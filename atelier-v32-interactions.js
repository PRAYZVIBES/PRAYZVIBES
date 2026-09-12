/* Unpublished v32. Additive encounters: original photographs and the existing
   native calendar destination remain intact. No network service or analytics
   is introduced by this file. */
(() => {
  'use strict';
  if (!document.body.classList.contains('pv-v32')) return;
  const lang = document.documentElement.lang.slice(0, 2);
  const copy = ({
    de: {
      inspect: 'Foto näher ansehen', close: 'Foto schließen', original: 'Originalfoto',
      reset: 'Kalenderblatt wieder anheften', ready: 'Kalenderblatt wieder angeheftet.',
      released: 'Kalenderblatt gelöst. Die Kalenderdatei wurde angefordert.',
      photoError: 'Das Foto konnte nicht geladen werden.'
    },
    fr: {
      inspect: 'Regarder la photo de plus près', close: 'Fermer la photo', original: 'Photo originale',
      reset: 'Rattacher la feuille du calendrier', ready: 'La feuille du calendrier est rattachée.',
      released: 'Feuille détachée. Le fichier calendrier a été demandé.',
      photoError: 'La photo n’a pas pu être chargée.'
    },
    en: {
      inspect: 'Look closer at the photograph', close: 'Close photograph', original: 'Original photograph',
      reset: 'Pin the calendar leaf back', ready: 'The calendar leaf is pinned back.',
      released: 'Calendar leaf released. The calendar file was requested.',
      photoError: 'The photograph could not be loaded.'
    }
  })[lang] || {
    inspect: 'Look closer at the photograph', close: 'Close photograph', original: 'Original photograph',
    reset: 'Pin the calendar leaf back', ready: 'The calendar leaf is pinned back.',
    released: 'Calendar leaf released. The calendar file was requested.',
    photoError: 'The photograph could not be loaded.'
  };

  function initPhotographs() {
    const containers = [...document.querySelectorAll('.aw-portrait,.aw-landscape,.pv-release__field,.pv-story__portrait')];
    if (!containers.length || !('HTMLDialogElement' in window)) return;
    const dialog = document.createElement('dialog');
    dialog.className = 'pv-photo-dialog';
    dialog.setAttribute('aria-labelledby', 'pv-photo-caption');
    const header = document.createElement('div');
    header.className = 'pv-photo-dialog__header';
    const note = document.createElement('span');
    note.textContent = copy.original;
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'pv-photo-dialog__close';
    close.textContent = `${copy.close} ×`;
    close.autofocus = true;
    header.append(note, close);
    const image = document.createElement('img');
    image.className = 'pv-photo-dialog__image';
    image.decoding = 'async';
    const caption = document.createElement('p');
    caption.id = 'pv-photo-caption';
    const status = document.createElement('p');
    status.className = 'pv-photo-dialog__status';
    status.setAttribute('role', 'status');
    dialog.append(header, image, caption, status);
    document.body.append(dialog);
    let trigger = null;
    let backdropStart = false;
    const requestClose = () => dialog.close();
    close.addEventListener('click', requestClose);
    // Native modal semantics provide inert background and keyboard containment.
    // Explicitly wrap Tab as well: with one focusable control some browsers
    // transfer focus to browser chrome/body at the end of their native cycle.
    dialog.addEventListener('keydown', (event) => {
      if (event.key !== 'Tab') return;
      const controls = [...dialog.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')]
        .filter((element) => !element.closest('[hidden]') && element.getClientRects().length > 0);
      const first = controls[0] || close;
      const last = controls[controls.length - 1] || close;
      const active = document.activeElement;
      if (controls.length <= 1 || (event.shiftKey && active === first) || (!event.shiftKey && active === last) || !dialog.contains(active)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus({ preventScroll: true });
      }
    });
    dialog.addEventListener('cancel', (event) => { event.preventDefault(); requestClose(); });
    dialog.addEventListener('pointerdown', (event) => { backdropStart = event.target === dialog; });
    dialog.addEventListener('click', (event) => {
      if (event.target !== dialog || !backdropStart) return;
      const r = dialog.getBoundingClientRect();
      if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) requestClose();
    });
    dialog.addEventListener('close', () => {
      document.documentElement.classList.remove('pv-photo-open');
      trigger?.focus({ preventScroll: true });
    });
    image.addEventListener('error', () => { status.textContent = copy.photoError; });
    image.addEventListener('load', () => { status.textContent = ''; });

    containers.forEach((container) => {
      const original = container.querySelector('img');
      if (!original || container.querySelector('[data-pv-inspect]')) return;
      const captionText = container.querySelector('figcaption')?.textContent.trim() || original.alt;
      if (!captionText) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'pv-photo-inspect';
      button.dataset.pvInspect = '';
      button.setAttribute('aria-haspopup', 'dialog');
      button.setAttribute('aria-label', `${copy.inspect}: ${captionText}`);
      button.textContent = `${copy.inspect} ↗`;
      container.classList.add('pv-inspectable-photo');
      container.append(button);
      button.addEventListener('click', () => {
        trigger = button;
        status.textContent = '';
        const sources = (original.getAttribute('srcset') || '').split(',').map((entry) => {
          const [src, descriptor] = entry.trim().split(/\s+/);
          return { src, width: descriptor?.endsWith('w') ? Number.parseInt(descriptor, 10) : 0 };
        }).filter((entry) => entry.src).sort((a, b) => b.width - a.width);
        // Select a supplied original source, never generate or crop a face.
        image.src = sources[0]?.src || original.currentSrc || original.src;
        image.alt = original.alt;
        caption.textContent = captionText;
        document.documentElement.classList.add('pv-photo-open');
        dialog.showModal();
        close.focus({ preventScroll: true });
      });
    });
  }

  function initCalendar() {
    const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const still = () => reduced.matches || document.documentElement.classList.contains('pv-motion-paused');
    document.querySelectorAll('[data-tear-ticket]').forEach((ticket) => {
      if (ticket.dataset.v32Calendar) return;
      ticket.dataset.v32Calendar = 'ready';
      const leaf = ticket.querySelector('.pv-tear-ticket__leaf');
      const stub = ticket.querySelector('.pv-tear-ticket__stub');
      const status = ticket.parentElement.querySelector('[data-tear-status]');
      if (!leaf || !stub) return;
      const reset = document.createElement('button');
      reset.type = 'button';
      reset.className = 'pv-calendar-reset';
      reset.textContent = copy.reset;
      reset.hidden = true;
      ticket.after(reset);
      let start = null, distance = 0, suppressClick = false;
      const clearDrag = () => {
        ticket.classList.remove('is-dragging');
        ['--tear-y', '--tear-x', '--tear-turn'].forEach((name) => ticket.style.removeProperty(name));
      };
      const release = () => {
        if (ticket.dataset.v32Calendar === 'released') return;
        ticket.dataset.v32Calendar = 'released';
        clearDrag();
        ticket.classList.add('is-torn');
        reset.hidden = false;
        if (status) status.textContent = copy.released;
        window.dispatchEvent(new Event('pv:composition'));
      };
      reset.addEventListener('click', () => {
        ticket.classList.remove('is-torn');
        ticket.dataset.v32Calendar = 'ready';
        reset.hidden = true;
        clearDrag();
        if (status) status.textContent = copy.ready;
        ticket.focus({ preventScroll: true });
        window.dispatchEvent(new Event('pv:composition'));
      });
      ticket.addEventListener('dragstart', (event) => event.preventDefault());
      ticket.addEventListener('click', (event) => {
        if (suppressClick) { event.preventDefault(); return; }
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button > 0) return;
        // Do not prevent default: click, Enter and tap keep the existing native
        // download URL and browser behaviour, including without JavaScript.
        release();
      });
      ticket.addEventListener('pointerdown', (event) => {
        if (!finePointer.matches || event.pointerType === 'touch' || event.button !== 0 || still() || ticket.dataset.v32Calendar === 'released' || event.target.closest('.pv-tear-ticket__stub')) return;
        start = { y: event.clientY, id: event.pointerId };
        distance = 0;
      });
      ticket.addEventListener('pointermove', (event) => {
        if (!start || start.id !== event.pointerId) return;
        distance = Math.max(0, Math.min(112, event.clientY - start.y));
        if (distance < 6) return;
        ticket.setPointerCapture?.(event.pointerId);
        ticket.classList.add('is-dragging');
        ticket.style.setProperty('--tear-y', `${distance * .32}px`);
        ticket.style.setProperty('--tear-x', `${-distance * .24}deg`);
        ticket.style.setProperty('--tear-turn', `${distance * .035}deg`);
      }, { passive: true });
      ticket.addEventListener('pointerup', (event) => {
        if (!start || start.id !== event.pointerId) return;
        start = null;
        if (ticket.hasPointerCapture?.(event.pointerId)) ticket.releasePointerCapture(event.pointerId);
        clearDrag();
        if (distance > 52) {
          ticket.click();
          suppressClick = true;
          // Suppress only the follow-on pointer click, not later activation.
          setTimeout(() => { suppressClick = false; }, 0);
        }
      });
      ticket.addEventListener('pointercancel', () => { start = null; distance = 0; clearDrag(); });
      ticket.addEventListener('lostpointercapture', () => { start = null; clearDrag(); });
    });
  }

  initPhotographs();
  initCalendar();
})();
