const TAU=Math.PI*2;
function surface(w,h=w){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function rng(seed){return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
// All printed surfaces are sampled from the supplied painted reference, not icons.
const patches=[
 [240,158,151,225], [247,393,409,53], [66,486,133,257],
 [277,1,329,58], [28,992,180,151], [85,261,113,108],
 [1202,74,336,52], [644,178,135,189], [870,168,102,111],
 [1439,1107,281,34], [1827,485,139,269], [1631,155,179,211]
];
function polygon(s,kind,seed){const random=rng(seed),pts=[],N=kind===1?96:kind===2?48:kind===3?24:kind===4?64:64;
 for(let i=0;i<N;i++){const a=i/N*TAU;let r;
  if(kind===0)r=1/(Math.abs(Math.cos(a))+Math.abs(Math.sin(a)));
  else if(kind===1)r=.83+.105*Math.cos(a*8);
  else if(kind===2)r=.78+.18*Math.cos(a*4);
  else if(kind===3)r=i%3===0?1:.51;
  else r=1/(Math.abs(Math.cos(a))**4+Math.abs(Math.sin(a))**4)**.25;
  r*=.983+random()*.034;pts.push([Math.cos(a)*r*49,Math.sin(a)*r*49*(kind===0?1.16:1)]);
 }
 s.beginPath();pts.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();
}
export async function makeCollage(){
 const source=new Image();source.src=new URL('../v2/assets/ornament.jpg',import.meta.url).href;await source.decode();
 const sx=source.width/2048,sy=source.height/1151;
 const pieces=patches.map((p,i)=>{
  const c=surface(160),s=c.getContext('2d');s.translate(80,78);s.save();polygon(s,i%5,91+i);
  s.fillStyle='#eed3b5';s.shadowColor='#42201d50';s.shadowBlur=2;s.shadowOffsetY=1.5;s.fill();s.shadowColor='transparent';s.clip();
  s.drawImage(source,p[0]*sx,p[1]*sy,p[2]*sx,p[3]*sy,-52,-61,104,122);
  s.restore();polygon(s,i%5,91+i);s.strokeStyle=i%3===0?'#efd5b5b3':'#7f313a50';s.lineWidth=1.2;s.stroke();
  return c;
 });
 // A tiny unprinted pink patch retains the original paper fibres. Offset tiles
 // and an opaque pink wash remove obvious seams without a per-frame filter.
 const paper=surface(512),s=paper.getContext('2d'),random=rng(198);
 s.fillStyle='#ce8c91';s.fillRect(0,0,512,512);
 for(let y=0;y<512;y+=32)for(let x=0;x<512;x+=32){s.save();s.translate(x+16,y+16);s.rotate(Math.floor(random()*4)*Math.PI/2);s.drawImage(source,1058*sx,299*sy,25*sx,25*sy,-17,-17,34,34);s.restore();}
 s.fillStyle='#d6959b55';s.fillRect(0,0,512,512);
 const data=s.getImageData(0,0,512,512);for(let i=0;i<data.data.length;i+=4){const n=(random()-.5)*8;for(let k=0;k<3;k++)data.data[i+k]+=n;}s.putImageData(data,0,0);
 const stars=['#8c2934','#f2d4b6','#a63132'].map((color,k)=>{const c=surface(80),s=c.getContext('2d');s.translate(40,40);s.scale(.62,.62);polygon(s,3,28+k);s.fillStyle=color;s.shadowColor='#55232d33';s.shadowBlur=2;s.shadowOffsetY=1;s.fill();s.clip();s.globalAlpha=.22;s.drawImage(source,277*sx,2*sy,329*sx,58*sy,-52,-52,104,104);return c;});
 const palm=new Path2D('M -9 21 L -12 11 C -16 7 -22 2 -23 -3 C -24 -8 -19 -10 -16 -5 L -10 2 L -11 -20 C -11 -27 -5 -27 -5 -20 L -4 -8 L -4 -28 C -4 -34 2 -34 2 -27 L 3 -8 L 4 -24 C 4 -30 10 -29 10 -22 L 9 -7 L 12 -16 C 14 -22 19 -19 17 -13 L 14 6 Q 12 16 7 21 Z');
 const fist=new Path2D('M -10 20 L -13 10 Q -21 4 -20 -5 Q -19 -11 -13 -9 L -13 -15 Q -12 -21 -6 -18 Q 0 -23 4 -18 Q 10 -21 13 -15 Q 19 -17 19 -9 L 18 3 Q 17 13 10 20 Z');
 const hands=[palm,fist].map((path,i)=>{const c=surface(120),s=c.getContext('2d');s.translate(60,62);s.scale(1.55,1.55);s.save();s.shadowColor='#52232a50';s.shadowBlur=1;s.shadowOffsetY=1;s.fillStyle='#edd1b3';s.fill(path);s.clip(path);s.globalAlpha=.26;s.drawImage(source,1058*sx,299*sy,25*sx,25*sy,-28,-36,56,62);s.restore();s.strokeStyle='#853139';s.lineWidth=1.05;s.stroke(path);s.beginPath();if(i){s.moveTo(-13,-7);s.bezierCurveTo(1,-11,4,-2,-3,2);s.moveTo(-5,-16);s.lineTo(-5,-8);s.moveTo(3,-16);s.lineTo(3,-9);s.moveTo(11,-14);s.lineTo(11,-7);}else{s.moveTo(-8,5);s.quadraticCurveTo(1,-2,10,3);s.moveTo(-8,10);s.quadraticCurveTo(-2,3,-4,-2);}s.stroke();s.fillStyle='#95343b';s.translate(0,13);s.rotate(Math.PI/4);s.fillRect(-2,-2,4,4);return c;});
 return {pieces,paper,stars,hands,source};
}
