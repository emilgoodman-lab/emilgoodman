function canvas(w,h,dpr){const c=document.createElement('canvas');c.width=Math.round(w*dpr);c.height=Math.round(h*dpr);const s=c.getContext('2d');s.scale(dpr,dpr);return {c,s};}
// A scalloped pointed opening, drawn as one continuous paper-cut edge.
function arch(x,y,w,h){const p=new Path2D(),X=u=>x+u*w,Y=v=>y+v*h;
 p.moveTo(X(0),Y(1));p.lineTo(X(0),Y(.46));
 p.bezierCurveTo(X(-.008),Y(.35),X(.065),Y(.29),X(.14),Y(.29));
 p.bezierCurveTo(X(.11),Y(.19),X(.21),Y(.13),X(.30),Y(.15));
 p.bezierCurveTo(X(.29),Y(.06),X(.43),Y(.055),X(.50),Y(0));
 p.bezierCurveTo(X(.57),Y(.055),X(.71),Y(.06),X(.70),Y(.15));
 p.bezierCurveTo(X(.79),Y(.13),X(.89),Y(.19),X(.86),Y(.29));
 p.bezierCurveTo(X(.935),Y(.29),X(1.008),Y(.35),X(1),Y(.46));
 p.lineTo(X(1),Y(1));p.closePath();return p;
}
export function buildHabitat(width,height,skin,dpr=1){
 const rear=canvas(width,height,dpr),front=canvas(width,height,dpr),unit=Math.min(width,height),mobile=width<600;
 const source=skin.source,sx=source.width/2048,sy=source.height/1151;
 function texture(s,path,color,opacity=.18){s.fillStyle=color;s.fill(path,'evenodd');s.save();s.clip(path,'evenodd');s.globalAlpha=opacity;s.fillStyle=s.createPattern(skin.paper,'repeat');s.fillRect(0,0,width,height);s.restore();}
 function frame(s,x,y,w,h,thick,color,foreground){
  const outer=arch(x,y,w,h),inner=arch(x+thick,y+thick*1.7,w-2*thick,h-thick*2.1),ring=new Path2D();ring.addPath(outer);ring.addPath(inner);
  s.save();if(foreground){s.shadowColor='#552c3f38';s.shadowBlur=unit*.005;s.shadowOffsetX=unit*.002;s.shadowOffsetY=unit*.004;}
  texture(s,ring,color,.15);s.restore();s.save();s.clip(ring,'evenodd');
  s.globalAlpha=.48;s.drawImage(source,277*sx,2*sy,329*sx,58*sy,x,y,w,thick*1.15);
  s.globalAlpha=1;s.restore();s.lineWidth=Math.max(1,unit*.002);s.strokeStyle='#ecd0aa';s.stroke(inner);
  s.lineWidth=.8;s.strokeStyle=foreground?'#652a3977':'#893c4b33';s.stroke(outer);
  // Thin diamond inlay marks the pillars without filling the clear openings.
  for(const edge of [x+thick*.49,x+w-thick*.49])for(let yy=y+h*.49;yy<y+h-thick;yy+=thick*1.7){s.save();s.translate(edge,yy);s.rotate(Math.PI/4+.015*Math.sin(yy));s.fillStyle=foreground?'#e5be9a':'#c78b8b';s.fillRect(-thick*.19,-thick*.19,thick*.38,thick*.38);s.restore();}
  return ring;
 }
 const s=rear.s;s.fillStyle=s.createPattern(skin.paper,'repeat');s.fillRect(0,0,width,height);
 // Distant niches are quieter, and always behind the animal.
 for(const [cx,cy,w,h] of [[.22,.16,.33,.68],[.73,.08,.39,.77]]){
  const x=width*(cx-w/2),y=height*cy,ww=width*w,hh=height*h;
  texture(s,arch(x,y,ww,hh),'#b46f80',.28);frame(s,x-unit*.014,y-unit*.014,ww+unit*.028,hh+unit*.03,unit*.011,'#b78086',false);
  const inset=unit*.028;s.strokeStyle='#dda8a0';s.lineWidth=1;s.stroke(arch(x+inset,y+inset*1.8,ww-inset*2,hh-inset*2.4));
  for(let j=0;j<3;j++){s.save();s.translate(width*cx,y+hh*.77+j*unit*.025);s.rotate(Math.PI/4);s.fillStyle='#d6a29a';s.fillRect(-unit*.005,-unit*.005,unit*.01,unit*.01);s.restore();}
 }
 // A faint geometric frieze recedes on the back wall.
 s.globalAlpha=.28;s.drawImage(source,235*sx,390*sy,440*sx,64*sy,0,height*.865,width,unit*.038);s.globalAlpha=1;
 const f=front.s,thick=unit*(mobile?.028:.032),rings=[];
 // Two free-standing, hollow cut-paper arcades: the creature is visible through
 // their openings and is genuinely occluded by the narrow pillars and crests.
 rings.push(frame(f,-width*.085,height*.22,width*(mobile?.60:.42),height*.84,thick,'#863640',true));
 rings.push(frame(f,width*(mobile?.68:.73),height*.38,width*(mobile?.48:.33),height*.66,thick*.86,'#a63e43',true));
 // Small hanging geometric pendants overlap passing arms; fixed order, no swaps.
 for(const [xx,yy,sz] of [[.11,.115,.064],[.88,.20,.057],[.54,.055,.045]]){
  const x=xx*width,y=yy*height,r=sz*unit;
  f.strokeStyle='#7c354580';f.lineWidth=1;f.beginPath();f.moveTo(x,0);f.lineTo(x,y-r*.32);f.stroke();
  f.save();f.translate(x,y);f.rotate(Math.PI/4);f.shadowColor='#48293333';f.shadowBlur=2;f.shadowOffsetY=2;f.drawImage(skin.pieces[xx>.8?5:0],-r*.8,-r*.8,r*1.6,r*1.6);f.restore();
 }
 // A shallow foreground rail anchors the scene while leaving most of it open.
 const rail=unit*.018;f.fillStyle='#e4bba2';f.fillRect(0,height-rail,width,rail);f.globalAlpha=.75;f.drawImage(source,240*sx,393*sy,407*sx,53*sy,0,height-rail,width,rail);f.globalAlpha=1;
 return {rear:rear.c,front:front.c,rings,width,height};
}
