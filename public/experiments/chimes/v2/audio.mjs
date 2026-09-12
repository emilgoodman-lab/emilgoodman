export const NOTES=[50,52,54,57,59,62,64,66,69,71,74,76,78,81,83,86];
export const frequencies=NOTES.map(n=>440*2**((n-69)/12));
export class ChimeAudio{
 constructor(){this.enabled=false;this.fist=false;this.volume=.5;this.last=new Float64Array(16).fill(-10);this.previous=new Float64Array(16);this.voices=new Set();}
 async enable(){
  if(!this.ctx){
   const AudioContext=window.AudioContext||window.webkitAudioContext;if(!AudioContext)throw new Error('Web Audio unavailable');
   this.ctx=new AudioContext();this.master=this.ctx.createGain();this.master.gain.value=this.volume*.4;
   const compressor=this.ctx.createDynamicsCompressor();compressor.threshold.value=-24;compressor.knee.value=18;compressor.ratio.value=5;compressor.attack.value=.003;compressor.release.value=.3;
   const filter=this.ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=4200;
   this.master.connect(filter);filter.connect(compressor);compressor.connect(this.ctx.destination);
   this.clean=this.ctx.createGain();this.dirty=this.ctx.createGain();this.clean.gain.value=this.fist?0:1;this.dirty.gain.value=this.fist?1:0;
   // Both timbres feed the same quiet, filtered stereo echo. The tail survives mode changes.
   for(const bus of [this.clean,this.dirty])bus.connect(this.master);
   const left=this.ctx.createDelay(1),right=this.ctx.createDelay(1);left.delayTime.value=.29;right.delayTime.value=.43;
   const send=this.ctx.createGain();send.gain.value=.22;this.clean.connect(send);this.dirty.connect(send);send.connect(left);send.connect(right);
   const lp=this.ctx.createStereoPanner(),rp=this.ctx.createStereoPanner();lp.pan.value=-.8;rp.pan.value=.8;left.connect(lp);right.connect(rp);lp.connect(this.master);rp.connect(this.master);
   const damping=this.ctx.createBiquadFilter();damping.type='lowpass';damping.frequency.value=2100;const feedback=this.ctx.createGain();feedback.gain.value=.26;
   left.connect(damping);damping.connect(feedback);feedback.connect(right);
   const damping2=this.ctx.createBiquadFilter();damping2.type='lowpass';damping2.frequency.value=1800;const feedback2=this.ctx.createGain();feedback2.gain.value=.26;
   right.connect(damping2);damping2.connect(feedback2);feedback2.connect(left);
   this.curve=Float32Array.from({length:2048},(_,i)=>Math.tanh((i/2047*2-1)*4));
  }
  await this.ctx.resume();if(this.ctx.state!=='running')throw new Error('Audio is suspended');this.enabled=true;this.setVolume(this.volume);
 }
 setFist(value){
  value=Boolean(value);if(value===this.fist)return;this.fist=value;
  if(this.ctx){const t=this.ctx.currentTime;this.clean.gain.setTargetAtTime(value?0:1,t,.045);this.dirty.gain.setTargetAtTime(value?1:0,t,.045);}
  this.last.fill(-10);this.previous.fill(0);
  if(value){this.chime(3,.5);this.chime(7,.4);}
 }
 mute(){this.enabled=false;if(this.ctx)this.master.gain.setTargetAtTime(0,this.ctx.currentTime,.025);}
 setVolume(value){this.volume=value;if(this.ctx)this.master.gain.setTargetAtTime(this.enabled?value*.4:0,this.ctx.currentTime,.025);}
 chime(id,strength=1){
  if(!this.enabled||this.ctx.state!=='running'||this.voices.size>=32)return;
  const t=this.ctx.currentTime,base=frequencies[id],level=Math.min(1,strength)*.08;
  const voice=this.ctx.createGain(),pan=this.ctx.createStereoPanner();pan.pan.value=(id/15-.5)*1.25;voice.connect(pan);pan.connect(this.fist?this.dirty:this.clean);this.voices.add(voice);
  let duration=2.1;
  if(this.fist){
   duration=1.35;
   const osc=this.ctx.createOscillator(),mod=this.ctx.createOscillator(),depth=this.ctx.createGain(),drive=this.ctx.createGain(),shape=this.ctx.createWaveShaper(),filter=this.ctx.createBiquadFilter();
   osc.type='sawtooth';osc.frequency.setValueAtTime(base*.52,t);osc.frequency.exponentialRampToValueAtTime(base*.25,t+1.1);
   mod.type='sine';mod.frequency.setValueAtTime(base*.73,t);mod.frequency.exponentialRampToValueAtTime(base*.11,t+1.1);depth.gain.setValueAtTime(base*.65,t);depth.gain.exponentialRampToValueAtTime(2,t+1.1);mod.connect(depth);depth.connect(osc.frequency);
   drive.gain.value=2.3;shape.curve=this.curve;shape.oversample='2x';filter.type='lowpass';filter.Q.value=1.5;filter.frequency.setValueAtTime(750+base*2,t);filter.frequency.exponentialRampToValueAtTime(220,t+1.15);
   voice.gain.setValueAtTime(0,t);voice.gain.linearRampToValueAtTime(level*.62,t+.025);voice.gain.exponentialRampToValueAtTime(.00001,t+1.2);
   osc.connect(drive);drive.connect(shape);shape.connect(filter);filter.connect(voice);osc.start(t);mod.start(t);osc.stop(t+1.25);mod.stop(t+1.25);
   osc.onended=()=>{for(const node of [osc,mod,depth,drive,shape,filter])node.disconnect();};
  }else{
   for(const [multiple,amplitude,decay] of [[1,1,1.8],[2.003,.23,1.1],[3.01,.065,.65]]){
    const osc=this.ctx.createOscillator(),env=this.ctx.createGain();osc.type='sine';osc.frequency.value=base*multiple;
    env.gain.setValueAtTime(0,t);env.gain.linearRampToValueAtTime(level*amplitude,t+.012);env.gain.exponentialRampToValueAtTime(.00001,t+decay);
    osc.connect(env);env.connect(voice);osc.start(t);osc.stop(t+decay+.04);osc.onended=()=>{osc.disconnect();env.disconnect();};
   }
  }
  setTimeout(()=>{voice.disconnect();pan.disconnect();this.voices.delete(voice);},duration*1000);
 }
 update(chains,time){
  for(const c of chains){
   const current=c.energy,threshold=this.fist?10:38,interval=this.fist?.65:1.6;
   if(current>threshold&&time-this.last[c.id]>(this.fist?.3:.55)&&(this.previous[c.id]<threshold||time-this.last[c.id]>interval)){
    this.chime(c.id,Math.min(.8,.2+current/500));this.last[c.id]=time;
   }
   this.previous[c.id]=current;
  }
 }
}
