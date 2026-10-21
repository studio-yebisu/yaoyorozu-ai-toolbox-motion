/* Original Studio Yebisu composition. MIT. No product claims or third-party assets. */
(() => {
  'use strict';
  const canvas = document.getElementById('scene'), ctx = canvas.getContext('2d');
  const overrides = window.renderConfig || {};
  const cues = [1.6, 3.2, 4.8, 6.4];
  window.motionConfig = {width: overrides.width || 960, height: overrides.height || 600, fps: overrides.fps || 30, duration: 8, posterTime: 5.8, seed: 1313,
    audioEvents: cues.map((time, i) => ({time, frequency: [440, 554.37, 659.25, 880][i], duration: 0.14, gain: 0.22}))};
  window.motionReady = document.fonts.ready;
  const clamp = x => Math.max(0, Math.min(1, x));
  const ease = x => { x = clamp(x); return x * x * (3 - 2 * x); };
  // Step response of an underdamped oscillator. Every value is a function of t.
  function spring(t, frequency = 2.8, damping = 0.78) {
    if (t <= 0) return 0;
    const w = 2 * Math.PI * frequency, wd = w * Math.sqrt(1 - damping * damping);
    return 1 - Math.exp(-damping * w * t) * (Math.cos(wd * t) + damping * w / wd * Math.sin(wd * t));
  }
  function track(t, initial, changes) {
    let value = initial, previous = initial;
    for (const [at, target] of changes) { value += (target - previous) * spring(t - at); previous = target; }
    return value;
  }
  window.motionMath = {spring, track};
  function text(value, x, y, size, color = '#172322', align = 'left', weight = 600) {
    ctx.fillStyle = color; ctx.font = weight + ' ' + size + 'px system-ui, sans-serif'; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(value, x, y);
  }
  function panel(x, y, w, h, radius, color) { ctx.beginPath(); ctx.roundRect(x, y, w, h, radius); ctx.fillStyle = color; ctx.fill(); }
  function content(state, w, h, unit, t) {
    const left = -w / 2 + unit * 0.08, top = -h / 2 + unit * 0.075;
    text(['THE BRIEF', 'THE SHAPE', 'THE CLOCK', 'THE REVIEW', 'MOTION REEL'][state], left, top, unit * 0.045);
    if (state === 0) {
      for (let i = 0; i < 3; i++) panel(left, top + unit * (0.07 + i * 0.055), w * (i === 2 ? 0.45 : 0.65), unit * 0.013, 4, i === 0 ? '#3d6960' : '#9eb0a9');
      text('One idea. Clear facts.', left, h / 2 - unit * 0.06, unit * 0.027, '#526c64', 'left', 500);
    } else if (state === 1) {
      const n = ease((t - 1.6) / 0.65);
      panel(-unit * 0.095, -unit * 0.055, unit * 0.19, unit * 0.15, unit * (0.022 + n * 0.025), '#3d6960');
      ctx.fillStyle = '#d5f099'; ctx.beginPath(); ctx.arc(0, unit * 0.018, unit * 0.04, 0, Math.PI * 2); ctx.fill();
      text('Carry one form forward.', left, h / 2 - unit * 0.06, unit * 0.027, '#526c64', 'left', 500);
    } else if (state === 2) {
      const x = -w * 0.3, lineW = w * 0.6, y = unit * 0.035;
      panel(x, y, lineW, unit * 0.012, 4, '#a4b5aa');
      for (let i = 0; i < 4; i++) { ctx.fillStyle = '#3d6960'; ctx.beginPath(); ctx.arc(x + i * lineW / 3, y + unit * 0.006, unit * 0.016, 0, Math.PI * 2); ctx.fill(); }
      const p = ease((t - 3.2) / 1.2);
      panel(x + p * lineW - unit * 0.004, y - unit * 0.044, unit * 0.008, unit * 0.098, 3, '#cf6649');
      text('Picture + sound, one clock.', left, h / 2 - unit * 0.06, unit * 0.027, '#526c64', 'left', 500);
    } else if (state === 3) {
      for (let i = 0; i < 6; i++) {
        const col = i % 3, row = Math.floor(i / 3), sw = w * 0.23, sh = h * 0.22;
        const x = -w * 0.37 + col * w * 0.26, y = -h * 0.18 + row * h * 0.26;
        panel(x, y, sw, sh, unit * 0.012, '#3d6960');
        ctx.fillStyle = '#d5f099'; ctx.beginPath(); ctx.arc(x + sw / 2, y + sh / 2, unit * (0.012 + i * 0.002), 0, Math.PI * 2); ctx.fill();
      }
      text('Render. Inspect. Refine.', left, h / 2 - unit * 0.06, unit * 0.027, '#526c64', 'left', 500);
    } else {
      text('MAKE IT', 0, -unit * 0.035, unit * 0.07, '#172322', 'center', 750);
      text('EDITABLE.', 0, unit * 0.04, unit * 0.07, '#3d6960', 'center', 750);
      text('Code + frames + MP4', 0, h / 2 - unit * 0.07, unit * 0.024, '#526c64', 'center', 500);
    }
  }
  window.seek = seconds => {
    const t = Math.max(0, Math.min(window.motionConfig.duration, Number(seconds) || 0));
    const W = window.__MOTION_RENDER__ ? window.motionConfig.width : innerWidth;
    const H = window.__MOTION_RENDER__ ? window.motionConfig.height : innerHeight;
    canvas.width = W; canvas.height = H;
    const portrait = H > W, u = Math.min(W, H), state = cues.filter(at => t >= at).length;
    ctx.fillStyle = '#172322'; ctx.fillRect(0, 0, W, H);
    text('FROM AN IDEA', W * 0.075, H * 0.15, u * 0.06, '#f3f0e7', 'left', 650);
    text('TO A FILM YOU CAN CHANGE.', W * 0.075, H * (portrait ? 0.2 : 0.21), u * (portrait ? 0.029 : 0.024), '#a5beb5', 'left', 500);
    const cardW = track(t, portrait ? W * 0.85 : W * 0.55, cues.map((at, i) => [at, (portrait ? [0.77, 0.85, 0.86, 0.88] : [0.42, 0.67, 0.65, 0.6])[i] * W]));
    const cardH = track(t, u * 0.42, cues.map((at, i) => [at, [0.4, 0.4, 0.46, 0.47][i] * u]));
    const radius = track(t, u * 0.025, cues.map((at, i) => [at, [0.09, 0.025, 0.025, 0.04][i] * u]));
    const y = H * (portrait ? 0.51 : 0.59);
    panel((W - cardW) / 2, y - cardH / 2 + u * 0.02, cardW, cardH, radius, '#0e1917');
    ctx.save(); ctx.translate(W / 2, y); panel(-cardW / 2, -cardH / 2, cardW, cardH, radius, '#f3f0e7');
    ctx.beginPath(); ctx.roundRect(-cardW / 2, -cardH / 2, cardW, cardH, radius); ctx.clip();
    content(state, cardW, cardH, u, t); ctx.restore();
    for (let i = 0; i < 5; i++) panel(W * 0.075 + i * u * 0.045, H * (portrait ? 0.8 : 0.88), u * 0.028, u * 0.009, 3, i <= state ? '#d5f099' : '#496158');
    text('STUDIO YEBISU / ORIGINAL DEMO', W * 0.075, H * (portrait ? 0.87 : 0.94), u * 0.018, '#a5beb5', 'left', 500);
    return {time: t, state};
  };
  window.seek(0);
})();
