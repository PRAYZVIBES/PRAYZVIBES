/* One approved artwork per chosen thought. Native details and anchors work without JS.
   No network integrations, media playback, tracking or persistence are added. */
(() => {
  const art = document.querySelector('.pv-thoughts__art');
  const image = art?.querySelector('img');
  const link = art?.querySelector('a');
  const caption = art?.querySelector('.pv-thoughts__caption');
  const thoughts = [...document.querySelectorAll('.pv-thought[data-thought-image]')];
  if (!art || !image || !link || !caption || !thoughts.length) return;
  const language = document.documentElement.lang;
  const labels = { de: 'Bildstudie & Gedanken', en: 'Artwork & thoughts', fr: 'Étude & réflexions' };
  let requested = 0;
  function showWork(thought) {
    if (!thought.open) return;
    const src = thought.dataset.thoughtImage;
    const title = thought.querySelector('summary strong')?.textContent.trim();
    if (!src || !title) return;
    const token = ++requested;
    const next = new Image();
    next.onload = () => {
      if (token !== requested || !thought.open) return;
      image.src = src;
      image.alt = `${title} · Living Charge`;
      link.href = '#' + thought.id;
      link.dataset.openThought = thought.id;
      caption.replaceChildren(document.createTextNode(`${title} · ${labels[language] || labels.en} `));
      const arrow = document.createElement('span');
      arrow.setAttribute('aria-hidden','true'); arrow.textContent='↗'; caption.append(arrow);
    };
    next.onerror = () => { /* Keep the current complete artwork and its valid link. */ };
    next.src = src;
  }
  thoughts.forEach(thought=>{
    thought.addEventListener('toggle',()=>{ if(thought.open) showWork(thought); });
  });
  const initial = thoughts.find(thought=>thought.open);
  if (initial) showWork(initial);
})();
