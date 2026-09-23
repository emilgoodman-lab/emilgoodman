export {zoneWeights,mirrorSectors,TAU,GLYPHS,clamp} from '../v1/geometry.mjs';
import {zoneWeights,TAU,GLYPHS,clamp} from '../v1/geometry.mjs';
// Six permanent swimmer orbits with restrained size variation.
export const SIZE_FACTORS=[.72,1.08,.84,1.22,.76,1];
export const MOTIF_INDICES=[0,4,9,15,21,27];
export function trackPoint(radius,u,phase){
 const n=((phase/TAU*8)%8+8)%8,k=Math.floor(n),f=n-k,a=k*TAU/8+Math.PI/8,b=a+TAU/8;
 const px=Math.cos(a)*(1-f)+Math.cos(b)*f,py=Math.sin(a)*(1-f)+Math.sin(b)*f;
 const angle=phase+Math.PI/8,cx=Math.cos(angle),cy=Math.sin(angle),blend=u**2.4;
 return {x:radius*(cx*(1-blend)+px*blend),y:radius*(cy*(1-blend)+py*blend),dx:radius*(-Math.sin(angle)*(1-blend)+(Math.cos(b)-Math.cos(a))*8/TAU*blend),dy:radius*(Math.cos(angle)*(1-blend)+(Math.sin(b)-Math.sin(a))*8/TAU*blend)};
}
export class RotorField{
 constructor(width,height){this.time=0;this.motionTime=0;this.delayMix=0;this.axisMix=0;this.axisTime=0;this.pointer={x:0,y:0,active:false};this.weights=[1,1,1,1];this.inverted=false;this.stress=0;this.handClosed=false;this.rings=MOTIF_INDICES.map((motif,i)=>({glyph:GLYPHS[motif],motif,i,swimmer:true,phase:i*.371,speed:(i%2?-1:1)*(.014+i*.003),x:0,y:0,vx:0,vy:0}));this.resize(width,height);}
 resize(w,h){this.width=Math.max(1,w);this.height=Math.max(1,h);this.unit=Math.min(w,h);const base=i=>clamp(this.unit*.018*(.86+.28*((i*17%23)/23)),8,21),last=this.rings.length-1;
  // Fit the entire fixed octagon, including the outer ornaments, in the viewport.
  const max=Math.max(this.unit*.25,(this.unit*.5-base(last)*1.7-10)/Math.cos(Math.PI/8));
  for(const r of this.rings){r.u=r.i/last;r.radius=this.unit*.037+r.u*(max-this.unit*.037);r.size=base(r.i)*SIZE_FACTORS[r.i];const perimeter=r.radius*(TAU*(1-r.u**2.4)+16*Math.sin(Math.PI/8)*r.u**2.4);r.count=Math.max(12,Math.round(perimeter/(r.size*(r.swimmer?3.5:1.38))));}
 }
 move(x,y,active=true){this.pointer={x:clamp(x,-1,1),y:clamp(y,-1,1),active};}
 hold(v){this.inverted=Boolean(v);}toggle(){this.hold(!this.inverted);}
 hand(tracked,x=0,y=0,fist=false){if(!tracked){this.handClosed=false;this.pointer.active=false;this.hold(false);return;}this.move(x,y);this.hold(fist);this.handClosed=fist;}
 step(dt){dt=clamp(dt,0,1/30);this.time+=dt;const target=this.pointer.active?zoneWeights(this.pointer.x,this.pointer.y,true):[1,1,1,1],smooth=1-Math.exp(-dt*1.1);this.weights=this.weights.map((v,i)=>v+(target[i]-v)*smooth);this.stress+=(Number(this.inverted)-this.stress)*(1-Math.exp(-dt*5));
  // Full displacement, but a separate slow clock prevents held rotation runaway.
  const gain=2*(1+this.stress);this.motionTime+=dt*.22*(1+this.stress*.25);
  const delayTarget=this.pointer.active?Math.max(0,1-Math.hypot(this.pointer.x*.85,(this.pointer.y+.75)*1.5)):0;
  const axisTarget=this.pointer.active?Math.max(0,1-Math.hypot(this.pointer.x*.9,(this.pointer.y-.75)*1.5)):0;
  this.delayMix+=(delayTarget-this.delayMix)*(1-Math.exp(-dt*.85));this.axisMix+=(axisTarget-this.axisMix)*(1-Math.exp(-dt*.7));this.axisTime+=dt*(.42+this.stress*.08);
  if(delayTarget===0&&this.delayMix<.001)this.delayMix=0;if(axisTarget===0&&this.axisMix<.001)this.axisMix=0;
  for(const r of this.rings){r.phase+=r.speed*dt*.32*(1+this.stress*.3);if(r.u===1){r.x=r.y=r.vx=r.vy=0;continue;}const lag=.15+r.u*.9,k=20/(1+lag*5),drag=2*Math.sqrt(k)*.84,wave=this.motionTime*.58-r.i*.18,pin=(1-r.u)**.7;
   const x=this.weights[1]*this.unit*(this.pointer.x*.11+Math.sin(wave)*.052)*gain*pin,y=this.weights[1]*this.unit*(this.pointer.y*.11+Math.cos(wave*.83)*.052)*gain*pin;r.vx+=((x-r.x)*k-r.vx*drag)*dt;r.vy+=((y-r.y)*k-r.vy*drag)*dt;r.x+=r.vx*dt;r.y+=r.vy*dt;
  }
 }
 point(r,j){
  const [depth,,spin,tilt]=this.weights,t=this.motionTime,u=r.u,a=TAU*j/r.count+r.phase,gain=2*(1+this.stress),pin=(1-u)**.7;
  // Twice the v1 stress displacement (.009→.018) and local shake (.1→.2).
  const vibration=this.stress*(Math.sin(t*12+r.i*1.7+j*.22)*.65+Math.sin(t*8-r.i+j*.49)*.35);
  const path=trackPoint(r.radius+vibration*this.unit*.018*pin,u,a);
  const ax=tilt*(.12+u*.91)*Math.sin(t*.27+u*1.8)*gain*pin,ay=tilt*(.15+u*.98)*Math.cos(t*.21+u*1.3)*gain*pin;
  const yy=path.y*Math.cos(ax),zz=path.y*Math.sin(ax),xx=path.x*Math.cos(ay)+zz*Math.sin(ay);
  const z=-path.x*Math.sin(ay)+zz*Math.cos(ay)+depth*(1-u)*this.unit*1.8*gain;
  const focal=this.unit*1.65,perspective=focal/Math.max(focal*.28,focal+z);
  const dy=path.dy*Math.cos(ax),dz=path.dy*Math.sin(ax),tx=path.dx*Math.cos(ay)+dz*Math.sin(ay),tz=-path.dx*Math.sin(ay)+dz*Math.cos(ay);
  const tangent=Math.atan2(dy-yy*tz/(focal+z),tx-xx*tz/(focal+z));
  const glyphTurn=spin*Math.PI*.3*Math.sin(t*.32-j*.1-r.i*.31)*(1+this.stress*.3);
  // Lower-zone interaction: a slow staggered rotation around each swimmer's
  // own center, delayed along and between the six rings.
  const selfTurn=this.axisMix*Math.PI*.92*Math.sin(this.axisTime-j*.24-r.i*.68);
  const localX=(tilt*.35+this.stress*.2)*Math.sin(t*.35-j*.13-r.i*.2)*gain,localY=(spin*.45+this.stress*.2)*Math.cos(t*.31-j*.17+r.i*.3)*gain;
  return {x:xx*perspective+r.x,y:yy*perspective+r.y,z,size:r.size*perspective,angle:tangent+glyphTurn+selfTurn+vibration*.2,selfTurn,localX,localY,alpha:1};
 }
 get count(){return this.rings.reduce((n,r)=>n+r.count,0);}
}
