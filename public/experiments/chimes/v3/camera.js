import {describeHand,FistLatch,dither2bit} from '../../organic/v4/hand-math.mjs';
const button=document.querySelector('#camera-toggle');
const status=document.querySelector('#camera-status');
const placeholder=document.querySelector('#camera-placeholder');
const pixels=document.querySelector('#camera-pixels');
const ctx=pixels.getContext('2d',{willReadFrequently:true,alpha:false});
const video=document.createElement('video');video.muted=true;video.playsInline=true;
const latch=new FistLatch();
let stream=null,worker=null,active=false,loading=false,session=0,raf=0,busy=false,lastSample=0,lastVideoTime=-1,lastResult=0,box=null,tracked=false,handX=0,handY=0,initTimer=0;
function publish(detail){window.dispatchEvent(new CustomEvent('lab-hand',{detail}));}
function release(){box=null;tracked=false;latch.reset();publish({tracked:false,fist:false});}
function blank(){ctx.fillStyle='#000';ctx.fillRect(0,0,pixels.width,pixels.height);placeholder.hidden=false;}
function stop(message='Camera off. Mouse control active.'){
  session++;active=loading=false;busy=false;clearTimeout(initTimer);cancelAnimationFrame(raf);raf=0;
  stream?.getTracks().forEach(track=>track.stop());stream=null;
  video.pause();video.srcObject=null;worker?.terminate();worker=null;release();blank();
  button.textContent='[ ENABLE WEBCAM ]';button.setAttribute('aria-pressed','false');status.textContent=message;
}
function preview(){
  if(video.readyState<2)return;
  ctx.save();ctx.translate(pixels.width,0);ctx.scale(-1,1);ctx.drawImage(video,0,0,pixels.width,pixels.height);ctx.restore();
  const image=ctx.getImageData(0,0,pixels.width,pixels.height);dither2bit(image.data,pixels.width,pixels.height);ctx.putImageData(image,0,0);
  if(box&&tracked){
    const side=Math.ceil(Math.max(box.width*pixels.width,box.height*pixels.height)+8);
    const x=Math.round(box.x*pixels.width-side/2),y=Math.round(box.y*pixels.height-side/2);
    ctx.fillStyle='#fff';
    // Integer filled rectangles keep the HUD strictly binary and one pixel wide.
    ctx.fillRect(x,y,side,1);ctx.fillRect(x,y+side-1,side,1);ctx.fillRect(x,y,1,side);ctx.fillRect(x+side-1,y,1,side);
  }
}
function loop(now){
  if(!active)return;
  if(now-lastResult>400&&tracked){release();status.textContent='SEARCHING / show one hand';}
  if(now-lastSample>=50&&video.readyState>=2&&video.currentTime!==lastVideoTime){
    lastSample=now;lastVideoTime=video.currentTime;preview();
    if(!busy){
      busy=true;const token=session;const currentWorker=worker;
      createImageBitmap(video,{resizeWidth:320,resizeHeight:Math.round(320*video.videoHeight/video.videoWidth)}).then(bitmap=>{
        if(token!==session||!active){bitmap.close();return;}
        currentWorker.postMessage({type:'frame',bitmap,timestamp:now},[bitmap]);
      }).catch(()=>{if(token===session)stop('Video frame unavailable. Try enabling again.');});
    }
  }
  raf=requestAnimationFrame(loop);
}
async function start(){
  if(!window.isSecureContext||!navigator.mediaDevices?.getUserMedia){status.textContent='Camera needs HTTPS or localhost in a supported browser.';return;}
  const token=++session;loading=true;
  button.textContent='[ CANCEL CAMERA ]';button.setAttribute('aria-pressed','true');status.textContent='Allow camera access to begin. No audio is used.';
  try{
    const acquired=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:640},height:{ideal:480},frameRate:{ideal:24,max:30}},audio:false});
    if(token!==session){acquired.getTracks().forEach(t=>t.stop());return;}
    stream=acquired;video.srcObject=stream;await video.play();
    if(token!==session)return;
    placeholder.hidden=true;preview();status.textContent='Loading hand tracker…';
    worker=new Worker(new URL('../../organic/v4/hand-worker.js',import.meta.url),{type:'module'});
    initTimer=setTimeout(()=>{if(token===session)stop('Hand tracker timed out. Try enabling again.');},35000);
    worker.onerror=()=>{if(token===session)stop('Hand tracker unavailable in this browser. Mouse control active.');};
    worker.onmessage=({data})=>{
      if(token!==session)return;
      if(data.type==='ready'){
        clearTimeout(initTimer);active=true;loading=false;busy=false;lastSample=0;lastVideoTime=-1;lastResult=performance.now();
        status.textContent='SEARCHING / show one hand';button.textContent='[ DISABLE WEBCAM ]';raf=requestAnimationFrame(loop);
      }else if(data.type==='result'){
        busy=false;lastResult=performance.now();const hand=describeHand(data.landmarks,data.world);
        if(!hand){release();status.textContent='SEARCHING / show one hand';return;}
        if(!tracked){handX=hand.x;handY=hand.y;}else{handX+=(hand.x-handX)*.4;handY+=(hand.y-handY)*.4;}
        tracked=true;box=hand.box;const fist=latch.update(hand.fist,lastResult);
        publish({tracked:true,x:handX,y:handY,fist});
        status.textContent=fist?'TRACKING / FIST → SHAKE':'TRACKING / OPEN HAND';
      }else if(data.type==='error'){stop('Hand tracker could not run. Try another browser or re-enable.');}
    };
    worker.postMessage({type:'init'});
    stream.getVideoTracks()[0]?.addEventListener('ended',()=>{if(token===session)stop('Camera disconnected. Mouse control active.');});
  }catch(error){
    if(token!==session)return;
    const message=error.name==='NotAllowedError'?'Camera permission denied. Allow it in the browser, then retry.':error.name==='NotFoundError'?'No camera found. Connect a webcam and retry.':error.name==='NotReadableError'?'Camera is busy. Close other camera apps and retry.':'Camera unavailable. Mouse control remains active.';
    stop(message);
  }
}
button.addEventListener('click',()=>{if(active||loading)stop();else start();});
window.addEventListener('pagehide',()=>stop());
document.addEventListener('visibilitychange',()=>{if(document.hidden&&(active||loading))stop('Camera paused when tab was hidden. Enable to resume.');});
blank();
