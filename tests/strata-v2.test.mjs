import test from 'node:test';
import assert from 'node:assert/strict';
import {StrataWorld as StrataI} from '../public/experiments/strata/v1/physics.mjs';
import {StrataWorld,GLYPHS,COUNT,sweepWeight,layersCollide} from '../public/experiments/strata/v2/physics.mjs';

const advance=(world,steps)=>{for(let i=0;i<steps;i++)world.step();};
const finite=world=>assert.ok(world.particles.every(p=>[p.x,p.y,p.vx,p.vy,p.r].every(Number.isFinite)));

test('all 3000 physical and visible grains are four times the Strata I scale',()=>{
 const oldWorld=new StrataI(1200,720),world=new StrataWorld(1200,720);assert.equal(COUNT,3000);assert.equal(GLYPHS.length,90);assert.equal(world.base/oldWorld.base,4);for(let i=0;i<COUNT;i++)assert.ok(Math.abs(world.particles[i].r/oldWorld.particles[i].r-4)<1e-12);assert.deepEqual([0,1,2].map(layer=>world.particles.filter(p=>p.layer===layer).length),[1000,1000,1000]);finite(world);
});

test('solid broom has a flat interior and only an eight-percent feathered rim',()=>{
 const radius=100;assert.equal(sweepWeight(0,radius),1);assert.equal(sweepWeight(90,radius),1);assert.equal(sweepWeight(92,radius),1);assert.ok(sweepWeight(96,radius)>.49&&sweepWeight(96,radius)<.51);assert.equal(sweepWeight(100,radius),0);assert.equal(sweepWeight(110,radius),0);
});

test('large same-layer grains settle cleanly while layers remain independent',()=>{
 const world=new StrataWorld(1200,720);advance(world,450);assert.equal(world.moving,0);assert.ok(world.activity<.001);assert.equal(layersCollide({layer:1},{layer:1}),true);assert.equal(layersCollide({layer:1},{layer:2}),false);finite(world);
});

test('a moving solid broom sweeps a broad, sharply bounded mass of sand',()=>{
 const world=new StrataWorld(1200,720);advance(world,300);let peak=0;for(let i=0;i<42;i++){world.move(300+i*12,360+Math.sin(i*.3)*22);world.step();peak=Math.max(peak,world.sweepActivity);}assert.ok(world.moving>500,`moving ${world.moving}`);assert.ok(world.contacts>700,`contacts ${world.contacts}`);assert.ok(peak>.9,`sweep ${peak}`);finite(world);
});

test('the established multidirectional held wind still reaches every layer',()=>{
 const world=new StrataWorld(1000,650);world.move(500,325);world.setHeld(true);advance(world,140);const angle=world.windAngle;assert.ok(world.moving>2950,`moving ${world.moving}`);assert.ok(world.contactsByLayer.every(n=>n>1000),world.contactsByLayer.join('/'));advance(world,140);assert.notEqual(world.windAngle,angle);assert.ok(Math.abs(world.windPan)<=1);finite(world);
});

test('responsive large grains remain finite and bounded on a phone canvas',()=>{
 const world=new StrataWorld(390,700);advance(world,500);assert.ok(world.base>15&&world.base<17);assert.ok(world.particles.every(p=>p.x>=p.r&&p.x<=world.width-p.r&&p.y>=p.r&&p.y<=world.height-p.r));finite(world);
});
