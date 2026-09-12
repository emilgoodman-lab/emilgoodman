const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export function buildSiltAudio(ctx,seed=718){
 const nodes=[],osc=[],grains=new Set();let randomState=seed;const random=()=>{randomState=(Math.imul(randomState,1664525)+1013904223)>>>0;return randomState/4294967296;};const node=(method,...args)=>{const n=ctx[method](...args);nodes.push(n);return n;};
 const master=node('createGain'),limiter=node('createDynamicsCompressor'),sand=node('createGain'),space=node('createGain'),air=node('createGain');master.gain.value=0;sand.gain.value=1;space.gain.value=0;air.gain.value=.006;limiter.threshold.value=-14;limiter.knee.value=14;limiter.ratio.value=5;limiter.attack.value=.004;limiter.release.value=.3;limiter.connect(master).connect(ctx.destination);sand.connect(limiter);
 const noise=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate),data=noise.getChannelData(0);let brown=0;for(let i=0;i<data.length;i++){brown=(brown+(random()*2-1)*.12)*.985;data[i]=(random()*2-1)*.65+brown*.35;}
 const texture=node('createBufferSource'),low=node('createBiquadFilter');texture.buffer=noise;texture.loop=true;low.type='lowpass';low.frequency.value=310;texture.connect(low).connect(air).connect(space);texture.start();osc.push(texture);
 const voices=[];for(const [i,f] of [43.65,65.41,87.31,130.81].entries()){const o=node('createOscillator'),gain=node('createGain'),pan=node('createStereoPanner');o.frequency.value=f;o.type='sine';gain.gain.value=.022/(1+i*.6);pan.pan.value=(i-1.5)*.38;o.connect(gain).connect(pan).connect(space);o.start();osc.push(o);voices.push({o,gain,pan,i});}
 const dry=node('createGain');dry.gain.value=.7;space.connect(dry).connect(limiter);
 for(const [panValue,delayTime] of [[-1,.59],[1,.83]]){const delay=node('createDelay',2),feedback=node('createGain'),lp=node('createBiquadFilter'),pan=node('createStereoPanner'),wet=node('createGain');delay.delayTime.value=delayTime;feedback.gain.value=.56;lp.type='lowpass';lp.frequency.value=900;pan.pan.value=panValue;wet.gain.value=.48;space.connect(delay);delay.connect(lp).connect(feedback).connect(delay);lp.connect(wet).connect(pan).connect(limiter);}
 let nextGrain=0;
 function grain(at,activity){const source=ctx.createBufferSource(),env=ctx.createGain(),filter=ctx.createBiquadFilter(),pan=ctx.createStereoPanner();source.buffer=noise;source.playbackRate.value=.7+random()*.8;filter.type='bandpass';filter.frequency.value=950+random()*5300;filter.Q.value=.35+random()*.9;const length=.018+random()*.07,amplitude=(.018+random()*.043)*(.3+activity*.7);env.gain.setValueAtTime(0,at);env.gain.linearRampToValueAtTime(amplitude,at+.002);env.gain.exponentialRampToValueAtTime(.0001,at+length);pan.pan.value=random()*1.8-.9;source.connect(filter).connect(env).connect(pan).connect(sand);grains.add(source);source.onended=()=>{grains.delete(source);source.disconnect();filter.disconnect();env.disconnect();pan.disconnect();};source.start(at,random()*1.8);source.stop(at+length+.015);}
 function update({time=0,activity=0,zero=false},at=ctx.currentTime){activity=clamp(activity);sand.gain.setTargetAtTime(zero?0:1,at,.17);space.gain.setTargetAtTime(zero?.8:0,at,.3);air.gain.setTargetAtTime(.006+activity*.012,at,.2);for(const v of voices){v.o.detune.setTargetAtTime(Math.sin(time*.22+v.i)*6,at,.15);v.gain.gain.setTargetAtTime((.022+Math.sin(time*.4+v.i)*.004+activity*.008)/(1+v.i*.6),at,.2);v.pan.pan.setTargetAtTime(Math.sin(time*.09+v.i*1.7)*.65,at,.2);}
  if(zero||activity<.008){nextGrain=at;return;}const rate=3+activity*135;nextGrain=Math.max(nextGrain,at);while(nextGrain<at+.065){grain(nextGrain,activity);nextGrain+=(.6+random()*.8)/rate;}
 }
 return {master,update,dispose(){for(const o of [...osc,...grains]){try{o.stop();}catch{}}for(const n of nodes)n.disconnect();}};
}
export class SiltAudio{
 constructor(){this.enabled=false;this.volume=.5;this.paused=false;}
 async enable(){if(!this.ctx){this.ctx=new AudioContext();this.graph=buildSiltAudio(this.ctx);}await this.ctx.resume();this.enabled=true;this.level();}
 level(){if(this.graph)this.graph.master.gain.setTargetAtTime(this.enabled&&!this.paused?this.volume*.85:0,this.ctx.currentTime,.15);}
 setVolume(v){this.volume=clamp(v);this.level();}setPaused(v){this.paused=v;this.level();}mute(){this.enabled=false;this.level();}
 update(world){if(this.enabled&&this.ctx.state==='running')this.graph.update(world);}
 dispose(){this.graph?.dispose();this.ctx?.close();}
}
