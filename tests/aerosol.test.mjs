import test from 'node:test';
import assert from 'node:assert/strict';
import {AerosolWorld,GLYPHS,SHADES,MAX_MIST,MAX_PAINT,nextShade} from '../public/experiments/aerosol/v1/physics.mjs';

const advance=(world,steps)=>{for(let i=0;i<steps;i++)world.step();};
const finite=world=>assert.ok([...world.mist,...world.paint.values(),...world.drips].every(item=>[item.x,item.y].every(Number.isFinite)));

test('idle nozzle leaks falling glyph mist without painting the white surface',()=>{
 const world=new AerosolWorld(1000,700);advance(world,180);assert.equal(world.paint.size,0);assert.ok(world.mist.length>12&&world.mist.length<MAX_MIST);assert.ok(world.mist.every(p=>p.deposit===false&&p.glyph>=0&&p.glyph<GLYPHS.length));assert.ok(world.mist.some(p=>p.vx<0)&&world.mist.some(p=>p.vx>0));assert.ok(world.leakActivity>0);finite(world);
});

test('each new spray stroke selects a gray at least twenty percent apart',()=>{
 const world=new AerosolWorld(900,650),values=[];for(let i=0;i<12;i++){world.beginSpray();values.push(world.shade);world.endSpray();}for(let i=1;i<values.length;i++)assert.ok(Math.abs(values[i]-values[i-1])>=.2-1e-12,`${values[i-1]} -> ${values[i]}`);assert.ok(values.every(v=>SHADES.includes(v)));assert.equal(nextShade(.82,0),.1);
});

test('faulty spray forms a dense irregular near-circular field with satellite marks',()=>{
 const world=new AerosolWorld(1000,700,1);world.move(500,350);world.beginSpray();advance(world,270);world.endSpray();const distances=[...world.paint.values()].map(p=>Math.hypot(p.x-500,p.y-350));assert.ok(world.paint.size>500,`marks ${world.paint.size}`);assert.ok(world.deposits>1500);assert.ok(world.overwrites>800,`rewrites ${world.overwrites}`);assert.ok(Math.max(...distances)>world.brushRadius*1.45);assert.ok(distances.filter(d=>d<world.brushRadius).length>world.paint.size*.8);assert.ok(distances.filter(d=>d<world.brushRadius*.7).length>world.paint.size*.45);assert.ok(new Set(world.paint.values()).size===world.paint.size);finite(world);
});

test('repeated hits rewrite one spatial cell instead of stacking paint objects',()=>{
 const world=new AerosolWorld(600,500),key=world.key(300,250);world.deposit(300,250,.1);const first=world.paint.get(key),firstGlyph=first.glyph;for(let i=0;i<40;i++)world.deposit(300,250,.7);const current=world.paint.get(key);assert.equal(world.paint.size,1);assert.equal(current,first);assert.equal(current.hits,41);assert.equal(current.shade,.7);assert.ok(current.version>1);assert.ok(world.overwrites===40);assert.ok(current.glyph!==firstGlyph||GLYPHS.length>1);
});

test('saturated paint drips while fed, then stops and dries after release',()=>{
 const world=new AerosolWorld(900,700,23);world.move(450,250);world.beginSpray();advance(world,450);assert.ok(world.drips.length>20,`drips ${world.drips.length}`);assert.ok(world.activeDrips>0);assert.ok(world.wetCells>500);const marks=world.paint.size;world.endSpray();advance(world,900);assert.equal(world.activeDrips,0);assert.ok(world.wetCells<50,`wet ${world.wetCells}`);assert.ok(world.paint.size>=marks);finite(world);
});

test('brush control, bounded particle pool and resize remain stable',()=>{
 const world=new AerosolWorld(1200,720);world.setBrush(18);assert.equal(world.brushRadius,18);world.setBrush(999);assert.equal(world.brushRadius,150);world.move(1100,620);world.beginSpray();advance(world,500);assert.ok(world.mist.length<=MAX_MIST);assert.ok(world.paint.size<=MAX_PAINT);world.endSpray();world.resize(390,700);assert.ok([...world.paint.values()].every(p=>p.x>=0&&p.x<=world.width&&p.y>=0&&p.y<=world.height));finite(world);
});
