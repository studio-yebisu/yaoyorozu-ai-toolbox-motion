// Useful invariants of the mechanism and its public controls, rather than pixel snapshots.
import assert from 'node:assert/strict';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SPEC, pistonAt, compressor } from './solver.mjs';
import { serve } from './scripts/lib/serve.mjs';
import { launch } from './scripts/lib/browser.mjs';
const near=(a,b,tolerance=1e-10)=>assert.ok(Math.abs(a-b)<tolerance,`${a} != ${b}`);
near(pistonAt(0).travel,0);near(pistonAt(Math.PI).travel,SPEC.stroke);
for(let i=0;i<360;i++){
  const a=i*Math.PI/180,p=pistonAt(a),c=compressor(1400,a);
  near(Math.hypot(p.crankX,p.pinY-p.crankY),SPEC.rod);
  assert.ok(p.travel>=-1e-10&&p.travel<=SPEC.stroke+1e-10);
  assert.ok(c.pressurePa>=SPEC.inletPa&&c.pressurePa<=SPEC.inletPa+SPEC.outletGaugePa);
  near(compressor(1400,a,true).pressurePa,SPEC.inletPa);
}
const reference=compressor(1400);
assert.ok(reference.flowLmin>33&&reference.flowLmin<35);
assert.ok(Math.abs(reference.tankL-7.6)<.01);
near(compressor(0).flowLmin,0);near(compressor(0).powerW,0);
near(compressor(1400,0,true).flowLmin,0);
near(compressor(700).flowLmin,reference.flowLmin/2);
console.log(`PASS: slider-crank closure, 30 mm stroke, pressure bounds, 0 rpm, failure, linear flow; ${reference.flowLmin.toFixed(3)} L/min.`);

const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const out=resolve(root,'.qa/machine-check');mkdirSync(out,{recursive:true});
const server=await serve(root);const {browser,page}=await launch({width:1280,height:800});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
const url=server.url+'/examples/machine-skill/index.html';
try{
  await page.goto(url,{waitUntil:'networkidle'});await page.waitForFunction(()=>window.__machineReady);
  await page.waitForTimeout(3400);
  const slider=page.locator('input[type=range]');
  await slider.fill('700');await slider.dispatchEvent('input');await page.waitForTimeout(1600);
  const half=await page.evaluate(()=>window.__lab.heroValue);assert.ok(half>16&&half<19,`half flow ${half}`);
  await page.locator('[data-k=cut]').click();await page.locator('[data-k=labels]').click();await page.waitForTimeout(1600);
  assert.ok(await page.evaluate(()=>window.__lab.state.cut>.95&&window.__lab.state.labels>.95));
  await page.locator('[data-k=explode]').click();await page.waitForTimeout(1600);
  assert.ok(await page.evaluate(()=>window.__lab.state.explode>.95));
  await page.locator('[data-k=explode]').click();await page.locator('[data-k=xray]').click();await page.waitForTimeout(1600);
  assert.ok(await page.evaluate(()=>window.__lab.state.xray>.95));
  await page.locator('[data-k=break]').click();await page.waitForTimeout(200);
  near(await page.evaluate(()=>window.__lab.heroValue),0);
  await page.locator('[data-k=break]').click();await page.waitForTimeout(200);
  assert.ok(await page.evaluate(()=>window.__lab.heroValue>15));
  await page.locator('[data-k=run]').click();const a=await page.evaluate(()=>window.__machine.sim.angle);
  await page.waitForTimeout(200);near(await page.evaluate(()=>window.__machine.sim.angle),a);
  await page.locator('[data-k=run]').click();
  await page.setViewportSize({width:390,height:844});await page.waitForTimeout(600);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  const buttons=await page.locator('.lab-modes').boundingBox();assert.ok(buttons.y+buttons.height<844);
  await page.screenshot({path:resolve(out,'mobile.png')});
  await page.emulateMedia({reducedMotion:'reduce'});await page.reload({waitUntil:'networkidle'});
  assert.ok(await page.evaluate(()=>window.__lab.paused&&window.__lab._assembly===0));
  await page.screenshot({path:resolve(out,'reduced.png')});
  assert.deepEqual(errors,[]);
  const proof={reference,errors,controls:'rpm, cut, labels, explode, xray, failure, reset, pause',mobile:{width:390,height:844,overflow:false},reducedMotion:'paused, assembly disabled'};
  writeFileSync(resolve(out,'validation.json'),JSON.stringify(proof,null,2)+'\n');
  console.log('PASS: controls, failure/reset, pause, 390px viewport, reduced motion, no browser errors.');
}finally{await browser.close();server.server.close();}
