import {AbyssalWorld,STEP} from './physics.mjs';
import {CreatureAudio} from './audio.mjs';
import {makeCollage} from './collage.mjs';
const canvas=document.querySelector('#creature'),ctx=canvas.getContext('2d',{alpha:false}),audio=new CreatureAudio(),reduced=matchMedia('(prefers-reduced-motion: reduce)');
const skin=await makeCollage(),paper=ctx.createPattern(skin.paper,'repeat');
let world,width=1,height=1,raf=0,last=0,accumulator=0,paused=reduced.matches,hand=false,pointerId=null,soundPending=false;
const cursor={active:false,x:0,y:0,down:false};
function piece(index,x,y,size,angle=0){ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.drawImage(skin.pieces[index%skin.pieces.length],-size*.8,-size*.8,size*1.6,size*1.6);ctx.restore();}
function draw(){
 ctx.fillStyle=paper;ctx.fillRect(0,0,width,height);
 for(const f of world.food){ctx.save();ctx.translate(f.x,f.y);ctx.rotate(Math.sin(f.phase+world.time*.2)*.2);ctx.drawImage(skin.stars[f.id%3],-f.size,-f.size,f.size*2,f.size*2);ctx.restore();}
 const b=world.body;
 for(const arm of world.arms)for(let j=arm.nodes.length-1;j>=0;j--){const p=arm.nodes[j],prev=j?arm.nodes[j-1]:b;piece((p.id*7+Math.floor(p.id/100)*3)%12,p.x,p.y,p.size*world.scale*1.65,Math.atan2(p.y-prev.y,p.x-prev.x)-Math.PI/2);}
 const r=world.radius,t=world.time,agitation=world.caught?4:world.mode==='STRIKE'?2.5:1;
 ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.angle);
 piece(1,0,0,r*2.6,Math.sin(t*.3)*.1);
 piece(4,0,0,r*1.95,t*.24*agitation);
 for(let i=0;i<3;i++){const a=i*Math.PI*2/3+t*.18,rr=r*.52;piece(0,Math.cos(a)*rr,Math.sin(a)*rr,r*.77,-t*.7*agitation+i);}
 piece(5,0,0,r*.88,t*.46*agitation);
 for(let i=0;i<4;i++){const a=i*Math.PI/2+.7;piece(7,Math.cos(a)*r*.99,Math.sin(a)*r*.99,r*.5,a+Math.sin(t*1.6+i)*.25);}
 const jaw=world.mode==='STRIKE'?r*.36:r*(.13+.06*Math.sin(t*1.3));
 piece(2,r*1.02,-jaw,r*.6,-.55);piece(2,r*1.02,jaw,r*.6,.55);
 ctx.restore();
 // Keep the habitat pink: capture agitation lives in the articulated paper.
 if(cursor.active){const p=cursor;ctx.drawImage(skin.hands[p.down?1:0],p.x-31,p.y-33,62,62);}
}
function resize(){const r=canvas.getBoundingClientRect();width=r.width;height=r.height;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);if(world)world.resize(width,height);else world=new AbyssalWorld(width,height);draw();}
function tick(now){raf=0;if(paused||document.hidden){last=0;return;}const dt=last?Math.min(.08,(now-last)/1000):STEP;last=now;accumulator+=dt;while(accumulator>=STEP){world.step();accumulator-=STEP;}audio.update(world);draw();raf=requestAnimationFrame(tick);}
function start(){if(!raf&&!paused&&!document.hidden)raf=requestAnimationFrame(tick);}
function pause(value){paused=value;world.release();last=0;accumulator=0;audio.setPaused(paused);if(paused){cancelAnimationFrame(raf);raf=0;draw();}else start();}
async function enableSound(){if(audio.enabled||soundPending)return;soundPending=true;try{await audio.enable();audio.setVolume(.5);audio.setPaused(paused);}catch{document.querySelector('#camera-status').textContent='Sound unavailable. The creature still responds to touch.';}finally{soundPending=false;}}
function position(e,down=world.pointer.down){if(hand)return;const b=canvas.getBoundingClientRect();Object.assign(cursor,{active:true,x:e.clientX-b.left,y:e.clientY-b.top,down});world.move(cursor.x,cursor.y,down);if(paused)draw();}
canvas.addEventListener('pointermove',e=>{if(pointerId===null||pointerId===e.pointerId)position(e);});
canvas.addEventListener('pointerdown',e=>{if(pointerId!==null)return;enableSound();pointerId=e.pointerId;canvas.setPointerCapture(pointerId);position(e,true);});
function release(e){if(e.pointerId!==pointerId)return;pointerId=null;if(!hand){world.release();cursor.down=false;cursor.active=e.pointerType!=='touch'&&cursor.x>=0&&cursor.x<=width&&cursor.y>=0&&cursor.y<=height;}if(paused)draw();}
canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);canvas.addEventListener('lostpointercapture',()=>{pointerId=null;if(!hand){world.release();cursor.down=false;}});canvas.addEventListener('pointerleave',()=>{if(pointerId===null&&!hand){world.release();cursor.active=false;if(paused)draw();}});
canvas.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='p'){e.preventDefault();pause(!paused);}else if(e.key.toLowerCase()==='m'){if(audio.enabled)audio.mute();else enableSound();}else if(e.key===' '){e.preventDefault();enableSound();world.move(world.pointer.x,world.pointer.y,true);}else if(e.key.startsWith('Arrow')){e.preventDefault();const p=world.pointer,x=p.active?p.x:width*.5,y=p.active?p.y:height*.5;world.move(x+(e.key==='ArrowRight'?20:e.key==='ArrowLeft'?-20:0),y+(e.key==='ArrowDown'?20:e.key==='ArrowUp'?-20:0),p.down);}if(paused)draw();});
canvas.addEventListener('keyup',e=>{if(e.key===' '){e.preventDefault();world.move(world.pointer.x,world.pointer.y,false);if(paused)draw();}});
window.addEventListener('lab-hand',e=>{const wasHand=hand;hand=Boolean(e.detail.tracked);if(!hand){if(wasHand){world.release();cursor.active=false;if(paused)draw();}return;}world.move((e.detail.x+1)*.5*width,(e.detail.y+1)*.5*height,Boolean(e.detail.fist));Object.assign(cursor,world.pointer);if(paused)draw();});
document.querySelector('#camera-toggle').addEventListener('click',enableSound);
window.addEventListener('blur',()=>{world.release();cursor.active=false;if(paused)draw();});document.addEventListener('visibilitychange',()=>{world.release();cursor.active=false;if(document.hidden){cancelAnimationFrame(raf);raf=0;last=0;accumulator=0;audio.ctx?.suspend();}else{if(audio.enabled)audio.ctx?.resume();start();}});
window.addEventListener('pagehide',()=>audio.dispose());reduced.addEventListener('change',e=>pause(e.matches));
new ResizeObserver(resize).observe(canvas);resize();pause(paused);start();
// Read-only diagnostics are available to a local test harness, never visible UI.
export function snapshot(){return {width,height,paused,hand,mode:world.mode,caught:world.caught,eaten:world.eaten,time:world.time,body:{x:world.body.x,y:world.body.y},pointer:{...world.pointer},arms:world.arms.length,nodes:world.arms.reduce((n,a)=>n+a.nodes.length,0),stretch:world.maxStretch(),audioEnabled:audio.enabled,audioState:audio.ctx?.state};}
