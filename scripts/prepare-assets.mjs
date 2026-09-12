import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname,resolve} from 'node:path';
const assets=JSON.parse(await readFile(new URL('./assets.json',import.meta.url),'utf8'));
const root=process.env.LAB_ASSET_TEST_ROOT||process.cwd();
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
for(const asset of assets){
 const destination=resolve(root,asset.path);
 try{if(hash(await readFile(destination))===asset.sha256){console.log(`Verified ${asset.path}`);continue;}}catch{}
 let error;
 for(let attempt=0;attempt<3;attempt++){
  try{
   const response=await fetch(asset.url,{signal:AbortSignal.timeout(90000)});if(!response.ok)throw Error(`HTTP ${response.status}`);
   const bytes=Buffer.from(await response.arrayBuffer());if(hash(bytes)!==asset.sha256)throw Error('Asset checksum mismatch');
   await mkdir(dirname(destination),{recursive:true});await writeFile(destination,bytes);console.log(`Prepared ${asset.path}`);error=null;break;
  }catch(e){error=e;}
 }
 if(error)throw Error(`Cannot prepare ${asset.path}: ${error.message}`);
}
