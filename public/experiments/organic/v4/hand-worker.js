import {FilesetResolver,HandLandmarker} from './vendor/mediapipe/vision_bundle.mjs';
let detector;
self.onmessage=async({data})=>{
  try{
    if(data.type==='init'){
      const files=await FilesetResolver.forVisionTasks(new URL('./vendor/mediapipe/wasm',import.meta.url).href,true);
      detector=await HandLandmarker.createFromOptions(files,{
        baseOptions:{modelAssetPath:new URL('./vendor/hand_landmarker.task',import.meta.url).href,delegate:'CPU'},
        runningMode:'VIDEO',numHands:1,minHandDetectionConfidence:.6,minHandPresenceConfidence:.6,minTrackingConfidence:.6,
        canvas:new OffscreenCanvas(1,1)
      });
      self.postMessage({type:'ready'});
    }else if(data.type==='frame'){
      try{
        const result=detector.detectForVideo(data.bitmap,data.timestamp);
        self.postMessage({type:'result',landmarks:result.landmarks[0]||null,world:result.worldLandmarks[0]||null,timestamp:data.timestamp});
      }finally{data.bitmap.close();}
    }
  }catch(error){self.postMessage({type:'error',message:error.message||String(error)});}
};
