import test from 'node:test';
import assert from 'node:assert/strict';
import {StrataWorld as StrataII} from '../public/experiments/strata/v2/physics.mjs';
import {StrataWorld,GLYPHS,LAYER_COUNTS,COUNT,ringWeight,ringInfluence,layersCollide} from '../public/experiments/strata/v3/physics.mjs';

const advance=(world,steps)=>{for(let i=0;i<steps;i++)world.step();};
const finite=world=>assert.ok(world.particles.every(p=>[p.x,p.y,p.vx,p.vy,p.r].every(Number.isFinite)));

test('5000 permanent grains split exactly across three independent layers',()=>{
 const world=new StrataWorld(1200,720),identity=world.particles.map(p=>[p.layer,p.glyph,p.size]);assert.equal(COUNT,5000);assert.deepEqual(LAYER_COUNTS,[1667,1667,1666]);assert.deepEqual([0,1,2].map(layer=>world.particles.filter(p=>p.layer===layer).length),LAYER_COUNTS);assert.equal(GLYPHS.length,90);advance(world,180);assert.deepEqual(world.particles.map(p=>[p.layer,p.glyph,p.size]),identity);assert.equal(layersCollide({layer:0},{layer:0}),true);assert.equal(layersCollide({layer:0},{layer:2}),false);finite(world);
});

test('every physical and visible grain is exactly half the Strata II scale',()=>{
 const oldWorld=new StrataII(1200,720),world=new StrataWorld(1200,720);assert.equal(world.base/oldWorld.base,.5);for(let i=0;i<3000;i++)assert.ok(Math.abs(world.particles[i].r/oldWorld.particles[i].r-.5)<1e-12);assert.ok(world.particles.every(p=>p.size>=.75&&p.size<=1.25));
});

test('only the dashed circumference collides; the circle interior is empty',()=>{
 const radius=100,grain=7;assert.equal(ringInfluence(0,radius,grain),0);assert.equal(ringInfluence(50,radius,grain),0);assert.equal(ringInfluence(89,radius,grain),0);assert.equal(ringInfluence(100,radius,grain),1);assert.equal(ringInfluence(111,radius,grain),0);assert.equal(ringWeight(0,10),1);assert.ok(ringWeight(9,10)>.49&&ringWeight(9,10)<.51);assert.equal(ringWeight(10,10),0);
});

test('moving ring boundary sweeps a broad band without filling its interior',()=>{
 const world=new StrataWorld(1200,720);advance(world,400);let peak=0;for(let i=0;i<80;i++){world.move(220+i*10,360+Math.sin(i*.25)*35);world.step();peak=Math.max(peak,world.sweepActivity);}assert.ok(world.moving>350,`moving ${world.moving}`);assert.ok(peak>.9,`ring ${peak}`);finite(world);
});

test('multidirectional held wind remains strong across all 5000 grains',()=>{
 const world=new StrataWorld(1100,680);world.move(550,340);world.setHeld(true);advance(world,150);const angle=world.windAngle;assert.ok(world.moving>4900,`moving ${world.moving}`);assert.ok(world.contactsByLayer.every(n=>n>1000),world.contactsByLayer.join('/'));advance(world,150);assert.notEqual(world.windAngle,angle);assert.ok(Math.abs(world.windPan)<=1);finite(world);
});

test('the denser three-layer table settles and resizes safely on mobile',()=>{
 const world=new StrataWorld(1200,720);advance(world,500);assert.equal(world.moving,0);assert.ok(world.activity<.001);world.resize(390,700);advance(world,350);assert.ok(world.particles.every(p=>p.x>=p.r&&p.x<=world.width-p.r&&p.y>=p.r&&p.y<=world.height-p.r));finite(world);
});
