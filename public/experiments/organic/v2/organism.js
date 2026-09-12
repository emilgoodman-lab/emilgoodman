'use strict';
(async () => {
  const canvas = document.querySelector('canvas');
  const ctx = canvas.getContext('2d', {alpha:false});
  const button = document.querySelector('button');
  const hint = document.querySelector('.instructions p');
  if (!ctx) { hint.textContent='EZ A BÖNGÉSZŐ NEM TÁMOGATJA AZ ALKOTÁST.'; return; }
  // Real Unicode symbols, without letters, digits, glow, trails or compositing effects.
  const alphabets = [Array.from('◈◇◊◬◭◮◰◱◲◳'),Array.from('▧▨▩▱▰◫◩◪▣'),Array.from('◴◵◶◷◸◹◺◿⌖')];
  try { await document.fonts.load('20px LabSymbols'); }
  catch { hint.textContent='A JELBETŰKÉSZLET NEM TÖLTHETŐ BE. FRISSÍTSD AZ OLDALT.'; }
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let paused=reduced.matches, width=1, height=1, ratio=1, frame=0, last=0, time=0;
  let targetX=0,targetY=0,spread=0,holding=false,pointerId=null;
  const layers=[
    {scale:1,count:590,speed:.085,response:4.3,turn:.58,phase:0,x:0,y:0},
    {scale:.74,count:390,speed:-.125,response:2.3,turn:.9,phase:2.2,x:0,y:0},
    {scale:.46,count:210,speed:.18,response:1.25,turn:1.2,phase:4.7,x:0,y:0}
  ];
  let points=[],atlas=[];
  const palette=['#4e4e4e','#898989','#c4c4c4','#eeeeee'];
  function makeAtlas(){
    atlas=alphabets.map(chars=>chars.map(char=>palette.map(color=>{
      const tile=document.createElement('canvas');tile.width=tile.height=Math.ceil(32*ratio);
      const c=tile.getContext('2d');c.scale(ratio,ratio);c.font='22px LabSymbols';
      c.textAlign='center';c.textBaseline='middle';c.fillStyle=color;c.fillText(char,16,15);
      return tile;
    })));
  }
  function resize(){
    const bounds=canvas.getBoundingClientRect();width=Math.max(1,bounds.width);height=Math.max(1,bounds.height);
    ratio=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);
    ctx.setTransform(ratio,0,0,ratio,0,0);makeAtlas();
    points=[];
    layers.forEach((layer,l)=>{
      const count=Math.round(layer.count*(width<600?.6:1));
      for(let i=0;i<count;i++){
        const v=1-2*(i+.5)/count;
        points.push({l,v,ring:Math.sqrt(1-v*v),a:i*2.3999632297+l*.83,g:(i*7+l*3)%alphabets[l].length});
      }
    });render();
  }
  function render(){
    ctx.fillStyle='#080808';ctx.fillRect(0,0,width,height);
    const radius=Math.min(width*.335,height*.355,370);
    const glyphSize=width<600?12.5:16;
    const transformed=[];
    for(const p of points){
      const layer=layers[p.l],phase=layer.phase;
      const rot=time*layer.speed+layer.x*layer.turn;
      const tilt=layer.y*(.42+p.l*.14)+Math.sin(time*(.14+p.l*.025)+phase)*.18;
      const wave=.13*Math.sin(p.a*3+p.v*4+time*(.58+p.l*.15)+phase)
        +.075*Math.cos(p.v*7-time*(.5+p.l*.18)+phase)
        +.045*Math.sin(p.a*5+p.v*6-time*.25);
      const breath=1+.045*Math.sin(time*(.7+p.l*.19)+phase);
      const r=radius*layer.scale*(breath+wave)*(1+spread*(.1+p.l*.22));
      const angle=p.a+.085*Math.sin(p.v*6+time*(.4+p.l*.2)+phase);
      const px=Math.cos(angle)*p.ring*r,py=p.v*r,pz=Math.sin(angle)*p.ring*r;
      const xx=px*Math.cos(rot)+pz*Math.sin(rot),zz=pz*Math.cos(rot)-px*Math.sin(rot);
      const yy=py*Math.cos(tilt)-zz*Math.sin(tilt),z=zz*Math.cos(tilt)+py*Math.sin(tilt);
      const perspective=radius*4.5/(radius*4.5-z);
      const driftX=layer.x*radius*(.12+p.l*.095)+Math.sin(time*.31+phase)*radius*.018;
      const driftY=layer.y*radius*(.09+p.l*.075)+Math.cos(time*.24+phase)*radius*.018;
      const split=(p.l-1)*spread*radius*.3;
      const depth=(z/Math.max(r,.01)+1)*.5;
      transformed.push({x:width*.5+xx*perspective+driftX+split,y:height*.5+yy*perspective+driftY,z,
        tile:atlas[p.l][p.g][depth<.23?0:depth<.5?1:depth<.77?2:3],s:glyphSize*(.86+p.l*.05)*perspective});
    }
    transformed.sort((a,b)=>a.z-b.z);
    // Keep the nearest glyph when two centers share a cell so symbols stay legible.
    const cells=new Map(),step=width<600?7:9;
    for(const p of transformed)cells.set(Math.round(p.x/step)+','+Math.round(p.y/step),p);
    for(const p of cells.values())ctx.drawImage(p.tile,Math.round(p.x-p.s*.5),Math.round(p.y-p.s*.5),p.s,p.s);
  }
  function tick(now){
    frame=0;if(paused||document.hidden){last=0;return;}
    const dt=last?Math.min((now-last)/1000,.05):1/60;last=now;time+=dt;
    for(const layer of layers){const ease=1-Math.exp(-dt*layer.response);layer.x+=(targetX-layer.x)*ease;layer.y+=(targetY-layer.y)*ease;}
    spread+=((holding?1:0)-spread)*(1-Math.exp(-dt*3.5));
    render();frame=requestAnimationFrame(tick);
  }
  function start(){if(!frame&&!paused&&!document.hidden)frame=requestAnimationFrame(tick);}
  function still(){if(paused){for(const layer of layers){layer.x=targetX;layer.y=targetY;}spread=holding?1:0;render();}}
  function position(e){const r=canvas.getBoundingClientRect();targetX=Math.max(-1,Math.min(1,(e.clientX-r.left)/width*2-1));targetY=Math.max(-1,Math.min(1,(e.clientY-r.top)/height*2-1));still();}
  canvas.addEventListener('pointermove',e=>{if(pointerId===null||pointerId===e.pointerId)position(e);});
  canvas.addEventListener('pointerdown',e=>{if(pointerId!==null)return;pointerId=e.pointerId;holding=true;canvas.setPointerCapture(pointerId);position(e);});
  function release(e){if(e.pointerId!==pointerId)return;pointerId=null;holding=false;if(e.pointerType!=='mouse')targetX=targetY=0;still();}
  canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);
  canvas.addEventListener('lostpointercapture',()=>{pointerId=null;holding=false;still();});
  canvas.addEventListener('pointerleave',()=>{if(!holding){targetX=targetY=0;still();}});
  canvas.addEventListener('keydown',e=>{
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(e.key))return;e.preventDefault();
    if(e.key==='ArrowLeft')targetX=Math.max(-1,targetX-.2);
    if(e.key==='ArrowRight')targetX=Math.min(1,targetX+.2);
    if(e.key==='ArrowUp')targetY=Math.max(-1,targetY-.2);
    if(e.key==='ArrowDown')targetY=Math.min(1,targetY+.2);
    if(e.key===' ')holding=true;still();
  });
  canvas.addEventListener('keyup',e=>{if(e.key===' '){holding=false;still();}});
  function state(){button.textContent=paused?'[ FOLYTATÁS ]':'[ SZÜNET ]';button.setAttribute('aria-pressed',String(paused));}
  function pause(value){paused=value;last=0;state();if(paused){cancelAnimationFrame(frame);frame=0;}else start();}
  button.addEventListener('click',()=>pause(!paused));
  reduced.addEventListener('change',e=>pause(e.matches));
  function blur(){holding=false;pointerId=null;targetX=targetY=0;still();}
  window.addEventListener('blur',blur);
  document.addEventListener('visibilitychange',()=>{blur();if(document.hidden){cancelAnimationFrame(frame);frame=0;last=0;}else start();});
  new ResizeObserver(resize).observe(canvas);
  state();resize();start();
})();
