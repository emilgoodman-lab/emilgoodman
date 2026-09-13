import {works,navigation,workURL} from './catalog.mjs';
const id=new URLSearchParams(location.search).get('work')||works[0]?.id;
const entry=navigation(id),stage=document.querySelector('#stage'),loading=document.querySelector('#loading');
if(!entry){loading.textContent='WORK NOT FOUND / RETURN TO INDEX';document.title='Work not found — Interactive Visual Lab';}
else{
 document.title=`${entry.work.title} — Interactive Visual Lab`;
 if(entry.work.immersive){document.querySelector('.transport').style.display='none';stage.style.height='100dvh';}
 document.querySelector('#position').textContent=`${String(entry.index+1).padStart(3,'0')} / ${String(entry.total).padStart(3,'0')}`;
 document.querySelector('#name').textContent=entry.work.title;document.querySelector('#index').href=`/#${entry.work.id}`;
 for(const [name,target] of [['previous',entry.previous],['next',entry.next]]){const a=document.querySelector(`#${name}`);a.href=workURL(target.id);a.title=`${name==='previous'?'Previous':'Next'}: ${target.title}`;a.hidden=false;}
 const frame=document.createElement('iframe');frame.title=`${entry.work.title} — ${entry.work.edition}`;frame.allow='camera; autoplay; fullscreen';frame.src=entry.work.path;
 frame.addEventListener('load',()=>{try{if(!frame.contentDocument?.querySelector('canvas')){loading.textContent='EXPERIMENT UNAVAILABLE / RETURN TO INDEX';frame.remove();return;}}catch{}loading.remove();});stage.append(frame);
 // Real page navigation destroys the old browsing context, releasing audio and camera resources.
}
