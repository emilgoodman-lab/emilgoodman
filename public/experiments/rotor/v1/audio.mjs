const clamp=v=>Math.max(0,Math.min(1,v));
export function buildResonator(ctx){
 const nodes=[],oscillators=[],voices=[];const make=(method,...args)=>{const n=ctx[method](...args);nodes.push(n);return n;};
 const source=make('createGain'),clean=make('createGain'),dirty=make('createGain'),shaper=make('createWaveShaper'),drive=make('createGain'),master=make('createGain'),filter=make('createBiquadFilter'),limiter=make('createDynamicsCompressor');
 const curve=new Float32Array(2048);for(let i=0;i<curve.length;i++){const x=i/(curve.length-1)*2-1;curve[i]=Math.tanh(5*x);}shaper.curve=curve;shaper.oversample='2x';drive.gain.value=6;clean.gain.value=1;dirty.gain.value=0;master.gain.value=0;
 filter.type='lowpass';filter.frequency.value=2400;filter.Q.value=.6;limiter.threshold.value=-18;limiter.knee.value=16;limiter.ratio.value=5;limiter.attack.value=.01;limiter.release.value=.3;
 source.connect(clean).connect(filter);source.connect(drive).connect(shaper).connect(dirty).connect(filter);filter.connect(limiter).connect(master).connect(ctx.destination);
 for(const [side,delayTime] of [[-1,.37],[1,.53]]){const delay=make('createDelay',2),feedback=make('createGain'),lowpass=make('createBiquadFilter'),pan=make('createStereoPanner'),wet=make('createGain');delay.delayTime.value=delayTime;feedback.gain.value=.32;lowpass.type='lowpass';lowpass.frequency.value=1800;pan.pan.value=side;wet.gain.value=.23;filter.connect(delay);delay.connect(lowpass).connect(feedback).connect(delay);lowpass.connect(wet).connect(pan).connect(limiter);}
 for(const [i,ratio] of [1,1.5,2,2.25,3].entries()){
  const osc=make('createOscillator'),mod=make('createOscillator'),fm=make('createGain'),gain=make('createGain'),pan=make('createStereoPanner'),breath=make('createOscillator'),breathGain=make('createGain');
  osc.type='sine';osc.frequency.value=92.5*ratio;mod.type='sine';mod.frequency.value=92.5*ratio*2.003;fm.gain.value=6+i*2;gain.gain.value=.024/(1+i*.35);pan.pan.value=(i-2)*.32;breath.frequency.value=.11+i*.037;breathGain.gain.value=.005/(1+i*.35);
  mod.connect(fm).connect(osc.frequency);breath.connect(breathGain).connect(gain.gain);osc.connect(gain).connect(pan).connect(source);
  for(const o of [osc,mod,breath]){o.start();oscillators.push(o);}voices.push({osc,mod,fm,pan,ratio,i});
 }
 function update({time=0,weights=[0,0,0,0],stress=0,mirror=0},at=ctx.currentTime){
  const tension=clamp(stress),[depth,drift,spin,tilt]=weights;
  clean.gain.setTargetAtTime(1-tension,at,.1);dirty.gain.setTargetAtTime(tension*.3,at,.1);filter.frequency.setTargetAtTime(1800+spin*1700+tension*1800-depth*850,at,.2);
  for(const v of voices){const base=92.5*v.ratio*(1-depth*.19);v.osc.frequency.setTargetAtTime(base,at,.18);v.osc.detune.setTargetAtTime(Math.sin(time*.25+v.i)*3+tilt*12*Math.sin(time*.43-v.i),at,.1);v.mod.frequency.setTargetAtTime(base*(2.003+tension*.41)+tension*Math.sin(time*7+v.i)*12,at,.09);v.fm.gain.setTargetAtTime(6+v.i*2+spin*14+mirror*1.5+tension*(100+v.i*42),at,.13);v.pan.pan.setTargetAtTime(Math.sin(time*.12+v.i*1.7)*(.38+drift*.5),at,.15);}
 }
 return {master,update,dispose(){for(const o of oscillators){try{o.stop();}catch{}}for(const n of nodes)n.disconnect();}};
}
export class RotorAudio{
 constructor(){this.enabled=false;this.volume=.45;this.paused=false;}
 async enable(){if(!this.ctx){this.ctx=new AudioContext();this.graph=buildResonator(this.ctx);}await this.ctx.resume();this.enabled=true;this.level();}
 level(){if(this.graph)this.graph.master.gain.setTargetAtTime(this.enabled&&!this.paused?this.volume*.7:0,this.ctx.currentTime,.18);}
 setVolume(v){this.volume=clamp(v);this.level();}setPaused(v){this.paused=v;this.level();}mute(){this.enabled=false;this.level();}
 update(field,mirror){if(this.enabled&&this.ctx.state==='running')this.graph.update({time:field.time,weights:field.weights,stress:field.stress,mirror});}
 dispose(){this.graph?.dispose();this.ctx?.close();}
}
