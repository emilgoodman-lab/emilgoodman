import {RotorField,mirrorSectors,TAU} from './geometry.mjs';
import {RotorAudio} from './audio.mjs';
const canvas=document.querySelector('#rings'),ctx=canvas.getContext('2d',{alpha:false}),source=document.createElement('canvas'),sctx=source.getContext('2d',{alpha:false});
const main=document.querySelector('main'),readout=document.querySelector('#readout'),mirrorInput=document.querySelector('#mirror'),pauseButton=document.querySelector('#pause'),soundButton=document.querySelector('#sound'),invertButton=document.querySelector('#invert'),audio=new RotorAudio();
const reduced=matchMedia('(prefers-reduced-motion: reduce)');let paused=reduced.matches,width=1,height=1,sourceSize=1,dpr=1,world,raf=0,last=0,mirror=0,hand=false,lastReadout=-1,pointerId=null,down=null;
await document.fonts.load('24px LabSymbols');
const atlas=new Map();
function sprite(glyph){if(atlas.has(glyph))return atlas.get(glyph);const c=document.createElement('canvas');c.width=c.height=72;const cctx=c.getContext('2d');cctx.fillStyle='#e4e4e4';cctx.font='46px LabSymbols';cctx.textAlign='center';cctx.textBaseline='middle';cctx.fillText(glyph,36,34);atlas.set(glyph,c);return c;}
function draw(){
 sctx.setTransform(dpr,0,0,dpr,0,0);sctx.globalAlpha=1;sctx.fillStyle='#080808';sctx.fillRect(0,0,sourceSize,sourceSize);sctx.translate(sourceSize/2,sourceSize/2);
 for(const ring of world.rings){const image=sprite(ring.glyph);for(let j=0;j<ring.count;j++){const p=world.point(ring,j);if(Math.abs(p.x)>sourceSize/2+p.size*2||Math.abs(p.y)>sourceSize/2+p.size*2)continue;sctx.save();sctx.translate(p.x,p.y);sctx.rotate(p.angle);sctx.globalAlpha=p.alpha;const size=p.size*1.55;sctx.drawImage(image,-size/2,-size/2,size,size);sctx.restore();}}
 ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle='#080808';ctx.fillRect(0,0,width,height);const sectors=mirrorSectors(mirror);
 if(!sectors)ctx.drawImage(source,(width-sourceSize)/2,(height-sourceSize)/2,sourceSize,sourceSize);
 else {const step=TAU/sectors,radius=Math.hypot(width,height),start=-Math.PI/2;ctx.translate(width/2,height/2);
  for(let i=0;i<sectors;i++){ctx.save();ctx.rotate(start+i*step);ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,radius,-.001,step+.001);ctx.closePath();ctx.clip();if(i%2){ctx.rotate(step);ctx.scale(1,-1);}ctx.rotate(-start);ctx.drawImage(source,-sourceSize/2,-sourceSize/2,sourceSize,sourceSize);ctx.restore();}
 }
 main.classList.toggle('inverted',world.inverted);
}
function telemetry(force=false){if(!force&&world.time-lastReadout<.18)return;lastReadout=world.time;const w=world.weights;readout.textContent=[`rings = ${world.rings.length} / ${world.count} glyphs`,`depth = ${w[0].toFixed(2)}  drift = ${w[1].toFixed(2)}`,`spin  = ${w[2].toFixed(2)}  tilt  = ${w[3].toFixed(2)}`,`input = ${hand?'HAND':'POINTER'} / ${world.inverted?'AGITATED':'CALM'}`,`time  = ${world.time.toFixed(1)} s`].join('\n');for(let i=0;i<4;i++)document.querySelector(`#zone${i}`).style.color=`rgb(${Math.round(95+w[i]*130)} ${Math.round(95+w[i]*130)} ${Math.round(95+w[i]*130)})`;}
function resize(){const b=canvas.getBoundingClientRect();width=b.width;height=b.height;dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);sourceSize=Math.ceil(Math.hypot(width,height));source.width=source.height=Math.round(sourceSize*dpr);if(world)world.resize(width,height);else world=new RotorField(width,height);draw();telemetry(true);}
function tick(now){raf=0;if(paused||document.hidden){last=0;return;}const dt=last?Math.min(.05,(now-last)/1000):1/60;last=now;for(let remaining=dt;remaining>0;remaining-=1/60)world.step(Math.min(remaining,1/60));audio.update(world,mirror);draw();telemetry();raf=requestAnimationFrame(tick);}
function start(){if(!raf&&!paused&&!document.hidden)raf=requestAnimationFrame(tick);}
function pause(value){paused=value;last=0;audio.setPaused(value);pauseButton.textContent=value?'[ RESUME ]':'[ PAUSE ]';pauseButton.setAttribute('aria-pressed',String(value));if(value){cancelAnimationFrame(raf);raf=0;}else start();telemetry(true);}
function polarity(){main.classList.toggle('inverted',world.inverted);invertButton.textContent=world.inverted?'[ RESTORE ]':'[ INVERT ]';invertButton.setAttribute('aria-pressed',String(world.inverted));document.querySelector('#mode').textContent=world.inverted?'AGITATION':'CONTEMPLATION';document.querySelector('#status').textContent=world.inverted?'DISTORTION / CLICK OR FIST TO RESTORE':'CLICK / FIST TO SWITCH POLARITY';audio.update(world,mirror);draw();telemetry(true);}
function toggle(){world.toggle();polarity();}
function position(e){if(hand)return;const b=canvas.getBoundingClientRect();world.move((e.clientX-b.left)/width*2-1,(e.clientY-b.top)/height*2-1);}
canvas.addEventListener('pointermove',e=>{if(pointerId===null||e.pointerId===pointerId)position(e);});
canvas.addEventListener('pointerdown',e=>{if(pointerId!==null)return;pointerId=e.pointerId;down={x:e.clientX,y:e.clientY,time:performance.now()};canvas.setPointerCapture(pointerId);position(e);});
canvas.addEventListener('pointerup',e=>{if(e.pointerId!==pointerId)return;position(e);if(down&&Math.hypot(e.clientX-down.x,e.clientY-down.y)<14&&performance.now()-down.time<700)toggle();pointerId=null;down=null;});
function release(){pointerId=null;down=null;}
canvas.addEventListener('pointercancel',release);canvas.addEventListener('lostpointercapture',release);canvas.addEventListener('pointerleave',()=>{if(pointerId===null&&!hand)world.pointer.active=false;});
canvas.addEventListener('keydown',e=>{if(e.key===' '){e.preventDefault();if(!e.repeat)toggle();}else if(e.key.toLowerCase()==='p'){e.preventDefault();if(!e.repeat)pause(!paused);}else if(e.key.startsWith('Arrow')){e.preventDefault();world.move(world.pointer.x+(e.key==='ArrowRight'?.12:e.key==='ArrowLeft'?-.12:0),world.pointer.y+(e.key==='ArrowDown'?.12:e.key==='ArrowUp'?-.12:0));}});
window.addEventListener('lab-hand',e=>{hand=Boolean(e.detail.tracked);const before=world.inverted;world.hand(hand,e.detail.x,e.detail.y,Boolean(e.detail.fist));if(before!==world.inverted)polarity();});
window.addEventListener('blur',()=>{release();if(!hand)world.pointer.active=false;});
mirrorInput.addEventListener('input',()=>{mirror=Number(mirrorInput.value);document.querySelector('#mirror-value').textContent=mirror===0?'OFF':mirror===1?'MIRROR':`${mirrorSectors(mirror)} FOLDS`;draw();});
invertButton.addEventListener('click',toggle);pauseButton.addEventListener('click',()=>pause(!paused));
soundButton.addEventListener('click',async()=>{try{if(audio.enabled){audio.mute();soundButton.textContent='[ ENABLE SOUND ]';soundButton.setAttribute('aria-pressed','false');}else{await audio.enable();audio.setVolume(Number(document.querySelector('#volume').value));audio.setPaused(paused);soundButton.textContent='[ MUTE SOUND ]';soundButton.setAttribute('aria-pressed','true');}}catch{document.querySelector('#status').textContent='AUDIO UNAVAILABLE / TRY ANOTHER BROWSER';}});
document.querySelector('#volume').addEventListener('input',e=>audio.setVolume(Number(e.target.value)));
document.addEventListener('visibilitychange',()=>{release();if(document.hidden){cancelAnimationFrame(raf);raf=0;last=0;audio.ctx?.suspend();}else{if(audio.enabled)audio.ctx?.resume();start();}});
window.addEventListener('pagehide',()=>audio.dispose());reduced.addEventListener('change',e=>pause(e.matches));new ResizeObserver(resize).observe(canvas);resize();pause(paused);start();
