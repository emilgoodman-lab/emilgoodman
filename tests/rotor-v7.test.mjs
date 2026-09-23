import test from 'node:test';
import assert from 'node:assert/strict';
import {RotorField as DenseRotor} from '../public/experiments/rotor/v6/geometry.mjs';
import {RotorField as EnlargedRotor,trackPoint,TAU} from '../public/experiments/rotor/v7/geometry.mjs';
import {frameIndex} from '../public/experiments/rotor/v7/swimmer.mjs';

const durations=Array(121).fill(40);

test('six rings keep exactly one quarter of the previous swimmer count',()=>{
 for(const [width,height] of [[1280,720],[390,620],[900,900]]){
  const dense=new DenseRotor(width,height),large=new EnlargedRotor(width,height);
  assert.equal(large.rings.length,6);
  assert.ok(large.rings.every(r=>r.swimmer));
  assert.deepEqual(large.rings.map(r=>r.count),dense.rings.map(r=>Math.max(3,Math.round(r.count/4))));
 }
});

test('default GIF playback remains exactly synchronized across sparse rings',()=>{
 const world=new EnlargedRotor(1200,760);
 for(let time=0;time<12;time+=.319){
  const frames=world.rings.flatMap(r=>Array.from({length:r.count},(_,j)=>frameIndex(time,0,j,r.count,r.i,durations)));
  assert.equal(new Set(frames).size,1);
 }
});

test('frame delay and staggered axis rotation survive the sparse layout',()=>{
 const world=new EnlargedRotor(1000,700);world.move(0,-.75);
 for(let i=0;i<360;i++)world.step(1/60);
 const frames=world.rings.flatMap(r=>Array.from({length:r.count},(_,j)=>frameIndex(world.time,world.delayMix,j,r.count,r.i,durations)));
 assert.ok(new Set(frames).size>12);
 world.move(0,.75);for(let i=0;i<600;i++)world.step(1/60);
 assert.ok(world.axisMix>.98);
 const turns=world.rings.flatMap(r=>Array.from({length:r.count},(_,j)=>world.point(r,j).selfTurn));
 assert.ok(new Set(turns.map(v=>v.toFixed(3))).size>12);
});

test('the outer sparse ring remains a fixed opaque octagon',()=>{
 const world=new EnlargedRotor(390,620);world.hold(true);for(let i=0;i<300;i++)world.step(1/60);
 const ring=world.rings.at(-1);
 for(let j=0;j<ring.count;j++){
  const point=world.point(ring,j),track=trackPoint(ring.radius,1,TAU*j/ring.count+ring.phase);
  assert.ok(Math.hypot(point.x-track.x,point.y-track.y)<1e-8);assert.equal(point.z,0);assert.equal(point.alpha,1);
 }
});
