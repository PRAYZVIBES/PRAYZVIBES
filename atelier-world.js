/* PRAYZVIBES Living Current v25.
   Native details remain complete without JavaScript. This layer only keeps the
   large artwork in sync and controls the user-initiated local EP excerpt. */
(() => {
  document.documentElement.classList.add('pv-world-js');

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
        image.alt = alt;
        link.href = href;
        const linkLabel = item.dataset[key('LinkLabel')];
        if (linkLabel) link.setAttribute('aria-label', linkLabel);
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

    const hero = document.querySelector('.aw-hero-art');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!hero || reducedMotion || !finePointer) return;

    let frame = 0;
    hero.addEventListener('pointermove', (event) => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = hero.getBoundingClientRect();
        const x = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1));
        const y = Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1));
        hero.style.setProperty('--pv-photo-x', `${(-x * 4).toFixed(2)}px`);
        hero.style.setProperty('--pv-photo-y', `${(-y * 3).toFixed(2)}px`);
        hero.style.setProperty('--pv-wall-x', `${(x * 6).toFixed(2)}px`);
        hero.style.setProperty('--pv-wall-y', `${(y * 4).toFixed(2)}px`);
        frame = 0;
      });
    });
    hero.addEventListener('pointerleave', () => {
      hero.style.setProperty('--pv-photo-x', '0px');
      hero.style.setProperty('--pv-photo-y', '0px');
      hero.style.setProperty('--pv-wall-x', '0px');
      hero.style.setProperty('--pv-wall-y', '0px');
    });
  }

  initLivingCanvas();

  function localeCopy() {
    const lang = document.documentElement.lang?.slice(0, 2);
    if (lang === 'de') return {
      next: (title) => `Nächster Song: ${title}`,
      complete: 'Transience als Ganzes hören',
      shareThought: 'Gedanken teilen',
      thoughtCopied: 'Link und Gedanke kopiert.'
    };
    if (lang === 'fr') return {
      next: (title) => `Chanson suivante : ${title}`,
      complete: 'Écouter Transience en entier',
      shareThought: 'Partager la réflexion',
      thoughtCopied: 'Lien et réflexion copiés.'
    };
    return {
      next: (title) => `Next song: ${title}`,
      complete: 'Hear Transience as a whole',
      shareThought: 'Share this thought',
      thoughtCopied: 'Thought and link copied.'
    };
  }

  function initRoomRail() {
    const rail = document.querySelector('[data-room-rail]');
    if (!rail) return;
    const roots = [
      ['outside', document.querySelector('#journey')],
      ['atelier', document.querySelector('#about')],
      ['stage', document.querySelector('#live-preview')]
    ].filter(([, node]) => node);
    const links = [...rail.querySelectorAll('[data-room-link]')];
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
        const summary = next.querySelector('summary');
        summary?.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'center' });
        window.setTimeout(() => summary?.focus({ preventScroll: true }), reducedMotion.matches ? 0 : 350);
      });
      body.append(button);
    });
  }

  async function shareOrCopy({ title, text, url, copied, status }) {
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
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
        document.body.append(field);
        field.select();
        document.execCommand('copy');
        field.remove();
      }
      if (status) status.textContent = copied;
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
        status: button.closest('.pv-event-feature__copy')?.querySelector('[data-berlin-share-status]')
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
        const url = new URL(window.location.href);
        url.search = '';
        url.hash = thought.id;
        shareOrCopy({
          title: `${title} · Living Charge · PRAYZVIBES`,
          text: quote,
          url: url.href,
          copied: copy.thoughtCopied,
          status
        });
      });
    });
  }

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
      document.documentElement.classList.add('is-audio-flowing');
      setButtonState('pause');
    });
    media.addEventListener('pause', () => {
      document.documentElement.classList.remove('is-audio-flowing');
      if (!complete) setButtonState('play');
    });
    media.addEventListener('loadedmetadata', updateProgress);
    media.addEventListener('timeupdate', updateProgress);
    media.addEventListener('ended', () => {
      complete = true;
      document.documentElement.classList.remove('is-audio-flowing');
      status.textContent = root.dataset.completeLabel || '';
      setButtonState('replay');
      updateProgress();
    });
    media.addEventListener('error', () => {
      loading = false;
      document.documentElement.classList.remove('is-audio-flowing');
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
