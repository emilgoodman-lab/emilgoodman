export const STEP=1/120;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export class ChainWorld{
 constructor(width,height){this.pointer={active:false,x:0,y:0,fromX:0,fromY:0,vx:0,vy:0,down:false};this.grab=null;this.time=0;this.resize(width,height);}
 resize(width,height){
  const oldW=this.width,oldH=this.height;this.width=Math.max(100,width);this.height=Math.max(100,height);
  const margin=this.width<600?18:48,gap=(this.width-margin*2)/15;
  if(!this.chains){this.chains=Array.from({length:16},(_,id)=>({id,nodes:[],count:29+(id%4),length:0,energy:0}));}
  for(const chain of this.chains){
   const x=margin+gap*chain.id,y=24;
   const length=(this.height-60)*(.66+.25*((chain.id*7%17)/16));chain.rest=length/(chain.count-1);chain.length=length;
   for(let j=0;j<chain.count;j++){
    let p=chain.nodes[j];
    if(!p){const angle=.018*Math.sin(chain.id*1.7);p={x:x+Math.sin(angle)*j*chain.rest,y:y+Math.cos(angle)*j*chain.rest,px:0,py:0,inv:j===0?0:1,id:chain.id*100+j};p.px=p.x;p.py=p.y;chain.nodes.push(p);}
    else if(oldW&&oldH){p.x*=this.width/oldW;p.px=p.x;p.y=y+(p.y-24)*this.height/oldH;p.py=p.y;}
   }
   Object.assign(chain.nodes[0],{x,y,px:x,py:y});chain.anchor={x,y};
  }
  this.radius=Math.max(1.7,Math.min(4.5,gap*.15));this.grab=null;this.pointer.active=false;
  // Relax resized constraints without carrying resize velocities into the simulation.
  for(let i=0;i<40;i++)this.solveDistances();
  for(const c of this.chains)for(const p of c.nodes){p.px=p.x;p.py=p.y;}
 }
 move(x,y,dt=1/60,down=false){
  const p=this.pointer;
  if(!p.active){p.x=p.fromX=x;p.y=p.fromY=y;p.vx=p.vy=0;}
  p.fromX=p.x;p.fromY=p.y;
  p.vx=clamp((x-p.x)/Math.max(dt,.008),-1800,1800);p.vy=clamp((y-p.y)/Math.max(dt,.008),-1800,1800);
  p.x=x;p.y=y;p.active=true;
  if(down&&!p.down){let best=50;this.grab=null;for(const c of this.chains)for(let i=1;i<c.nodes.length;i++){const n=c.nodes[i],d=Math.hypot(n.x-x,n.y-y);if(d<best){best=d;this.grab=n;}}}
  if(!down)this.grab=null;p.down=down;
 }
 release(){this.pointer.active=false;this.pointer.down=false;this.pointer.vx=this.pointer.vy=0;this.grab=null;}
 solveDistances(){
  for(const c of this.chains){
   const n=c.nodes;
   // Alternating traversal improves convergence along the full hanging length.
   for(let pass=0;pass<2;pass++)for(let k=1;k<n.length;k++){
    const j=pass?k:n.length-k,a=n[j-1],b=n[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1;
    const correction=(d-c.rest)/d/(a.inv+b.inv);
    a.x+=dx*correction*a.inv;a.y+=dy*correction*a.inv;b.x-=dx*correction*b.inv;b.y-=dy*correction*b.inv;
   }
   n[0].x=c.anchor.x;n[0].y=c.anchor.y;
  }
 }
 collide(){
  const diameter=this.radius*2,cells=new Map();
  for(const c of this.chains)for(let j=0;j<c.nodes.length;j++){
   const p=c.nodes[j],ix=Math.floor(p.x/diameter),iy=Math.floor(p.y/diameter);
   for(let ox=-1;ox<=1;ox++)for(let oy=-1;oy<=1;oy++)for(const q of cells.get((ix+ox)+','+(iy+oy))||[]){
    if(Math.abs(p.id-q.id)<=1)continue;
    const dx=p.x-q.x,dy=p.y-q.y,d=Math.hypot(dx,dy),mass=p.inv+q.inv;
    if(d<diameter&&d>.00001&&mass){const s=(diameter-d)/d/mass*.75;p.x+=dx*s*p.inv;p.y+=dy*s*p.inv;q.x-=dx*s*q.inv;q.y-=dy*s*q.inv;}
   }
   const key=ix+','+iy;if(!cells.has(key))cells.set(key,[]);cells.get(key).push(p);
  }
 }
 step(dt=STEP){
  const damp=Math.exp(-.65*dt),cursor=this.pointer;
  const gravity=Math.max(420,this.height*1.6),reach=Math.max(35,Math.min(95,this.width*.115));
  for(const c of this.chains)for(let j=1;j<c.nodes.length;j++){
   const p=c.nodes[j];let ax=0,ay=gravity;
   if(cursor.active&&!this.grab){
    const dx=cursor.x-cursor.fromX,dy=cursor.y-cursor.fromY;
    const t=clamp(((p.x-cursor.fromX)*dx+(p.y-cursor.fromY)*dy)/(dx*dx+dy*dy||1),0,1);
    const distance=Math.hypot(p.x-(cursor.fromX+t*dx),p.y-(cursor.fromY+t*dy));
    if(distance<reach){const force=(1-distance/reach)**2;ax=cursor.vx*14*force;ay+=cursor.vy*14*force;}
   }
   const x=p.x,y=p.y;p.x+=(p.x-p.px)*damp+ax*dt*dt;p.y+=(p.y-p.py)*damp+ay*dt*dt;p.px=x;p.py=y;
  }
  for(let i=0;i<14;i++){
   this.solveDistances();
   if(this.grab){this.grab.x+=(cursor.x-this.grab.x)*.18;this.grab.y+=(cursor.y-this.grab.y)*.18;}
   if(i===4||i===10)this.collide();
  }
  for(const c of this.chains){let sum=0;for(let j=1;j<c.nodes.length;j++){const p=c.nodes[j];sum+=Math.hypot(p.x-p.px,p.y-p.py)/dt;}c.energy=sum/(c.nodes.length-1);}
  cursor.vx*=Math.exp(-12*dt);cursor.vy*=Math.exp(-12*dt);this.time+=dt;
 }
 maxStretch(){let max=0;for(const c of this.chains)for(let j=1;j<c.nodes.length;j++){const a=c.nodes[j-1],b=c.nodes[j];max=Math.max(max,Math.abs(Math.hypot(a.x-b.x,a.y-b.y)-c.rest)/c.rest);}return max;}
}
