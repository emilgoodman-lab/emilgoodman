// Explicit, same-origin control contract shared by the versioned artworks.
// Standalone versions retain their own original controls and behavior.
export function registerLabAudio(audio,isPaused=()=>false){
 if(window.top===window)return;
 const enable=audio.enable.bind(audio),mute=audio.mute.bind(audio),volume=audio.setVolume.bind(audio);
 let locked=true,sequence=0;
 const emit=error=>window.dispatchEvent(new CustomEvent('lab-audio-state',{detail:{enabled:audio.enabled,volume:audio.volume??.5,error:error||''}}));
 audio.enable=async()=>{if(locked)return;await enable();emit();};
 audio.mute=()=>{locked=true;mute();emit();};
 audio.setVolume=v=>{volume(v);emit();};
 window.addEventListener('lab-audio-query',()=>emit());
 window.addEventListener('lab-audio-command',async({detail})=>{
  const token=++sequence;
  if(Number.isFinite(detail.volume))volume(detail.volume);
  if(typeof detail.enabled!=='boolean'){emit();return;}
  locked=!detail.enabled;
  if(locked){mute();emit();return;}
  try{await enable();if(token!==sequence||locked){if(locked)mute();return;}audio.setPaused?.(isPaused());emit();}
  catch{locked=true;mute();emit('Sound unavailable. Try enabling again.');}
 });
 emit();
}
