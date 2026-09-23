import {works,navigation,workURL} from './catalog.mjs';
import './camera.mjs';
const id=new URLSearchParams(location.search).get('work')||works[0]?.id;
const entry=navigation(id),stage=document.querySelector('#stage'),loading=document.querySelector('#loading');
const sound=document.querySelector('#lab-sound'),volume=document.querySelector('#lab-volume');
let prefs={enabled:false,volume:.5};
try{const p=JSON.parse(localStorage.getItem('lab-audio')||'{}');prefs={enabled:p.enabled===true,volume:Number.isFinite(p.volume)?Math.max(0,Math.min(1,p.volume)):.5};}catch{}
volume.value=prefs.volume;
function save(){try{localStorage.setItem('lab-audio',JSON.stringify(prefs));}catch{}}
if(!entry){loading.textContent='WORK NOT FOUND / RETURN TO INDEX';document.title='Work not found — Interactive Visual Lab';}
else{
 document.title=`${entry.work.title} — Interactive Visual Lab`;
 document.querySelector('#position').textContent=`${String(entry.index+1).padStart(3,'0')} / ${String(entry.total).padStart(3,'0')}`;
 document.querySelector('#name').textContent=entry.work.title;document.querySelector('#index').href=`/#${entry.work.id}`;
 for(const [name,target] of [['previous',entry.previous],['next',entry.next]]){const a=document.querySelector(`#${name}`);a.href=workURL(target.id);a.title=`${name==='previous'?'Previous':'Next'}: ${target.title}`;a.hidden=false;}
 const frame=document.createElement('iframe');frame.title=`${entry.work.title} — ${entry.work.edition}`;frame.allow='camera; autoplay; fullscreen';frame.src=entry.work.path;
 const send=detail=>{const win=frame.contentWindow,local=frame.contentDocument?.querySelector('#volume');if(local&&Number.isFinite(detail.volume))local.value=detail.volume;win?.dispatchEvent(new win.CustomEvent('lab-audio-command',{detail}));};
 sound.addEventListener('click',()=>{prefs.enabled=sound.getAttribute('aria-pressed')!=='true';save();send(prefs);});
 volume.addEventListener('input',()=>{prefs.volume=Number(volume.value);save();send({volume:prefs.volume});});
 window.addEventListener('lab-hand',e=>{const win=frame.contentWindow;if(win)win.dispatchEvent(new win.CustomEvent('lab-hand',{detail:e.detail}));});
 frame.addEventListener('load',()=>{
  const doc=frame.contentDocument,win=frame.contentWindow;
  if(!doc?.querySelector('canvas')){loading.textContent='EXPERIMENT UNAVAILABLE / RETURN TO INDEX';frame.remove();return;}
  // Keep simulation-specific controls; shared sound and camera live in one place.
  const style=doc.createElement('style');style.textContent='#sound,#camera-toggle,#camera-status,.camera-panel,.camera-card,[hidden]{display:none!important}';doc.head.append(style);
  const localVolume=doc.querySelector('#volume');if(localVolume)localVolume.closest('label')?.setAttribute('hidden','');
  if(entry.work.audio){
   sound.disabled=false;
   win.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='m'&&!e.repeat&&!['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)){e.preventDefault();e.stopImmediatePropagation();sound.click();}},true);
   win.addEventListener('lab-audio-state',({detail})=>{sound.setAttribute('aria-pressed',String(detail.enabled));sound.textContent=detail.enabled?'[ SOUND ON ]':'[ SOUND OFF ]';sound.title=detail.error||'Toggle artwork sound';});
   send(prefs);win.dispatchEvent(new win.Event('lab-audio-query'));
  }else{sound.textContent='[ SILENT WORK ]';sound.disabled=true;volume.disabled=true;}
  loading.remove();
 });stage.append(frame);
 // Navigation destroys the old context, releasing all audio and camera tracks.
}
