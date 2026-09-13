export const TAU=Math.PI*2;
export const GLYPHS=Array.from('⎔⌘◈⯁▧⧖⬡◬⌖▥⨳⟐◍⯂▨⧗⬢◭⌑▤⨯⟡◎⯃▩⧉⬣◮');
export const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export function zoneWeights(x,y,active=true){
 if(!active)return [0,0,0,0];
 const radius=Math.hypot(x,y),center=Math.exp(-radius*radius/0.13),angle=Math.atan2(y,x);
 // Cardinal fields overlap continuously. At the exact center all four are one.
 return [-Math.PI/2,0,Math.PI/2,Math.PI].map(a=>center+(1-center)*Math.pow(Math.max(0,Math.cos(angle-a)),2));
}
export class RotorField{
 constructor(width,height){this.time=0;this.motionTime=0;this.pointer={x:0,y:0,active:false};this.weights=[0,0,0,0];this.inverted=false;this.stress=0;this.handClosed=false;this.rings=GLYPHS.map((glyph,i)=>({glyph,i,phase:i*.371,speed:(i%2?-1:1)*(.016+(i%7)*.006),x:0,y:0,vx:0,vy:0}));this.resize(width,height);}
 resize(w,h){this.width=Math.max(1,w);this.height=Math.max(1,h);this.unit=Math.min(w,h);const max=Math.hypot(w,h)*.57;for(const r of this.rings){r.u=r.i/(this.rings.length-1);r.radius=this.unit*.037+r.u*(max-this.unit*.037);r.size=clamp(this.unit*.018*(.86+.28*((r.i*17%23)/23)),8,21);r.count=Math.max(12,Math.round(TAU*r.radius/(r.size*1.38)));}}
 move(x,y,active=true){this.pointer={x:clamp(x,-1,1),y:clamp(y,-1,1),active};}
 toggle(){this.inverted=!this.inverted;}
 hold(value){this.inverted=Boolean(value);}
 hand(tracked,x=0,y=0,fist=false){if(!tracked){this.handClosed=false;this.pointer.active=false;this.hold(false);return;}this.move(x,y);this.hold(fist);this.handClosed=fist;}
 step(dt){dt=clamp(dt,0,1/30);this.time+=dt;const target=zoneWeights(this.pointer.x,this.pointer.y,this.pointer.active),smooth=1-Math.exp(-dt*3.5);this.weights=this.weights.map((v,i)=>v+(target[i]-v)*smooth);this.stress+=(Number(this.inverted)-this.stress)*(1-Math.exp(-dt*5));
  this.motionTime+=dt*(1+this.stress*3.6);
  for(const r of this.rings){const lag=.15+r.u*.9,k=20/(1+lag*5),drag=2*Math.sqrt(k)*.84;const wave=this.motionTime*.58-r.i*.18;const x=(this.weights[1]+this.stress*.65)*(1+this.stress*2)*this.unit*(this.pointer.x*.11+Math.sin(wave)*.052),y=(this.weights[1]+this.stress*.65)*(1+this.stress*2)*this.unit*(this.pointer.y*.11+Math.cos(wave*.83)*.052);r.vx+=((x-r.x)*k-r.vx*drag)*dt;r.vy+=((y-r.y)*k-r.vy*drag)*dt;r.x+=r.vx*dt;r.y+=r.vy*dt;r.phase+=r.speed*dt*(1+this.stress*8);}
 }
 point(r,j){
  const [depth,,spin,tilt]=this.weights,t=this.motionTime,u=r.u,a=TAU*j/r.count+r.phase;
  const vibration=this.stress*(Math.sin(t*31+r.i*1.7+j*.22)*.65+Math.sin(t*19-r.i+j*.49)*.35);
  const rr=r.radius+vibration*this.unit*.042;
  let x=Math.cos(a)*rr,y=Math.sin(a)*rr;
  const ax=(tilt+this.stress*.85)*(.12+u*.91)*Math.sin(t*.27+u*1.8),ay=(tilt+this.stress*.85)*(.15+u*.98)*Math.cos(t*.21+u*1.3);
  const yy=y*Math.cos(ax),zz=y*Math.sin(ax),xx=x*Math.cos(ay)+zz*Math.sin(ay);
  const z=-x*Math.sin(ay)+zz*Math.cos(ay)+depth*(1-u)*this.unit*1.8;
  const focal=this.unit*1.65,perspective=focal/Math.max(focal*.28,focal+z);
  const baseX=xx*perspective+r.x,baseY=yy*perspective+r.y;
  // Project a nearby point to align each glyph to its actual ring tangent.
  const dx=-Math.sin(a),dy=Math.cos(a)*Math.cos(ax),dz=Math.cos(a)*Math.sin(ax),tx=dx*Math.cos(ay)+dz*Math.sin(ay),tz=-dx*Math.sin(ay)+dz*Math.cos(ay);
  const tangent=Math.atan2(dy-yy*tz/(focal+z),tx-xx*tz/(focal+z));
  const glyphTurn=(spin+this.stress*1.7)*Math.PI*Math.sin(t*1.15-j*.15-r.i*.31);
  return {x:baseX,y:baseY,z,size:r.size*perspective,angle:tangent+glyphTurn+vibration*.65,alpha:clamp(.87-z/(this.unit*2.6),.16,.94)};
 }
 get count(){return this.rings.reduce((n,r)=>n+r.count,0);}
}
export function mirrorSectors(level){return Math.round(clamp(level,0,8))*2;}
