const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const STEPS=[0,1,4,5,7,8,11,12],PHRASE=[0,2,3,2,1,0,4,3,2,1,0,-1];
// Original procedural music, inspired by breath flute, long-neck lute and skin
// percussion. It is not a recording or a claim of historically exact tuning.
export class CreatureAudio{
 constructor(){this.enabled=false;this.volume=.5;this.paused=false;this.voices=new Set();this.strings=new Map();this.nextNote=0;this.note=0;this.seed=1973;this.mode='DRIFT';}
 random(){this.seed=(Math.imul(this.seed,1664525)+1013904223)>>>0;return this.seed/4294967296;}
 async enable(){
  if(!this.ctx){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)throw Error('Web Audio unavailable');const c=this.ctx=new AC(),gain=v=>{const g=c.createGain();g.gain.value=v;return g;};
   this.master=gain(0);const compressor=c.createDynamicsCompressor();compressor.threshold.value=-19;compressor.ratio.value=4;compressor.attack.value=.006;compressor.release.value=.3;this.master.connect(compressor);compressor.connect(c.destination);
   this.mix=gain(.8);this.pan=c.createStereoPanner();this.mix.connect(this.pan);this.pan.connect(this.master);
   const impulse=c.createBuffer(2,Math.floor(c.sampleRate*1.3),c.sampleRate);for(let ch=0;ch<2;ch++){const d=impulse.getChannelData(ch);let last=0;for(let i=0;i<d.length;i++){last=last*.3+(this.random()*2-1)*.7;d[i]=last*Math.exp(-i/c.sampleRate*5)*.23;}}
   const room=c.createConvolver();room.buffer=impulse;this.roomSend=gain(.25);this.mix.connect(this.roomSend);this.roomSend.connect(room);room.connect(this.master);
   this.flute=gain(0);this.flute.connect(this.mix);this.fluteOsc=c.createOscillator();this.fluteOsc.type='sine';this.fluteOsc.frequency.value=293.66;this.fluteOsc.connect(this.flute);
   this.fluteHarm=c.createOscillator();this.fluteHarm.type='sine';this.fluteHarm.frequency.value=587.32;const partial=gain(.13);this.fluteHarm.connect(partial);partial.connect(this.flute);
   this.vibrato=c.createOscillator();this.vibrato.frequency.value=4.7;const depth=gain(1.6);this.vibrato.connect(depth);depth.connect(this.fluteOsc.frequency);
   this.breath=gain(0);const filter=c.createBiquadFilter();filter.type='bandpass';filter.frequency.value=1500;filter.Q.value=.7;filter.connect(this.breath);this.breath.connect(this.mix);
   const noise=c.createBuffer(1,c.sampleRate*2,c.sampleRate),data=noise.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=this.random()*2-1;
   this.noise=c.createBufferSource();this.noise.buffer=noise;this.noise.loop=true;this.noise.connect(filter);
   for(const n of [this.fluteOsc,this.fluteHarm,this.vibrato,this.noise])n.start();
  }
  await this.ctx.resume();if(this.ctx.state!=='running')throw Error('Audio suspended');this.enabled=true;this.setVolume(this.volume);
 }
 stringBuffer(note){
  if(this.strings.has(note))return this.strings.get(note);const c=this.ctx,f=146.83*2**(note/12),period=c.sampleRate/f,n=Math.floor(period),frac=period-n,ring=new Float32Array(n+1);
  for(let i=0;i<ring.length;i++)ring[i]=(this.random()*2-1)*.72;
  const b=c.createBuffer(1,Math.floor(c.sampleRate*2.6),c.sampleRate),d=b.getChannelData(0);let last=0;
  for(let i=0;i<d.length;i++){const p=i%ring.length,a=ring[p],next=ring[(p+1)%ring.length],v=(a*(1-frac)+next*frac);ring[p]=(v+last)*.5*.994;last=v;d[i]=v*Math.min(1,i/40);}
  this.strings.set(note,b);return b;
 }
 pluck(note,strength,time){
  const c=this.ctx;if(this.voices.size>=12)return;const source=c.createBufferSource(),g=c.createGain(),p=c.createStereoPanner(),filter=c.createBiquadFilter();source.buffer=this.stringBuffer(note);filter.type='lowpass';filter.frequency.value=2600;filter.Q.value=.5;p.pan.value=(this.random()-.5)*.55;g.gain.setValueAtTime(strength,time);g.gain.exponentialRampToValueAtTime(.0001,time+2.5);source.connect(filter);filter.connect(g);g.connect(p);p.connect(this.mix);this.voices.add(source);source.onended=()=>{this.voices.delete(source);source.disconnect();filter.disconnect();g.disconnect();p.disconnect();};source.start(time);source.stop(time+2.6);
 }
 drum(time,strength){
  const c=this.ctx,o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(158,time);o.frequency.exponentialRampToValueAtTime(74,time+.13);g.gain.setValueAtTime(.0001,time);g.gain.linearRampToValueAtTime(strength,time+.008);g.gain.exponentialRampToValueAtTime(.0001,time+.26);o.connect(g);g.connect(this.mix);this.voices.add(o);o.onended=()=>{this.voices.delete(o);o.disconnect();g.disconnect();};o.start(time);o.stop(time+.3);
 }
 setVolume(v){this.volume=clamp(v,0,1);if(this.ctx)this.master.gain.setTargetAtTime(this.enabled&&!this.paused?this.volume*.7:0,this.ctx.currentTime,.06);}
 setPaused(v){this.paused=v;this.setVolume(this.volume);}
 mute(){this.enabled=false;this.setVolume(this.volume);}
 update(world){
  if(!this.ctx||!this.enabled||this.paused)return;const t=this.ctx.currentTime,s=world.time,caught=world.caught,strike=world.mode==='STRIKE',set=(p,v,tau=.12)=>p.setTargetAtTime(v,t,tau);
  set(this.pan.pan,clamp((world.body.x/world.width-.5)*.9,-.5,.5));
  const step=PHRASE[Math.floor(s/3.2)%PHRASE.length],pitch=step<0?-5:STEPS[step];const breath=Math.max(0,Math.sin(s*.9))**1.4;
  set(this.fluteOsc.frequency,293.66*2**(pitch/12),.2);set(this.fluteHarm.frequency,587.32*2**(pitch/12),.2);
  set(this.flute.gain,(caught?.012:.034)*breath,.16);set(this.breath.gain,(caught?.022:.008)*(.4+breath*.6),.13);
  if(s>=this.nextNote){const degree=PHRASE[this.note%PHRASE.length],note=degree<0?-5:STEPS[degree];this.pluck(note,caught?.4:.32,t);
   if(strike||caught)this.pluck(note+12,.12,t+.07);
   if(this.note%3===0)this.drum(t+.035,caught?.11:.055);
   this.note++;this.nextNote=s+(caught?.17+this.random()*.13:strike?.3:.85+this.random()*.65);
  }
  if(strike&&this.mode!=='STRIKE'){this.pluck(13,.16,t+.04);this.pluck(16,.12,t+.13);}
  this.mode=world.mode;
 }
 dispose(){if(!this.ctx)return;for(const n of [this.fluteOsc,this.fluteHarm,this.vibrato,this.noise,...this.voices]){try{n.stop();}catch{}}this.voices.clear();this.ctx.close();this.ctx=null;this.strings.clear();this.enabled=false;}
}
