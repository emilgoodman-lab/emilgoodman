const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const curve=drive=>{const n=1024,out=new Float32Array(n),k=18+drive*150;for(let i=0;i<n;i++){const x=i*2/(n-1)-1;out[i]=(1+k)*x/(1+k*Math.abs(x));}return out;};
const noiseBuffer=(ctx,seconds=2)=>{const b=ctx.createBuffer(2,ctx.sampleRate*seconds,ctx.sampleRate);for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);let last=0;for(let i=0;i<d.length;i++){last=last*.88+(Math.random()*2-1)*.12;d[i]=last;}}return b;};
export function weaveSoundFrame(state){const p=state.pointer||{x:state.x??.5,y:state.y??.5},nx=state.x??(state.width?p.x/state.width:.5),ny=state.y??(state.height?p.y/state.height:.5),dwell=clamp(state.dwell??0,0,1),knot=clamp(state.knot??0,0,1),energy=clamp(state.energy??0,0,1),wave=clamp(state.waveEnergy??energy,0,1),signal=clamp(state.waveSignal??Math.sin((state.time||0)*(.65+dwell*2.45)),-1,1),crest=(signal+1)/2,positionPitch=92*Math.pow(2,clamp(nx,0,1)*1.35)+clamp(ny,0,1)*22;return{nx,ny,dwell,knot,energy,wave,signal,crest,pitch:positionPitch*Math.pow(2,signal*.13),calmGain:(.004+dwell*.068+wave*.026)*(.16+crest*.84)*(1-knot*.84)};}

