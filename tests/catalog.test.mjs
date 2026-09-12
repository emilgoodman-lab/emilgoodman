import test from 'node:test';
import assert from 'node:assert/strict';
import {access} from 'node:fs/promises';
import {works,navigation,workURL} from '../public/lab/catalog.mjs';
test('catalog entries resolve to preserved artwork files and stable links',async()=>{
 assert.equal(new Set(works.map(w=>w.id)).size,works.length);
 for(const work of works){assert.match(work.id,/^[a-z0-9-]+$/);assert.match(work.path,/^\/experiments\/[a-z-]+\/v\d+\/$/);await access(new URL('../public'+work.path+'index.html',import.meta.url));assert.equal(new URL(workURL(work.id),'https://example.com').searchParams.get('work'),work.id);}
});
test('previous and next wrap, and extending the list needs no navigation changes',()=>{
 assert.equal(navigation(works[0].id).previous.id,works.at(-1).id);assert.equal(navigation(works.at(-1).id).next.id,works[0].id);
 const more=[...works,{id:'new-work'}];assert.equal(navigation(works.at(-1).id,more).next.id,'new-work');assert.equal(navigation('new-work',more).next.id,works[0].id);assert.equal(navigation('missing'),null);
});
