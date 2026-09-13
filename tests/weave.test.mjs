import test from 'node:test';
import assert from 'node:assert/strict';
import {WeaveWorld,GLYPHS,STEP} from '../public/experiments/weave/v1/physics.mjs';
const advance=(w,n)=>{for(let i=0;i<n;i++)w.step();};
const finite=w=>assert.ok(w.nodes.every(n=>[n.baseX,n.baseY,n.dx,n.dy,n.z,n.vx,n.vy,n.vz].every(Number.isFinite)));

test('a dense permanent glyph grid covers desktop and mobile canvases',()=>{
 const desktop=new WeaveWorld(1280,720),identity=desktop.nodes.map(n=>n.glyph);assert.ok(desktop.count>1700);assert.equal(GLYPHS.length,90);assert.ok(desktop.nodes.some(n=>n.baseX<0)&&desktop.nodes.some(n=>n.baseX>1280));advance(desktop,240);assert.deepEqual(desktop.nodes.map(n=>n.glyph),identity);finite(desktop);
 const mobile=new WeaveWorld(390,700);assert.ok(mobile.count>650);finite(mobile);
});

test('dwelling builds a wider and taller three-axis elastic wave',()=>{
 const w=new WeaveWorld(1200,700);w.move(600,350);advance(w,35);const early={dwell:w.dwell,range:w.range,amplitude:w.amplitude,affected:w.nodes.filter(n=>Math.abs(n.z)>1).length};advance(w,250);const late={dwell:w.dwell,range:w.range,amplitude:w.amplitude,affected:w.nodes.filter(n=>Math.abs(n.z)>1).length};assert.ok(late.dwell>.95);assert.ok(late.range>early.range*1.8);assert.ok(late.amplitude>early.amplitude*2.5);assert.ok(late.affected>early.affected*1.35,`${early.affected} -> ${late.affected}`);assert.ok(w.nodes.some(n=>Math.abs(n.dx)>2)&&w.nodes.some(n=>Math.abs(n.dy)>2)&&w.nodes.some(n=>Math.abs(n.z)>25));finite(w);
});

test('held input gathers an amorphous knot, vibrates, and pulls the wider fabric',()=>{
 const w=new WeaveWorld(1200,700);w.move(520,310);advance(w,120);const before=w.clusterRadius();w.setHeld(true);advance(w,130);const after=w.clusterRadius(),outer=w.nodes.filter(n=>Math.hypot(n.baseX-520,n.baseY-310)>300&&Math.hypot(n.dx,n.dy)>2).length,fast=w.nodes.filter(n=>Math.hypot(n.vx,n.vy,n.vz)>20).length;assert.equal(w.knot,1);assert.ok(after<before*.75,`${before} -> ${after}`);assert.ok(outer>150,`outer pull ${outer}`);assert.ok(fast>300,`vibrating ${fast}`);finite(w);
});

test('release restores the flat regular fabric without numerical residue',()=>{
 const w=new WeaveWorld(900,620);w.move(450,300);advance(w,180);w.setHeld(true);advance(w,130);w.setHeld(false);w.pointer.active=false;advance(w,900);assert.equal(w.knot,0);assert.equal(w.dwell,0);assert.ok(w.energy<.001);assert.ok(Math.max(...w.nodes.map(n=>Math.hypot(n.dx,n.dy,n.z)))<.01);assert.equal(STEP,1/90);finite(w);
});