export function buildWeaveAudio(ctx){
 const master=ctx.createGain(),compressor=ctx.createDynamicsCompressor(),calmBus=ctx.createGain(),knotBus=ctx.createGain(),dry=ctx.createGain(),wet=ctx.createGain(),pan=ctx.createStereoPanner(),filter=ctx.createBiquadFilter();master.gain.value=.45;calmBus.gain.value=0;knotBus.gain.value=0;dry.gain.value=.72;wet.gain.value=.32;filter.type='lowpass';filter.frequency.value=1600;filter.Q.value=.7;compressor.threshold.value=-20;compressor.knee.value=18;compressor.ratio.value=5;compressor.attack.value=.008;compressor.release.value=.24;
 calmBus.connect(filter).connect(pan);pan.connect(dry).connect(compressor);pan.connect(wet);
 const delays=[{t:.31,p:-.72},{t:.47,p:.72},{t:.73,p:-.25}].map(({t,p})=>{const d=ctx.createDelay(1),fb=ctx.createGain(),tone=ctx.createBiquadFilter(),stereo=ctx.createStereoPanner();d.delayTime.value=t;fb.gain.value=.27;tone.type='lowpass';tone.frequency.value=2100;stereo.pan.value=p;wet.connect(d);d.connect(tone).connect(stereo).connect(compressor);tone.connect(fb).connect(d);return{d,fb,tone,stereo};});
 const voices=[1,1.498,2.01,3.02].map((ratio,i)=>{const osc=ctx.createOscillator(),gain=ctx.createGain(),panner=ctx.createStereoPanner();osc.type=i<2?'sine':'triangle';osc.frequency.value=110*ratio;gain.gain.value=i?0.035:0.055;panner.pan.value=[-.62,.58,-.18,.25][i];osc.connect(gain).connect(panner).connect(calmBus);osc.start();return{osc,gain,ratio};});
 const air=ctx.createBufferSource(),airFilter=ctx.createBiquadFilter(),airGain=ctx.createGain(),airPan=ctx.createStereoPanner();air.buffer=noiseBuffer(ctx);air.loop=true;airFilter.type='bandpass';airFilter.frequency.value=560;airFilter.Q.value=2.5;airGain.gain.value=.018;air.connect(airFilter).connect(airGain).connect(airPan).connect(calmBus);air.start();
 const shaper=ctx.createWaveShaper(),knotFilter=ctx.createBiquadFilter(),knotPan=ctx.createStereoPanner();shaper.curve=curve(.4);shaper.oversample='4x';knotFilter.type='bandpass';knotFilter.frequency.value=340;knotFilter.Q.value=2.2;knotBus.connect(shaper).connect(knotFilter).connect(knotPan);knotPan.connect(compressor);knotPan.connect(wet);
 const chaos=[1,1.337,1.887].map((ratio,i)=>{const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type=i===1?'sawtooth':'triangle';osc.frequency.value=82*ratio;gain.gain.value=[.055,.025,.019][i];osc.connect(gain).connect(knotBus);osc.start();return{osc,gain,ratio};});
 const trem=ctx.createOscillator(),tremGain=ctx.createGain();trem.type='square';trem.frequency.value=13;tremGain.gain.value=.035;trem.connect(tremGain).connect(knotBus.gain);trem.start();compressor.connect(master).connect(ctx.destination);
 let lastDrive=-1;
 const update=(state,at=ctx.currentTime)=>{const f=weaveSoundFrame(state),{nx,ny,dwell,knot,energy,signal,crest}=f;
  calmBus.gain.setTargetAtTime(f.calmGain,at,.035);filter.frequency.setTargetAtTime((650+ny*1250+dwell*1000)*(.82+crest*.28),at,.045);pan.pan.setTargetAtTime(clamp(nx*2-1,-.85,.85),at,.08);airFilter.frequency.setTargetAtTime((330+nx*760)*(.88+crest*.18),at,.055);airGain.gain.setTargetAtTime((.004+dwell*.024+energy*.018)*(.2+crest*.8),at,.04);
  voices.forEach((v,i)=>{v.osc.frequency.setTargetAtTime(f.pitch*v.ratio,at,.035);v.gain.gain.setTargetAtTime((i?0.027:0.05)*(1+dwell*.7),at,.08);});
  knotBus.gain.setTargetAtTime(knot*(.1+energy*.16),at,.025);knotFilter.frequency.setTargetAtTime(170+nx*650+Math.sin((state.time||0)*5.7)*90*knot,at,.035);knotPan.pan.setTargetAtTime(Math.sin((state.time||0)*3.1)*.78*knot,at,.04);trem.frequency.setTargetAtTime(10+knot*24+dwell*8,at,.04);tremGain.gain.setTargetAtTime(knot*(.025+energy*.07),at,.03);chaos.forEach((v,i)=>v.osc.frequency.setTargetAtTime((68+ny*96)*v.ratio*(1+Math.sin((state.time||0)*(7+i*2.3))*.055*knot),at,.025));
  const drive=clamp(knot*.8+energy*.45,0,1);if(Math.abs(drive-lastDrive)>.04){shaper.curve=curve(drive);lastDrive=drive;}wet.gain.setTargetAtTime(.22+dwell*.18+knot*.28,at,.1);
 };
 const dispose=()=>{[...voices.map(v=>v.osc),...chaos.map(v=>v.osc),trem,air].forEach(n=>{try{n.stop();}catch{}});master.disconnect();};
 return{master,calmBus,knotBus,delays,update,dispose};
}

export class WeaveAudio{
 constructor(){this.ctx=null;this.graph=null;this.enabled=false;this.volume=.5;}
 async enable(){if(!this.ctx){this.ctx=new AudioContext();this.graph=buildWeaveAudio(this.ctx);this.setVolume(this.volume);}await this.ctx.resume();this.enabled=true;}
 mute(){this.enabled=false;if(this.graph)this.graph.master.gain.setTargetAtTime(0,this.ctx.currentTime,.04);}
 setVolume(value){this.volume=clamp(value,0,1);if(this.graph)this.graph.master.gain.setTargetAtTime(this.enabled?this.volume*.72:0,this.ctx.currentTime,.04);}
 setPaused(value){if(!this.ctx)return;if(value)this.ctx.suspend();else if(this.enabled)this.ctx.resume();}
 update(world){if(this.enabled&&this.graph)this.graph.update(world);}
 dispose(){this.graph?.dispose();this.ctx?.close();this.ctx=this.graph=null;this.enabled=false;}
}
