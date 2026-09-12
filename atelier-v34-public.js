/* Approved V34 composition: public default, without preview controls. */
(() => {
 const install=()=>{
  const html=document.documentElement,hero=document.querySelector('.aw-hero'),intro=hero?.querySelector('.aw-intro'),art=hero?.querySelector('.aw-hero-art');
  if(!hero||!intro||!art)return;
  html.classList.add('pv-wall-study');
  /* Maintain original media node and same reading order at all breakpoints. */
  const arrange=()=>{
   const preview=hero.querySelector('[data-native-preview]'),bio=hero.querySelector('.aw-bio');
   if(bio&&bio.parentElement!==intro)intro.insertBefore(bio,intro.querySelector('.pv-actions'));
   if(preview&&preview.parentElement!==intro)intro.insertBefore(preview,intro.querySelector('.pv-actions'));
   preview?.classList.remove('aw-preview-mobile');
   const heading=hero.querySelector('h1');heading?.after(intro);intro.after(art);
   window.dispatchEvent(new Event('pv:composition'));
  };
  // The inherited world moves these exact nodes in a media-query change
  // listener (after resize). Run after that listener, not in the resize race.
  arrange();window.matchMedia('(max-width: 900px)').addEventListener('change',arrange);

 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
