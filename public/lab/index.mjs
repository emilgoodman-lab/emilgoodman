import {works,workURL} from './catalog.mjs';
const list=document.querySelector('#works');list.replaceChildren();
for(const [index,work] of works.entries()){
 const li=document.createElement('li'),a=document.createElement('a');a.className='work';a.id=work.id;a.href=workURL(work.id);
 const number=document.createElement('span');number.className='number';number.textContent=String(index+1).padStart(3,'0');
 const body=document.createElement('span'),name=document.createElement('span'),edition=document.createElement('span'),description=document.createElement('span'),launch=document.createElement('span');
 name.className='name';name.textContent=work.title;edition.className='edition';edition.textContent=work.edition;name.append(edition);description.className='description';description.textContent=work.description;body.append(name,description);launch.className='launch';launch.textContent='[RUN]';launch.setAttribute('aria-hidden','true');a.append(number,body,launch);li.append(a);list.append(li);
}
document.querySelector('#count').textContent=`${String(works.length).padStart(3,'0')} EXPERIMENTS / READY`;
list.addEventListener('keydown',e=>{if(!['ArrowDown','ArrowUp','Home','End'].includes(e.key))return;const links=[...list.querySelectorAll('a')],index=links.indexOf(document.activeElement);if(index<0)return;e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?links.length-1:(index+(e.key==='ArrowDown'?1:-1)+links.length)%links.length;links[next].focus();});
const selected=works.find(w=>`#${w.id}`===location.hash);if(selected)document.getElementById(selected.id)?.focus({preventScroll:true});
