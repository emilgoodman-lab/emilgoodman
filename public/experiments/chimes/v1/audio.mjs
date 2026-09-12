// Sixteen individual pitches in a quiet D-major pentatonic chime bank.
export const NOTES=[50,52,54,57,59,62,64,66,69,71,74,76,78,81,83,86];
export const frequencies=NOTES.map(n=>440*2**((n-69)/12));
export class ChimeAudio{
 constructor(){this.enabled=false;this.volume=.5;this.last=new Float64Array(16).fill(-10);this.previous=new Float64Array(16);this.pulses=new Float64Array(16).fill(-10);this.voices=new Set();}
 async enable(){
  if(!this.ctx){
   const AudioContext=window.AudioContext||window.webkitAudioContext;if(!AudioContext)throw new Error('Web Audio unavailable');
   this.ctx=new AudioContext();this.master=this.ctx.createGain();this.master.gain.value=this.volume*.4;
   const compressor=this.ctx.createDynamicsCompressor();compressor.threshold.value=-24;compressor.knee.value=18;compressor.ratio.value=5;compressor.attack.value=.003;compressor.release.value=.25;
   const filter=this.ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=4200;
   this.master.connect(filter);filter.connect(compressor);compressor.connect(this.ctx.destination);
  }
  await this.ctx.resume();if(this.ctx.state!=='running')throw new Error('Audio is suspended');this.enabled=true;
 }
 mute(){this.enabled=false;if(this.ctx){this.master.gain.setTargetAtTime(0,this.ctx.currentTime,.025);}}
 setVolume(value){this.volume=value;if(this.ctx)this.master.gain.setTargetAtTime(this.enabled?value*.4:0,this.ctx.currentTime,.025);}
 chime(id,strength=1){
  if(!this.enabled||this.ctx.state!=='running'||this.voices.size>36)return;
  const t=this.ctx.currentTime,base=frequencies[id],level=Math.min(1,strength)*.08;
  const voice=this.ctx.createGain();const pan=this.ctx.createStereoPanner();pan.pan.value=(id/15-.5)*1.25;voice.connect(pan);pan.connect(this.master);this.voices.add(voice);
  const parts=[[1,1,1.8],[2.003,.23,1.1],[3.01,.065,.65]];
  for(const [multiple,amplitude,decay] of parts){
   const osc=this.ctx.createOscillator(),env=this.ctx.createGain();osc.type='sine';osc.frequency.value=base*multiple;
   env.gain.setValueAtTime(0,t);env.gain.linearRampToValueAtTime(level*amplitude,t+.012);env.gain.exponentialRampToValueAtTime(.00001,t+decay);
   osc.connect(env);env.connect(voice);osc.start(t);osc.stop(t+decay+.04);osc.onended=()=>{osc.disconnect();env.disconnect();};
  }
  setTimeout(()=>{voice.disconnect();pan.disconnect();this.voices.delete(voice);},2100);
 }
 update(chains,time){
  for(const c of chains){
   const current=c.energy,threshold=38;
   if(current>threshold&&time-this.last[c.id]>.55&&(this.previous[c.id]<threshold||time-this.last[c.id]>1.6)){
    this.chime(c.id,Math.min(.8,.2+current/500));this.last[c.id]=time;this.pulses[c.id]=time;
   }
   this.previous[c.id]=current;
  }
 }
}
