const TAU=Math.PI*2;
// One permanent printed crop and one cut silhouette for each ring. Sources are
// interleaved so adjacent rings contrast in palette, pattern and contour.
export const MOTIFS=[
 [0,245,164,143,219,0],[1,425,63,72,74,1],[2,405,166,215,71,2],[3,424,8,182,44,3],
 [0,57,488,142,254,4],[1,1490,68,236,151,5],[2,18,9,72,209,6],[3,169,103,251,35,7],
 [0,88,261,109,108,1],[1,614,116,107,111,8],[2,1626,388,180,159,0],[3,180,159,160,113,9],
 [0,272,1,240,57,3],[1,1068,377,245,230,10],[2,299,822,55,223,5],[3,47,411,42,242,2],
 [0,245,394,290,54,6],[1,811,309,96,95,1],[2,975,990,108,102,11],[3,342,350,115,169,8],
 [0,27,993,179,146,7],[1,1461,43,80,180,0],[2,905,112,199,90,3],[3,865,1028,353,74,4],
 [0,654,191,115,164,2],[1,1116,32,123,135,8],[2,1964,191,73,202,6],[3,692,44,270,51,10]
];
function shape(kind,seed){const p=new Path2D(),n=144;let state=seed>>>0;
 for(let i=0;i<n;i++){state=(Math.imul(state,1664525)+1013904223)>>>0;const a=i/n*TAU,ca=Math.cos(a),sa=Math.sin(a);let r=1;
 switch(kind){case 0:r=1/(Math.abs(ca)+Math.abs(sa));break;case 1:r=.73+.24*Math.cos(a*8);break;case 2:r=.78+.19*Math.cos(a*4);break;case 3:r=1/Math.max(Math.abs(ca),Math.abs(sa));break;case 4:r=.8+.15*Math.cos(a*6);break;case 5:r=(1+.13*Math.sin(a*3))/(Math.abs(ca)+Math.abs(sa)*.62);break;case 6:r=.75+.21*Math.cos(a*3);break;case 7:r=(Math.abs(ca)**5+Math.abs(sa)**5)**(-.2);break;case 8:r=.8+.17*Math.cos(a*5);break;case 9:r=.82+.12*Math.cos(a*12);break;case 10:r=.85+.13*Math.cos(a*7);break;case 11:r=.69+.29*Math.cos(a*10);}
 const rough=.974+state/4294967296*.052,x=ca*r*46*rough,y=sa*r*46*rough;
 if(i)p.lineTo(x,y);else p.moveTo(x,y);
 }p.closePath();return p;
}
export async function makeCollage(){
 const paths=['../../abyssal/v2/assets/ornament.jpg','./assets/blue-red.jpg','./assets/blue-ivory.jpg','./assets/blue-gold.jpg'];
 const images=await Promise.all(paths.map(async path=>{const i=new Image();i.src=new URL(path,import.meta.url).href;await i.decode();return i;}));
 const sprites=MOTIFS.map(([source,x,y,w,h,kind],id)=>{const c=document.createElement('canvas');c.width=c.height=160;const s=c.getContext('2d');s.translate(77,73);const p=shape(kind,id+171),image=images[source],scale=image.width/2048;
  // Strong, compact shadow stays baked into the transparent sprite. It lands
  // on the previous paper piece rather than applying a full-screen glow.
  s.save();s.shadowColor='#000e';s.shadowBlur=5;s.shadowOffsetX=3;s.shadowOffsetY=6;s.fillStyle='#d9bd90';s.fill(p);s.restore();
  s.save();s.clip(p);s.drawImage(image,x*scale,y*scale,w*scale,h*scale,-53,-58,106,116);s.restore();s.strokeStyle=id%3===0?'#e4c9a56b':'#180e1866';s.lineWidth=.8;s.stroke(p);return c;
 });
 // Reuse the hand silhouettes, with paper grain from the pink reference.
 const palm=new Path2D('M-9 21 L-12 11 C-16 7-22 2-23-3 C-24-8-19-10-16-5 L-10 2 L-11-20 C-11-27-5-27-5-20 L-4-8 L-4-28 C-4-34 2-34 2-27 L3-8 L4-24 C4-30 10-29 10-22 L9-7 L12-16 C14-22 19-19 17-13 L14 6 Q12 16 7 21 Z');
 const fist=new Path2D('M-10 20 L-13 10 Q-21 4-20-5 Q-19-11-13-9 L-13-15 Q-12-21-6-18 Q0-23 4-18 Q10-21 13-15 Q19-17 19-9 L18 3 Q17 13 10 20 Z');
 const hands=[palm,fist].map((p,i)=>{const c=document.createElement('canvas');c.width=c.height=112;const s=c.getContext('2d');s.translate(56,59);s.scale(1.5,1.5);s.save();s.shadowColor='#000c';s.shadowBlur=3;s.shadowOffsetY=2;s.fillStyle='#e7d2ae';s.fill(p);s.clip(p);s.globalAlpha=.2;const im=images[0],k=im.width/2048;s.drawImage(im,1058*k,299*k,25*k,25*k,-27,-34,54,57);s.restore();s.strokeStyle='#613341';s.lineWidth=1;s.stroke(p);s.beginPath();if(i){s.moveTo(-13,-7);s.bezierCurveTo(1,-11,4,-2,-3,2);for(const x of [-5,3,11]){s.moveTo(x,-15);s.lineTo(x,-8);}}else{s.moveTo(-8,5);s.quadraticCurveTo(1,-2,10,3);s.moveTo(-8,10);s.quadraticCurveTo(-2,3,-4,-2);}s.stroke();s.fillStyle='#174593';s.translate(0,13);s.rotate(Math.PI/4);s.fillRect(-2,-2,4,4);return c;});
 return {sprites,hands};
}
