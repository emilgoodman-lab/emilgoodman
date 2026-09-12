export const COUNT=2000,STEP=1/120;
export const GLYPHS=Array.from('◈◇◊◌◍◎◉◐◑◒◓◔◕◖◗◘◙◚◛◜◝◞◟◠◡◢◣◤◥◧◨◩◪◫◬◭◮◰◱◲◳◴◵◶◷◸◹◺◿▣▤▥▦▧▨▩▰▱△▽▷◁▵▿▹◃⌖⌘⎔⬡⬢⬣⬠⬟⯁⯂⯃⯄⯅⯆⯇⯈⟐⟡⧖⧗⧉⨳⨯⌑');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export class SiltWorld{
 constructor(w,h,seed=1879){this.time=0;this.tick=0;this.zero=false;this.moving=0;this.contacts=0;this.activity=0;this.collisionActivity=0;this.fieldActivity=0;this.fieldContacts=0;this.pointer={x:w/2,y:h/2,active:false,vx:0,vy:0};let state=seed;const rand=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};this.particles=Array.from({length:COUNT},(_,i)=>({id:i,glyph:i%GLYPHS.length,size:.7+rand()*.6,x:0,y:0,vx:(rand()-.5)*22,vy:rand()*25,angle:rand()*Math.PI*2,spin:(rand()-.5)*.6,quiet:0,sleep:false,support:false,contact:false,shade:.62+rand()*.35}));this.resize(w,h,true);}
 resize(w,h,initial=false){const ow=this.width||w,oh=this.height||h;this.width=Math.max(40,w);this.height=Math.max(40,h);this.base=clamp(Math.sqrt(this.width*this.height/COUNT)*.47,4.5,10);this.radius=clamp(Math.min(w,h)*.175,62,138);this.gravity=clamp(h*2.55,1150,2200);this.cell=this.base*1.3+1;this.cols=Math.ceil(this.width/this.cell);this.rows=Math.ceil(this.height/this.cell);this.head=new Int32Array(this.cols*this.rows);this.next=new Int32Array(COUNT);
  const columns=Math.max(1,Math.floor((w-10)/(this.base*1.32))),rows=Math.ceil(COUNT/columns);for(const p of this.particles){p.r=this.base*p.size*.5;p.inv=1/(p.size*p.size);if(initial){const col=p.id%columns,row=Math.floor(p.id/columns);p.x=5+(col+.5)*(w-10)/columns;p.y=8+(row+.5)*Math.min((h*.72-12)/rows,this.base*1.36);}else{p.x=p.x/ow*w;p.y=p.y/oh*h;}p.x=clamp(p.x,p.r,w-p.r);p.y=clamp(p.y,p.r,h-p.r);p.ox=p.x;p.oy=p.y;p.sleep=false;p.quiet=0;}this.pointer.active=false;
 }
 move(x,y,active=true){const p=this.pointer;p.vx=clamp((x-p.x)*20,-900,900);p.vy=clamp((y-p.y)*20,-900,900);p.x=clamp(x,0,this.width);p.y=clamp(y,0,this.height);p.active=active;}
 setZero(value){value=Boolean(value);if(value===this.zero)return;this.zero=value;for(const p of this.particles){p.sleep=false;p.quiet=0;if(value){p.vy-=22+(p.id*17%31);p.vx+=Math.sin(p.id*2.39)*14;}}}
 release(){this.pointer.active=false;this.pointer.vx=this.pointer.vy=0;this.setZero(false);}
 grid(){this.head.fill(-1);for(let i=0;i<COUNT;i++){const p=this.particles[i],c=clamp(Math.floor(p.x/this.cell),0,this.cols-1),r=clamp(Math.floor(p.y/this.cell),0,this.rows-1),key=r*this.cols+c;this.next[i]=this.head[key];this.head[key]=i;}}
 step(){const dt=STEP,ptr=this.pointer,g=this.zero?0:this.gravity;this.time+=dt;this.tick++;let collisions=0,impact=0,moving=0,fieldContacts=0,fieldEnergy=0;
  for(const p of this.particles){p.ox=p.x;p.oy=p.y;p.support=p.y>=this.height-p.r-.15;p.contact=false;p.penetration=0;let fx=0,fy=0;
   if(ptr.active){const dx=p.x-ptr.x,dy=p.y-ptr.y,d2=dx*dx+dy*dy;if(d2<this.radius*this.radius){const d=Math.sqrt(d2)||.001,q=1-d/this.radius,w=q*q*(3-2*q),nx=d>.01?dx/d:Math.cos(p.id),ny=d>.01?dy/d:Math.sin(p.id),pointerSpeed=Math.hypot(ptr.vx,ptr.vy),direction=Math.abs(ptr.vx)+Math.abs(ptr.vy)>.5?Math.sign(ptr.vx+ptr.vy*.37):Math.sin(this.time*.9)>0?1:-1,pulse=1+.24*Math.sin(this.time*10-d*.09+p.id*.013),radial=(4700+pointerSpeed*4.5)*pulse,swirl=direction*(2500+pointerSpeed*2.2);fx=(nx*radial-ny*swirl+ptr.vx*7.5)*w;fy=(ny*radial+nx*swirl+ptr.vy*7.5)*w-(this.zero?0:900*w);p.spin+=(direction*2.8+ptr.vx*.0025)*w*dt*8;p.sleep=false;p.quiet=0;fieldContacts++;fieldEnergy+=w*(.3+pointerSpeed/520);}}
   if(p.sleep)continue;const damp=Math.exp(-(this.zero?.1:.16)*dt);p.vx=(p.vx+fx*dt)*damp;p.vy=(p.vy+(g+fy)*dt)*damp;const speed=Math.hypot(p.vx,p.vy);if(speed>1450){p.vx*=1450/speed;p.vy*=1450/speed;}p.x+=p.vx*dt;p.y+=p.vy*dt;
  }
  // Smooth disks circumscribe the glyphs. Fixed substeps and an inelastic positional
  // contact solve avoid thin glyph edges interlocking or exciting a resting pile.
  for(let pass=0;pass<7;pass++){this.grid();for(let i=0;i<COUNT;i++){const a=this.particles[i],cx=clamp(Math.floor(a.x/this.cell),0,this.cols-1),cy=clamp(Math.floor(a.y/this.cell),0,this.rows-1);
   for(let row=Math.max(0,cy-1);row<=Math.min(this.rows-1,cy+1);row++)for(let col=Math.max(0,cx-1);col<=Math.min(this.cols-1,cx+1);col++)for(let j=this.head[row*this.cols+col];j!==-1;j=this.next[j]){if(j<=i)continue;const b=this.particles[j],dx=b.x-a.x,dy=b.y-a.y,sum=a.r+b.r,d2=dx*dx+dy*dy;if(d2>(sum+.22)*(sum+.22))continue;const d=Math.sqrt(d2),nx=d>.0001?dx/d:1,ny=d>.0001?dy/d:0;
    if(ny>.22)a.support=true;if(ny<-.22)b.support=true;a.contact=b.contact=true;if(pass===0){collisions++;impact+=Math.max(0,Math.hypot(a.vx-b.vx,a.vy-b.vy)-7);}
    const overlap=sum-d;if(pass===6){a.penetration=Math.max(a.penetration,overlap);b.penetration=Math.max(b.penetration,overlap);}if(overlap<=.015)continue;const closing=(a.vx-b.vx)*nx+(a.vy-b.vy)*ny;if(closing>40||overlap>Math.min(a.r,b.r)*.4||(a.sleep&&b.sleep&&overlap>.15)){a.sleep=b.sleep=false;a.quiet=b.quiet=0;}const aFloor=a.y>=this.height-a.r-.06&&ny<-.2,bFloor=b.y>=this.height-b.r-.06&&ny>.2,ia=a.sleep||aFloor?0:a.inv,ib=b.sleep||bFloor?0:b.inv,weight=ia+ib;if(!weight)continue;const correction=(overlap-.015)*.94,aa=correction*ia/weight,bb=correction*ib/weight;a.x-=nx*aa;a.y-=ny*aa;b.x+=nx*bb;b.y+=ny*bb;
   }
  }
  for(const p of this.particles){p.x=clamp(p.x,p.r,this.width-p.r);p.y=clamp(p.y,p.r,this.height-p.r);if(p.y>=this.height-p.r-.05){p.support=true;p.contact=true;}}
  }
  for(const p of this.particles){if(p.sleep&&(!p.support||this.zero)){p.sleep=false;p.quiet=0;}const vx=(p.x-p.ox)/dt,vy=(p.y-p.oy)/dt;if(p.sleep){p.vx=p.vy=0;continue;}const friction=p.contact&&!this.zero?.91:.999;p.vx=vx*friction;p.vy=vy*friction;
   if(p.x<=p.r+.01&&p.vx<0)p.vx=0;if(p.x>=this.width-p.r-.01&&p.vx>0)p.vx=0;if(p.y<=p.r+.01&&p.vy<0)p.vy=0;if(p.y>=this.height-p.r-.01&&p.vy>0)p.vy=0;
   const speed=Math.hypot(p.vx,p.vy);if(speed>8)moving++;if(!this.zero&&p.support&&speed<6&&p.penetration<.1){p.quiet+=dt;if(p.quiet>.5){p.sleep=true;p.vx=p.vy=0;}}else p.quiet=0;
   p.spin*=Math.exp(-(p.contact&&!this.zero?6:.15)*dt);p.angle+=(p.spin+p.vx*.006)*dt;
  }
  ptr.vx*=.92;ptr.vy*=.92;this.contacts=collisions;this.moving=moving;this.fieldContacts=fieldContacts;const movingRatio=moving/COUNT,collisionDensity=moving<20?0:clamp(impact/COUNT/70+collisions/COUNT*.035*movingRatio,0,1),fieldDensity=clamp(fieldEnergy/120,0,1),density=clamp(collisionDensity+fieldDensity*.72+(moving<20?0:movingRatio*.18),0,1);this.collisionActivity+=(collisionDensity-this.collisionActivity)*.1;this.fieldActivity+=(fieldDensity-this.fieldActivity)*.13;this.activity+=(density-this.activity)*.1;
 }
}
