export const NOTES=[50,52,54,57,59,62,64,66,69,71,74,76,78,81,83,86];
export const frequencies=NOTES.map(n=>440*2**((n-69)/12));
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
// Height is measured at actual contact: 0 = screen top, 1 = bottom.
export function voiceParameters(id,height=.5,fist=false){
 const air=1-clamp(height,0,1),octave=air>.67?2:air<.33?.5:1;
 return {pitch:frequencies[id]*octave*(fist?.5:1),air,
  cutoff:(fist?360:850)+air*(fist?3700:3400),
  modRatio:.31+id*.083,drive:1.6+id*.17,flutter:.19+id*.023,
  leftDelay:.23+id*.013,rightDelay:.37+((id*7)%16)*.019,
  feedback:.28+(id%5)*.015};
}
export class ChimeAudio{
 constructor(){this.enabled=false;this.fist=false;this.volume=.5;this.last=new Float64Array(16).fill(-10);this.previous=new Float64Array(16);this.heights=new Float64Array(16).fill(.5);this.voices=new Set();}
 async enable(){
  if(!this.ctx){
   const AudioContext=window.AudioContext||window.webkitAudioContext;if(!AudioContext)throw new Error('Web Audio unavailable');
   this.ctx=new AudioContext();this.master=this.ctx.createGain();this.master.gain.value=this.volume*.4;
   const compressor=this.ctx.createDynamicsCompressor();compressor.threshold.value=-24;compressor.knee.value=18;compressor.ratio.value=5;compressor.attack.value=.005;compressor.release.value=.4;
   const filter=this.ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=5800;
   this.master.connect(filter);filter.connect(compressor);compressor.connect(this.ctx.destination);
   this.banks=Array.from({length:16},(_,id)=>this.makeSpace(id));
   this.curve=Float32Array.from({length:2048},(_,i)=>Math.tanh((i/2047*2-1)*3.5));
  }
  await this.ctx.resume();if(this.ctx.state!=='running')throw new Error('Audio is suspended');this.enabled=true;this.setVolume(this.volume);
 }
 makeSpace(id){
  const ctx=this.ctx,p=voiceParameters(id),clean=ctx.createGain(),dirty=ctx.createGain();clean.gain.value=this.fist?0:1;dirty.gain.value=this.fist?1:0;
  clean.connect(this.master);dirty.connect(this.master);
  // Each chain has its own two delay times and feedback personality, shared by both timbres.
  const left=ctx.createDelay(1),right=ctx.createDelay(1);left.delayTime.value=p.leftDelay;right.delayTime.value=p.rightDelay;
  const send=ctx.createGain();send.gain.value=.3;clean.connect(send);dirty.connect(send);send.connect(left);send.connect(right);
  const lp=ctx.createStereoPanner(),rp=ctx.createStereoPanner();lp.pan.value=-.85;rp.pan.value=.85;left.connect(lp);right.connect(rp);lp.connect(this.master);rp.connect(this.master);
  for(const [source,target,cutoff] of [[left,right,2400],[right,left,1900]]){
   const damping=ctx.createBiquadFilter(),feedback=ctx.createGain();damping.type='lowpass';damping.frequency.value=cutoff+id*25;feedback.gain.value=p.feedback;source.connect(damping);damping.connect(feedback);feedback.connect(target);
  }
  return {clean,dirty};
 }
 setFist(value){
  value=Boolean(value);if(value===this.fist)return;this.fist=value;
  if(this.ctx){const t=this.ctx.currentTime;for(const bank of this.banks){bank.clean.gain.setTargetAtTime(value?0:1,t,.07);bank.dirty.gain.setTargetAtTime(value?1:0,t,.07);}}
  this.last.fill(-10);this.previous.fill(0);
  // Closing a fist in empty space produces no note; only contact excites a chain.
 }
 mute(){this.enabled=false;if(this.ctx)this.master.gain.setTargetAtTime(0,this.ctx.currentTime,.03);}
 setVolume(value){this.volume=value;if(this.ctx)this.master.gain.setTargetAtTime(this.enabled?value*.4:0,this.ctx.currentTime,.03);}
 chime(id,strength=1,height=.5){
  if(!this.enabled||this.ctx.state!=='running'||this.voices.size>=48)return;
  const ctx=this.ctx,t=ctx.currentTime,p=voiceParameters(id,height,this.fist),base=p.pitch,level=Math.min(1,strength)*.068;
  const voice=ctx.createGain(),pan=ctx.createStereoPanner();pan.pan.value=(id/15-.5)*1.2;voice.connect(pan);pan.connect(this.fist?this.banks[id].dirty:this.banks[id].clean);this.voices.add(voice);
  const nodes=[voice,pan];const oscillators=[];let duration;
  const osc=(type,freq)=>{const o=ctx.createOscillator();o.type=type;o.frequency.value=freq;oscillators.push(o);nodes.push(o);return o;};
  if(this.fist){
   duration=1.45;
   const carrier=osc(id%3===0?'square':'sawtooth',base*(1.13+p.air*.22)),mod=osc('sine',base*p.modRatio);
   carrier.frequency.exponentialRampToValueAtTime(base*(.65+p.air*.2),t+1.25);
   const depth=ctx.createGain(),drive=ctx.createGain(),shape=ctx.createWaveShaper(),filter=ctx.createBiquadFilter();nodes.push(depth,drive,shape,filter);
   depth.gain.setValueAtTime(base*(.25+p.air*.85+id*.017),t);depth.gain.exponentialRampToValueAtTime(3,t+1.2);mod.connect(depth);depth.connect(carrier.frequency);
   mod.frequency.exponentialRampToValueAtTime(base*(.08+id*.012),t+1.25);
   drive.gain.value=p.drive;shape.curve=this.curve;shape.oversample='2x';filter.type='lowpass';filter.Q.value=.8+(id%4)*.35;filter.frequency.setValueAtTime(p.cutoff,t);filter.frequency.exponentialRampToValueAtTime(160+p.air*600,t+1.3);
   voice.gain.setValueAtTime(0,t);voice.gain.linearRampToValueAtTime(level*.6,t+.035);voice.gain.exponentialRampToValueAtTime(.00001,t+1.4);
   carrier.connect(drive);drive.connect(shape);shape.connect(filter);filter.connect(voice);
  }else{
   duration=3.7;
   const filter=ctx.createBiquadFilter(),breath=ctx.createGain(),swell=osc('sine',p.flutter),swellDepth=ctx.createGain(),vibrato=osc('sine',.32+id*.021),vibratoDepth=ctx.createGain(),drift=osc('sine',.11+id*.008),driftDepth=ctx.createGain();
   nodes.push(filter,breath,swellDepth,vibratoDepth,driftDepth);
   filter.type='lowpass';filter.frequency.value=p.cutoff;filter.Q.value=.35;
   breath.gain.value=.87;swellDepth.gain.value=.11;swell.connect(swellDepth);swellDepth.connect(breath.gain);
   vibratoDepth.gain.value=3.2;vibrato.connect(vibratoDepth);driftDepth.gain.value=.16;drift.connect(driftDepth);driftDepth.connect(pan.pan);
   filter.connect(breath);breath.connect(voice);
   voice.gain.setValueAtTime(0,t);voice.gain.linearRampToValueAtTime(level,t+.13);voice.gain.exponentialRampToValueAtTime(.00001,t+3.6);
   for(const [multiple,amplitude,detune] of [[1,.52,-3],[1,.48,3],[2,.16+p.air*.07,0],[3,.035+p.air*.045,0]]){
    const carrier=osc('sine',base*multiple),gain=ctx.createGain();nodes.push(gain);carrier.detune.value=detune;vibratoDepth.connect(carrier.detune);gain.gain.value=amplitude;carrier.connect(gain);gain.connect(filter);
   }
  }
  for(const o of oscillators){o.start(t);o.stop(t+duration);}
  let remaining=oscillators.length;for(const o of oscillators)o.onended=()=>{if(--remaining===0){for(const n of nodes)n.disconnect();this.voices.delete(voice);}};
 }
 update(chains,time){
  for(const c of chains){
   const contact=c.contact,active=contact?.active,elapsed=time-this.last[c.id],changed=active&&Math.abs(contact.height-this.heights[c.id])>.075;
   const interval=this.fist?.48:1.05;
   if(active&&elapsed>(this.fist?.19:.28)&&(!this.previous[c.id]||changed||elapsed>interval)){
    this.chime(c.id,Math.min(.8,.22+contact.strength*.35+c.energy/1200),contact.height);this.last[c.id]=time;this.heights[c.id]=contact.height;
   }
   this.previous[c.id]=active?1:0;
  }
 }
}
