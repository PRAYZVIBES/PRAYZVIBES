/* PRAYZVIBES Living Workbench v27.
   Native details remain complete without JavaScript. This layer only keeps the
   large artwork in sync and controls the user-initiated local EP excerpt. */
(() => {
  document.documentElement.classList.add('pv-world-js');
  const recordInteraction = (name, parameters = {}) => document.dispatchEvent(new CustomEvent('pv:interaction', { detail: { name, parameters } }));

  function initArtworkExplorer({
    rootSelector,
    artSelector,
    itemSelector,
    imageSelector,
    captionSelector,
    linkSelector,
    dataPrefix,
    activeKey,
    localLink = false
  }) {
    const root = document.querySelector(rootSelector);
    const art = root?.querySelector(artSelector);
    const image = art?.querySelector(imageSelector);
    const caption = art?.querySelector(captionSelector);
    const link = art?.querySelector(linkSelector);
    const items = root ? [...root.querySelectorAll(itemSelector)] : [];
    if (!root || !art || !image || !caption || !link || !items.length) return false;

    let requestToken = 0;
    const key = (suffix) => `${dataPrefix}${suffix}`;

    function finishChange() {
      art.classList.remove('is-changing');
      art.removeAttribute('aria-busy');
    }

    function showItem(item) {
      if (!item.open) return;
      const src = item.dataset[key('Image')];
      const title = item.querySelector('summary strong')?.textContent.trim();
      const alt = item.dataset[key('Alt')] || item.dataset[key('Caption')] || title;
      const nextCaption = item.dataset[key('Caption')] || title;
      const href = localLink ? `#${item.id}` : item.dataset[key('Href')];
      if (!src || !title || !nextCaption || !href) return;

      const token = ++requestToken;
      root.dataset[activeKey] = item.id;
      art.classList.add('is-changing');
      art.setAttribute('aria-busy', 'true');
      const next = new Image();
      next.decoding = 'async';
      next.onload = () => {
        if (token !== requestToken) return;
        if (!item.open) {
          finishChange();
          return;
        }
        image.src = src;
        image.alt = localLink ? '' : alt;
        link.href = href;
        const linkLabel = item.dataset[key('LinkLabel')];
        if (linkLabel || localLink) link.setAttribute('aria-label', linkLabel || title);
        if (localLink) link.dataset.openThought = item.id;
        else link.dataset.release = title;
        caption.textContent = nextCaption;
        finishChange();
      };
      next.onerror = () => {
        if (token === requestToken) finishChange();
      };
      next.src = src;
    }

    items.forEach((item) => {
      item.addEventListener('toggle', () => {
        if (!item.open) return;
        if (localLink) recordInteraction('thought_open', { thought_id: item.id });
        items.forEach((other) => {
          if (other !== item && other.open) other.open = false;
        });
        showItem(item);
      });
    });

    root.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      const item = event.target.closest(itemSelector);
      if (!item?.open) return;
      item.open = false;
      item.querySelector('summary')?.focus({ preventScroll: true });
      event.preventDefault();
    });

    const initial = items.find((item) => item.open);
    if (initial) showItem(initial);
    return true;
  }

  const trackExplorerReady = initArtworkExplorer({
    rootSelector: '[data-track-explorer]',
    artSelector: '[data-track-art]',
    itemSelector: '.pv-track[data-track-image]',
    imageSelector: '[data-track-art-image]',
    captionSelector: '[data-track-art-caption]',
    linkSelector: '[data-track-art-link]',
    dataPrefix: 'track',
    activeKey: 'activeTrack'
  });

  const thoughtExplorerReady = initArtworkExplorer({
    rootSelector: '[data-thought-explorer]',
    artSelector: '[data-thought-art]',
    itemSelector: '.pv-thought[data-thought-image]',
    imageSelector: '[data-thought-art-image]',
    captionSelector: '[data-thought-art-caption]',
    linkSelector: '[data-thought-art-link]',
    dataPrefix: 'thought',
    activeKey: 'activeThought',
    localLink: true
  });

  if (trackExplorerReady || thoughtExplorerReady) {
    document.documentElement.classList.add('has-artwork-explorer');
  }

  function initLivingCanvas() {
    const pieces = [...document.querySelectorAll('.aw-hero-art,.pv-thoughts,.pv-room--start')];
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-painted');
          observer.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: .12 });
      pieces.forEach((piece) => observer.observe(piece));
    } else {
      pieces.forEach((piece) => piece.classList.add('is-painted'));
    }

  }

  initLivingCanvas();

  function localeCopy() {
    const lang = document.documentElement.lang?.slice(0, 2);
    if (lang === 'de') return {
      next: (title) => `Nächster Song: ${title}`,
      complete: 'Transience als Ganzes hören',
      shareThought: 'Gedanken teilen',
      thoughtCopied: 'Link und Gedanke kopiert.',
      pauseMotion: 'Bewegung pausieren', resumeMotion: 'Bewegung aktivieren',
      stillMotion: 'Bewegung reduziert', fullEp: 'Die ganze EP hören'
    };
    if (lang === 'fr') return {
      next: (title) => `Chanson suivante : ${title}`,
      complete: 'Écouter Transience en entier',
      shareThought: 'Partager la réflexion',
      thoughtCopied: 'Lien et réflexion copiés.',
      pauseMotion: 'Mettre le mouvement en pause', resumeMotion: 'Activer le mouvement',
      stillMotion: 'Mouvement réduit', fullEp: 'Écouter tout l’EP'
    };
    return {
      next: (title) => `Next song: ${title}`,
      complete: 'Hear Transience as a whole',
      shareThought: 'Share this thought',
      thoughtCopied: 'Thought and link copied.',
      pauseMotion: 'Pause movement', resumeMotion: 'Enable movement',
      stillMotion: 'Reduced movement', fullEp: 'Hear the full EP'
    };
  }

  function initRoomRail() {
    const rail = document.querySelector('[data-room-rail]');
    if (!rail) return;
    const roots = [
      ['outside', document.querySelector('#journey')],
      ['atelier', document.querySelector('#about')],
      ['stage', document.querySelector('#berlin-2026-11-04')]
    ].filter(([, node]) => node);
    const links = [...rail.querySelectorAll('[data-room-link]')];
    links.forEach((link) => link.addEventListener('click', () => recordInteraction('room_navigation', { room_name: link.dataset.roomLink })));
    let scheduled = false;

    function update() {
      scheduled = false;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const progress = Math.max(0, Math.min(100, window.scrollY / max * 100));
      document.documentElement.style.setProperty('--pv-page-progress', `${progress.toFixed(2)}%`);
      const marker = window.scrollY + window.innerHeight * .4;
      let active = roots[0]?.[0];
      roots.forEach(([key, node]) => {
        if (node.offsetTop <= marker) active = key;
      });
      links.forEach((link) => {
        if (link.dataset.roomLink === active) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
      document.documentElement.dataset.currentRoom = active || 'outside';
    }

    function requestUpdate() {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(update);
    }

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    update();
  }

  function initTrackJourney() {
    const tracks = [...document.querySelectorAll('[data-track-explorer] .pv-track')];
    if (!tracks.length) return;
    const copy = localeCopy();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    tracks.forEach((track, index) => {
      const body = track.querySelector('.pv-track__body');
      if (!body || body.querySelector('.pv-track__next')) return;
      const next = tracks[index + 1];
      if (!next) {
        const link = document.createElement('a');
        link.className = 'pv-track__next';
        link.href = 'https://listen.music-hub.com/rAGDlw';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.innerHTML = `${copy.complete} <span aria-hidden="true">↗</span>`;
        body.append(link);
        return;
      }
      const title = next.querySelector('summary strong')?.textContent.trim() || '';
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'pv-track__next';
      button.innerHTML = `${copy.next(title)} <span aria-hidden="true">↓</span>`;
      button.addEventListener('click', () => {
        next.open = true;
        recordInteraction('track_next', { from_track: track.id, to_track: next.id });
        const summary = next.querySelector('summary');
        const still = reducedMotion.matches || document.documentElement.classList.contains('pv-motion-paused');
        summary?.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'center' });
        window.setTimeout(() => summary?.focus({ preventScroll: true }), still ? 0 : 350);
      });
      body.append(button);
    });
  }

  async function shareOrCopy({ title, text, url, copied, status, analytics }) {
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        if (analytics) recordInteraction(analytics.name, { ...analytics.parameters, share_method: 'native' });
        return;
      }
      const payload = `${text}\n${url}`;
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(payload);
      else {
        const field = document.createElement('textarea');
        field.value = payload;
        field.setAttribute('readonly', '');
        field.style.position = 'fixed';
        field.style.opacity = '0';
        const previousFocus = document.activeElement;
        document.body.append(field);
        try {
          field.select();
          if (!document.execCommand('copy')) throw new Error('Copy unavailable');
        } finally {
          field.remove();
          previousFocus?.focus({ preventScroll: true });
        }
      }
      if (status) status.textContent = copied;
      if (analytics) recordInteraction(analytics.name, { ...analytics.parameters, share_method: 'copy' });
    } catch (error) {
      if (error?.name !== 'AbortError' && status) status.textContent = url;
    }
  }

  function initSharing() {
    document.querySelectorAll('[data-share-berlin]').forEach((button) => {
      button.addEventListener('click', () => shareOrCopy({
        title: button.dataset.shareTitle || document.title,
        text: button.dataset.shareText || '',
        url: button.dataset.shareUrl || window.location.href,
        copied: button.dataset.shareCopied || '',
        status: button.closest('section')?.querySelector('[data-berlin-share-status]'),
        analytics: { name: 'event_share', parameters: { event_id: 'berlin-2026-11-04' } }
      }));
    });

    const copy = localeCopy();
    document.querySelectorAll('.pv-thought').forEach((thought) => {
      const actions = thought.querySelector('.pv-thought__actions');
      const quote = thought.querySelector('blockquote p')?.textContent.trim();
      const title = thought.querySelector('summary strong')?.textContent.trim();
      if (!actions || !quote || !title || actions.querySelector('[data-share-thought]')) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.shareThought = '';
      button.innerHTML = `${copy.shareThought} <span aria-hidden="true">↗</span>`;
      const status = document.createElement('span');
      status.className = 'pv-thought__share-status';
      status.setAttribute('aria-live', 'polite');
      actions.append(button, status);
      button.addEventListener('click', () => {
        const url = new URL(document.querySelector('link[rel="canonical"]')?.href || window.location.href);
        url.search = '';
        url.hash = thought.id;
        shareOrCopy({
          title: `${title} · Living Charge · PRAYZVIBES`,
          text: quote,
          url: url.href,
          copied: copy.thoughtCopied,
          status,
          analytics: { name: 'thought_share', parameters: { thought_id: thought.id } }
        });
      });
    });
  }

  function initThoughtLinks() {
    const openThought = (hash, focus = false) => {
      let id;
      try { id = decodeURIComponent(hash.replace(/^#/, '')); } catch { return; }
      const thought = document.getElementById(id);
      if (!thought?.matches('.pv-thought')) return;
      document.querySelectorAll('.pv-thought[open]').forEach((other) => {
        if (other !== thought) other.open = false;
      });
      thought.open = true;
      if (focus) requestAnimationFrame(() => thought.querySelector('summary')?.focus({ preventScroll: true }));
    };
    document.addEventListener('click', (event) => {
      const link = event.target.closest('[data-open-thought]');
      if (!link || event.defaultPrevented || event.button > 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      openThought(link.hash || `#${link.dataset.openThought}`, true);
    });
    window.addEventListener('hashchange', () => openThought(window.location.hash, true));
    window.addEventListener('load', () => {
      openThought(window.location.hash);
      const target = document.getElementById(window.location.hash.slice(1));
      if (target?.matches('.pv-thought')) target.scrollIntoView({ block: 'start', behavior: 'auto' });
    });
    openThought(window.location.hash);
  }

  function initSubpageTrackJourney() {
    const list = document.querySelector('.pv-transience-list');
    if (!list) return;
    const copy = localeCopy();
    const items = [...list.querySelectorAll('li')];
    items.forEach((item, index) => {
      item.tabIndex = -1;
      const next = items[index + 1];
      const link = document.createElement('a');
      link.className = 'pv-track__next';
      link.dataset.trackNext = next?.id || 'complete';
      link.href = next ? `#${next.id}` : 'https://listen.music-hub.com/rAGDlw';
      link.textContent = next ? `${copy.next(next.querySelector('strong').textContent)} ↓` : `${copy.fullEp} ↗`;
      if (!next) { link.target = '_blank'; link.rel = 'noopener noreferrer'; }
      else link.addEventListener('click', () => {
        recordInteraction('track_next', { from_track: item.id, to_track: next.id });
        items.forEach((row) => row.removeAttribute('data-current-track'));
        next.setAttribute('data-current-track', '');
        requestAnimationFrame(() => next.focus({ preventScroll: true }));
      });
      item.append(link);
    });
  }

  function initHeaderMeasure() {
    const header = document.querySelector('.site-header');
    const rail = document.querySelector('[data-room-rail]');
    const update = () => {
      if (header) document.documentElement.style.setProperty('--header-height', `${header.getBoundingClientRect().height}px`);
      document.documentElement.style.setProperty('--room-rail-height', `${rail?.getBoundingClientRect().height || 0}px`);
    };
    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(update);
      if (header) observer.observe(header);
      if (rail) observer.observe(rail);
    }
    window.addEventListener('resize', update);
    document.fonts?.ready.then(update);
    update();
  }

  function initLivingCurrent() {
    const main = document.querySelector('main');
    if (!main) return;
    const copy = localeCopy();
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let paused = false;
    let soundFrame = 0;
    let audioContext;
    const analysers = new Map();
    const flowing = new Set();
    try { paused = localStorage.getItem('pv-motion-paused') === 'true'; } catch {}
    const control = document.createElement('button');
    control.type = 'button';
    control.className = 'pv-motion-control';
    const controls = document.querySelector('[data-atelier-controls]') || document.querySelector('.footer-bottom');
    controls?.append(control);
    const updateMotion = () => {
      const still = paused || motionPreference.matches;
      document.documentElement.classList.toggle('pv-motion-paused', still);
      control.textContent = motionPreference.matches ? copy.stillMotion : paused ? copy.resumeMotion : copy.pauseMotion;
      control.setAttribute('aria-pressed', String(still));
      control.disabled = motionPreference.matches;
      if (still) {
        cancelAnimationFrame(soundFrame); soundFrame = 0;
        document.documentElement.style.setProperty('--charge-energy', '0');
      } else if (flowing.size && !soundFrame) soundFrame = requestAnimationFrame(readSound);
    };
    control.addEventListener('click', () => {
      paused = !paused;
      try { localStorage.setItem('pv-motion-paused', String(paused)); } catch {}
      updateMotion();
    });
    motionPreference.addEventListener('change', updateMotion);
    updateMotion();

    // An energy connection diagram anchored to the actual original marks. It
    // runs under the objects, never over text, and never takes over scrolling.
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.classList.add('pv-current');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    const trail = document.createElementNS(ns, 'path');
    const flow = document.createElementNS(ns, 'path');
    const pulse = document.createElementNS(ns, 'path');
    trail.classList.add('pv-current__trail'); flow.classList.add('pv-current__flow'); pulse.classList.add('pv-current__pulse');
    const layers = ['shadow','glow','jacket','highlight'].map((name) => {
      const path = document.createElementNS(ns, 'path'); path.classList.add(`pv-current__${name}`); return path;
    });
    const paths = [layers[0], layers[1], trail, layers[2], layers[3], flow, pulse];
    paths.forEach((path) => { path.setAttribute('pathLength', '1000'); svg.append(path); });
    main.prepend(svg);
    let totalLength = 0;
    let geometry = [];
    let scheduled = false;
    const layout = () => {
      const width = main.clientWidth;
      const height = main.offsetHeight;
      const left = width < 700 ? 9 : 18;
      const mainRect = main.getBoundingClientRect();
      const point = (el) => {
        // Geometry updates on layout changes, not pointer movements. Hover
        // transforms never trigger a resize/animation feedback loop.
        const r = el.getBoundingClientRect();
        const centreLane = width > 900 && ['music','about','living-charge','berlin-2026-11-04','next-release'].includes(el.parentElement.id);
        return { x: r.left - mainRect.left + r.width/2, y: r.top - mainRect.top + r.height/2, centreLane };
      };
      const heroNodes = [...main.querySelectorAll('.atelier-signal')].map(point);
      const chapterNodes = [...main.querySelectorAll('.atelier-chapter-mark')].map(point);
      let prev = heroNodes[0] || { x: left, y: 45 };
      let d = `M ${prev.x} ${Math.max(20,prev.y - 95)} Q ${prev.x - 30} ${prev.y - 45} ${prev.x} ${prev.y}`;
      heroNodes.slice(1).forEach((p) => {
        const dy = Math.max(30,(p.y-prev.y)*.5);
        d += ` C ${prev.x + 65} ${prev.y+dy}, ${p.x - 65} ${p.y+dy}, ${p.x} ${p.y}`;
        prev = p;
      });
      d += ` C ${prev.x+35} ${prev.y+95}, ${left} ${prev.y+110}, ${left} ${prev.y+145}`;
      let side = left;
      chapterNodes.forEach((p) => {
        const direction = p.x > width/2 ? 1 : -1;
        const nextSide = p.centreLane ? p.x : direction === 1 ? width-left : left;
        d += ` L ${side} ${p.y-58} C ${side} ${p.y-5}, ${p.x-direction*120} ${p.y-35}, ${p.x} ${p.y} C ${p.x+direction*35} ${p.y+30}, ${nextSide} ${p.y+25}, ${nextSide} ${p.y+82}`;
        side = nextSide;
      });
      d += ` L ${side} ${Math.max(45,height - 20)}`;
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      svg.style.height = `${height}px`;
      paths.forEach((path) => path.setAttribute('d', d));
      totalLength = flow.getTotalLength();
      geometry = Array.from({ length: 301 }, (_, i) => ({ point: flow.getPointAtLength(totalLength * i / 300), ratio: i / 300 }));
      update();
    };
    const update = () => {
      scheduled = false;
      const y = window.innerHeight * .66 - main.getBoundingClientRect().top;
      const closest = geometry.reduce((best, sample) => Math.abs(sample.point.y - y) < Math.abs(best.point.y - y) ? sample : best, geometry[0] || { point: { y: 0 }, ratio: 0 });
      const amount = closest.ratio * 1000;
      flow.style.strokeDasharray = `${amount} 1000`;
    };
    window.addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(update); } }, { passive: true });
    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(() => requestAnimationFrame(layout));
      observer.observe(main);
      main.querySelectorAll('.atelier-signals').forEach((el) => observer.observe(el));
    }
    else window.addEventListener('resize', layout);
    document.fonts?.ready.then(layout);
    layout();
    const media = [...document.querySelectorAll('video,audio')];
    const audible = (item) => !item.paused && !item.ended && !item.error && !item.muted && item.volume > 0;
    function readSound() {
      soundFrame = 0;
      if (document.hidden || document.documentElement.classList.contains('pv-motion-paused')) return;
      let intensity = 0;
      for (const [item,{analyser,data}] of analysers) {
        if (!flowing.has(item) || !audible(item)) continue;
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (const sample of data) sum += ((sample-128)/128)**2;
        intensity = Math.max(intensity, Math.min(1, Math.sqrt(sum/data.length)*1.7));
      }
      document.documentElement.style.setProperty('--charge-energy', intensity.toFixed(3));
      if ([...flowing].some(audible)) soundFrame = requestAnimationFrame(readSound);
    }
    const updateSound = () => {
      const playing = [...flowing].some(audible);
      document.documentElement.classList.toggle('is-audio-flowing', playing);
      if (playing && !soundFrame) soundFrame = requestAnimationFrame(readSound);
      if (!playing) {
        cancelAnimationFrame(soundFrame); soundFrame = 0;
        document.documentElement.style.setProperty('--charge-energy','0');
      }
    };
    // Only same-origin media, only after the visitor's own playback gesture.
    // A suspended or unsupported audio graph is never connected to the sound.
    const connectAudio = async (item) => {
      if (!item) return;
      const source = item.currentSrc || item.querySelector('source')?.dataset.src || item.querySelector('source')?.src;
      if (!source || new URL(source,location.href).origin !== location.origin) return;
      try {
        const Context = window.AudioContext || window.webkitAudioContext;
        if (!Context) return;
        audioContext ||= new Context();
        if (audioContext.state !== 'running') await audioContext.resume();
        if (audioContext.state !== 'running' || analysers.has(item)) return;
        const node = audioContext.createMediaElementSource(item);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 512; analyser.smoothingTimeConstant = .8;
        node.connect(analyser); analyser.connect(audioContext.destination);
        analysers.set(item,{analyser,data:new Uint8Array(analyser.fftSize)});
        document.documentElement.dataset.chargeAudio = 'waveform';
      } catch { /* Native playback and honest playing-state animation remain. */ }
    };
    document.addEventListener('click', (event) => {
      const target = event.target.closest('[data-preview-toggle],[data-ep-preview-toggle],[data-native-film-play],[data-native-film-replay],video,audio');
      if (!target) return;
      const item = target.matches('video,audio') ? target : target.closest('[data-native-preview],[data-ep-preview],[data-native-film]')?.querySelector('video,audio');
      void connectAudio(item);
    },true);
    media.forEach((item) => {
      item.addEventListener('playing', () => { flowing.add(item); updateSound(); });
      ['pause', 'ended', 'error', 'waiting', 'emptied'].forEach((name) => item.addEventListener(name, () => { flowing.delete(item); updateSound(); }));
      item.addEventListener('volumechange', updateSound);
    });
    document.addEventListener('visibilitychange', updateSound);
  }

  function initTactileObjects() {
    const origin = document.querySelector('.atelier-signal--0');
    const work = document.querySelector('.aw-hero-art');
    if (origin && work) { origin.classList.add('atelier-signal--origin'); work.prepend(origin); }
    const intro = document.querySelector('.aw-intro');
    const preview = intro?.querySelector('.pv-quick-preview');
    const heading = document.querySelector('.aw-wordmark');
    if (preview && intro && heading && work) {
      const query = window.matchMedia('(max-width: 900px)');
      const positionPreview = () => {
        if (query.matches) {
          heading.after(preview); preview.after(work); work.after(intro);
          preview.classList.add('aw-preview-mobile');
        } else {
          heading.after(intro); intro.after(work);
          intro.insertBefore(preview,intro.querySelector('.pv-actions'));
          preview.classList.remove('aw-preview-mobile');
        }
      };
      query.addEventListener('change',positionPreview); positionPreview();
    }
    document.querySelectorAll('[data-charge-node] > img,[data-thought-art-image]').forEach((img) => {
      const wrapper = document.createElement('span');
      wrapper.className = 'atelier-stencil';
      const refresh = () => wrapper.style.setProperty('--stencil-image', `url("${img.src}")`);
      img.before(wrapper); wrapper.append(img); refresh();
      new MutationObserver(refresh).observe(img,{attributes:true,attributeFilter:['src']});
    });
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    document.querySelectorAll('[data-energy-object]').forEach((object) => {
      const glow = (on) => document.documentElement.style.setProperty('--charge-hover',on ? '1' : '0');
      const reset = () => { object.style.removeProperty('--tilt-x'); object.style.removeProperty('--tilt-y'); glow(false); };
      object.addEventListener('pointerenter', () => glow(true));
      object.addEventListener('pointerleave', reset);
      object.addEventListener('focusin', () => glow(true));
      object.addEventListener('focusout', reset);
      object.addEventListener('pointermove', (event) => {
        if (!finePointer.matches || document.documentElement.classList.contains('pv-motion-paused')) return;
        const r = object.getBoundingClientRect();
        object.style.setProperty('--tilt-x', `${(0.5-(event.clientY-r.top)/r.height)*7}deg`);
        object.style.setProperty('--tilt-y', `${((event.clientX-r.left)/r.width-0.5)*7}deg`);
      },{passive:true});
    });
  }

  function initTearTickets() {
    document.querySelectorAll('[data-tear-ticket]').forEach((ticket) => {
      let start = null, distance = 0, busy = false, suppressClick = false;
      let resetTimer;
      const still = () => document.documentElement.classList.contains('pv-motion-paused');
      const status = ticket.parentElement.querySelector('[data-tear-status]');
      const clearDrag = () => {
        ticket.classList.remove('is-dragging');
        ticket.style.removeProperty('--tear-y'); ticket.style.removeProperty('--tear-x'); ticket.style.removeProperty('--tear-turn');
      };
      const take = () => {
        if (busy) return;
        busy = true; clearTimeout(resetTimer); clearDrag();
        ticket.classList.add('is-torn');
        // Save in the same user gesture; browsers may block a delayed download.
        const download = document.createElement('a');
        download.href = ticket.href; download.download = ''; download.hidden = true;
        download.dataset.calendarDelivery = 'true';
        document.body.append(download); download.click(); download.remove();
        if (status) status.textContent = status.dataset.copy;
        resetTimer = setTimeout(() => { ticket.classList.remove('is-torn'); busy = false; },still() ? 0 : 1150);
      };
      ticket.addEventListener('dragstart',(event) => event.preventDefault());
      ticket.addEventListener('pointerdown',(event) => {
        if (event.button !== 0 || busy || event.target.closest('.pv-tear-ticket__stub')) return;
        start = event.clientY; distance = 0;
        ticket.setPointerCapture?.(event.pointerId);
      });
      ticket.addEventListener('pointermove',(event) => {
        if (start === null || still()) return;
        distance = Math.max(0,Math.min(115,event.clientY-start));
        if (distance < 5) return;
        ticket.classList.add('is-dragging');
        ticket.style.setProperty('--tear-y',`${distance*.42}px`);
        ticket.style.setProperty('--tear-x',`${-distance*.3}deg`);
        ticket.style.setProperty('--tear-turn',`${distance*.04-1}deg`);
      });
      ticket.addEventListener('pointerup',(event) => {
        if (start === null) return;
        start = null;
        if (distance > 54) { suppressClick = true; take(); setTimeout(() => { suppressClick = false; },0); }
        clearDrag();
        if (ticket.hasPointerCapture?.(event.pointerId)) ticket.releasePointerCapture(event.pointerId);
      });
      ticket.addEventListener('pointercancel',() => { start = null; distance = 0; clearDrag(); });
      ticket.addEventListener('click',(event) => { event.preventDefault(); if (!suppressClick) take(); });
    });
  }

  initHeaderMeasure();
  initThoughtLinks();
  initSubpageTrackJourney();
  initTactileObjects();
  initLivingCurrent();
  initTearTickets();
  initRoomRail();
  initTrackJourney();
  initSharing();

  function initEpPreview() {
    const root = document.querySelector('[data-ep-preview]');
    const button = root?.querySelector('[data-ep-preview-toggle]');
    const icon = root?.querySelector('.pv-ep-preview__icon');
    const media = root?.querySelector('[data-ep-preview-media]');
    const source = root?.querySelector('[data-ep-preview-source]');
    const status = root?.querySelector('[data-ep-preview-status]');
    const progress = root?.querySelector('.pv-ep-preview__progress');
    const progressBar = root?.querySelector('[data-ep-preview-progress]');
    const time = root?.querySelector('[data-ep-preview-time]');
    if (!root || !button || !icon || !media || !source || !status || !progress || !progressBar || !time) return;

    const fallbackDuration = 24;
    let loading = false;
    let complete = false;
    const formatTime = (seconds) => {
      const safe = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0;
      return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, '0')}`;
    };
    const duration = () => Number.isFinite(media.duration) && media.duration > 0 ? media.duration : fallbackDuration;

    function updateProgress() {
      const total = duration();
      const current = Number.isFinite(media.currentTime) ? media.currentTime : 0;
      const percent = Math.max(0, Math.min(100, current / total * 100));
      progressBar.style.width = `${percent}%`;
      progress.setAttribute('aria-valuemax', String(Math.round(total)));
      progress.setAttribute('aria-valuenow', String(Math.round(current)));
      time.textContent = `${formatTime(current)} / ${formatTime(total)}`;
    }

    function setButtonState(state) {
      const labels = {
        play: root.dataset.playLabel,
        pause: root.dataset.pauseLabel,
        replay: root.dataset.replayLabel
      };
      const label = labels[state] || labels.play;
      button.setAttribute('aria-label', label);
      button.setAttribute('aria-pressed', state === 'pause' ? 'true' : 'false');
      icon.textContent = state === 'pause' ? '❚❚' : state === 'replay' ? '↺' : '▶';
    }

    async function togglePreview() {
      if (loading) return;
      if (!source.src) {
        const src = source.dataset.src;
        if (!src) return;
        source.src = src;
        loading = true;
        button.disabled = true;
        status.textContent = root.dataset.loadingLabel || '';
        media.load();
      }
      if (!media.paused) {
        media.pause();
        return;
      }
      if (complete || media.ended) {
        media.currentTime = 0;
        complete = false;
      }
      try {
        await media.play();
      } catch {
        loading = false;
        button.disabled = false;
        status.textContent = root.dataset.errorLabel || '';
        setButtonState('play');
      }
    }

    button.addEventListener('click', togglePreview);
    media.addEventListener('playing', () => {
      loading = false;
      complete = false;
      button.disabled = false;
      status.textContent = '';
      setButtonState('pause');
    });
    media.addEventListener('pause', () => {
      if (!complete) setButtonState('play');
    });
    media.addEventListener('loadedmetadata', updateProgress);
    media.addEventListener('timeupdate', updateProgress);
    media.addEventListener('ended', () => {
      complete = true;
      status.textContent = root.dataset.completeLabel || '';
      setButtonState('replay');
      updateProgress();
    });
    media.addEventListener('error', () => {
      loading = false;
      button.disabled = false;
      status.textContent = root.dataset.errorLabel || '';
      setButtonState('play');
    });
    root.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || media.paused) return;
      media.pause();
      button.focus({ preventScroll: true });
      event.preventDefault();
    });
    updateProgress();
  }

  initEpPreview();
})();
