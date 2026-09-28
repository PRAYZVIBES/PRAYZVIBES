(() => {
 'use strict';
 const root=document.documentElement;
 // One native source at a time, also when EP is started after the hero preview.
 document.addEventListener('play',event=>{
  const current=event.target;if(!(current instanceof HTMLMediaElement)||current.matches('[data-songbook-video]'))return;
  document.querySelectorAll('audio,video:not([data-songbook-video])').forEach(media=>{if(media!==current&&!media.paused)media.pause();});
 },true);
 function updateLocalLight(){
  const media=[...document.querySelectorAll('audio,video')].find(m=>!m.error&&!m.paused&&!m.ended&&!m.muted&&m.volume>0&&m.readyState>=3);
  const section=media?.closest('section');
  if(section)root.dataset.clarityAudio=section.id;else delete root.dataset.clarityAudio;
 }
 ['playing','pause','ended','error','waiting','emptied','volumechange'].forEach(type=>document.addEventListener(type,updateLocalLight,true));
 document.addEventListener('visibilitychange',()=>{if(document.hidden)delete root.dataset.clarityAudio;else updateLocalLight();});
 function textLayout(){const large=parseFloat(getComputedStyle(root).fontSize)>=28;root.classList.toggle('clarity-stack',innerWidth<=360||large);root.classList.toggle('clarity-text-large',large);}
 textLayout();window.addEventListener('resize',textLayout,{passive:true});
 const book=document.querySelector('#songbook'),sheet=document.querySelector('#songbook-sheet'),enlarge=document.querySelector('[data-songbook-enlarge]'),film=document.querySelector('[data-songbook-video]');
 if(book&&sheet&&enlarge){
  enlarge.addEventListener('click',()=>{film?.pause();const img=sheet.querySelector('[data-songbook-full]');if(!img.src)img.src=img.dataset.src;sheet.showModal();sheet.querySelector('[data-songbook-close]').focus();});
  sheet.querySelector('[data-songbook-close]').addEventListener('click',()=>sheet.close());
  sheet.addEventListener('close',()=>enlarge.focus());
  book.addEventListener('toggle',()=>{if(!book.open)film?.pause();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)film?.pause();});
 }
})();
