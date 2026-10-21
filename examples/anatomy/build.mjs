import * as k from '../../.qa/anatomy/kit/iso-kit.mjs';
import { STROKE, PERIOD, pressAt } from './model.mjs';
import { readFile, writeFile } from 'node:fs/promises';

const width = 800, height = 340;
const base = { x: 0, y: 0, w: 120, d: 76, r: 4 };
const parts = [];
function part(name, plan, z, h, { moving = false, lit = false } = {}) {
  parts.push({ name, plan, z, h, moving, lit });
}
const box = (name, x, y, w, d, z, h, opts) => part(name, { x, y, w, d, r: Math.min(1, w / 4, d / 4) }, z, h, opts);

// A fictitious linear press: base, guide frame, die, square plunger and fasteners.
for (const [x, y] of [[5, 5], [104, 5], [5, 60], [104, 60]]) {
  box(`foot-${x}-${y}`, x, y, 11, 11, -4, 4);
}
part('bedplate', base, 0, 8);
for (const x of [6, 110]) for (const y of [6, 66]) {
  box(`bed-screw-${x}-${y}`, x, y, 4, 4, 8, 1.2);
}
for (const x of [12, 100]) {
  box(`post-foot-${x}`, x - 3, 14, 15, 17, 8, 5);
  box(`post-${x}`, x, 18, 9, 9, 13, 83);
  box(`post-cap-${x}`, x - 2, 16, 13, 13, 96, 3);
  for (const y of [16, 27]) {
    box(`post-bolt-${x}-${y}`, x - 1, y, 3, 3, 13, 1);
    box(`post-bolt-${x + 8}-${y}`, x + 8, y, 3, 3, 13, 1);
  }
  for (const z of [22, 39, 56, 73, 90]) {
    box(`guide-bracket-${x}-${z}`, x + (x === 12 ? 9 : -2), 20, 2, 5, z, 3);
  }
}
box('crossbar-back', 12, 18, 97, 4, 99, 10);
box('crossbar-front', 12, 25, 97, 4, 99, 10);
box('crossbar-left-end', 12, 22, 4, 3, 99, 10);
box('crossbar-right-end', 105, 22, 4, 3, 99, 10);
for (const x of [19, 99]) for (const y of [19, 26]) {
  box(`crossbar-screw-${x}-${y}`, x, y, 3, 2, 109, 1);
}
box('plunger-guide-back', 53, 19, 15, 3, 109, 6);
box('plunger-guide-front', 53, 25, 15, 3, 109, 6);
box('plunger-guide-left', 53, 22, 3, 3, 109, 6);
box('plunger-guide-right', 65, 22, 3, 3, 109, 6);
box('die-lower', 29, 15, 63, 26, 8, 5);
box('die-upper', 34, 19, 53, 18, 13, 3);
box('workpiece', 41, 21, 39, 14, 16, 4, { lit: true });
for (const x of [27, 89]) {
  box(`die-clamp-${x}`, x, 17, 4, 23, 13, 3);
  for (const y of [20, 34]) box(`die-clamp-screw-${x}-${y}`, x, y, 4, 3, 16, 1);
}
box('moving-tool', 34, 19, 53, 18, 44, 7, { moving: true, lit: true });
box('tool-collar', 53, 20, 15, 7, 51, 3, { moving: true });
box('square-plunger', 57, 22, 7, 3, 54, 85, { moving: true });
for (const x of [38, 79]) {
  box(`tool-screw-${x}`, x, 25, 4, 4, 51, 1, { moving: true });
}
box('control-pedestal', 100, 48, 12, 15, 8, 5);
box('control-case', 100, 49, 12, 13, 13, 10);
box('control-key', 103, 52, 6, 7, 23, 2, { lit: true });
box('nameplate', 10, 50, 26, 9, 8, 0.7);
for (const x of [12, 31]) box(`label-fastener-${x}`, x, 52, 2, 2, 8.7, 0.6);

