const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));

export function buildSiltAudio(ctx,seed=718){
 const nodes=[],sources=[],transients=new Set();let randomState=seed;
 const random=()=>{randomState=(Math.imul(randomState,1664525)+1013904223)>>>0;return randomState/4294967296;};
 const node=(method,...args)=>{const n=ctx[method](...args);nodes.push(n);return n;};
 const master=node('createGain'),limiter=node('createDynamicsCompressor'),dry=node('createGain'),echoInput=node('createGain'),echoDirect=node('createGain'),atmosphere=node('createGain');
 master.gain.value=0;dry.gain.value=.88;echoDirect.gain.value=.1;atmosphere.gain.value=0;
 limiter.threshold.value=-16;limiter.knee.value=18;limiter.ratio.value=6;limiter.attack.value=.003;limiter.release.value=.28;
 dry.connect(limiter);echoInput.connect(echoDirect).connect(limiter);limiter.connect(master).connect(ctx.destination);

 const noise=ctx.createBuffer(1,ctx.sampleRate*3,ctx.sampleRate),data=noise.getChannelData(0);let brown=0;
 for(let i=0;i<data.length;i++){const white=random()*2-1;brown=(brown+white*.1)*.987;data[i]=white*.69+brown*.31;}

 const texture=[];
 for(const [i,config] of [{type:'lowpass',frequency:620,pan:-.5,rate:.71},{type:'bandpass',frequency:1900,pan:.35,rate:1.03},{type:'highpass',frequency:4200,pan:-.1,rate:1.37}].entries()){
  const source=node('createBufferSource'),filter=node('createBiquadFilter'),gain=node('createGain'),pan=node('createStereoPanner');source.buffer=noise;source.loop=true;source.playbackRate.value=config.rate;filter.type=config.type;filter.frequency.value=config.frequency;filter.Q.value=i===1?.7:.35;gain.gain.value=0;pan.pan.value=config.pan;source.connect(filter).connect(gain).connect(pan).connect(dry);source.start();sources.push(source);texture.push({source,filter,gain,pan,i});
 }

 const wetTextureSource=node('createBufferSource'),wetTextureFilter=node('createBiquadFilter'),wetTextureGain=node('createGain'),wetTexturePan=node('createStereoPanner');
 wetTextureSource.buffer=noise;wetTextureSource.loop=true;wetTextureSource.playbackRate.value=.83;wetTextureFilter.type='bandpass';wetTextureFilter.frequency.value=1450;wetTextureFilter.Q.value=.5;wetTextureGain.gain.value=0;wetTextureSource.connect(wetTextureFilter).connect(wetTextureGain).connect(wetTexturePan).connect(echoInput);wetTextureSource.start();sources.push(wetTextureSource);

 const voices=[];
 for(const [i,f] of [36.71,43.65,65.41,87.31,130.81].entries()){
  const carrier=node('createOscillator'),mod=node('createOscillator'),modGain=node('createGain'),gain=node('createGain'),pan=node('createStereoPanner');carrier.frequency.value=f;carrier.type=i<2?'sine':'triangle';mod.frequency.value=.08+i*.043;modGain.gain.value=.8+i*.45;gain.gain.value=.022/(1+i*.56);pan.pan.value=(i-2)*.32;mod.connect(modGain).connect(carrier.detune);carrier.connect(gain).connect(pan).connect(atmosphere);carrier.start();mod.start();sources.push(carrier,mod);voices.push({carrier,mod,modGain,gain,pan,i});
 }
 atmosphere.connect(echoInput);

 for(const [panValue,delayTime,feedbackValue] of [[-1,.43,.46],[1,.71,.53],[-.35,1.07,.39]]){
  const delay=node('createDelay',2),feedback=node('createGain'),filter=node('createBiquadFilter'),pan=node('createStereoPanner'),wet=node('createGain');delay.delayTime.value=delayTime;feedback.gain.value=feedbackValue;filter.type='lowpass';filter.frequency.value=1180;pan.pan.value=panValue;wet.gain.value=.33;echoInput.connect(delay);delay.connect(filter).connect(feedback).connect(delay);filter.connect(wet).connect(pan).connect(limiter);
 }

 function grain(at,energy,destination,family=0){
  const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),env=ctx.createGain(),pan=ctx.createStereoPanner();
  source.buffer=noise;source.playbackRate.value=.6+random()*1.65;filter.type=family===0?'bandpass':family===1?'highpass':'lowpass';filter.frequency.value=family===0?700+random()*3300:family===1?3200+random()*6200:250+random()*920;filter.Q.value=.25+random()*1.2;
  const length=.014+random()*(family===2?.11:.065),amplitude=(.009+random()*.026)*(.25+energy*.95);env.gain.setValueAtTime(.0001,at);env.gain.linearRampToValueAtTime(amplitude,at+.002);env.gain.exponentialRampToValueAtTime(.0001,at+length);pan.pan.value=random()*1.9-.95;source.connect(filter).connect(env).connect(pan).connect(destination);transients.add(source);source.onended=()=>{transients.delete(source);source.disconnect();filter.disconnect();env.disconnect();pan.disconnect();};source.start(at,random()*2.7);source.stop(at+length+.02);
 }

 let nextCollision=0,nextField=0;
 function spray(at,energy,destination,layers){for(let i=0;i<layers;i++)grain(at+random()*.006,energy,destination,i%3);}
 function schedule(at,horizon,rate,energy,destination,next,layerScale){next=Math.max(next,at);while(next<at+horizon){spray(next,energy,destination,1+Math.floor(energy*layerScale));next+=(.55+random()*.9)/Math.max(1,rate);}return next;}

 function update({time=0,activity=0,collisionActivity=activity,fieldActivity=0,zero=false},at=ctx.currentTime){
  activity=clamp(activity);collisionActivity=clamp(collisionActivity);fieldActivity=clamp(fieldActivity);const dryEnergy=clamp(collisionActivity+fieldActivity*.72),wetEnergy=fieldActivity;
  atmosphere.gain.setTargetAtTime(zero?.78:0,at,.25);echoDirect.gain.setTargetAtTime(zero?.12:.04,at,.2);
  const textureEnergy=zero?0:clamp(dryEnergy*.72+activity*.28);for(const t of texture){const weights=[.027,.019,.011];t.gain.gain.setTargetAtTime(textureEnergy*weights[t.i],at,.055+t.i*.025);t.filter.frequency.setTargetAtTime([470,1500,3900][t.i]+textureEnergy*[620,2800,4200][t.i],at,.08);t.pan.pan.setTargetAtTime(Math.sin(time*(.21+t.i*.09)+t.i)*(.45+t.i*.13),at,.12);}
  wetTextureGain.gain.setTargetAtTime(zero*wetEnergy*.027,at,.08);wetTextureFilter.frequency.setTargetAtTime(700+wetEnergy*3900,at,.09);wetTexturePan.pan.setTargetAtTime(Math.sin(time*.8)*.8,at,.1);
  for(const v of voices){v.carrier.detune.setTargetAtTime(Math.sin(time*.19+v.i)*7+wetEnergy*Math.sin(time*1.3-v.i)*12,at,.16);v.modGain.gain.setTargetAtTime(.8+v.i*.45+wetEnergy*5,at,.15);v.gain.gain.setTargetAtTime((.021+activity*.008)/(1+v.i*.56),at,.2);v.pan.pan.setTargetAtTime(Math.sin(time*.075+v.i*1.4)*.72,at,.2);}
  const horizon=.07;if(!zero&&dryEnergy>.004){nextCollision=schedule(at,horizon,8+collisionActivity*250,dryEnergy,dry,nextCollision,3);nextField=schedule(at,horizon,fieldActivity*155,fieldActivity,dry,nextField,2);}else nextCollision=at;
  if(zero&&wetEnergy>.004)nextField=schedule(at,horizon,6+wetEnergy*190,wetEnergy,echoInput,nextField,3);else if(!fieldActivity)nextField=at;
 }
 return {master,update,dispose(){for(const source of [...sources,...transients]){try{source.stop();}catch{}}for(const n of nodes)n.disconnect();}};
}

export class SiltAudio{
 constructor(){this.enabled=false;this.volume=.5;this.paused=false;}
 async enable(){if(!this.ctx){this.ctx=new AudioContext();this.graph=buildSiltAudio(this.ctx);}await this.ctx.resume();this.enabled=true;this.level();}
 level(){if(this.graph)this.graph.master.gain.setTargetAtTime(this.enabled&&!this.paused?this.volume*.82:0,this.ctx.currentTime,.15);}
 setVolume(v){this.volume=clamp(v);this.level();}setPaused(v){this.paused=v;this.level();}mute(){this.enabled=false;this.level();}
 update(world){if(this.enabled&&this.ctx.state==='running')this.graph.update(world);}
 dispose(){this.graph?.dispose();this.ctx?.close();}
}
