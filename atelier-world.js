/* PRAYZVIBES open atelier v23.
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
