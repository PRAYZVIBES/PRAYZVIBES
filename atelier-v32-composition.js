/* Move existing nodes, never duplicate approved text, images or IDs. */
(() => {
  const story=document.querySelector('#about'),copy=story?.querySelector('.pv-story__copy'),photo=story?.querySelector('.pv-story__portrait');
  const small=matchMedia('(max-width:900px)');
  const compose=()=>{
    if(copy&&photo){
      if(small.matches)copy.querySelector('h2').after(photo);
      else copy.after(photo);
    }
    const event=document.querySelector('.pv-event-feature'),media=event?.querySelector('.pv-event-feature__media'),words=event?.querySelector('.pv-event-feature__copy');
    if(media&&words){if(small.matches)words.after(media);else media.after(words);}
    window.dispatchEvent(new Event('pv:composition'));
  };
  small.addEventListener('change',compose);compose();
  addEventListener('load',()=>document.fonts.ready.then(()=>requestAnimationFrame(()=>requestAnimationFrame(()=>{
    const id=decodeURIComponent(location.hash.slice(1));
    const target=id&&document.getElementById(id);
    if(target){const header=document.querySelector('.site-header').getBoundingClientRect().height,rail=document.querySelector('.pv-room-rail').getBoundingClientRect().height;scrollTo({top:Math.max(0,target.getBoundingClientRect().top+scrollY-header-rail-32),behavior:'instant'});}
  }))));
  const rail=document.querySelector('[data-room-rail]');
  if(rail){
    const sentinel=document.createElement('span');sentinel.setAttribute('aria-hidden','true');sentinel.style.cssText='display:block;height:0;pointer-events:none;';rail.before(sentinel);
    let pending=false;
    const update=()=>{pending=false;const header=document.querySelector('.site-header').getBoundingClientRect().height;const compact=sentinel.getBoundingClientRect().top<header-2;if(rail.classList.contains('is-compact')!==compact){rail.classList.toggle('is-compact',compact);window.dispatchEvent(new Event('pv:composition'));}};
    addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(update);}},{passive:true});addEventListener('resize',update);update();
  }
})();
