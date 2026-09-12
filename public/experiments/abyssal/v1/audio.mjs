const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export class CreatureAudio{
 constructor(){this.enabled=false;this.volume=.5;this.paused=false;this.mode='DRIFT';this.oscillators=[];}
 async enable(){
  if(!this.ctx){
   const AudioContext=window.AudioContext||window.webkitAudioContext;if(!AudioContext)throw Error('Web Audio unavailable');this.ctx=new AudioContext();const c=this.ctx;
   const gain=(value)=>{const g=c.createGain();g.gain.value=value;return g;};
   const osc=(type,freq)=>{const o=c.createOscillator();o.type=type;o.frequency.value=freq;this.oscillators.push(o);return o;};
   this.master=gain(0);const compressor=c.createDynamicsCompressor();compressor.threshold.value=-25;compressor.knee.value=20;compressor.ratio.value=6;compressor.attack.value=.004;compressor.release.value=.35;
   this.master.connect(compressor);compressor.connect(c.destination);
   this.mix=gain(1);this.pan=c.createStereoPanner();this.mix.connect(this.pan);this.pan.connect(this.master);
   const left=c.createDelay(1),right=c.createDelay(1),send=gain(.24),lp=c.createStereoPanner(),rp=c.createStereoPanner();left.delayTime.value=.237;right.delayTime.value=.391;lp.pan.value=-.8;rp.pan.value=.8;this.mix.connect(send);send.connect(left);send.connect(right);left.connect(lp);right.connect(rp);lp.connect(this.master);rp.connect(this.master);
   for(const [from,to] of [[left,right],[right,left]]){const f=c.createBiquadFilter(),fb=gain(.28);f.type='lowpass';f.frequency.value=1400;from.connect(f);f.connect(fb);fb.connect(to);}
   this.calm=gain(.04);this.calm.connect(this.mix);this.water=c.createBiquadFilter();this.water.type='lowpass';this.water.frequency.value=420;this.water.Q.value=.7;this.water.connect(this.calm);
   this.fundamental=osc('sine',66);this.harmonic=osc('sine',132);const h=gain(.23);this.fundamental.connect(this.water);this.harmonic.connect(h);h.connect(this.water);
   const purr=osc('sine',4.1),purrDepth=gain(.011);purr.connect(purrDepth);purrDepth.connect(this.calm.gain);
   const drift=osc('sine',.17),driftDepth=gain(2.3);drift.connect(driftDepth);driftDepth.connect(this.fundamental.frequency);
   // Low-pass filtered deterministic noise supplies a quiet water-like texture.
   const noise=c.createBuffer(1,c.sampleRate*3,c.sampleRate),data=noise.getChannelData(0);let state=1511,brown=0;for(let i=0;i<data.length;i++){state=(Math.imul(state,1664525)+1013904223)>>>0;brown=(brown+((state/4294967296)*2-1)*.025)/1.025;data[i]=brown;}
   this.noise=c.createBufferSource();this.noise.buffer=noise;this.noise.loop=true;const noiseLevel=gain(.1);this.noise.connect(noiseLevel);noiseLevel.connect(this.water);
   this.distress=gain(0);this.distress.connect(this.mix);this.carrier=osc('sawtooth',130);this.modulator=osc('sine',31);this.modDepth=gain(90);this.modulator.connect(this.modDepth);this.modDepth.connect(this.carrier.frequency);
   const drive=gain(2.5),shape=c.createWaveShaper();shape.curve=Float32Array.from({length:2048},(_,i)=>Math.tanh((i/2047*2-1)*4));shape.oversample='2x';
   this.filter=c.createBiquadFilter();this.filter.type='lowpass';this.filter.frequency.value=1500;this.filter.Q.value=2;this.carrier.connect(drive);drive.connect(shape);shape.connect(this.filter);this.filter.connect(this.distress);
   const tremolo=osc('sine',19);this.tremoloDepth=gain(0);tremolo.connect(this.tremoloDepth);this.tremoloDepth.connect(this.distress.gain);
   this.attack=gain(0);this.attack.connect(this.mix);this.attackOsc=osc('triangle',240);this.attackOsc.connect(this.attack);
   for(const o of this.oscillators)o.start();this.noise.start();
  }
  await this.ctx.resume();if(this.ctx.state!=='running')throw Error('Audio suspended');this.enabled=true;this.setVolume(this.volume);
 }
 setVolume(v){this.volume=clamp(v,0,1);if(this.ctx)this.master.gain.setTargetAtTime(this.enabled&&!this.paused?this.volume*.5:0,this.ctx.currentTime,.06);}
 setPaused(v){this.paused=v;this.setVolume(this.volume);}
 mute(){this.enabled=false;this.setVolume(this.volume);}
 update(world){
  if(!this.ctx||!this.enabled||this.paused)return;const t=this.ctx.currentTime,s=world.time,caught=world.caught,attacking=world.mode==='STRIKE';
  const set=(param,value,slew=.09)=>param.setTargetAtTime(value,t,slew);
  const speed=clamp(world.body.speed/260,0,1);
  set(this.pan.pan,clamp((world.body.x/world.width-.5)*1.2,-.7,.7));
  set(this.fundamental.frequency,62+speed*34+Math.sin(s*.33)*6,.25);set(this.harmonic.frequency,126+speed*61,.25);set(this.water.frequency,340+speed*650,.3);set(this.calm.gain,caught?.009:attacking?.025:.046,.12);
  set(this.distress.gain,caught?.055:world.mode==='ESCAPE'?.009:0,.035);set(this.tremoloDepth.gain,caught?.017:0,.05);
  const broken=Math.sin(s*11.7+Math.sin(s*3.3)*2);set(this.carrier.frequency,Math.max(45,125+broken*58+Math.sin(s*21)*24),.025);set(this.modulator.frequency,28+Math.sin(s*7)*19,.03);set(this.modDepth.gain,caught?125+70*Math.sin(s*4):40,.06);set(this.filter.frequency,700+(1+Math.sin(s*8.1))*700,.025);
  if(attacking&&this.mode!=='STRIKE'){
   this.attack.gain.cancelScheduledValues(t);this.attack.gain.setValueAtTime(0,t);this.attack.gain.linearRampToValueAtTime(.065,t+.018);this.attack.gain.exponentialRampToValueAtTime(.00001,t+.52);
   this.attackOsc.frequency.cancelScheduledValues(t);this.attackOsc.frequency.setValueAtTime(580,t);this.attackOsc.frequency.exponentialRampToValueAtTime(85,t+.5);
  }
  this.mode=world.mode;
 }
 dispose(){if(!this.ctx)return;for(const o of this.oscillators){try{o.stop();}catch{}}try{this.noise.stop();}catch{}this.ctx.close();this.ctx=null;this.enabled=false;}
}
