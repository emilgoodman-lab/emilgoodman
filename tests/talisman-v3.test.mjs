import test from 'node:test';import assert from 'node:assert/strict';
import {headPose,easeEnergy} from '../public/experiments/abyssal/v3/head.mjs';
import {AbyssalWorld} from '../public/experiments/abyssal/v3/physics.mjs';
import {AbyssalWorld as Original} from '../public/experiments/abyssal/v1/physics.mjs';
test('arcade creature preserves the original physics',()=>assert.equal(AbyssalWorld,Original));
test('head retains every component, mounting point, scale and painter order across state transitions',()=>{
 const identity=headPose(0).map(p=>[p.id,p.sprite,p.size]);let energy=0,last=headPose(0);
 for(let i=1;i<36000;i++){const t=i/120;energy=easeEnergy(energy,i%700<180?1:0,1/120);const pose=headPose(t,energy);assert.deepEqual(pose.map(p=>[p.id,p.sprite,p.size]),identity);
  for(let k=0;k<pose.length;k++){assert.ok(Math.abs(pose[k].angle-last[k].angle)<.01);assert.ok(Math.hypot(pose[k].x-last[k].x,pose[k].y-last[k].y)<.002);if(!pose[k].id.startsWith('jaw')){assert.equal(pose[k].x,last[k].x);assert.equal(pose[k].y,last[k].y);}}last=pose;
 }
});