const P = k.fitProjection(parts.flatMap(p => k.boxCorners(p.plan, p.z, p.z + p.h)), width, height, { pad: 22, azimuth: 38 });
for (const p of parts) {
  const geometry = k.slabOf(p.plan, p.z, p.h, P, 6, Math.min(0.6, p.h / 4));
  p.body = k.solidSvg(geometry, { tone: 'mid', crease: 'lo', lit: p.lit });
  p.key = k.depthOf([p.plan.x + p.plan.w / 2, p.plan.y + p.plan.d / 2, p.z + p.h / 2], P);
}
const sorted = [...parts].sort((a, b) => a.key - b.key);
const body = sorted.map(p => k.groupSvg(p.body, { id: p.name })).join('');
const figure = k.figureSvg({ width, height, label: '小さなプレスの押し型が24mm往復するSVG図解', body: `<g id="machine">${body}</g>` });
const plate = k.plateHtml({ fig: 'Fig A', title: '24 mm / Linear press', hint: 'スライダー・左右キーで操作', readout: '移動 0.0 mm', keys: [{ mark: 'lit', label: '押し型と試験片' }, { mark: 'raised', label: '固定フレーム' }], caption: '架空の装置。押し型の移動量と表示値は、同じ時刻モデルから計算します。', body: figure });
const [dx, dy] = k.axisVector(P, [0, 0, -1]);
const depthDelta = k.depthOf([0, 0, -1], P);
const data = parts.map(({ name, moving, key }) => ({ name, moving, key }));
const script = `
const PERIOD=${PERIOD}, STROKE=${STROKE};
const pressAt=${pressAt.toString()};
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const query=new URLSearchParams(location.search);
const fixed=query.has('t');
const slider=document.querySelector('#stroke');
const toggle=document.querySelector('#play');
const readout=document.querySelector('[data-readout]');
const machine=document.querySelector('#machine');
const parts=${JSON.stringify(data)}.map(p=>({...p,el:document.getElementById(p.name)}));
let time=fixed?Number(query.get('t')):0, playing=!fixed&&!reduced.matches, visible=true, stamp=null;
function render(seconds){
  time=seconds;
  const {travel,gap,progress}=pressAt(seconds);
  const order=parts.map(p=>({...p,key:p.key+(p.moving?travel*${depthDelta}:0)})).sort((a,b)=>a.key-b.key);
  for(const p of order){
    if(p.moving)p.el.setAttribute('transform','translate('+travel*${dx}+' '+travel*${dy}+')');
    machine.appendChild(p.el);
  }
  readout.textContent='移動 '+travel.toFixed(1)+' mm · 隙間 '+gap.toFixed(1)+' mm';
  slider.value=String(progress*100);
  slider.setAttribute('aria-valuetext',travel.toFixed(1)+' mm');
}
function syncPlay(){toggle.textContent=playing?'停止':'再生';toggle.setAttribute('aria-pressed',String(playing));}
function pause(){playing=false;stamp=null;syncPlay();}
slider.addEventListener('input',()=>{pause();render(Math.acos(1-Number(slider.value)/50)*PERIOD/(2*Math.PI));});
toggle.addEventListener('click',()=>{playing=!playing;stamp=null;syncPlay();});
reduced.addEventListener('change',()=>{if(reduced.matches)pause();});
new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;stamp=null;}).observe(document.querySelector('.iso-plate'));
document.addEventListener('visibilitychange',()=>{stamp=null;});
function tick(now){
  if(playing&&visible&&!document.hidden){if(stamp!==null)render(time+Math.min((now-stamp)/1000,.1));stamp=now;}else stamp=null;
  requestAnimationFrame(tick);
}
window.__scene={id:'anatomy',fps:30,durationFrames:240,feature:'Anatomy iso-kit SVG / '+parts.length+' solid parts / deterministic linear press',ready:document.fonts.ready,seek(frame){pause();render(frame/30);}};
render(time);syncPlay();requestAnimationFrame(tick);
`;
const controls = '<div class="controls"><label for="stroke">移動量</label><input id="stroke" type="range" min="0" max="100" step="0.1" value="0" aria-label="押し型の移動量"><button id="play" type="button" aria-pressed="true">停止</button></div>';
const content = `<header><p class="eyebrow">ANATOMY / SVG STUDY</p><h1>動きを、部品から説明する。</h1></header>${plate}${controls}`;
const license = await readFile(new URL('../../.qa/anatomy/LICENSE', import.meta.url), 'utf8');
const customCss = `<style>.iso-page{width:min(840px,100% - 32px);margin:18px auto}header{margin:0 0 12px}h1{font-size:28px;line-height:1.3;color:var(--anatomy-strong);margin:2px 0}.eyebrow{font:11px var(--anatomy-mono);letter-spacing:.15em;margin:0 0 8px}.iso-figure{margin:0}.iso-plate{border-radius:12px;padding:32px 24px}.iso-legend{font-size:11px;gap:8px}.controls{display:flex;align-items:center;gap:14px;margin:12px 0;font-size:12px}.controls input{flex:1;min-width:0;accent-color:#679763}.controls button{font:inherit;padding:6px 18px;background:var(--anatomy-card);color:var(--anatomy-strong);border:1px solid var(--anatomy-lo);border-radius:6px}.iso-solid[data-lit]{--anatomy-lit-top:#d4e3b4;--anatomy-lit-shade:#9fae88}.iso[data-theme="dark"] .iso-solid[data-lit]{--anatomy-lit-top:#47623f;--anatomy-lit-shade:#2d4128}@media(max-width:480px){h1{font-size:23px}.iso-plate{padding:32px 12px 60px}.iso-plate-corner{font-size:8px}.iso-legend{font-size:10px}}</style>`;
for (const theme of ['light', 'dark']) {
  let html = k.pageHtml({ title: 'Anatomy作例：小さなプレスの往復', theme, body: content, script, width: 880 });
  html = html.replace('lang="en"', 'lang="ja"').replace('</head>', customCss + '</head>');
  html = html.replace('<!doctype html>', '<!doctype html>\n<!-- Anatomy iso-kit, e6600ff; ' + license + ' -->');
  const name = theme === 'light' ? 'index.html' : 'dark.html';
  await writeFile(new URL(name, import.meta.url), html);
}
console.log(`Built Anatomy SVG example: ${parts.length} solid parts, two themes.`);
