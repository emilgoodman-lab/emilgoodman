import test from 'node:test';
import assert from 'node:assert/strict';
import {RotorField,zoneWeights,mirrorSectors} from '../public/experiments/rotor/v1/geometry.mjs';
test('cardinal fields separate, blend on diagonals, and combine at center',()=>{
 assert.deepEqual(zoneWeights(0,0),[1,1,1,1]);assert.deepEqual(zoneWeights(0,0,false),[0,0,0,0]);
 for(const [i,[x,y]] of [[0,-1],[1,0],[0,1],[-1,0]].entries()){const w=zoneWeights(x,y);assert.ok(w[i]>.99);assert.ok(w[(i+2)%4]<.01);}
 const w=zoneWeights(.7,-.7);assert.ok(w[0]>.45&&w[1]>.45&&w[2]<.01&&w[3]<.01);
});
test('stable one-glyph rings, depth projection and delayed rotation stay finite',()=>{
 const f=new RotorField(1280,720),ids=f.rings.map(r=>[r.glyph,r.count]);const r=f.rings[8];const p=f.point(r,0);f.weights[0]=1;const deep=f.point(r,0);assert.ok(deep.z>p.z&&deep.alpha<p.alpha&&deep.size<p.size);
 f.move(0,0);for(let i=0;i<1800;i++)f.step(1/60);assert.deepEqual(f.rings.map(r=>[r.glyph,r.count]),ids);assert.ok(f.weights.every(w=>w>.99));assert.ok(Math.abs(f.rings[3].x-f.rings[23].x)>1);
 for(const ring of f.rings)for(let j=0;j<ring.count;j+=9){const p=f.point(ring,j);assert.ok(Object.values(p).every(Number.isFinite));assert.ok(p.size>0&&p.alpha>=.16&&p.alpha<=.94);}
});
test('held fist toggles once, release rearms; agitation and resize remain bounded',()=>{
 const f=new RotorField(390,844);f.hand(true,.1,.3,true);assert.equal(f.inverted,true);for(let i=0;i<240;i++){f.hand(true,.2,.3,true);f.step(1/60);}assert.equal(f.inverted,true);assert.ok(f.stress>.99);f.hand(true,0,0,false);f.hand(true,0,0,true);assert.equal(f.inverted,false);f.hand(false);assert.equal(f.pointer.active,false);assert.equal(f.handClosed,false);
 f.resize(844,390);assert.equal(f.rings.length,28);assert.ok(f.rings.every(r=>r.radius>0&&r.count>=12));assert.deepEqual([0,1,2,8].map(mirrorSectors),[0,2,4,16]);
});
