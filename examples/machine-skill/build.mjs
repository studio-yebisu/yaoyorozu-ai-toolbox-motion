// Build the single-file page from editable source and the pinned Airsup runtime.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = dirname(fileURLToPath(import.meta.url));
// Canonical LF output keeps the single-file artifact and its hash identical after Git checkout.
const read = name => readFileSync(join(dir, name), 'utf8').replace(/\r\n/g, '\n');
const safe = source => source.replace(/<\/script/gi, '<\\/script');
const solver = read('solver.mjs').replace(/^export /gm, '');
const html = `<!doctype html>
<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Air compressor — Machine Skill 作例 / Studio Yebisu</title>
<meta name="description" content="回転数、断面、分解、吸気弁の故障を操作できる単気筒エアコンプレッサー。Machine Skillで制作した3D作例。">
<meta name="author" content="Studio Yebisu">
<link rel="icon" href="../../assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/"}}</script>
</head><body>
<a class="study-home" href="../../projects.html#machine-skill">STUDIO YEBISU <span> / MACHINE STUDY 01</span><span class="home-arrow">一覧へ ↗</span></a>
<h1 id="machine-title" class="initial-title">Air compressor</h1>
<div class="loading" role="status">3Dモデルを読み込んでいます…</div>
<!-- Airsup lab-kit.js, MIT, pinned at 35074a98b14c5f414e446cbb53bd8b1798ff70cc. See vendor/LICENSE.txt. -->
<!-- lab-kit:start --><script type="module">${safe(read('vendor/lab-kit.js'))}</script><!-- lab-kit:end -->
<script type="module">${safe(solver + '\n' + read('machine.js'))}</script>
<style>${read('style.css')}</style>
<noscript>この作例はJavaScriptとWebGL 2を使用します。<a href="../../assets/previews/machine-skill.mp4">動画を見る</a></noscript>
<script>setTimeout(function(){if(!window.__machineReady){var el=document.querySelector('.loading');el.innerHTML='3Dモデルを読み込めませんでした。<a href="../../assets/previews/machine-skill.mp4">動画を見る ↗</a>';el.classList.add('failed')}},18000)</script>
</body></html>\n`;
writeFileSync(join(dir, 'index.html'), html);
console.log(`Built Machine Skill page: ${Buffer.byteLength(html)} bytes`);
