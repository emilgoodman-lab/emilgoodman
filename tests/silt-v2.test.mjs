import test from 'node:test';
import assert from 'node:assert/strict';
import {SiltWorld,COUNT,GLYPHS,STEP} from '../public/experiments/silt/v2/physics.mjs';
const advance=(world,n)=>{for(let i=0;i<n;i++)world.step();};
function bounds(w){assert.ok(w.particles.every(p=>[p.x,p.y,p.vx,p.vy].every(Number.isFinite)&&p.x>=p.r-.001&&p.x<=w.width-p.r+.001&&p.y>=p.r-.001&&p.y<=w.height-p.r+.001));}
function overlapRatio(w){let max=0;for(let i=0;i<COUNT;i++)for(let j=i+1;j<COUNT;j++){const a=w.particles[i],b=w.particles[j];max=Math.max(max,(a.r+b.r-Math.hypot(a.x-b.x,a.y-b.y))/Math.min(a.r,b.r));}return max;}
test('2000 permanent glyphs with ±30% sizes settle into a still, closely packed pile',()=>{
 const w=new SiltWorld(1266,610),ids=w.particles.map(p=>[p.glyph,p.size]);assert.equal(w.particles.length,COUNT);assert.ok(GLYPHS.length>=80);assert.ok(w.particles.every(p=>p.size>=.7&&p.size<=1.3));advance(w,1800);assert.ok(w.moving<10);assert.ok(w.activity<.005);const positions=w.particles.map(p=>[p.x,p.y]);advance(w,240);assert.deepEqual(w.particles.map(p=>[p.glyph,p.size]),ids);const movement=Math.max(...w.particles.map((p,i)=>Math.hypot(p.x-positions[i][0],p.y-positions[i][1])));assert.ok(movement<.12,`rest jitter ${movement}`);assert.ok(overlapRatio(w)<.33);bounds(w);
});
test('gravity produces a visibly accelerating fall instead of a slow drift',()=>{
 const w=new SiltWorld(1280,720),sample=w.particles.slice(0,64);for(const p of w.particles){p.vx=0;p.vy=0;}const start=sample.reduce((sum,p)=>sum+p.y,0)/sample.length;advance(w,12);const y=sample.reduce((sum,p)=>sum+p.y,0)/sample.length,vy=sample.reduce((sum,p)=>sum+p.vy,0)/sample.length;assert.ok(w.gravity>=1800);assert.ok(vy>150,`fall speed ${vy}`);assert.ok(y-start>7,`fall distance ${y-start}`);assert.equal(STEP,1/120);
});
test('circular stirring wakes the pile and contact sound density follows movement',()=>{
 const w=new SiltWorld(900,600);advance(w,1600);w.move(450,565);let active=0,density=0;for(let i=0;i<300;i++){if(i%10===0)w.move(450+Math.sin(i*.03)*120,550+Math.cos(i*.02)*25);w.step();active=Math.max(active,w.moving);density=Math.max(density,w.activity);}assert.ok(active>100);assert.ok(density>.03);bounds(w);w.release();advance(w,2200);assert.ok(w.moving<20);assert.ok(w.activity<.01);bounds(w);
});
test('the larger pulsing field throws a broad section of the pile dynamically',()=>{
 const w=new SiltWorld(1000,650);advance(w,1200);w.move(500,610);let fastest=0,affected=0,field=0;for(let i=0;i<180;i++){if(i%8===0)w.move(500+Math.sin(i*.12)*150,575+Math.cos(i*.09)*38);w.step();fastest=Math.max(fastest,...w.particles.map(p=>Math.hypot(p.vx,p.vy)));affected=Math.max(affected,w.moving);field=Math.max(field,w.fieldActivity);}assert.ok(w.radius>=110);assert.ok(fastest>700,`fastest ${fastest}`);assert.ok(affected>500,`affected ${affected}`);assert.ok(field>.1,`field ${field}`);bounds(w);
});
test('held zero gravity preserves free momentum; release restores settling on mobile',()=>{
 const w=new SiltWorld(390,700);advance(w,1600);w.setZero(true);const first=w.particles[500].vy;w.setZero(true);assert.equal(w.particles[500].vy,first);advance(w,240);assert.equal(w.zero,true);assert.ok(w.moving>500);w.move(195,350);advance(w,400);bounds(w);w.release();assert.equal(w.zero,false);assert.equal(w.pointer.active,false);advance(w,2200);assert.ok(w.moving<20);assert.ok(w.activity<.01);bounds(w);w.resize(700,390);advance(w,1000);bounds(w);
});
