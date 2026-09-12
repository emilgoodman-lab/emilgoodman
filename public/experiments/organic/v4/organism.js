'use strict';
(async () => {
  const canvas = document.querySelector('#organism');
  const ctx = canvas.getContext('2d', {alpha:false});
  const button = document.querySelector('.pause');
  const hint = document.querySelector('.instructions p');
  if (!ctx) { hint.textContent='THIS BROWSER CANNOT DISPLAY THE ARTWORK.'; return; }
  // Real Unicode symbols, without letters, digits, glow, trails or compositing effects.
  const glyphs = Array.from("◈◇◊◌◍◎◉◐◑◒◓◔◕◖◗◘◙◚◛◜◝◞◟◠◡◢◣◤◥◧◨◩◪◫◬◭◮◰◱◲◳◴◵◶◷◸◹◺◿▣▤▥▦▧▨▩▰▱△▽▷◁▵▿▹◃⌖⌘⎔⬡⬢⬣⬠⬟⯁⯂⯃⯄⯅⯆⯇⯈");
  try { await document.fonts.load('20px LabSymbols'); }
  catch { hint.textContent='SYMBOL FONT UNAVAILABLE. PLEASE RELOAD.'; }
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let paused=reduced.matches, width=1, height=1, ratio=1, frame=0, last=0, time=0;
  let targetX=0,targetY=0,spread=0,holding=false,pointerId=null;
  let handTracked=false,handFist=false;
  const params={particleSize:1,amplitude:1,scale:1};
  const layers=[
    {scale:1,count:2300,speed:.085,response:4.3,turn:.58,phase:0,x:0,y:0},
    {scale:.74,count:1600,speed:-.125,response:2.3,turn:.9,phase:2.2,x:0,y:0},
    {scale:.46,count:900,speed:.18,response:1.25,turn:1.2,phase:4.7,x:0,y:0}
  ];
  const readout=document.querySelector('#readout');
  const collapse=document.querySelector('.collapse');
  collapse.addEventListener('click',()=>{
    const expanded=collapse.getAttribute('aria-expanded')==='true';
    collapse.setAttribute('aria-expanded',String(!expanded));
    collapse.setAttribute('aria-label',expanded?'Expand simulation monitor':'Minimize simulation monitor');
    collapse.textContent=expanded?'+':'−';readout.hidden=expanded;
  });
  let seed=91831;
  function random(){seed=(seed*16807)%2147483647;return (seed-1)/2147483646;}
  // Identity, glyph, and base size are assigned once, including across resizes.
  const points=[];
  layers.forEach((layer,l)=>{
    for(let i=0;i<layer.count;i++){
      const v=1-2*(i+.5)/layer.count;
      points.push({id:points.length,l,v,ring:Math.sqrt(1-v*v),a:i*2.3999632297+l*.83,
        g:Math.floor(random()*glyphs.length),size:.48+Math.pow(random(),1.9)*1.6,
        thickness:.94+random()*.1,x:0,y:0,z:0,s:0,alpha:0});
    }
  });
  const drawOrder=points.slice();
  let atlas=[],fps=0,frameMs=0,drawMs=0,lastReadout=-Infinity;
  function makeAtlas(){
    atlas=glyphs.map(char=>{
      const tile=document.createElement('canvas');tile.width=tile.height=Math.ceil(40*ratio);
      const c=tile.getContext('2d');c.scale(ratio,ratio);c.font='28px LabSymbols';
      c.textAlign='center';c.textBaseline='middle';c.fillStyle='#ededed';c.fillText(char,20,19);
      return tile;
    });
  }
  function resize(){
    const bounds=canvas.getBoundingClientRect();width=Math.max(1,bounds.width);height=Math.max(1,bounds.height);
    const nextRatio=Math.min(devicePixelRatio||1,2);
    if(nextRatio!==ratio||!atlas.length){ratio=nextRatio;makeAtlas();}
    canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);
    ctx.setTransform(ratio,0,0,ratio,0,0);render();telemetry(performance.now(),true);
  }
  function render(){
    const began=performance.now();
    ctx.globalAlpha=1;ctx.fillStyle='#080808';ctx.fillRect(0,0,width,height);
    const radius=Math.min(width*.34,height*.36,410)*params.scale;
    const glyphSize=(width<600?10.5:16)*params.particleSize;
    const transforms=layers.map((layer,l)=>{
      const rot=time*layer.speed*params.amplitude+layer.x*layer.turn;
      const tilt=layer.y*(.42+l*.14)+Math.sin(time*(.14+l*.025)+layer.phase)*.18*params.amplitude;
      layer.rotation=rot;
      return {cr:Math.cos(rot),sr:Math.sin(rot),ct:Math.cos(tilt),st:Math.sin(tilt),
        breath:1+.045*params.amplitude*Math.sin(time*(.7+l*.19)+layer.phase),
        dx:layer.x*radius*(.12+l*.095)+Math.sin(time*.31+layer.phase)*radius*.018*params.amplitude+(l-1)*spread*radius*.3,
        dy:layer.y*radius*(.09+l*.075)+Math.cos(time*.24+layer.phase)*radius*.018*params.amplitude};
    });
    for(const p of points){
      const layer=layers[p.l],phase=layer.phase,m=transforms[p.l];
      const wave=.13*Math.sin(p.a*3+p.v*4+time*(.58+p.l*.15)+phase)
        +.075*Math.cos(p.v*7-time*(.5+p.l*.18)+phase)
        +.045*Math.sin(p.a*5+p.v*6-time*.25);
      const r=radius*layer.scale*(m.breath+wave*params.amplitude)*(1+spread*(.1+p.l*.22))*p.thickness;
      const angle=p.a+.085*params.amplitude*Math.sin(p.v*6+time*(.4+p.l*.2)+phase);
      const px=Math.cos(angle)*p.ring*r,py=p.v*r,pz=Math.sin(angle)*p.ring*r;
      const xx=px*m.cr+pz*m.sr,zz=pz*m.cr-px*m.sr;
      const yy=py*m.ct-zz*m.st,z=zz*m.ct+py*m.st;
      const perspective=radius*4.5/(radius*4.5-z);
      p.x=width*.5+xx*perspective+m.dx;p.y=height*.5+yy*perspective+m.dy;p.z=z;
      p.s=glyphSize*p.size*perspective;
      // Continuous camera-space depth. No brightness thresholds or visibility culling.
      const depth=Math.max(0,Math.min(1,(z/Math.max(radius,.01)+1.4)/2.8));
      p.alpha=.06+.94*Math.pow(depth,1.8);
    }
    drawOrder.sort((a,b)=>a.z-b.z);
    // Render every particle, with subpixel positions: no cell replacement or pixel snapping.
    for(const p of drawOrder){ctx.globalAlpha=p.alpha;ctx.drawImage(atlas[p.g],p.x-p.s*.5,p.y-p.s*.5,p.s,p.s);}
    ctx.globalAlpha=1;drawMs=performance.now()-began;
  }
  function telemetry(now,force=false){
    if(!force && now-lastReadout<125)return;lastReadout=now;
    const p=points[137];
    const signed=n=>(n>=0?'+':'')+n.toFixed(3);
    readout.textContent=[
      'sim.state = '+(paused?'PAUSED':'RUNNING'),
      'sim.time  = '+time.toFixed(3)+' s',
      'frame.fps = '+(paused?'—':fps.toFixed(1))+' / '+drawMs.toFixed(2)+' ms draw',
      'particles = '+points.length+' / '+glyphs.length+' glyphs',
      'input.src = '+(handTracked?'HAND'+(handFist?' / FIST':' / OPEN'):'POINTER'),
      'pointer.x = '+signed(targetX),
      'pointer.y = '+signed(targetY),
      'separation= '+spread.toFixed(3),
      'layer.rot = '+layers.map(l=>l.rotation.toFixed(2)).join(' '),
      'p[137].ch = '+glyphs[p.g]+'  size = '+p.size.toFixed(3),
      'p[137].xy = '+p.x.toFixed(1)+', '+p.y.toFixed(1),
      'p[137].z  = '+signed(p.z)
    ].join('\n');
  }
  function tick(now){
    frame=0;if(paused||document.hidden){last=0;return;}
    const elapsed=last?(now-last)/1000:1/60;const dt=Math.min(elapsed,.05);last=now;time+=dt;
    frameMs=frameMs?frameMs*.92+elapsed*1000*.08:elapsed*1000;fps=1000/frameMs;
    for(const layer of layers){const ease=1-Math.exp(-dt*layer.response);layer.x+=(targetX-layer.x)*ease;layer.y+=(targetY-layer.y)*ease;}
    spread+=(((holding||handFist)?1:0)-spread)*(1-Math.exp(-dt*3.5));
    render();telemetry(now);frame=requestAnimationFrame(tick);
  }
  function start(){if(!frame&&!paused&&!document.hidden)frame=requestAnimationFrame(tick);}
  function still(){if(paused){for(const layer of layers){layer.x=targetX;layer.y=targetY;}spread=(holding||handFist)?1:0;render();telemetry(performance.now(),true);}}
  function position(e){if(handTracked)return;const r=canvas.getBoundingClientRect();targetX=Math.max(-1,Math.min(1,(e.clientX-r.left)/width*2-1));targetY=Math.max(-1,Math.min(1,(e.clientY-r.top)/height*2-1));still();}
  canvas.addEventListener('pointermove',e=>{if(pointerId===null||pointerId===e.pointerId)position(e);});
  canvas.addEventListener('pointerdown',e=>{if(pointerId!==null)return;pointerId=e.pointerId;holding=true;canvas.setPointerCapture(pointerId);position(e);});
  function release(e){if(e.pointerId!==pointerId)return;pointerId=null;holding=false;if(e.pointerType!=='mouse'&&!handTracked)targetX=targetY=0;still();}
  canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);
  canvas.addEventListener('lostpointercapture',()=>{pointerId=null;holding=false;still();});
  canvas.addEventListener('pointerleave',()=>{if(!holding&&!handTracked){targetX=targetY=0;still();}});
  canvas.addEventListener('keydown',e=>{
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(e.key))return;e.preventDefault();
    if(e.key==='ArrowLeft')targetX=Math.max(-1,targetX-.2);
    if(e.key==='ArrowRight')targetX=Math.min(1,targetX+.2);
    if(e.key==='ArrowUp')targetY=Math.max(-1,targetY-.2);
    if(e.key==='ArrowDown')targetY=Math.min(1,targetY+.2);
    if(e.key===' ')holding=true;still();
  });
  canvas.addEventListener('keyup',e=>{if(e.key===' '){holding=false;still();}});
  function state(){button.textContent=paused?'[ RESUME ]':'[ PAUSE ]';button.setAttribute('aria-pressed',String(paused));}
  function pause(value){paused=value;last=0;state();if(paused){cancelAnimationFrame(frame);frame=0;}else start();telemetry(performance.now(),true);}
  button.addEventListener('click',()=>pause(!paused));
  reduced.addEventListener('change',e=>pause(e.matches));
  function blur(){holding=false;pointerId=null;if(!handTracked)targetX=targetY=0;still();}
  window.addEventListener('blur',blur);
  document.addEventListener('visibilitychange',()=>{blur();if(document.hidden){cancelAnimationFrame(frame);frame=0;last=0;}else start();});
  for(const [id,key,out] of [['particle-size','particleSize','size-value'],['motion-amplitude','amplitude','amplitude-value'],['field-scale','scale','scale-value']]){
    const input=document.getElementById(id),output=document.getElementById(out);
    input.addEventListener('input',()=>{params[key]=Number(input.value);output.textContent=params[key].toFixed(2)+'×';render();telemetry(performance.now(),true);});
  }
  window.addEventListener('lab-hand',e=>{
    handTracked=Boolean(e.detail.tracked);handFist=handTracked&&Boolean(e.detail.fist);
    if(handTracked){targetX=e.detail.x;targetY=e.detail.y;}
    else if(pointerId===null)targetX=targetY=0;
    still();
  });
  new ResizeObserver(resize).observe(canvas);
  state();resize();start();
})();
