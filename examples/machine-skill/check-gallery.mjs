// Verify that the actual site works inside the gallery and releases its renderer on close.
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from './scripts/lib/serve.mjs';
import { launch } from './scripts/lib/browser.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const out=resolve(root,'.qa/machine-gallery');mkdirSync(out,{recursive:true});
const srv=await serve(root),base=(process.argv[2]||srv.url).replace(/\/$/,'');
const {browser,page}=await launch({width:1280,height:900});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
const dialog=page.locator('.preview-dialog'),iframe=page.frameLocator('#preview-site');
async function ready(){
  await iframe.locator('[data-k=break]').waitFor();
  await page.waitForFunction(()=>document.querySelector('.preview-site-status')?.hidden);
}
async function unloaded(){
  assert.equal(await page.locator('#preview-site').getAttribute('src'),null);
  await page.waitForFunction(()=>document.querySelector('#preview-site').contentDocument?.URL==='about:blank');
}
try{
  await page.goto(base+'/projects.html?q=Machine%20Skill',{waitUntil:'networkidle'});
  assert.equal(await page.locator('#preview-site').getAttribute('src'),null); // No 3D before an explicit action.
  await page.locator('#machine-skill [data-open-interactive]').click();await ready();await page.waitForTimeout(3400);
  assert.ok(await dialog.isVisible());assert.ok(await page.locator('#preview-video').isHidden());
  assert.ok(await page.evaluate(()=>[...document.querySelectorAll('[data-preview]')].every(v=>v.paused)));
  const input=iframe.locator('input[type=range]');await input.fill('700');await input.dispatchEvent('input');await page.waitForTimeout(1800);
  const value=await iframe.locator('body').evaluate(()=>window.__lab.heroValue);assert.ok(value>16&&value<19);
  await iframe.locator('[data-k=cut]').click();await page.waitForTimeout(1600);
  assert.ok(await iframe.locator('body').evaluate(()=>window.__lab.state.cut>.95));
  await iframe.locator('[data-k=break]').click();await page.waitForTimeout(250);
  assert.equal(await iframe.locator('body').evaluate(()=>window.__lab.heroValue),0);
  await iframe.locator('[data-k=break]').click();await page.waitForTimeout(250);
  await page.screenshot({path:resolve(out,'desktop.png')});
  await page.locator('[data-preview-mode=video]').click();await unloaded();
  await page.waitForFunction(()=>document.querySelector('#preview-video').readyState>=2);
  assert.equal(await page.locator('#preview-video').evaluate(v=>v.duration),28);
  await page.locator('[data-preview-mode=live]').click();await ready();
  await iframe.locator('canvas').focus();await page.keyboard.press('Escape');
  await dialog.waitFor({state:'hidden'});await unloaded();
  assert.ok(await page.locator('#machine-skill [data-open-interactive]').evaluate(el=>document.activeElement===el));
  await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});
  await page.locator('#machine-skill [data-open-interactive]').click();await ready();
  assert.ok(await iframe.locator('body').evaluate(()=>window.__lab.paused));
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert.ok(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth));
  await page.screenshot({path:resolve(out,'mobile.png')});
  await iframe.locator('[data-k=explode]').click();await page.waitForTimeout(1600);
  assert.ok(await iframe.locator('body').evaluate(()=>window.__lab.state.explode>.95));
  await page.locator('.preview-close').click();await dialog.waitFor({state:'hidden'});await unloaded();
  await page.locator('#clear-filters').click();await page.locator('#remotion-skills [data-open-preview]').click();
  assert.ok(await page.locator('.preview-modes').isHidden());
  assert.ok(await page.locator('#preview-video').isVisible());
  await page.locator('.preview-close').click();
  assert.deepEqual(errors,[]);
  writeFileSync(resolve(out,'validation.json'),JSON.stringify({base,liveControls:['rpm','cut','break/reset','explode'],videoSwitch:true,unloadedOnSwitchAndClose:true,escapeInsideFrame:true,focusRestored:true,mobileWidth:390,reducedMotion:true,videoOnlyRegression:true,errors},null,2)+'\n');
  console.log('PASS: embedded site controls, live/video switching, resource cleanup, Escape/focus, 390px, reduced motion, existing videos.');
}finally{await browser.close();srv.server.close();}
