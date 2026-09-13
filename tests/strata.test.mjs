import test from 'node:test';
import assert from 'node:assert/strict';
import {StrataWorld,GLYPHS,LAYERS,PER_LAYER,COUNT,STEP,layersCollide} from '../public/experiments/strata/v1/physics.mjs';

const advance=(world,steps)=>{for(let i=0;i<steps;i++)world.step();};
const finite=world=>assert.ok(world.particles.every(p=>[p.x,p.y,p.vx,p.vy,p.r,p.size,p.angle].every(Number.isFinite)));

test('three permanent layers contain exactly one thousand uncommon glyph grains each',()=>{
 const world=new StrataWorld(1200,720),identity=world.particles.map(p=>[p.layer,p.glyph,p.size]);
 assert.equal(LAYERS,3);assert.equal(PER_LAYER,1000);assert.equal(COUNT,3000);assert.equal(world.particles.length,3000);assert.equal(GLYPHS.length,90);
 assert.deepEqual([0,1,2].map(layer=>world.particles.filter(p=>p.layer===layer).length),[1000,1000,1000]);
 assert.ok(world.particles.every(p=>p.size>=.75&&p.size<=1.25));advance(world,180);assert.deepEqual(world.particles.map(p=>[p.layer,p.glyph,p.size]),identity);finite(world);
});

test('collision policy isolates layers while allowing contacts inside each layer',()=>{
 assert.equal(layersCollide({layer:0},{layer:0}),true);assert.equal(layersCollide({layer:0},{layer:1}),false);assert.equal(layersCollide({layer:2},{layer:1}),false);
 const world=new StrataWorld(900,600);world.move(450,300);world.setHeld(true);advance(world,80);assert.ok(world.contactsByLayer.every(count=>count>0),world.contactsByLayer.join('/'));finite(world);
});

test('circular broom sweep displaces a broad local field and raises granular activity',()=>{
 const world=new StrataWorld(1100,680);advance(world,450);let peakSweep=0;for(let i=0;i<42;i++){world.move(310+i*11,340+Math.sin(i*.35)*28);world.step();peakSweep=Math.max(peakSweep,world.sweepActivity);}advance(world,8);
 assert.ok(world.moving>120,`moving ${world.moving}`);assert.ok(peakSweep>.2,`sweep ${peakSweep}`);assert.ok(world.contacts>0);finite(world);
});

test('held input drives changing multidirectional wind through almost the whole table',()=>{
 const world=new StrataWorld(1100,680);advance(world,320);world.move(550,340);world.setHeld(true);advance(world,140);const firstAngle=world.windAngle;
 assert.ok(world.moving>2500,`moving ${world.moving}`);assert.ok(world.windStrength>=.48&&world.windStrength<=1);assert.ok(world.windPan>=-1&&world.windPan<=1);assert.ok(world.contactsByLayer.every(count=>count>0));advance(world,140);assert.notEqual(world.windAngle,firstAngle);finite(world);
});

test('release removes the wind and lets all layers settle inside resized walls',()=>{
 const world=new StrataWorld(900,620);world.move(450,310);world.setHeld(true);advance(world,150);world.release();advance(world,900);world.resize(390,700);advance(world,120);
 assert.equal(world.held,false);assert.equal(world.windStrength,0);assert.ok(world.windActivity<.001);assert.ok(world.particles.every(p=>p.x>=p.r&&p.x<=world.width-p.r&&p.y>=p.r&&p.y<=world.height-p.r));assert.equal(STEP,1/90);finite(world);
});
