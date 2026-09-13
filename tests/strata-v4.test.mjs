import test from 'node:test';
import assert from 'node:assert/strict';
import {StrataWorld as StrataIII} from '../public/experiments/strata/v3/physics.mjs';
import {StrataWorld,GLYPHS,LAYER_COUNTS,COUNT,excludeFromCircle,layersCollide} from '../public/experiments/strata/v4/physics.mjs';

const advance=(world,steps)=>{for(let i=0;i<steps;i++)world.step();};
const finite=world=>assert.ok(world.particles.every(p=>[p.x,p.y,p.vx,p.vy,p.r].every(Number.isFinite)));
const outside=world=>world.particles.every(p=>Math.hypot(p.x-world.pointer.x,p.y-world.pointer.y)>=world.broomRadius+p.r+.999);

test('Strata IV preserves all 5000 permanent grains and three independent layers',()=>{
 const world=new StrataWorld(1200,720),identity=world.particles.map(p=>[p.layer,p.glyph,p.size]);assert.equal(COUNT,5000);assert.deepEqual(LAYER_COUNTS,[1667,1667,1666]);assert.equal(GLYPHS.length,90);assert.deepEqual([0,1,2].map(layer=>world.particles.filter(p=>p.layer===layer).length),LAYER_COUNTS);advance(world,120);assert.deepEqual(world.particles.map(p=>[p.layer,p.glyph,p.size]),identity);assert.equal(layersCollide({layer:1},{layer:1}),true);assert.equal(layersCollide({layer:1},{layer:2}),false);finite(world);
});

test('grain size remains exactly the Strata III scale',()=>{
 const oldWorld=new StrataIII(1200,720),world=new StrataWorld(1200,720);assert.equal(world.base,oldWorld.base);for(let i=0;i<COUNT;i++)assert.equal(world.particles[i].r,oldWorld.particles[i].r);
});

test('the exclusion helper projects a grain and its full radius outside the circle',()=>{
 const pointer={x:400,y:300,vx:120,vy:-40},p={id:7,x:400,y:300,vx:0,vy:0,r:8};assert.equal(excludeFromCircle(p,pointer,90,800,600),true);assert.ok(Math.hypot(p.x-pointer.x,p.y-pointer.y)>=99);assert.equal(excludeFromCircle(p,pointer,90,800,600),false);assert.ok(p.vx!==0||p.vy!==0);
});

test('the active circle interior is completely empty after every physics step',()=>{
 const world=new StrataWorld(1200,720);advance(world,300);world.move(600,360);for(let i=0;i<200;i++){const p=world.particles[i],a=i*.73,d=(i%9)/9*world.broomRadius;p.x=600+Math.cos(a)*d;p.y=360+Math.sin(a)*d;}world.step();assert.ok(outside(world));assert.ok(world.particles.slice(0,200).every(p=>Math.hypot(p.x-600,p.y-360)>=world.broomRadius+p.r+1));for(let i=0;i<119;i++){world.step();assert.ok(outside(world),`grain entered exclusion circle at step ${i}`);}finite(world);
});

test('fast moving exclusion ring cannot tunnel through grains',()=>{
 const world=new StrataWorld(1200,720);advance(world,250);const points=[[80,80],[1120,90],[1100,650],[100,640],[600,360],[1080,340],[140,330]];for(const [x,y] of points){world.move(x,y);for(let i=0;i<5;i++){world.step();assert.ok(outside(world),`grain entered at ${x},${y}`);}}assert.ok(world.sweepActivity>.25);finite(world);
});

test('held turbulence stays strong while the circle remains impenetrable',()=>{
 const world=new StrataWorld(1100,680);world.move(550,340);world.setHeld(true);for(let i=0;i<150;i++){world.step();assert.ok(outside(world));}assert.ok(world.moving>4900,`moving ${world.moving}`);assert.ok(world.contactsByLayer.every(n=>n>1000),world.contactsByLayer.join('/'));assert.ok(world.windActivity>.4);finite(world);
});

test('edge positions and mobile resize preserve walls and exclusion',()=>{
 const world=new StrataWorld(390,700);for(const [x,y] of [[0,0],[390,0],[390,700],[0,700],[195,350]]){world.move(x,y);for(let i=0;i<20;i++){world.step();assert.ok(outside(world));assert.ok(world.particles.every(p=>p.x>=p.r&&p.x<=world.width-p.r&&p.y>=p.r&&p.y<=world.height-p.r));}}finite(world);
});
