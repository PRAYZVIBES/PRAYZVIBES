(() => {
 'use strict';
 const lang=document.documentElement.lang.slice(0,2);
 const copy={de:{playing:'Läuft',paused:'Weiterhören',ended:'Noch einmal',loading:'Wird geladen'},en:{playing:'Playing',paused:'Resume',ended:'Play again',loading:'Loading'},fr:{playing:'En lecture',paused:'Reprendre',ended:'Réécouter',loading:'Chargement'}}[lang]||{playing:'Playing',paused:'Resume',ended:'Play again',loading:'Loading'};
 // Existing players retain playback, progress, accessibility and error handling.
 // This only makes the current state visible in their existing small label.
 document.querySelectorAll('[data-native-preview],[data-ep-preview]').forEach(box=>{
  const media=box.querySelector('audio,video'),label=box.querySelector('button small');
  if(!media||!label)return;
  const original=label.textContent,track=box.matches('[data-native-preview]')?'Mountain Day':'Transience';
  let waiting=false;
  const update=()=>{
   let state=media.error?'error':media.ended?'ended':waiting&&!media.paused?'loading':!media.paused?'playing':media.currentTime>0?'paused':'idle';
   box.dataset.finesseState=state;
   label.textContent=['idle','error'].includes(state)?original:`${copy[state]} · ${track}`;
  };
  ['playing','pause','ended','error','emptied'].forEach(type=>media.addEventListener(type,()=>{waiting=false;update();}));
  media.addEventListener('waiting',()=>{waiting=true;update();});
  media.addEventListener('seeked',update);
  update();
 });
 // A direct invitation to the songbook should expose the promised content.
 function revealBook(){if(location.hash==='#songbook'){const book=document.querySelector('details#songbook');if(book)book.open=true;}}
 revealBook();window.addEventListener('hashchange',revealBook);
})();
