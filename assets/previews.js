(() => {
  'use strict';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const clips=[...document.querySelectorAll('video[data-preview]')];
  const visible=new Set();let playing=!reduced.matches;
  const toggle=document.querySelector('#preview-toggle');
  const updateLabel=()=>{if(toggle){toggle.textContent=playing?'作例を停止 Ⅱ':'作例を再生 ▶';toggle.setAttribute('aria-pressed',String(playing));}};
  function load(video){if(!video.getAttribute('src')){video.src=video.dataset.src;video.load();}}
  function synchronize(){
    for(const video of clips){
      if(playing&&visible.has(video)&&!document.hidden&&!document.querySelector('.preview-dialog[open]')){load(video);video.play().catch(()=>{});}
      else video.pause();
    }
  }
  const observer=new IntersectionObserver(entries=>{
    for(const e of entries){if(e.isIntersecting)visible.add(e.target);else visible.delete(e.target);}
    synchronize();
  },{threshold:.15});
  clips.forEach(v=>observer.observe(v));
  if(toggle)toggle.addEventListener('click',()=>{playing=!playing;updateLabel();synchronize();});
  document.addEventListener('visibilitychange',synchronize);
  reduced.addEventListener('change',e=>{if(e.matches){playing=false;updateLabel();synchronize();}});
  updateLabel();
  const dialog=document.createElement('dialog');dialog.className='preview-dialog';
  dialog.setAttribute('aria-labelledby','preview-dialog-title');
  dialog.innerHTML='<div class="preview-dialog-head"><h2 id="preview-dialog-title"></h2><button type="button" class="preview-close" aria-label="作例の拡大表示を閉じる">閉じる ×</button></div><div class="preview-modes" role="group" aria-label="作例の表示方法" hidden><button type="button" data-preview-mode="video" aria-pressed="true" aria-controls="preview-video">動画を見る</button><button type="button" data-preview-mode="live" aria-pressed="false" aria-controls="preview-site">3Dサイトを操作</button><a class="dialog-site" target="_blank" rel="noopener noreferrer">別タブで開く ↗</a></div><video id="preview-video" controls loop playsinline muted></video><div class="preview-site-wrap" hidden><p class="preview-site-status" role="status">3Dサイトを読み込んでいます…</p><iframe id="preview-site" title="操作できる作例" allow="fullscreen"></iframe></div><p class="preview-dialog-description"></p><div class="preview-dialog-links"><a class="dialog-gif">GIFを開く ↗</a><a class="dialog-source" target="_blank" rel="noopener noreferrer">制作コード ↗</a></div>';
  document.body.appendChild(dialog);
  const player=dialog.querySelector('video'),frame=dialog.querySelector('iframe');
  const modes=dialog.querySelector('.preview-modes'),siteWrap=dialog.querySelector('.preview-site-wrap');
  const siteStatus=dialog.querySelector('.preview-site-status');
  let trigger,current,mode='video';
  function unloadSite(){frame.removeAttribute('src');siteStatus.hidden=false;}
  function showMode(next){
    mode=next==='live'&&current?.dataset.interactivePage?'live':'video';
    const live=mode==='live';
    dialog.classList.toggle('is-live',live);player.hidden=live;siteWrap.hidden=!live;
    for(const b of modes.querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.dataset.previewMode===mode));
    if(live){
      player.pause();player.removeAttribute('src');player.load();
      siteStatus.hidden=false;
      const url=new URL(current.dataset.interactivePage,location.href);url.searchParams.set('gallery','1');
      frame.title=current.dataset.title+' — 操作できる3Dサイト';frame.src=url.href;
    }else{
      unloadSite();player.src=current.dataset.openPreview;player.play().catch(()=>{});
    }
  }
  document.addEventListener('click',event=>{
    const clicked=event.target.closest('[data-open-preview],[data-open-interactive]');if(!clicked)return;
    const button=clicked.matches('[data-open-preview]')?clicked:clicked.closest('.specimen').querySelector('[data-open-preview]');
    trigger=clicked;current=button;dialog.querySelector('h2').textContent=button.dataset.title;
    dialog.querySelector('.preview-dialog-description').textContent=button.dataset.description;
    dialog.querySelector('.dialog-gif').href=button.dataset.gif;
    dialog.querySelector('.dialog-source').href=button.dataset.source;
    modes.hidden=!button.dataset.interactivePage;
    dialog.querySelector('.dialog-site').href=button.dataset.interactivePage||'#';
    for(const v of clips)v.pause();
    dialog.showModal();showMode(clicked.matches('[data-open-interactive]')?'live':'video');
    dialog.querySelector('.preview-close').focus();
  });
  modes.addEventListener('click',event=>{const b=event.target.closest('[data-preview-mode]');if(b&&b.dataset.previewMode!==mode)showMode(b.dataset.previewMode);});
  window.addEventListener('message',event=>{
    if(!dialog.open||mode!=='live'||event.origin!==location.origin||event.source!==frame.contentWindow)return;
    if(event.data?.type==='motion-example:ready')siteStatus.hidden=true;
    if(event.data?.type==='motion-example:close')dialog.close();
  });
  dialog.querySelector('.preview-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog){const b=dialog.getBoundingClientRect();if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom)dialog.close();}});
  dialog.addEventListener('close',()=>{player.pause();player.removeAttribute('src');player.load();unloadSite();current=null;trigger?.focus();synchronize();});
})();
