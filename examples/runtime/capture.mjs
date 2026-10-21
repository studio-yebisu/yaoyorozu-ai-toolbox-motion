import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import crypto from 'node:crypto';

const args=process.argv.slice(2);
const get=(flag,fallback)=>args.includes(flag)?args[args.indexOf(flag)+1]:fallback;
const id=get('--scene','gsap'),base=get('--base','http://127.0.0.1:5173');
const output=path.resolve(get('--out',`../../.qa/renders/${id}`));
const only=args.includes('--probe');
const executablePath=get('--chrome','C:/Program Files/Google/Chrome/Application/chrome.exe');
await fs.mkdir(output,{recursive:true});
const browser=await chromium.launch({executablePath,headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:960,height:600},deviceScaleFactor:1});
const errors=[],outside=[];
page.on('pageerror',e=>errors.push(String(e)));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
await page.route('**/*',route=>{
  const url=new URL(route.request().url());
  if(['http:','https:'].includes(url.protocol)&&!['127.0.0.1','localhost'].includes(url.hostname)){
    outside.push(url.origin);return route.abort();
  }
  return route.continue();
});
await page.addInitScript(()=>{let state=260613;Math.random=()=>{state=(Math.imul(1664525,state)+1013904223)>>>0;return state/4294967296;};});
await page.goto(get('--url',`${base}/?scene=${encodeURIComponent(id)}`),{waitUntil:'networkidle',timeout:120000});
await page.evaluate(()=>window.__scene.ready);
const frames=only?[0,60,120,180,239]:Array.from({length:240},(_,i)=>i);
for(const frame of frames){
  await page.evaluate(async f=>{await window.__scene.seek(f);await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));},frame);
  await page.screenshot({path:path.join(output,`frame-${String(frame).padStart(4,'0')}.png`)});
  if(!only&&frame%60===0)console.log(`${id}: ${frame}/240`);
}
const info=await page.evaluate(()=>({id:window.__scene.id,feature:window.__scene.feature,fps:window.__scene.fps,durationFrames:window.__scene.durationFrames,animations:document.getAnimations().length}));
const production=await page.evaluate(()=>({proof:window.__processingProof||null,media:window.__producedMedia||null}));
if(production.media){
  if(!['encoded.webm','processed.mp4'].includes(production.media.filename))throw new Error('Unexpected produced filename');
  await fs.writeFile(path.join(output,production.media.filename),Buffer.from(production.media.base64,'base64'));
}
const browserVersion=browser.version();await browser.close();
if(errors.length||outside.length)throw new Error(JSON.stringify({errors,outside}));
const manifest={...info,browserVersion,randomSeed:260613,capturedFrames:frames,errors,blockedExternalRequests:outside,processingProof:production.proof};
if(!only){
  const movie=path.join(output,'original.mp4');
  const result=spawnSync('ffmpeg',['-y','-v','error','-framerate','30','-i',path.join(output,'frame-%04d.png'),'-c:v','libx264','-crf','20','-preset','medium','-pix_fmt','yuv420p','-movflags','+faststart','-an',movie],{encoding:'utf8'});
  if(result.status!==0)throw new Error(result.stderr);
  manifest.movie=movie;manifest.movieSha256=crypto.createHash('sha256').update(await fs.readFile(movie)).digest('hex');
}
await fs.writeFile(path.join(output,'capture.json'),JSON.stringify(manifest,null,2));
console.log(JSON.stringify({...manifest,capturedFrames:`${frames.length} frames`,movieSha256:manifest.movieSha256}));
