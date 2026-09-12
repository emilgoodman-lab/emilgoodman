'use strict';
(() => {
  const canvas = document.querySelector('canvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  const button = document.querySelector('button');
  if (!ctx) {
    document.querySelector('.hint').textContent = 'This browser cannot display the artwork.';
    return;
  }
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reduced.matches, width = 1, height = 1, dpr = 1;
  let time = 0, last = 0, frame = 0, pressure = 0, holding = false;
  let x = 0, y = 0, targetX = 0, targetY = 0;
  let particles = [], dust = [], pointerId = null;
  const TAU = Math.PI * 2;
  // Deterministic seeds keep the composition consistent across devices and versions.
  let seed = 91831;
  function random() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
  const sprite = document.createElement('canvas');
  sprite.width = sprite.height = 32;
  const sc = sprite.getContext('2d');
  const glow = sc.createRadialGradient(16,16,0,16,16,16);
  glow.addColorStop(0,'rgba(220,255,248,1)');
  glow.addColorStop(.13,'rgba(139,255,225,.9)');
  glow.addColorStop(.35,'rgba(41,202,180,.3)');
  glow.addColorStop(1,'rgba(10,151,147,0)');
  sc.fillStyle = glow; sc.fillRect(0,0,32,32);
  function resize() {
    width = innerWidth; height = innerHeight; dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width*dpr); canvas.height = Math.round(height*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    seed = 91831;
    const count = width < 600 ? 1700 : 2900;
    particles = Array.from({length:count}, (_,i) => {
      const v = 1 - 2*(i+.5)/count;
      return { v, ring: Math.sqrt(1-v*v), a:i*2.3999632297, phase:random()*TAU, size:.7+random()*.9, inner:random()<.15 ? .6+random()*.25 : 1 };
    });
    dust = Array.from({length:85},()=>({x:random(),y:random(),s:random(),p:random()*TAU}));
    if (paused) render();
  }
  function render() {
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    ctx.fillStyle = '#030608'; ctx.fillRect(0,0,width,height);
    const radius = Math.min(width*.30,height*.30,330);
    const cx = width*.5+x*radius*.19, cy = height*.48+y*radius*.16;
    const halo = ctx.createRadialGradient(cx,cy,0,cx,cy,radius*1.95);
    halo.addColorStop(0,'#092523'); halo.addColorStop(.48,'#051414'); halo.addColorStop(1,'#030608');
    ctx.fillStyle = halo; ctx.fillRect(0,0,width,height);
    for(const d of dust){
      ctx.globalAlpha = .1+d.s*.24;
      ctx.fillStyle = '#8dbab8';
      ctx.beginPath(); ctx.arc(d.x*width+Math.sin(time*.12+d.p)*8,d.y*height+Math.cos(time*.1+d.p)*6,.4+d.s*.5,0,TAU); ctx.fill();
    }
    const rot = time*.09+x*.42, tilt = y*.33-.12;
    const cr=Math.cos(rot), sr=Math.sin(rot), ct=Math.cos(tilt), st=Math.sin(tilt);
    const dots=[];
    for(const p of particles){
      const breathing=1+.04*Math.sin(time*.75);
      const wave=.1*Math.sin(p.a*3+p.v*5+time*.7)+.065*Math.sin(p.v*8-time*.85)+.045*Math.cos(p.a*5-p.v*3+time*.46);
      const r=radius*(breathing+wave+pressure*.24)*p.inner;
      const a=p.a+.06*Math.sin(p.v*5+time*.6);
      const px=Math.cos(a)*p.ring*r, pz=Math.sin(a)*p.ring*r, py=p.v*r;
      const xx=px*cr+pz*sr, zz=pz*cr-px*sr;
      const yy=py*ct-zz*st, z=zz*ct+py*st;
      const perspective=3.8*radius/(3.8*radius-z);
      const front=(z/radius+1)*.5;
      const ripple=Math.sin(p.v*12+p.a*2-time*1.2)*pressure*radius*.025;
      dots.push({x:cx+xx*perspective+ripple,y:cy+yy*perspective,z,alpha:Math.max(.06,Math.min(.95,.13+front*.64)),s:p.size*perspective*(1+pressure*.35)});
    }
    dots.sort((a,b)=>a.z-b.z);
    ctx.globalCompositeOperation='lighter';
    for(const d of dots){
      ctx.globalAlpha=d.alpha;
      const size=d.s*7;
      ctx.drawImage(sprite,d.x-size*.5,d.y-size*.5,size,size);
    }
    ctx.globalAlpha=1; ctx.globalCompositeOperation='source-over';
  }
  function tick(now) {
    frame=0;
    if(paused || document.hidden){last=0;return;}
    const dt=last ? Math.min((now-last)/1000,.05) : 1/60; last=now;
    time+=dt;
    const ease=1-Math.exp(-dt*4.2);
    x+=(targetX-x)*ease; y+=(targetY-y)*ease;
    pressure+=((holding?1:0)-pressure)*(1-Math.exp(-dt*3));
    render(); frame=requestAnimationFrame(tick);
  }
  function start(){ if(!frame && !paused && !document.hidden) frame=requestAnimationFrame(tick); }
  function position(e){targetX=Math.max(-1,Math.min(1,e.clientX/width*2-1));targetY=Math.max(-1,Math.min(1,e.clientY/height*2-1));if(paused){x=targetX;y=targetY;render();}}
  canvas.addEventListener('pointermove',position);
  canvas.addEventListener('pointerdown',e=>{if(pointerId!==null)return;pointerId=e.pointerId;holding=true;canvas.setPointerCapture(e.pointerId);position(e);});
  function release(e){if(e.pointerId!==pointerId)return;pointerId=null;holding=false;if(e.pointerType!=='mouse'){targetX=targetY=0;}}
  canvas.addEventListener('pointerup',release);
  canvas.addEventListener('pointercancel',release);
  canvas.addEventListener('lostpointercapture',()=>{pointerId=null;holding=false;});
  canvas.addEventListener('pointerleave',()=>{if(!holding){targetX=targetY=0;}});
  canvas.addEventListener('keydown',e=>{
    if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(e.key))e.preventDefault();
    if(e.key==='ArrowLeft')targetX=Math.max(-1,targetX-.2);
    if(e.key==='ArrowRight')targetX=Math.min(1,targetX+.2);
    if(e.key==='ArrowUp')targetY=Math.max(-1,targetY-.2);
    if(e.key==='ArrowDown')targetY=Math.min(1,targetY+.2);
    if(e.key===' ')holding=true;
    if(paused){x=targetX;y=targetY;render();}
  });
  canvas.addEventListener('keyup',e=>{if(e.key===' ')holding=false;});
  function buttonState(){button.textContent=paused?'Play':'Pause';button.setAttribute('aria-label',paused?'Play animation':'Pause animation');button.setAttribute('aria-pressed',String(paused));}
  button.addEventListener('click',()=>{paused=!paused;buttonState();if(paused){cancelAnimationFrame(frame);frame=0;last=0;}else start();});
  reduced.addEventListener('change',e=>{paused=e.matches;buttonState();if(paused){cancelAnimationFrame(frame);frame=0;last=0;}else start();});
  document.addEventListener('visibilitychange',()=>{holding=false;if(document.hidden){cancelAnimationFrame(frame);frame=0;last=0;}else start();});
  window.addEventListener('blur',()=>{holding=false;});
  window.addEventListener('resize',resize);
  buttonState();resize();render();start();
})();
