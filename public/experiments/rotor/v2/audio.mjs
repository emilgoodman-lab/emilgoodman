import {CreatureAudio} from '../../abyssal/v3/audio.mjs';
// Plucked-string and breath-flute material is continuously colored by the same
// four fields that transform the rings. Original music, Turkish-inspired timbre.
export class RotorAudio extends CreatureAudio{
 async enable(){await super.enable();if(this.color)return;const c=this.ctx;
  this.color=c.createBiquadFilter();this.color.type='lowpass';this.color.frequency.value=2600;this.color.Q.value=.8;
  this.clean=c.createGain();this.clean.gain.value=1;this.dirty=c.createGain();this.dirty.gain.value=0;
  this.drive=c.createGain();this.drive.gain.value=4;this.shape=c.createWaveShaper();this.shape.curve=Float32Array.from({length:2048},(_,i)=>Math.tanh((i/2047*2-1)*3));this.shape.oversample='2x';
  this.mix.disconnect();this.mix.connect(this.color);this.color.connect(this.clean);this.clean.connect(this.pan);this.color.connect(this.drive);this.drive.connect(this.shape);this.shape.connect(this.dirty);this.dirty.connect(this.pan);this.color.connect(this.roomSend);
  this.pulse=c.createOscillator();this.pulse.frequency.value=.8;this.pulseDepth=c.createGain();this.pulseDepth.gain.value=.002;this.pulse.connect(this.pulseDepth);this.pulseDepth.connect(this.flute.gain);this.pulse.start();
 }
 update(field,mirror=0){
  super.update({time:field.time,mode:field.stress>.35?'CAUGHT':'STALK',caught:field.stress>.35,width:field.width,body:{x:(field.pointer.x+1)*field.width*.5,speed:0}});
  if(!this.enabled||!this.color||this.paused)return;const t=this.ctx.currentTime,[depth,drift,spin,tilt]=field.weights,s=field.stress,set=(p,v,tau=.15)=>p.setTargetAtTime(v,t,tau);
  set(this.color.frequency,900+(1-depth)*1700+spin*2400+s*1500);set(this.color.Q,.6+tilt*2.2+s);set(this.clean.gain,1-s*.55);set(this.dirty.gain,s*.24);
  set(this.fluteOsc.detune,tilt*Math.sin(field.motionTime*.9)*24-depth*27);set(this.fluteHarm.detune,tilt*Math.sin(field.motionTime*.9)*24-depth*27);
  set(this.pulse.frequency,.65+spin*4.2+s*12+mirror*.13);set(this.pulseDepth.gain,.002+drift*.004+s*.009);set(this.roomSend.gain,.22+depth*.22+s*.12);
  set(this.pan.pan,Math.sin(field.motionTime*.31)*drift*.8);
 }
 dispose(){try{this.pulse?.stop();}catch{}super.dispose();this.color=null;}
}
