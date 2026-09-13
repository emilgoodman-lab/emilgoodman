export const STEP=1/90;
export const GLYPHS=Array.from('◈◇◊◌◍◎◉◐◑◒◓◔◕◖◗◘◙◚◛◜◝◞◟◠◡◢◣◤◥◧◨◩◪◫◬◭◮◰◱◲◳◴◵◶◷◸◹◺◿▣▤▥▦▧▨▩▰▱△▽▷◁▵▿▹◃⌖⌘⎔⬡⬢⬣⬠⬟⯁⯂⯃⯄⯅⯆⯇⯈⟐⟡⧖⧗⧉⨳⨯⌑');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const hash=n=>{n=Math.imul(n^n>>>16,0x45d9f3b);n=Math.imul(n^n>>>16,0x45d9f3b);return((n^n>>>16)>>>0)/4294967295;};

export class WeaveWorld{
 constructor(width,height){this.time=0;this.held=false;this.dwell=0;this.knot=0;this.energy=0;this.waveEnergy=0;this.range=80;this.amplitude=0;this.pointer={x:width/2,y:height/2,vx:0,vy:0,active:false};this.resize(width,height);}
 resize(width,height){this.width=Math.max(160,width);this.height=Math.max(160,height);this.spacing=clamp(Math.sqrt(this.width*this.height/1550),16,24);this.cols=Math.ceil(this.width/this.spacing)+3;this.rows=Math.ceil(this.height/this.spacing)+3;this.count=this.cols*this.rows;this.nodes=[];
  for(let row=0;row<this.rows;row++)for(let col=0;col<this.cols;col++){const id=row*this.cols+col,baseX=(col-1)*this.width/(this.cols-3),baseY=(row-1)*this.height/(this.rows-3);this.nodes.push({id,row,col,baseX,baseY,dx:0,dy:0,z:0,vx:0,vy:0,vz:0,glyph:(id*37+row*11)%GLYPHS.length,size:.82+hash(id*19+7)*.36,shade:.5+hash(id*31+17)*.45,phase:hash(id*53+3)*Math.PI*2});}
  this.ax=new Float32Array(this.count);this.ay=new Float32Array(this.count);this.az=new Float32Array(this.count);this.pointer.x=clamp(this.pointer.x,0,this.width);this.pointer.y=clamp(this.pointer.y,0,this.height);
 }
 move(x,y,active=true){const p=this.pointer;p.vx=clamp((x-p.x)*16,-1200,1200);p.vy=clamp((y-p.y)*16,-1200,1200);p.x=clamp(x,0,this.width);p.y=clamp(y,0,this.height);p.active=active;}
 setHeld(value){this.held=Boolean(value);if(this.held)this.pointer.active=true;}
 release(){this.held=false;this.pointer.active=false;this.pointer.vx=this.pointer.vy=0;}
 step(){const dt=STEP,p=this.pointer,min=Math.min(this.width,this.height);this.time+=dt;this.dwell=clamp(this.dwell+(p.active?dt/2.8:-dt/1.2),0,1);this.knot=clamp(this.knot+(this.held?dt*2.6:-dt*1.45),0,1);this.range=clamp(min*(.17+this.dwell*.36),80,min*.62);this.amplitude=min*(.022+this.dwell*.13);
  const c=this.cols,nodes=this.nodes,ax=this.ax,ay=this.ay,az=this.az;
  for(let i=0;i<this.count;i++){
   const n=nodes[i],left=n.col?nodes[i-1]:n,right=n.col<c-1?nodes[i+1]:n,up=n.row?nodes[i-c]:n,down=n.row<this.rows-1?nodes[i+c]:n;
   const lapX=left.dx+right.dx+up.dx+down.dx-4*n.dx,lapY=left.dy+right.dy+up.dy+down.dy-4*n.dy,lapZ=left.z+right.z+up.z+down.z-4*n.z;
   let fx=lapX*32-n.dx*5.8-n.vx*4.4,fy=lapY*32-n.dy*5.8-n.vy*4.4,fz=lapZ*45-n.z*6.4-n.vz*4.1;
   const bx=n.baseX,by=n.baseY,rx=bx-p.x,ry=by-p.y,d=Math.hypot(rx,ry),nx=rx/(d||1),ny=ry/(d||1);
   if(p.active){const w=Math.exp(-d*d/(2*this.range*this.range)),phase=this.time*(3.2+this.dwell*1.5)-d/(19+this.dwell*13)+n.phase*.035,targetZ=Math.sin(phase)*this.amplitude*w,targetR=Math.cos(phase*.91)*this.amplitude*.22*w;
    fx+=(targetR*nx-n.dx)*24*w+p.vx*w*.035;fy+=(targetR*ny-n.dy)*24*w+p.vy*w*.035;fz+=(targetZ-n.z)*35*w;
   }
   if(this.knot>0){const sigma=min*(.15+this.knot*.18),core=Math.exp(-d*d/(2*sigma*sigma)),tail=Math.exp(-d/(min*.7))*.24,influence=clamp(core+tail,0,1),vibrate=Math.sin(this.time*(27+this.knot*12)+n.phase)*min*.014*this.knot*(.25+core),pull=(.12*tail+.78*core)*this.knot,targetX=(p.x-bx)*pull+vibrate,targetY=(p.y-by)*pull+Math.cos(this.time*31+n.phase*1.7)*min*.011*this.knot*(.2+core),targetZ=min*(.11+.18*core)*this.knot+vibrate*2.2;
    fx+=(targetX-n.dx)*(12+core*27);fy+=(targetY-n.dy)*(12+core*27);fz+=(targetZ-n.z)*(18+core*35);
   }
   ax[i]=fx;ay[i]=fy;az[i]=fz;
  }
  let kinetic=0,wave=0;const damp=Math.exp(-(this.held?1.65:2.25)*dt);
  for(let i=0;i<this.count;i++){const n=nodes[i];n.vx=(n.vx+ax[i]*dt)*damp;n.vy=(n.vy+ay[i]*dt)*damp;n.vz=(n.vz+az[i]*dt)*damp;const speed=Math.hypot(n.vx,n.vy,n.vz);if(speed>900){const q=900/speed;n.vx*=q;n.vy*=q;n.vz*=q;}n.dx=clamp(n.dx+n.vx*dt,-this.width*.72,this.width*.72);n.dy=clamp(n.dy+n.vy*dt,-this.height*.72,this.height*.72);n.z=clamp(n.z+n.vz*dt,-min*.35,min*.48);kinetic+=Math.hypot(n.vx,n.vy,n.vz);wave+=Math.abs(n.z);}
  this.energy+=(clamp(kinetic/this.count/85+this.dwell*.12,0,1)-this.energy)*.12;this.waveEnergy+=(clamp(wave/this.count/(min*.07),0,1)-this.waveEnergy)*.09;p.vx*=.88;p.vy*=.88;
 }
 clusterRadius(){let sum=0,count=0;const p=this.pointer,limit=Math.min(this.width,this.height)*.28;for(const n of this.nodes)if(Math.hypot(n.baseX-p.x,n.baseY-p.y)<limit){sum+=Math.hypot(n.baseX+n.dx-p.x,n.baseY+n.dy-p.y);count++;}return count?sum/count:0;}
}
