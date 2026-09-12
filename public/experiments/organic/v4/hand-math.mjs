// Geometry only: accepts actual MediaPipe landmarks, never camera pixels.
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,(a.z||0)-(b.z||0));
export function describeHand(normalized,world=normalized){
  if(!normalized||normalized.length!==21||!world||world.length!==21)return null;
  if([...normalized,...world].some(p=>!p||![p.x,p.y,p.z||0].every(Number.isFinite)))return null;
  let curled=0;
  for(const mcp of [5,9,13,17]){
    const a=world[mcp],b=world[mcp+1],c=world[mcp+2],tip=world[mcp+3];
    const length=distance(a,b)+distance(b,c)+distance(c,tip);
    const extension=distance(a,tip)/Math.max(length,1e-6);
    const dot=(a.x-b.x)*(c.x-b.x)+(a.y-b.y)*(c.y-b.y)+((a.z||0)-(b.z||0))*((c.z||0)-(b.z||0));
    const cosine=dot/Math.max(distance(a,b)*distance(b,c),1e-6);
    if(extension<.68||cosine>-.35)curled++;
  }
  const center=[0,5,9,13,17].reduce((s,i)=>({x:s.x+normalized[i].x/5,y:s.y+normalized[i].y/5}),{x:0,y:0});
  const xs=normalized.map(p=>1-p.x),ys=normalized.map(p=>p.y);
  const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
  return {x:clamp((.5-center.x)*3.2,-1,1),y:clamp((center.y-.5)*3.2,-1,1),fist:curled>=3,curled,
    box:{x:(minX+maxX)/2,y:(minY+maxY)/2,width:maxX-minX,height:maxY-minY}};
}
export class FistLatch{
  constructor(){this.reset();}
  reset(){this.value=false;this.candidate=false;this.since=0;}
  update(candidate,now){
    if(candidate!==this.candidate){this.candidate=candidate;this.since=now;}
    if(now-this.since>=(candidate?150:100))this.value=candidate;
    return this.value;
  }
}
// Four luminance levels represented using a fixed 2x2 white-dot pattern.
// Output contains only black (0) and white (255), with no gray pixels.
export function dither2bit(data,width,height){
  const pattern=[0,2,3,1],counts=[0,1,2,4];
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const i=(y*width+x)*4;
    const luminance=.2126*data[i]+.7152*data[i+1]+.0722*data[i+2];
    const level=Math.min(3,Math.floor(luminance/64));
    const white=pattern[(y%2)*2+x%2]<counts[level]?255:0;
    data[i]=data[i+1]=data[i+2]=white;data[i+3]=255;
  }
  return data;
}
