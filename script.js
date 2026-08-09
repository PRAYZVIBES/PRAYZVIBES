(() => {
  "use strict";

  const GA_ID = "G-YL0ZXL9Q4D";
  const CONSENT_KEY = "prayzvibes-consent-v1";
  const LANGUAGE_KEY = "prayzvibes-language";
  const supportedLanguages = ["en", "de", "fr"];
  const currentLanguage = (document.documentElement.lang || "en").slice(0, 2).toLowerCase();
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const motionBehavior = () => reducedMotionQuery.matches ? "auto" : "smooth";
  const getStoredLanguage = () => {
    try {
      const stored = localStorage.getItem(LANGUAGE_KEY);
      return supportedLanguages.includes(stored) ? stored : null;
    } catch {
      return null;
    }
  };
  const getBrowserLanguage = () => {
    const requested = Array.isArray(navigator.languages) && navigator.languages.length
      ? navigator.languages
      : [navigator.language || "en"];
    const primary = requested.map((language) => String(language).toLowerCase().split("-")[0])
      .find((language) => supportedLanguages.includes(language));
    return primary || "en";
  };
  const preferredLanguage = getStoredLanguage() || getBrowserLanguage();
  const preferredLink = document.querySelector(`[data-language-choice="${preferredLanguage}"]`);
  const isDefaultEntry = window.location.pathname === "/";
  if (isDefaultEntry && preferredLanguage !== currentLanguage && preferredLink instanceof HTMLAnchorElement) {
    const destination = new URL(preferredLink.href, window.location.href);
    destination.search = window.location.search;
    destination.hash = window.location.hash;
    window.location.replace(destination.href);
    return;
  }
  document.querySelectorAll("[data-language-choice]").forEach((link) => {
    link.addEventListener("click", () => {
      try {
        localStorage.setItem(LANGUAGE_KEY, link.dataset.languageChoice || "en");
      } catch {
        // The links still work when storage is unavailable.
      }
      trackEvent("language_change", {
        from_language: currentLanguage,
        to_language: link.dataset.languageChoice || "en"
      });
    });
  });
  const header = document.querySelector("[data-header]");
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");
  let lastFocused = null;

  const setHeaderState = () => {
    if (header) header.classList.toggle("scrolled", window.scrollY > 24);
  };

  const setMenu = (open) => {
    if (!menuToggle || !mobileMenu) return;
    menuToggle.classList.toggle("active", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    const menuLabels = {
      en: { open: "Open menu", close: "Close menu" },
      de: { open: "Menü öffnen", close: "Menü schließen" },
      fr: { open: "Ouvrir le menu", close: "Fermer le menu" },
    };
    const labels = menuLabels[currentLanguage] || menuLabels.en;
    menuToggle.setAttribute("aria-label", open ? labels.close : labels.open);
    mobileMenu.classList.toggle("active", open);
    mobileMenu.setAttribute("aria-hidden", String(!open));
    document.body.classList.toggle("menu-open", open);
    if (open) {
      lastFocused = document.activeElement;
      mobileMenu.querySelector("a")?.focus();
    } else if (lastFocused instanceof HTMLElement) {
      lastFocused.focus();
    }
  };

  menuToggle?.addEventListener("click", () => setMenu(menuToggle.getAttribute("aria-expanded") !== "true"));
  mobileMenu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
  const desktopNavigationQuery = window.matchMedia("(min-width: 1081px)");
  const closeMenuAtDesktop = (event) => {
    if (event.matches && menuToggle?.getAttribute("aria-expanded") === "true") setMenu(false);
  };
  desktopNavigationQuery.addEventListener?.("change", closeMenuAtDesktop);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuToggle?.getAttribute("aria-expanded") === "true") setMenu(false);
    if (event.key !== "Tab" || menuToggle?.getAttribute("aria-expanded") !== "true" || !mobileMenu) return;
    const items = [menuToggle, ...mobileMenu.querySelectorAll("a")];
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });

  document.querySelectorAll("[data-current-year]").forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });

  document.querySelectorAll(".release-switch").forEach((link) => {
    const releaseTime = Date.parse(link.dataset.releaseDate || "");
    if (!Number.isFinite(releaseTime)) return;
    link.textContent = Date.now() >= releaseTime ? link.dataset.afterLabel : link.dataset.beforeLabel;
  });

  document.querySelectorAll(".release-text").forEach((element) => {
    const releaseTime = Date.parse(element.dataset.releaseDate || "");
    if (!Number.isFinite(releaseTime)) return;
    element.textContent = Date.now() >= releaseTime ? element.dataset.afterText : element.dataset.beforeText;
  });

  const mountainDayRelease = Date.parse("2026-07-31T00:00:00+02:00");
  const transienceRelease = Date.parse("2026-08-07T00:00:00+02:00");
  const campaignPhase = Date.now() >= transienceRelease ? "ep" : Date.now() >= mountainDayRelease ? "single" : "before";
  document.body.dataset.campaignPhase = campaignPhase;

  document.querySelectorAll(".campaign-switch").forEach((link) => {
    const label = link.dataset[`${campaignPhase}Label`];
    const href = link.dataset[`${campaignPhase}Href`];
    if (label) link.textContent = label;
    if (href) link.href = href;
  });

  document.querySelectorAll(".campaign-text").forEach((element) => {
    const text = element.dataset[`${campaignPhase}Text`];
    if (text) element.textContent = text;
  });

  document.querySelectorAll(".campaign-anchor").forEach((link) => {
    const label = link.dataset[`${campaignPhase}Label`];
    const href = link.dataset[`${campaignPhase}Href`];
    const labelNode = link.querySelector("span");
    if (label && labelNode) labelNode.textContent = label;
    if (href) link.href = href;
  });

  if (campaignPhase === "ep") {
    const hero = document.querySelector(".hero");
    const transienceSection = document.querySelector("#music");
    if (hero && transienceSection) hero.insertAdjacentElement("afterend", transienceSection);
  }

  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px" });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  const readConsent = () => {
    try {
      return JSON.parse(localStorage.getItem(CONSENT_KEY)) || null;
    } catch {
      return null;
    }
  };

  const writeConsent = (choices) => {
    const saved = { analytics: Boolean(choices.analytics), media: Boolean(choices.media), updated: new Date().toISOString() };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(saved));
    return saved;
  };

  let analyticsLoaded = false;
  const loadAnalytics = () => {
    if (analyticsLoaded || document.querySelector(`script[src*="${GA_ID}"]`)) return;
    analyticsLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() { window.dataLayer.push(arguments); };
    window.gtag("consent", "default", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied"
    });
    window.gtag("consent", "update", { analytics_storage: "granted" });
    window.gtag("js", new Date());
    window.gtag("config", GA_ID, { anonymize_ip: true, allow_google_signals: false });
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.append(script);
  };

  const trackEvent = (name, parameters = {}) => {
    if (typeof window.gtag !== "function") return;
    window.gtag("event", name, { page_language: currentLanguage, ...parameters });
  };

  const releasePlayer = document.querySelector("[data-release-player]");
  const releasePreviewButton = releasePlayer?.querySelector("[data-release-preview]");
  const releasePlayerClose = releasePlayer?.querySelector("[data-release-player-close]");
  let releasePlayerDismissed = false;
  try {
    releasePlayerDismissed = sessionStorage.getItem("pv-release-player-dismissed") === "true";
  } catch {
    // The release player still works when session storage is unavailable.
  }

  if (releasePlayer && campaignPhase !== "before" && !releasePlayerDismissed) {
    releasePlayer.removeAttribute("hidden");
  }

  releasePlayerClose?.addEventListener("click", () => {
    releasePlayer?.setAttribute("hidden", "");
    try {
      sessionStorage.setItem("pv-release-player-dismissed", "true");
    } catch {
      // Dismissal applies to this view when session storage is unavailable.
    }
  });

  releasePreviewButton?.addEventListener("click", () => {
    const reelSection = document.querySelector("#reels");
    const reelVideo = [...(reelSection?.querySelectorAll("video") || [])]
      .find((video) => video.querySelector('source[src*="mountain-day-reel"]'));
    if (!reelSection || !reelVideo) return;
    trackEvent("preview_play", { release_title: "Mountain Day", campaign_phase: campaignPhase });
    reelSection.scrollIntoView({ behavior: motionBehavior(), block: "center" });
    reelVideo.muted = false;
    reelVideo.currentTime = 0;
    const playback = reelVideo.play();
    if (playback?.catch) playback.catch(() => {});
  });

  const filmCards = [...document.querySelectorAll(".pv-film")];
  const filmRail = document.querySelector(".pv-film-grid");
  const localReels = [...document.querySelectorAll(".reel-card__video")];
  const nativePreview = document.querySelector("[data-native-preview]");
  const nativePreviewToggle = nativePreview?.querySelector("[data-preview-toggle]");
  const nativePreviewMedia = nativePreview?.querySelector("[data-preview-media]");
  const nativePreviewSource = nativePreview?.querySelector("[data-preview-source]");
  const nativePreviewIcon = nativePreview?.querySelector(".pv-quick-preview__icon");
  const nativePreviewStatus = nativePreview?.querySelector("[data-preview-status]");
  let nativePreviewLoading = false;

  if (filmRail && filmCards.length > 1) {
    const railLabels = {
      en: "PRAYZVIBES films. Use the left and right arrow keys to move between films.",
      de: "PRAYZVIBES-Filme. Mit der linken und rechten Pfeiltaste zwischen den Filmen wechseln.",
      fr: "Films PRAYZVIBES. Utilisez les flèches gauche et droite pour passer d’un film à l’autre."
    };
    const mobileFilmRailQuery = window.matchMedia("(max-width: 900px)");
    const updateFilmRailAccess = () => {
      filmRail.setAttribute("role", "region");
      filmRail.setAttribute("aria-label", railLabels[currentLanguage] || railLabels.en);
      if (mobileFilmRailQuery.matches) filmRail.tabIndex = 0;
      else filmRail.removeAttribute("tabindex");
    };
    updateFilmRailAccess();
    mobileFilmRailQuery.addEventListener?.("change", updateFilmRailAccess);
    filmRail.addEventListener("keydown", (event) => {
      if (event.target !== filmRail || !mobileFilmRailQuery.matches || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      const firstCard = filmCards[0];
      const railStyles = window.getComputedStyle(filmRail);
      const gap = Number.parseFloat(railStyles.columnGap || railStyles.gap) || 0;
      const distance = (firstCard?.getBoundingClientRect().width || filmRail.clientWidth * .72) + gap;
      event.preventDefault();
      filmRail.scrollBy({ left: event.key === "ArrowRight" ? distance : -distance, behavior: motionBehavior() });
    });
  }

  const setNativePreviewState = (state) => {
    if (!nativePreview || !nativePreviewToggle) return;
    const isPlaying = state === "playing";
    nativePreview.classList.toggle("is-playing", isPlaying);
    nativePreview.classList.toggle("is-loading", state === "loading");
    nativePreviewToggle.setAttribute("aria-pressed", String(isPlaying));
    nativePreviewToggle.setAttribute("aria-busy", String(state === "loading"));
    nativePreviewToggle.setAttribute("aria-label", isPlaying
      ? nativePreview.dataset.pauseLabel || "Pause preview"
      : nativePreview.dataset.playLabel || "Play preview");
    if (nativePreviewIcon) nativePreviewIcon.textContent = isPlaying ? "\u2016" : "\u25B6";
    if (nativePreviewStatus) {
      nativePreviewStatus.textContent = state === "loading"
        ? nativePreview.dataset.loadingLabel || "Loading preview..."
        : state === "error"
          ? nativePreview.dataset.errorLabel || "The preview could not be loaded."
          : "";
    }
  };

  const pauseNativePreview = () => {
    if (nativePreviewMedia && !nativePreviewMedia.paused) nativePreviewMedia.pause();
  };

  nativePreviewToggle?.addEventListener("click", async () => {
    if (!nativePreviewMedia || !nativePreviewSource || nativePreviewLoading) return;
    if (!nativePreviewMedia.paused) {
      nativePreviewMedia.pause();
      return;
    }

    localReels.forEach((video) => {
      if (!video.paused) video.pause();
    });

    if (!nativePreviewSource.src) {
      const sourcePath = nativePreviewSource.dataset.src;
      if (!sourcePath) {
        setNativePreviewState("error");
        return;
      }
      nativePreviewSource.src = sourcePath;
      nativePreviewMedia.load();
    }

    nativePreviewLoading = true;
    setNativePreviewState("loading");
    try {
      await nativePreviewMedia.play();
      trackEvent("preview_play", { release_title: "Mountain Day", preview_format: "native_24_second" });
    } catch {
      setNativePreviewState("error");
    } finally {
      nativePreviewLoading = false;
    }
  });

  nativePreviewMedia?.addEventListener("playing", () => setNativePreviewState("playing"));
  nativePreviewMedia?.addEventListener("pause", () => setNativePreviewState("paused"));
  nativePreviewMedia?.addEventListener("ended", () => {
    nativePreviewMedia.currentTime = 0;
    setNativePreviewState("paused");
  });
  nativePreviewMedia?.addEventListener("error", () => {
    nativePreviewLoading = false;
    setNativePreviewState("error");
  });

  localReels.forEach((video) => {
    video.addEventListener("play", () => {
      pauseNativePreview();
      localReels.forEach((otherVideo) => {
        if (otherVideo !== video && !otherVideo.paused) otherVideo.pause();
      });
      const card = video.closest(".pv-film, .reel-card");
      const filmPosition = filmCards.indexOf(card);
      trackEvent("reel_play", {
        reel_title: card?.querySelector("h3")?.textContent?.trim() || "",
        reel_position: filmPosition >= 0 ? filmPosition + 1 : localReels.indexOf(video) + 1
      });
    });
  });

  const videoBlocks = document.querySelectorAll("[data-video-id]");
  const loadVideo = (block, { autoplay = false } = {}) => {
    if (!block || block.querySelector("iframe")) return;
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(block.dataset.videoId)}?autoplay=${autoplay ? "1" : "0"}&rel=0`;
    iframe.title = block.dataset.videoTitle || "PRAYZVIBES video";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    iframe.loading = "lazy";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    block.replaceChildren(iframe);
  };

  const applyConsent = (choices) => {
    if (choices?.analytics) loadAnalytics();
    if (choices?.media) videoBlocks.forEach(loadVideo);
  };

  let banner = document.querySelector("[data-cookie-banner]");
  if (!banner) {
    document.body.insertAdjacentHTML("beforeend", '<div class="cookie-banner" data-cookie-banner role="dialog" aria-labelledby="cookie-title" aria-describedby="cookie-copy" hidden><div><h2 id="cookie-title">Your privacy, your choice.</h2><p id="cookie-copy">Essential storage keeps the site working. Optional analytics helps show which pages are useful.</p></div><div class="cookie-actions"><button class="button button--small button--ghost-dark" type="button" data-consent="essential">Essential only</button><button class="button button--small button--dark" type="button" data-open-preferences>Choose</button><button class="button button--small button--primary" type="button" data-consent="all">Accept all</button></div></div>');
    banner = document.querySelector("[data-cookie-banner]");
  }
  const dialog = document.querySelector("[data-cookie-dialog]");
  const analyticsInput = dialog?.querySelector('input[name="analytics"]');
  const mediaInput = dialog?.querySelector('input[name="media"]');

  const openPreferences = () => {
    if (!dialog) return;
    const saved = readConsent() || { analytics: false, media: false };
    if (analyticsInput) analyticsInput.checked = Boolean(saved.analytics);
    if (mediaInput) mediaInput.checked = Boolean(saved.media);
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  };

  const completeConsent = (choices) => {
    const saved = writeConsent(choices);
    banner?.setAttribute("hidden", "");
    if (dialog?.open) dialog.close();
    applyConsent(saved);
  };

  document.querySelectorAll("[data-consent]").forEach((button) => {
    button.addEventListener("click", () => {
      const all = button.dataset.consent === "all";
      completeConsent({ analytics: all, media: all });
    });
  });
  document.querySelectorAll("[data-open-preferences], [data-cookie-settings]").forEach((button) => button.addEventListener("click", openPreferences));
  document.querySelector("[data-save-preferences]")?.addEventListener("click", () => completeConsent({ analytics: analyticsInput?.checked, media: mediaInput?.checked }));

  const initialConsent = readConsent();
  if (initialConsent) applyConsent(initialConsent);
  else banner?.removeAttribute("hidden");

  videoBlocks.forEach((block) => {
    block.querySelector(".video-load")?.addEventListener("click", () => {
      pauseNativePreview();
      localReels.forEach((video) => {
        if (!video.paused) video.pause();
      });
      trackEvent("video_play", {
        video_id: block.dataset.videoId || "",
        video_title: block.dataset.videoTitle || ""
      });
      loadVideo(block, { autoplay: true });
    });
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pauseNativePreview();
  });

  const brevoForm = document.querySelector("#sib-form");
  let brevoLoading = false;
  const loadBrevo = () => {
    if (brevoLoading || document.querySelector('script[src*="sibforms.com/forms/end-form"]')) return;
    brevoLoading = true;
    const script = document.createElement("script");
    script.src = "https://sibforms.com/forms/end-form/build/main.js";
    script.defer = true;
    document.body.append(script);
  };
  brevoForm?.addEventListener("focusin", loadBrevo, { once: true });
  brevoForm?.addEventListener("pointerenter", loadBrevo, { once: true });
  brevoForm?.addEventListener("submit", () => trackEvent("newsletter_submit"));

  const storeExitDialog = document.querySelector("[data-store-exit-dialog]");
  const storeExitCopy = storeExitDialog?.querySelector("[data-store-exit-copy]");
  const storeExitContinue = storeExitDialog?.querySelector("[data-store-exit-continue]");
  let storeExitLastFocused = null;
  const storeDestinations = [
    { matches: (host) => host.endsWith("bandcamp.com"), name: "Bandcamp", purpose: "digital" },
    { matches: (host) => host === "elasticstage.com" || host.endsWith(".elasticstage.com"), name: "ElasticStage", purpose: "physical" },
    { matches: (host) => host === "prayzvibes-shop.fourthwall.com", name: "Fourthwall", purpose: "merch" }
  ];
  const storeMessages = {
    en: {
      purposes: { digital: "music and digital artwork", physical: "CD and vinyl editions", merch: "PRAYZVIBES merchandise" },
      message: (name, purpose) => `You're leaving prayzvibes.com for ${name}, the official partner for ${purpose}. It will open in a new tab.`,
      continue: (name) => `Continue to ${name} ↗`
    },
    de: {
      purposes: { digital: "Musik und digitale Artworks", physical: "CD- und Vinyl-Ausgaben", merch: "PRAYZVIBES-Merchandise" },
      message: (name, purpose) => `Du verlässt prayzvibes.com und öffnest ${name}, den offiziellen Partner für ${purpose}. Der Shop öffnet sich in einem neuen Tab.`,
      continue: (name) => `Weiter zu ${name} ↗`
    },
    fr: {
      purposes: { digital: "la musique et les visuels numériques", physical: "les éditions CD et vinyle", merch: "le merchandising PRAYZVIBES" },
      message: (name, purpose) => `Vous quittez prayzvibes.com pour ${name}, le partenaire officiel pour ${purpose}. La boutique s'ouvrira dans un nouvel onglet.`,
      continue: (name) => `Continuer vers ${name} ↗`
    }
  };
  const storeMessage = storeMessages[currentLanguage] || storeMessages.en;

  const closeStoreExit = () => {
    if (!storeExitDialog) return;
    if (storeExitDialog.open && typeof storeExitDialog.close === "function") storeExitDialog.close();
    else storeExitDialog.removeAttribute("open");
    if (storeExitLastFocused instanceof HTMLElement) storeExitLastFocused.focus();
  };

  if (storeExitDialog && storeExitCopy && storeExitContinue) {
    document.querySelectorAll("a[href]").forEach((link) => {
      const destinationUrl = new URL(link.href, window.location.href);
      const destination = storeDestinations.find((item) => item.matches(destinationUrl.hostname));
      if (!destination) return;
      link.addEventListener("click", (event) => {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (link.closest("#shop")) {
          trackEvent("shop_click", {
            link_url: destinationUrl.href,
            link_text: link.textContent.trim().slice(0, 100),
            shop_route: link.dataset.merchRoute || "all"
          });
        }
        event.preventDefault();
        event.stopPropagation();
        storeExitLastFocused = link;
        storeExitCopy.textContent = storeMessage.message(destination.name, storeMessage.purposes[destination.purpose]);
        storeExitContinue.href = destinationUrl.href;
        storeExitContinue.textContent = storeMessage.continue(destination.name);
        if (typeof storeExitDialog.showModal === "function") storeExitDialog.showModal();
        else storeExitDialog.setAttribute("open", "");
      });
    });
    storeExitDialog.querySelectorAll("[data-store-exit-close]").forEach((button) => button.addEventListener("click", closeStoreExit));
    storeExitContinue.addEventListener("click", closeStoreExit);
    storeExitDialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      closeStoreExit();
    });
  }

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link || typeof window.gtag !== "function") return;
    const url = new URL(link.href, window.location.href);
    const linkText = link.textContent.trim().slice(0, 100);
    if (url.origin !== window.location.origin) {
      trackEvent("outbound_click", { link_url: url.href, link_text: linkText });
    }
    if (link.closest("#live-preview")) trackEvent("live_click", { link_url: url.href, link_text: linkText });
    if (link.closest("#shop")) trackEvent("shop_click", { link_url: url.href, link_text: linkText });
    if (link.closest("#worlds")) trackEvent("playlist_click", { link_url: url.href, link_text: linkText });
    if (link.matches(".campaign-switch, .release-switch") || link.closest("#listen")) trackEvent("listen_click", { link_url: url.href, link_text: linkText });
    if (url.hostname === "ko-fi.com" && url.pathname.toLowerCase().includes("prayzvibes")) {
      trackEvent("support_click", {
        link_url: url.href,
        link_text: linkText,
        support_source: link.dataset.supportSource || "unclassified"
      });
    }
    if (url.pathname.includes("epk.html")) trackEvent("epk_click", { link_url: url.href, link_text: linkText });
  });
})();
