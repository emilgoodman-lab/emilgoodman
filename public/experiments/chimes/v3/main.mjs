import {ChainWorld,STEP} from './physics.mjs';
import {ChimeAudio,voiceParameters} from './audio.mjs';
const canvas=document.querySelector('#chains'),ctx=canvas.getContext('2d',{alpha:false});
const audio=new ChimeAudio(),soundButton=document.querySelector('#sound'),pauseButton=document.querySelector('#pause');
const status=document.querySelector('#status'),readout=document.querySelector('#readout');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const glyphs=Array.from('◈◇◊◌◍◎◉◐◑◒◓◔◕◖◗◘◙◚◛◜◝◞◟◠◡◢◣◤◥◧◨◩◪◫◬◭◮◰◱◲◳◴◵◶◷◸◹◺◿▣▤▥▦▧▨▩▰▱△▽▷◁▵▿▹◃⌖⌘⎔⬡⬢⬣⬠⬟⯁⯂⯃⯄⯅⯆⯇⯈');
await document.fonts.load('18px LabSymbols');
let width=1,height=1,dpr=1,world,atlas=[],paused=reduced.matches,last=0,accumulator=0,raf=0,lastTelemetry=0,pointerId=null,lastPointer=0,hand=false,lastHand=0;
function makeAtlas(){atlas=glyphs.map(g=>{const c=document.createElement('canvas');c.width=c.height=64;const s=c.getContext('2d');s.font='44px LabSymbols';s.textAlign='center';s.textBaseline='middle';s.fillStyle='#ddd';s.fillText(g,32,30);const pixels=s.getImageData(0,0,64,64).data;let x0=64,y0=64,x1=0,y1=0;for(let y=0;y<64;y++)for(let x=0;x<64;x++)if(pixels[(y*64+x)*4+3]>20){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}return {image:c,x:x0,y:y0,w:Math.max(1,x1-x0+1),h:Math.max(1,y1-y0+1)};});}
function resize(){const r=canvas.getBoundingClientRect();width=r.width;height=r.height;const ratio=Math.min(devicePixelRatio||1,2);if(ratio!==dpr||!atlas.length){dpr=ratio;makeAtlas();}canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);if(world)world.resize(width,height);else world=new ChainWorld(width,height);draw();telemetry(true);}
function draw(){
 ctx.globalAlpha=1;ctx.fillStyle='#080808';ctx.fillRect(0,0,width,height);
 ctx.strokeStyle='#555';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,8.5);ctx.lineTo(width,8.5);ctx.stroke();
 for(const c of world.chains){
  const n=c.nodes;
  for(let j=0;j<n.length;j++){
   const p=n[j],previous=n[Math.max(0,j-1)];
   const hash=((p.id+71)*16807)%2147483647;
   const g=j===0?50:hash%glyphs.length;const sprite=atlas[g],h=c.glyphUnit*p.size*1.025,w=h*Math.min(1.5,sprite.w/sprite.h);
   ctx.globalAlpha=j===0?.95:.55+((hash%71)/71)*.4;
   const tremor=j?p.vibration*Math.min(3.4,c.glyphUnit*.25):0;const phase=p.id*2.39996;
   ctx.save();ctx.translate(p.x+Math.sin(world.time*(145+p.id%19)+phase)*tremor,p.y+Math.cos(world.time*(127+p.id%23)+phase)*tremor*.65);if(j)ctx.rotate(Math.atan2(p.y-previous.y,p.x-previous.x)-Math.PI/2);
   ctx.drawImage(sprite.image,sprite.x,sprite.y,sprite.w,sprite.h,-w*.5,-h*.5,w,h);ctx.restore();
  }
 }
 ctx.globalAlpha=1;
 if(world.pointer.active){const p=world.pointer;ctx.strokeStyle='#8a8a8a';ctx.lineWidth=1;ctx.strokeRect(Math.round(p.x)-5.5,Math.round(p.y)-5.5,11,11);}
}
function telemetry(force=false){if(!force&&world.time-lastTelemetry<.2)return;lastTelemetry=world.time;const c=world.chains[7];readout.textContent=[`chains   = ${world.chains.length}`,`links    = ${world.chains.reduce((n,c)=>n+c.nodes.length,0)}`,`step     = 120 Hz`,`time     = ${world.time.toFixed(2)} s`,`input    = ${hand?'HAND':'POINTER'}`,`chain[7] = ${c.energy.toFixed(1)} px/s`,`sound    = ${audio.fist?'DISTORT':'ETHER'}`,`height   = ${(c.contact.height*100).toFixed(0)} %`,`shake    = ${world.chains.reduce((n,c)=>n+c.nodes.filter(p=>p.vibration>.05).length,0)}`, `tone[7]  = ${voiceParameters(7,c.contact.height,audio.fist).pitch.toFixed(1)} Hz`].join('\n');}
function tick(now){raf=0;if(paused||document.hidden){last=0;return;}const dt=last?Math.min((now-last)/1000,.1):STEP;last=now;accumulator+=dt;while(accumulator>=STEP){world.step();accumulator-=STEP;}audio.update(world.chains,world.time);draw();telemetry();raf=requestAnimationFrame(tick);}
function start(){if(!raf&&!paused&&!document.hidden)raf=requestAnimationFrame(tick);}
function pause(value){paused=value;world.release();last=0;accumulator=0;pauseButton.textContent=paused?'[ RESUME ]':'[ PAUSE ]';pauseButton.setAttribute('aria-pressed',String(paused));if(paused){cancelAnimationFrame(raf);raf=0;}else start();}
function position(e,down=world.pointer.down){if(hand)return;const b=canvas.getBoundingClientRect(),now=performance.now();world.move(e.clientX-b.left,e.clientY-b.top,lastPointer?(now-lastPointer)/1000:1/60,down);lastPointer=now;}
canvas.addEventListener('pointermove',e=>{if(pointerId===null||pointerId===e.pointerId)position(e);});
canvas.addEventListener('pointerdown',e=>{if(pointerId!==null)return;pointerId=e.pointerId;canvas.setPointerCapture(pointerId);position(e,true);});
function release(e){if(e.pointerId!==pointerId)return;pointerId=null;if(!hand)world.release();}
canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);canvas.addEventListener('lostpointercapture',()=>{pointerId=null;if(!hand)world.release();});
canvas.addEventListener('pointerleave',()=>{if(pointerId===null&&!hand)world.release();});
canvas.addEventListener('keydown',e=>{if(e.key===' '){e.preventDefault();pause(!paused);}else if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();const p=world.pointer;const x=p.active?p.x:width*.5,y=p.active?p.y:height*.5;world.move(x+(e.key==='ArrowLeft'?-35:e.key==='ArrowRight'?35:0),y+(e.key==='ArrowUp'?-35:e.key==='ArrowDown'?35:0),.04,false);}});
window.addEventListener('lab-hand',e=>{hand=Boolean(e.detail.tracked);audio.setFist(hand&&Boolean(e.detail.fist));world.setFist(audio.fist);document.querySelector('main').classList.toggle('inverted',audio.fist);if(!hand){world.release();lastHand=0;return;}const now=performance.now();world.move((e.detail.x+1)*.5*width,(e.detail.y+1)*.5*height,lastHand?(now-lastHand)/1000:.05,false);lastHand=now;});
soundButton.addEventListener('click',async()=>{try{if(audio.enabled){audio.mute();soundButton.textContent='[ ENABLE SOUND ]';soundButton.setAttribute('aria-pressed','false');status.textContent='SOUND MUTED / 16 FIXED ANCHORS';}else{await audio.enable();audio.setVolume(Number(document.querySelector('#volume').value));soundButton.textContent='[ MUTE SOUND ]';soundButton.setAttribute('aria-pressed','true');audio.chime(5,.25,.5);status.textContent='SOUND ON / SWEEP THE CHAINS TO PLAY';}}catch{status.textContent='AUDIO UNAVAILABLE / TRY ANOTHER BROWSER';}});
document.querySelector('#volume').addEventListener('input',e=>audio.setVolume(Number(e.target.value)));
pauseButton.addEventListener('click',()=>pause(!paused));
window.addEventListener('blur',()=>{if(!hand)world.release();});
document.addEventListener('visibilitychange',()=>{world.release();if(document.hidden){cancelAnimationFrame(raf);raf=0;last=0;audio.ctx?.suspend();}else{if(audio.enabled)audio.ctx?.resume();start();}});
reduced.addEventListener('change',e=>pause(e.matches));new ResizeObserver(resize).observe(canvas);resize();pause(paused);start();
