import test from 'node:test';
import assert from 'node:assert/strict';
import {WeaveWorld,GLYPHS,STEP} from '../public/experiments/weave/v2/physics.mjs';
import {weaveSoundFrame} from '../public/experiments/weave/v2/audio.mjs';
const advance=(w,n)=>{for(let i=0;i<n;i++)w.step();};
const finite=w=>assert.ok(w.nodes.every(n=>[n.baseX,n.baseY,n.dx,n.dy,n.z,n.vx,n.vy,n.vz].every(Number.isFinite)));

test('a dense permanent glyph grid covers desktop and mobile canvases',()=>{
 const desktop=new WeaveWorld(1280,720),identity=desktop.nodes.map(n=>n.glyph);assert.ok(desktop.count>1700);assert.equal(GLYPHS.length,90);assert.ok(desktop.nodes.some(n=>n.baseX<0)&&desktop.nodes.some(n=>n.baseX>1280));advance(desktop,240);assert.deepEqual(desktop.nodes.map(n=>n.glyph),identity);finite(desktop);
 const mobile=new WeaveWorld(390,700);assert.ok(mobile.count>650);finite(mobile);
});

test('dwelling builds a wider and taller three-axis elastic wave',()=>{
 const w=new WeaveWorld(1200,700);w.move(600,350);advance(w,35);const early={dwell:w.dwell,range:w.range,amplitude:w.amplitude,affected:w.nodes.filter(n=>Math.abs(n.z)>1).length};advance(w,250);const late={dwell:w.dwell,range:w.range,amplitude:w.amplitude,affected:w.nodes.filter(n=>Math.abs(n.z)>1).length};assert.ok(late.dwell>.95);assert.ok(late.range>early.range*1.8);assert.ok(late.amplitude>early.amplitude*2.5);assert.ok(late.affected>early.affected*1.35,`${early.affected} -> ${late.affected}`);assert.ok(w.nodes.some(n=>Math.abs(n.dx)>2)&&w.nodes.some(n=>Math.abs(n.dy)>2)&&w.nodes.some(n=>Math.abs(n.z)>25));finite(w);
});

test('the wave begins slowly and grows continuously without a phase jump',()=>{
 const w=new WeaveWorld(1200,700);w.move(600,350);const amplitudes=[],ranges=[],phaseSteps=[];let previous=0;for(let i=0;i<288;i++){w.step();amplitudes.push(w.amplitude);ranges.push(w.range);phaseSteps.push(w.wavePhase-previous);previous=w.wavePhase;}assert.ok(amplitudes.every((v,i)=>!i||v>=amplitudes[i-1]));assert.ok(ranges.every((v,i)=>!i||v>=ranges[i-1]));assert.ok(amplitudes[29]<6);assert.ok(ranges[29]<65);assert.ok(amplitudes[119]>35&&amplitudes[119]<48);assert.ok(amplitudes.at(-1)>100);assert.ok(Math.max(...phaseSteps)<.035);assert.ok(phaseSteps[0]<phaseSteps.at(-1));
});

test('calm sound follows the exact visual sine from trough to crest',()=>{
 const base={x:.5,y:.5,dwell:.8,knot:0,energy:.5,waveEnergy:.6},low=weaveSoundFrame({...base,waveSignal:-1}),mid=weaveSoundFrame({...base,waveSignal:0}),high=weaveSoundFrame({...base,waveSignal:1}),left=weaveSoundFrame({...base,x:.1,waveSignal:0}),right=weaveSoundFrame({...base,x:.9,waveSignal:0});assert.equal(low.crest,0);assert.equal(mid.crest,.5);assert.equal(high.crest,1);assert.ok(low.calmGain<mid.calmGain&&mid.calmGain<high.calmGain);assert.ok(low.pitch<mid.pitch&&mid.pitch<high.pitch);assert.ok(Math.abs(high.calmGain/low.calmGain-6.25)<1e-9);assert.ok(right.pitch>left.pitch*1.7);
});

test('held input gathers a much larger amorphous knot, vibrates, and pulls the wider fabric',()=>{
 const w=new WeaveWorld(1200,700);w.move(520,310);advance(w,120);const before=w.clusterRadius();w.setHeld(true);advance(w,130);const after=w.clusterRadius(),outer=w.nodes.filter(n=>Math.hypot(n.baseX-520,n.baseY-310)>300&&Math.hypot(n.dx,n.dy)>8).length,gathered=w.nodes.filter(n=>Math.hypot(n.baseX+n.dx-520,n.baseY+n.dy-310)<170).length,fast=w.nodes.filter(n=>Math.hypot(n.vx,n.vy,n.vz)>20).length;assert.equal(w.knot,1);assert.ok(after<before*.55,`${before} -> ${after}`);assert.ok(gathered>480,`gathered ${gathered}`);assert.ok(outer>1200,`outer pull ${outer}`);assert.ok(fast>1300,`vibrating ${fast}`);finite(w);
});

test('release restores the flat regular fabric without numerical residue',()=>{
 const w=new WeaveWorld(900,620);w.move(450,300);advance(w,180);w.setHeld(true);advance(w,130);w.setHeld(false);w.pointer.active=false;advance(w,900);assert.equal(w.knot,0);assert.equal(w.dwell,0);assert.ok(w.energy<.001);assert.ok(Math.max(...w.nodes.map(n=>Math.hypot(n.dx,n.dy,n.z)))<.01);assert.equal(STEP,1/90);finite(w);
});
