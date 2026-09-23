import {registerLabAudio} from '../../../lab/audio-bridge.mjs';
import {AbyssalWorld,STEP} from './physics.mjs';
import {CreatureAudio} from './audio.mjs';
const canvas=document.querySelector('#creature'),ctx=canvas.getContext('2d',{alpha:false}),main=document.querySelector('main'),readout=document.querySelector('#readout'),status=document.querySelector('#status');
const soundButton=document.querySelector('#sound'),pauseButton=document.querySelector('#pause'),flashButton=document.querySelector('#flash'),audio=new CreatureAudio();
registerLabAudio(audio,()=>paused);
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const glyphs=Array.from('◈◇◊◌◍◎◉◐◑◒◓◔◕◖◗◘◙◚◛◜◝◞◟◠◡◢◣◤◥◧◨◩◪◫◬◭◮◰◱◲◳◴◵◶◷◸◹◺◿▣▤▥▦▧▨▩▰▱△▽▷◁▵▿▹◃⌖⌘⎔⬡⬢⬣⬠⬟⯁⯂⯃⯄⯅⯆⯇⯈');
await document.fonts.load('20px LabSymbols');
const atlas=glyphs.map(g=>{const c=document.createElement('canvas');c.width=c.height=64;const s=c.getContext('2d');s.font='44px LabSymbols';s.textAlign='center';s.textBaseline='middle';s.fillStyle='#e4e4e4';s.fillText(g,32,30);const d=s.getImageData(0,0,64,64).data;let x0=64,y0=64,x1=0,y1=0;for(let y=0;y<64;y++)for(let x=0;x<64;x++)if(d[(y*64+x)*4+3]>20){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}return {c,x:x0,y:y0,w:x1-x0+1,h:y1-y0+1};});
let world,width=1,height=1,raf=0,last=0,accumulator=0,lastReadout=0,paused=reduced.matches,flashEnabled=!reduced.matches,hand=false,pointerId=null;
function glyph(index,x,y,size,angle=0,alpha=1){const a=atlas[index%atlas.length];ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);ctx.rotate(angle);const w=size*Math.min(1.4,a.w/a.h);ctx.drawImage(a.c,a.x,a.y,a.w,a.h,-w/2,-size/2,w,size);ctx.restore();}
function draw(){
 ctx.globalAlpha=1;ctx.fillStyle='#080808';ctx.fillRect(0,0,width,height);
 // Quiet fixed markers define a tank rather than a conventional web page.
 ctx.fillStyle='#343434';for(const [x,y,sx,sy] of [[15,15,1,1],[width-15,15,-1,1],[15,height-15,1,-1],[width-15,height-15,-1,-1]]){ctx.fillRect(x,y,sx*8,1);ctx.fillRect(x,y,1,sy*8);}
 for(const f of world.food){glyph([0,2,61,69,74][f.id%5],f.x,f.y,f.size,Math.sin(f.phase+world.time*.2)*.2,.6);}
 const b=world.body;
 for(const arm of world.arms){
  for(let j=arm.nodes.length-1;j>=0;j--){const p=arm.nodes[j],prev=j?arm.nodes[j-1]:b;const hash=((p.id+121)*16807)%2147483647;
   glyph(hash%glyphs.length,p.x,p.y,p.size*world.scale,Math.atan2(p.y-prev.y,p.x-prev.x)-Math.PI/2,.58+.36*(1-j/arm.nodes.length));
  }
 }
 const r=world.radius,t=world.time,agitation=world.caught?4:world.mode==='STRIKE'?2.5:1;
 ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.angle);
 // Glyph-only chassis, counter-rotating gears, articulated plates and a two-part jaw.
 glyph(68,0,0,r*1.85,Math.sin(t*.3)*.1,.94);
 glyph(5,0,0,r*1.15,t*.24*agitation,.7);
 for(let i=0;i<3;i++){const a=i*Math.PI*2/3+t*.18,rr=r*.52;glyph(67,Math.cos(a)*rr,Math.sin(a)*rr,r*.55,-t*.7*agitation+i,.92);}
 glyph(0,0,0,r*.64,t*.46*agitation,1);
 for(let i=0;i<4;i++){const a=i*Math.PI/2+.7;glyph(56,Math.cos(a)*r*.84,Math.sin(a)*r*.84,r*.31,a+Math.sin(t*1.6+i)*.25,.82);}
 const jaw=world.mode==='STRIKE'?r*.36:r*(.13+.06*Math.sin(t*1.3));
 glyph(60,r*.88,-jaw,r*.55,-.55,1);glyph(61,r*.88,jaw,r*.55,.55,1);
 glyph(6,r*.48,-r*.38,r*.19,0,1);glyph(6,r*.48,r*.38,r*.19,0,1);
 ctx.restore();
 if(world.pointer.active){const p=world.pointer;ctx.strokeStyle=world.caught?'#eee':'#777';ctx.lineWidth=1;const side=world.caught?20:10;ctx.strokeRect(Math.round(p.x)-side/2+.5,Math.round(p.y)-side/2+.5,side,side);}
 main.classList.toggle('inverted',flashEnabled&&world.flash&&!paused);
}
function telemetry(force=false){if(!force&&world.time-lastReadout<.2)return;lastReadout=world.time;readout.textContent=[`state   = ${world.mode}`,`limbs   = 6 / 150 links`,`fluid   = VISCOUS`,`speed   = ${world.body.speed.toFixed(1)} px/s`,`center  = ${world.body.x.toFixed(1)} / ${world.body.y.toFixed(1)}`,`prey    = ${world.food.length}`,`eaten   = ${world.eaten}`,`input   = ${hand?'HAND':'POINTER'}`,`time    = ${world.time.toFixed(1)} s`].join('\n');status.textContent=world.caught?'CAPTURED / RELEASE TO LET IT GO':world.mode==='ESCAPE'?'ESCAPE RESPONSE / GIVE IT SPACE':world.mode==='STRIKE'?'PREDATION / RAPID STRIKE':'WATCH QUIETLY / IT IS HUNTING';}
function resize(){const r=canvas.getBoundingClientRect();width=r.width;height=r.height;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);if(world)world.resize(width,height);else world=new AbyssalWorld(width,height);draw();telemetry(true);}
function tick(now){raf=0;if(paused||document.hidden){last=0;return;}const dt=last?Math.min(.08,(now-last)/1000):STEP;last=now;accumulator+=dt;while(accumulator>=STEP){world.step();accumulator-=STEP;}audio.update(world);draw();telemetry();raf=requestAnimationFrame(tick);}
function start(){if(!raf&&!paused&&!document.hidden)raf=requestAnimationFrame(tick);}
function pause(value){paused=value;world.release();last=0;accumulator=0;audio.setPaused(paused);pauseButton.textContent=paused?'[ RESUME ]':'[ PAUSE ]';pauseButton.setAttribute('aria-pressed',String(paused));if(paused){cancelAnimationFrame(raf);raf=0;draw();}else start();}
function position(e,down=world.pointer.down){if(hand)return;const b=canvas.getBoundingClientRect();world.move(e.clientX-b.left,e.clientY-b.top,down);}
canvas.addEventListener('pointermove',e=>{if(pointerId===null||pointerId===e.pointerId)position(e);});
canvas.addEventListener('pointerdown',e=>{if(pointerId!==null)return;pointerId=e.pointerId;canvas.setPointerCapture(pointerId);position(e,true);});
function release(e){if(e.pointerId!==pointerId)return;pointerId=null;if(!hand)world.release();}
canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);canvas.addEventListener('lostpointercapture',()=>{pointerId=null;if(!hand)world.release();});canvas.addEventListener('pointerleave',()=>{if(pointerId===null&&!hand)world.release();});
canvas.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='p'){e.preventDefault();pause(!paused);}else if(e.key===' '){e.preventDefault();world.move(world.pointer.x,world.pointer.y,true);}else if(e.key.startsWith('Arrow')){e.preventDefault();const p=world.pointer,x=p.active?p.x:width*.5,y=p.active?p.y:height*.5;world.move(x+(e.key==='ArrowRight'?20:e.key==='ArrowLeft'?-20:0),y+(e.key==='ArrowDown'?20:e.key==='ArrowUp'?-20:0),p.down);}});
canvas.addEventListener('keyup',e=>{if(e.key===' '){e.preventDefault();world.move(world.pointer.x,world.pointer.y,false);}});
window.addEventListener('lab-hand',e=>{const wasHand=hand;hand=Boolean(e.detail.tracked);if(!hand){if(wasHand)world.release();return;}world.move((e.detail.x+1)*.5*width,(e.detail.y+1)*.5*height,Boolean(e.detail.fist));});
soundButton.addEventListener('click',async()=>{try{if(audio.enabled){audio.mute();soundButton.textContent='[ ENABLE SOUND ]';soundButton.setAttribute('aria-pressed','false');}else{await audio.enable();audio.setVolume(Number(document.querySelector('#volume').value));audio.setPaused(paused);soundButton.textContent='[ MUTE SOUND ]';soundButton.setAttribute('aria-pressed','true');}}catch{status.textContent='AUDIO UNAVAILABLE / TRY ANOTHER BROWSER';}});
document.querySelector('#volume').addEventListener('input',e=>audio.setVolume(Number(e.target.value)));
function setFlash(value){flashEnabled=value;flashButton.textContent=value?'[ FLASH ON ]':'[ FLASH OFF ]';flashButton.setAttribute('aria-pressed',String(value));draw();}
flashButton.addEventListener('click',()=>setFlash(!flashEnabled));pauseButton.addEventListener('click',()=>pause(!paused));
window.addEventListener('blur',()=>{if(!hand)world.release();});document.addEventListener('visibilitychange',()=>{world.release();if(document.hidden){cancelAnimationFrame(raf);raf=0;last=0;audio.ctx?.suspend();main.classList.remove('inverted');}else{if(audio.enabled)audio.ctx?.resume();start();}});
window.addEventListener('pagehide',()=>audio.dispose());reduced.addEventListener('change',e=>{if(e.matches)setFlash(false);pause(e.matches);});
new ResizeObserver(resize).observe(canvas);resize();setFlash(flashEnabled);pause(paused);start();
