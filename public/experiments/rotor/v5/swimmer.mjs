// One deterministic clock drives every copy. Offsets are measured in seconds,
// never by starting/stopping individual animated image elements.
export function frameIndex(time,mix,j,count,ring,durations){
 const total=durations.reduce((s,d)=>s+d,0)/1000;
 const offset=mix*total*(j/count*.85+(ring===10?.32:0));
 let ms=((time-offset)%total+total)%total*1000;
 for(let i=0;i<durations.length;i++){if(ms<durations[i])return i;ms-=durations[i];}
 return durations.length-1;
}
export async function loadSwimmer(){
 const meta=await fetch(new URL('./swimmer.json',import.meta.url)).then(r=>{if(!r.ok)throw Error('Swimmer timing unavailable');return r.json();});
 const atlas=new Image();atlas.src=new URL('./swimmer.webp',import.meta.url);await atlas.decode();
 const frames=meta.durations.map((_,i)=>{const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');const scale=224/Math.max(meta.width,meta.height),w=meta.width*scale,h=meta.height*scale;x.shadowColor='rgba(0,0,0,.95)';x.shadowBlur=9;x.shadowOffsetX=4;x.shadowOffsetY=6;x.drawImage(atlas,(i%meta.columns)*meta.width,Math.floor(i/meta.columns)*meta.height,meta.width,meta.height,(256-w)/2,(256-h)/2,w,h);return c;});
 return {frames,durations:meta.durations};
}
