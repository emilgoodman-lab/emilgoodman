import test from 'node:test';
import assert from 'node:assert/strict';
import {RotorField,trackPoint,TAU} from '../public/experiments/rotor/v6/geometry.mjs';
import {frameIndex} from '../public/experiments/rotor/v6/swimmer.mjs';

const durations=Array(121).fill(40);

test('six rings are made entirely from permanent swimmer assets',()=>{
 const world=new RotorField(1200,760);
 assert.equal(world.rings.length,6);
 assert.ok(world.rings.every(r=>r.swimmer));
 assert.deepEqual(world.rings.map(r=>r.i),[0,1,2,3,4,5]);
 for(let i=0;i<300;i++)world.step(1/60);
 assert.equal(world.rings.length,6);
});

test('all swimmers share one exact frame until the upper delay zone is active',()=>{
 for(let time=0;time<20;time+=.217){
  const frames=[];
  for(let ring=0;ring<6;ring++)for(let j=0;j<24;j++)frames.push(frameIndex(time,0,j,24,ring,durations));
  assert.equal(new Set(frames).size,1);
 }
 const world=new RotorField(1000,700);world.move(0,-.75);
 for(let i=0;i<360;i++)world.step(1/60);
 assert.ok(world.delayMix>.98);
 const delayed=[];
 for(let ring=0;ring<6;ring++)for(let j=0;j<20;j++)delayed.push(frameIndex(world.time,world.delayMix,j,20,ring,durations));
 assert.ok(new Set(delayed).size>30);
});

test('lower zone creates slow staggered local-axis rotation and releases smoothly',()=>{
 const world=new RotorField(1000,700);world.move(0,.75);
 for(let i=0;i<360;i++)world.step(1/60);
 assert.ok(world.axisMix>.98);
 const turns=world.rings.flatMap(r=>[0,Math.floor(r.count/3),Math.floor(r.count*2/3)].map(j=>world.point(r,j).selfTurn));
 assert.ok(new Set(turns.map(v=>v.toFixed(3))).size>12);
 assert.ok(turns.every(v=>Math.abs(v)<=Math.PI*.93));
 world.hand(false);
 for(let i=0;i<900;i++)world.step(1/60);
 assert.equal(world.axisMix,0);
 assert.ok(world.rings.every(r=>Math.abs(world.point(r,0).selfTurn)<1e-10));
});

test('outer swimmer ring remains a fixed opaque octagon under held motion',()=>{
 const world=new RotorField(390,620);world.hold(true);
 for(let i=0;i<300;i++)world.step(1/60);
 const ring=world.rings.at(-1);
 for(let j=0;j<ring.count;j++){
  const point=world.point(ring,j),track=trackPoint(ring.radius,1,TAU*j/ring.count+ring.phase);
  assert.ok(Math.hypot(point.x-track.x,point.y-track.y)<1e-8);
  assert.equal(point.z,0);assert.equal(point.alpha,1);
 }
});
