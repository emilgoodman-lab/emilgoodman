import {RotorField,mirrorSectors,TAU} from './geometry.mjs';
import {RotorAudio} from './audio.mjs';
import {makeCollage} from './collage.mjs';
const canvas=document.querySelector('#rings'),ctx=canvas.getContext('2d',{alpha:false}),source=document.createElement('canvas'),sctx=source.getContext('2d',{alpha:false}),main=document.querySelector('main'),audio=new RotorAudio(),reduced=matchMedia('(prefers-reduced-motion: reduce)');
const skin=await makeCollage();
let paused=reduced.matches,width=1,height=1,sourceSize=1,dpr=1,world,raf=0,last=0,mirror=0,hand=false,pointerId=null,soundPending=false,wheelTime=0;
const cursor={active:false,x:0,y:0,closed:false};
function draw(){
 const limitX=(mirror?sourceSize:width)/2,limitY=(mirror?sourceSize:height)/2;
 sctx.setTransform(dpr,0,0,dpr,0,0);sctx.globalAlpha=1;sctx.fillStyle='#000';sctx.fillRect(0,0,sourceSize,sourceSize);sctx.translate(sourceSize/2,sourceSize/2);
 for(const ring of world.rings){if(ring.u===1)continue;const image=skin.sprites[ring.motif];for(let j=0;j<ring.count;j++){const p=world.point(ring,j),size=p.size*3.25;if(Math.abs(p.x)>limitX+size||Math.abs(p.y)>limitY+size)continue;sctx.save();sctx.translate(p.x,p.y);sctx.rotate(p.angle);sctx.transform(Math.cos(p.localY),0,Math.sin(p.localX)*Math.sin(p.localY),Math.cos(p.localX),0,0);sctx.globalAlpha=1;sctx.drawImage(image,-size/2,-size/2,size,size);sctx.restore();}}
 ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle='#000';ctx.fillRect(0,0,width,height);const sectors=mirrorSectors(mirror);
 if(!sectors)ctx.drawImage(source,(width-sourceSize)/2,(height-sourceSize)/2,sourceSize,sourceSize);
 else{const step=TAU/sectors,radius=Math.hypot(width,height),start=-Math.PI/2;ctx.save();ctx.translate(width/2,height/2);for(let i=0;i<sectors;i++){ctx.save();ctx.rotate(start+i*step);ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,radius,-.001,step+.001);ctx.closePath();ctx.clip();if(i%2){ctx.rotate(step);ctx.scale(1,-1);}ctx.rotate(-start);ctx.drawImage(source,-sourceSize/2,-sourceSize/2,sourceSize,sourceSize);ctx.restore();}ctx.restore();}
 // Draw the fixed boundary after kaleidoscope compositing: every mirror level
 // preserves the same eight sides, while its ornaments still turn locally.
 const outer=world.rings.at(-1);ctx.save();ctx.translate(width/2,height/2);
 for(let j=0;j<outer.count;j++){const p=world.point(outer,j),size=p.size*3.25;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.angle);ctx.transform(Math.cos(p.localY),0,Math.sin(p.localX)*Math.sin(p.localY),Math.cos(p.localX),0,0);ctx.globalAlpha=1;ctx.drawImage(skin.sprites[outer.motif],-size/2,-size/2,size,size);ctx.restore();}ctx.restore();
 if(cursor.active)ctx.drawImage(skin.hands[cursor.closed?1:0],cursor.x-29,cursor.y-31,58,58);
 main.classList.toggle('inverted',world.inverted&&!reduced.matches);syncControls();
}
let lastUI=-1;
function syncControls(){if(world.time-lastUI<.2&&lastUI>=0&&!paused)return;lastUI=world.time;const soundButton=document.querySelector('#sound');soundButton.textContent=audio.enabled?'[ MUTE SOUND ]':'[ ENABLE SOUND ]';soundButton.setAttribute('aria-pressed',String(audio.enabled));const p=document.querySelector('#pause');p.textContent=paused?'[ RESUME ]':'[ PAUSE ]';p.setAttribute('aria-pressed',String(paused));document.querySelector('#mirror').value=mirror;document.querySelector('#mirror-value').textContent=mirror?mirrorSectors(mirror)+' FOLDS':'OFF';document.querySelector('#readout').textContent='10 RINGS / OPAQUE / '+(paused?'PAUSED':world.inverted?'HOLD':world.pointer.active?'INTERACTIVE':'AUTO 2×');}
function resize(){const b=canvas.getBoundingClientRect();width=b.width;height=b.height;dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);sourceSize=Math.ceil(Math.hypot(width,height));source.width=source.height=Math.round(sourceSize*dpr);if(world)world.resize(width,height);else world=new RotorField(width,height);if(cursor.active){cursor.x=(world.pointer.x+1)*width/2;cursor.y=(world.pointer.y+1)*height/2;}draw();}
function tick(now){raf=0;if(paused||document.hidden){last=0;return;}const dt=last?Math.min(.05,(now-last)/1000):1/60;last=now;for(let remaining=dt;remaining>0;remaining-=1/60)world.step(Math.min(remaining,1/60));audio.update(world,mirror);draw();raf=requestAnimationFrame(tick);}
function start(){if(!raf&&!paused&&!document.hidden)raf=requestAnimationFrame(tick);}
function hold(value){world.hold(value);cursor.closed=Boolean(value);if(paused)draw();}
function pause(value){paused=value;last=0;hold(false);audio.setPaused(value);if(value){cancelAnimationFrame(raf);raf=0;draw();}else start();}
async function sound(){if(audio.enabled||soundPending)return;soundPending=true;try{await audio.enable();audio.setVolume(Number(document.querySelector('#volume').value));audio.setPaused(paused);}catch{document.querySelector('#camera-status').textContent='Sound unavailable. Visual controls remain active.';}finally{soundPending=false;}}
function position(e){if(hand)return;const b=canvas.getBoundingClientRect();cursor.x=e.clientX-b.left;cursor.y=e.clientY-b.top;cursor.active=true;world.move(cursor.x/width*2-1,cursor.y/height*2-1);if(paused)draw();}
canvas.addEventListener('pointermove',e=>{if(pointerId===null||e.pointerId===pointerId)position(e);});
canvas.addEventListener('pointerdown',e=>{if(pointerId!==null||hand)return;sound();pointerId=e.pointerId;canvas.setPointerCapture(pointerId);position(e);hold(true);});
function release(e){if(e&&e.pointerId!==pointerId)return;pointerId=null;if(!hand){hold(false);if(e?.pointerType==='touch'){cursor.active=false;world.pointer.active=false;}}if(paused)draw();}
canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);canvas.addEventListener('lostpointercapture',()=>release());canvas.addEventListener('pointerleave',()=>{if(pointerId===null&&!hand){world.pointer.active=false;cursor.active=false;if(paused)draw();}});
canvas.addEventListener('wheel',e=>{e.preventDefault();if(performance.now()-wheelTime<170)return;wheelTime=performance.now();mirror=Math.max(0,Math.min(8,mirror+(e.deltaY>0?1:-1)));draw();},{passive:false});
canvas.addEventListener('keydown',e=>{if(e.key===' '){e.preventDefault();sound();hold(true);}else if(e.key.toLowerCase()==='p'&&!e.repeat){pause(!paused);}else if(e.key.toLowerCase()==='m'&&!e.repeat){if(audio.enabled)audio.mute();else sound();}else if(e.key.toLowerCase()==='k'&&!e.repeat){mirror=(mirror+1)%9;draw();}else if(e.key.startsWith('Arrow')){e.preventDefault();world.move(world.pointer.x+(e.key==='ArrowRight'?.12:e.key==='ArrowLeft'?-.12:0),world.pointer.y+(e.key==='ArrowDown'?.12:e.key==='ArrowUp'?-.12:0));Object.assign(cursor,{active:true,x:(world.pointer.x+1)*width/2,y:(world.pointer.y+1)*height/2});if(paused)draw();}});
canvas.addEventListener('keyup',e=>{if(e.key===' '){e.preventDefault();hold(false);}});
window.addEventListener('lab-hand',e=>{const wasHand=hand;hand=Boolean(e.detail.tracked);if(!hand){if(wasHand){world.hand(false);cursor.active=false;cursor.closed=false;}if(paused)draw();return;}world.hand(true,e.detail.x,e.detail.y,Boolean(e.detail.fist));Object.assign(cursor,{active:true,x:(world.pointer.x+1)*width/2,y:(world.pointer.y+1)*height/2,closed:world.handClosed});if(paused)draw();});
document.querySelector('#camera-toggle').addEventListener('click',sound);
document.querySelector('#sound').addEventListener('click',async()=>{if(audio.enabled)audio.mute();else await sound();lastUI=-1;syncControls();});
document.querySelector('#volume').addEventListener('input',e=>audio.setVolume(Number(e.target.value)));
document.querySelector('#pause').addEventListener('click',()=>{pause(!paused);lastUI=-1;syncControls();});
document.querySelector('#mirror').addEventListener('input',e=>{mirror=Number(e.target.value);lastUI=-1;draw();});
window.addEventListener('blur',()=>{release();world.hold(false);world.pointer.active=false;cursor.active=false;cursor.closed=false;if(paused)draw();});
document.addEventListener('visibilitychange',()=>{release();world.hold(false);world.pointer.active=false;cursor.active=false;cursor.closed=false;if(document.hidden){cancelAnimationFrame(raf);raf=0;last=0;audio.ctx?.suspend();}else{if(audio.enabled)audio.ctx?.resume();start();}});
window.addEventListener('pagehide',()=>audio.dispose());reduced.addEventListener('change',e=>pause(e.matches));new ResizeObserver(resize).observe(canvas);resize();pause(paused);start();
export function snapshot(){return {width,height,paused,hand,mirror,time:world.time,motionTime:world.motionTime,stress:world.stress,inverted:world.inverted,weights:[...world.weights],rings:world.rings.length,count:world.count,cursor:{...cursor},audioEnabled:audio.enabled,audioState:audio.ctx?.state};}
