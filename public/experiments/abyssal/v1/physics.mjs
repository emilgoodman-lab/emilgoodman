export const STEP=1/120;
export const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const angleDelta=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
export class AbyssalWorld{
 constructor(width,height,seed=906){
  this.seed=seed>>>0;this.time=0;this.eaten=0;this.mode='DRIFT';this.pointer={active:false,down:false,x:0,y:0};this.caught=false;this.fear=0;this.flash=false;this.flashAt=0;this.food=[];this.foodClock=0;this.target=null;this.strikeUntil=0;this.resize(width,height);
  for(let i=0;i<5;i++)this.spawnFood();
 }
 random(){this.seed=(Math.imul(this.seed,1664525)+1013904223)>>>0;return this.seed/4294967296;}
 resize(width,height){
  const ow=this.width,oh=this.height;this.width=Math.max(240,width);this.height=Math.max(240,height);this.scale=clamp(Math.min(this.width,this.height)/700,.55,1.3);this.radius=25*this.scale;
  if(!this.body){this.body={x:this.width*.5,y:this.height*.48,px:this.width*.5,py:this.height*.48,angle:-.5,omega:0,speed:0};this.arms=Array.from({length:6},(_,id)=>({id,angle:[-2.75,-1.9,-1.12,1.12,1.9,2.75][id],phase:this.random()*Math.PI*2,nodes:Array.from({length:25},(_,j)=>({x:0,y:0,px:0,py:0,id:id*100+j,size:(15*(1-j/24)**1.1+3.8)*(.87+this.random()*.26)})),rests:[]}));
   for(const arm of this.arms){let x=this.body.x+Math.cos(this.body.angle+arm.angle)*this.radius*.8,y=this.body.y+Math.sin(this.body.angle+arm.angle)*this.radius*.8;for(let j=0;j<arm.nodes.length;j++){const p=arm.nodes[j];if(j){const d=(p.size+arm.nodes[j-1].size)*.46*this.scale;arm.rests.push(d);x+=Math.cos(this.body.angle+arm.angle)*d;y+=Math.sin(this.body.angle+arm.angle)*d;}p.x=p.px=x;p.y=p.py=y;}}
  }else{
   this.body.x*=this.width/ow;this.body.y*=this.height/oh;this.body.px=this.body.x;this.body.py=this.body.y;
   for(const arm of this.arms){for(const p of arm.nodes){p.x*=this.width/ow;p.y*=this.height/oh;p.px=p.x;p.py=p.y;}arm.rests=arm.nodes.slice(1).map((p,j)=>(p.size+arm.nodes[j].size)*.46*this.scale);}
   for(const f of this.food){f.x*=this.width/ow;f.y*=this.height/oh;}this.release();for(let i=0;i<60;i++)this.constraints();for(const arm of this.arms)for(const p of arm.nodes){p.px=p.x;p.py=p.y;}
  }
 }
 spawnFood(){
  if(this.food.length>=8)return;
  const margin=35*this.scale;let x,y;
  for(let i=0;i<12;i++){x=margin+this.random()*(this.width-2*margin);y=margin+this.random()*(this.height-2*margin);if(Math.hypot(x-this.body.x,y-this.body.y)>this.radius*3)break;}
  this.food.push({id:Math.floor(this.random()*1e8),x,y,phase:this.random()*6.28,size:(6+this.random()*5)*this.scale,age:0});
 }
 distanceToCreature(x,y){let best=Math.max(0,Math.hypot(x-this.body.x,y-this.body.y)-this.radius);for(const arm of this.arms)for(const p of arm.nodes)best=Math.min(best,Math.max(0,Math.hypot(x-p.x,y-p.y)-p.size*this.scale*.5));return best;}
 move(x,y,down=false){
  const p=this.pointer;p.active=true;p.x=clamp(x,0,this.width);p.y=clamp(y,0,this.height);p.down=down;
  if(down&&!this.caught&&this.distanceToCreature(p.x,p.y)<22*this.scale){this.caught=true;this.offset={x:this.body.x-p.x,y:this.body.y-p.y};this.flashAt=this.time+.28;this.mode='CAUGHT';}
  if(!down&&this.caught){this.caught=false;this.fear=1.5;this.flash=false;}
 }
 release(){this.pointer.active=false;this.pointer.down=false;if(this.caught)this.fear=1.5;this.caught=false;this.flash=false;}
 steer(){
  const b=this.body,p=this.pointer;let dx=0,dy=0,speed=0;
  const danger=p.active?Math.min(Math.hypot(p.x-b.x,p.y-b.y)-this.radius,this.distanceToCreature(p.x,p.y)):Infinity;
  if(this.caught){this.mode='CAUGHT';return {x:0,y:0};}
  if(danger<65*this.scale||this.fear>0){
   this.mode='ESCAPE';dx=b.x-p.x;dy=b.y-p.y;if(Math.hypot(dx,dy)<1){dx=Math.cos(b.angle+Math.PI);dy=Math.sin(b.angle+Math.PI);}speed=260*this.scale;
   // Tangential deflection gives the animal a route around the hand and away from tank edges.
   dx+=(this.width*.5-b.x)*.28;dy+=(this.height*.5-b.y)*.28;
  }else{
   if(!this.target||!this.food.includes(this.target))this.target=this.food.reduce((best,f)=>!best||Math.hypot(f.x-b.x,f.y-b.y)<Math.hypot(best.x-b.x,best.y-b.y)?f:best,null);
   if(this.target){
    dx=this.target.x-b.x;dy=this.target.y-b.y;const distance=Math.hypot(dx,dy);
    if(distance<95*this.scale&&this.time>this.strikeUntil+.8)this.strikeUntil=this.time+.55;
    const striking=this.time<this.strikeUntil;
    this.mode=striking?'STRIKE':'STALK';speed=(striking?280:27)*this.scale;
    if(distance<this.radius+this.target.size+5*this.scale){this.food.splice(this.food.indexOf(this.target),1);this.eaten++;this.target=null;this.strikeUntil=0;}
   }else{this.mode='DRIFT';dx=Math.cos(this.time*.12);dy=Math.sin(this.time*.17)*.65;speed=18*this.scale;}
  }
  const length=Math.hypot(dx,dy)||1;let x=dx/length*speed,y=dy/length*speed;
  if(this.mode!=='STRIKE'&&this.mode!=='ESCAPE'){x+=Math.sin(this.time*.7)*5*this.scale;y+=Math.cos(this.time*.49)*7*this.scale;}
  return {x,y};
 }
 constraints(){
  const b=this.body;
  for(const arm of this.arms){
   const nodes=arm.nodes,a=b.angle+arm.angle,rx=Math.cos(a)*this.radius*.8,ry=Math.sin(a)*this.radius*.8,root=nodes[0];
   const dx=root.x-(b.x+rx),dy=root.y-(b.y+ry);
   // The shared body has finite mass: the six moving chains feed reaction forces back into it.
   root.x-=dx*.96;root.y-=dy*.96;b.x+=dx*.04;b.y+=dy*.04;
   b.angle+=clamp((rx*dy-ry*dx)/(this.radius*this.radius)*.002,-.003,.003);
   for(let pass=0;pass<2;pass++)for(let k=1;k<nodes.length;k++){
    const j=pass?k:nodes.length-k,p=nodes[j-1],q=nodes[j],x=q.x-p.x,y=q.y-p.y,d=Math.hypot(x,y)||1;
    const wi=j===1?.15:1,wj=1,correction=(d-arm.rests[j-1])/d/(wi+wj);p.x+=x*correction*wi;p.y+=y*correction*wi;q.x-=x*correction*wj;q.y-=y*correction*wj;
   }
  }
 }
 step(dt=STEP){
  const b=this.body;this.fear=Math.max(0,this.fear-dt);const desired=this.steer();
  const vx=(b.x-b.px)/dt,vy=(b.y-b.py)/dt;let ax=(desired.x-vx)*2.3,ay=(desired.y-vy)*2.3;
  if(this.caught){const tx=this.pointer.x+this.offset.x,ty=this.pointer.y+this.offset.y;ax=(tx-b.x)*110-vx*15+Math.sin(this.time*31)*160;ay=(ty-b.y)*110-vy*15+Math.cos(this.time*37)*160;}
  const nx=b.x+vx*dt+ax*dt*dt,ny=b.y+vy*dt+ay*dt*dt;b.px=b.x;b.py=b.y;b.x=nx;b.y=ny;
  const heading=Math.atan2(desired.y,desired.x);const torque=this.caught?Math.sin(this.time*18)*35:angleDelta(heading,b.angle)*7;
  b.omega+=(torque-b.omega*4.2)*dt;b.angle+=b.omega*dt;
  for(const arm of this.arms){
   const waveSpeed=this.caught?12:this.mode==='STRIKE'||this.mode==='ESCAPE'?3.7:1.4;
   for(let j=0;j<arm.nodes.length;j++){
    const p=arm.nodes[j],u=j/(arm.nodes.length-1),pvx=(p.x-p.px)/dt,pvy=(p.y-p.py)/dt;
    const phase=this.time*waveSpeed-arm.phase-u*5.5;
    const wanted=b.angle+arm.angle+Math.sin(phase)*(.25+u*.6)+(this.caught?Math.sin(this.time*17+arm.phase+u*3)*1.5:0);
    const prev=j?arm.nodes[j-1]:b;const rest=j?arm.rests[j-1]:this.radius*.8;
    const muscle=(this.caught?260:55)*(1-u*.55);
    let fx=(prev.x+Math.cos(wanted)*rest-p.x)*muscle,fy=(prev.y+Math.sin(wanted)*rest-p.y)*muscle;
    // Linear + speed-dependent fluid drag, weak currents, and distributed muscle actuation.
    const drag=.95+Math.hypot(pvx,pvy)*.0023;
    fx+=-pvx*drag+Math.sin(this.time*.54+p.y*.012+arm.phase)*9;
    fy+=-pvy*drag+Math.cos(this.time*.43+p.x*.013+arm.phase)*9;
    if(this.caught){fx+=Math.sin(this.time*26+u*9+arm.phase)*2500*u;fy+=Math.cos(this.time*23-u*8+arm.phase)*2500*u;}
    const x=p.x,y=p.y;p.x+=pvx*dt+fx*dt*dt;p.y+=pvy*dt+fy*dt*dt;p.px=x;p.py=y;
   }
  }
  for(let i=0;i<10;i++)this.constraints();
  const margin=this.radius+5;if(b.x<margin||b.x>this.width-margin){b.x=clamp(b.x,margin,this.width-margin);b.px=b.x+(b.x-b.px)*.15;}if(b.y<margin||b.y>this.height-margin){b.y=clamp(b.y,margin,this.height-margin);b.py=b.y+(b.y-b.py)*.15;}
  for(const arm of this.arms)for(const p of arm.nodes){p.x=clamp(p.x,3,this.width-3);p.y=clamp(p.y,3,this.height-3);}
  b.speed=Math.hypot(b.x-b.px,b.y-b.py)/dt;
  for(const f of this.food){f.age+=dt;f.x=clamp(f.x+Math.sin(this.time*.3+f.phase)*1.6*dt,12,this.width-12);f.y=clamp(f.y+Math.cos(this.time*.4+f.phase)*1.4*dt,12,this.height-12);}
  this.food=this.food.filter(f=>f.age<55||f===this.target);this.foodClock-=dt;if(this.foodClock<=0){this.spawnFood();this.foodClock=3+this.random()*3;}
  if(this.caught&&this.time>=this.flashAt){this.flash=!this.flash;this.flashAt=this.time+.28+this.random()*.24;}if(!this.caught)this.flash=false;
  this.time+=dt;
 }
 maxStretch(){let result=0;for(const arm of this.arms)for(let j=1;j<arm.nodes.length;j++){const p=arm.nodes[j-1],q=arm.nodes[j];result=Math.max(result,Math.abs(Math.hypot(q.x-p.x,q.y-p.y)-arm.rests[j-1])/arm.rests[j-1]);}return result;}
}
