// Permanent component identities, painter order and fixed mounting points.
// Bounded oscillation replaces time * mode multipliers and orbiting layers.
export function headPose(t,energy=0){
 const e=1+energy*.25,parts=[
  {id:'chassis',sprite:1,x:0,y:0,size:2.6,angle:Math.sin(t*.3)*.045},
  {id:'plate',sprite:4,x:0,y:0,size:1.95,angle:.4+Math.sin(t*.47)*.075*e}
 ];
 for(let i=0;i<3;i++){const a=i*Math.PI*2/3;parts.push({id:'gear-'+i,sprite:0,x:Math.cos(a)*.52,y:Math.sin(a)*.52,size:.77,angle:a+Math.sin(t*.68+i)*.12*e});}
 parts.push({id:'seal',sprite:5,x:0,y:0,size:.88,angle:Math.sin(t*.56)*.09*e});
 for(let i=0;i<4;i++){const a=i*Math.PI/2+.7;parts.push({id:'mount-'+i,sprite:7,x:Math.cos(a)*.99,y:Math.sin(a)*.99,size:.5,angle:a+Math.sin(t*.8+i)*.06*e});}
 const jaw=.16+.035*Math.sin(t*1.3)+energy*.025;
 parts.push({id:'jaw-left',sprite:2,x:1.02,y:-jaw,size:.6,angle:-.55+Math.sin(t*.9)*.035},{id:'jaw-right',sprite:2,x:1.02,y:jaw,size:.6,angle:.55-Math.sin(t*.9)*.035});
 return parts;
}
export const easeEnergy=(value,target,dt)=>value+(target-value)*(1-Math.exp(-dt*3));
