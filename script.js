(() => {
  "use strict";

  const GA_ID = "G-YL0ZXL9Q4D";
  const CONSENT_KEY = "prayzvibes-consent-v1";
  const LANGUAGE_KEY = "prayzvibes-language";
  const JOURNEY_FIRST_CHOICE_KEY = "pv-journey-first-choice";
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
  const normalizedPathname = window.location.pathname.replace(/\/+$/, "") || "/";
  const isDefaultEntry = normalizedPathname === "/" || normalizedPathname === "/index.html";
  if (isDefaultEntry && preferredLanguage !== currentLanguage && preferredLink instanceof HTMLAnchorElement) {
    const destination = new URL(preferredLink.href, window.location.href);
    destination.search = window.location.search;
    destination.hash = window.location.hash;
    window.location.replace(destination.href);
    return;
  }
  document.querySelectorAll("[data-language-choice]").forEach((link) => {
    link.addEventListener("click", () => {
      if (window.location.hash && link instanceof HTMLAnchorElement) {
        const destination = new URL(link.href, window.location.href);
        destination.hash = window.location.hash;
        link.href = destination.href;
      }
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

  let journeyFirstChoiceTracked = false;
  try {
    journeyFirstChoiceTracked = Boolean(sessionStorage.getItem(JOURNEY_FIRST_CHOICE_KEY));
  } catch {
    // The event remains once-per-view when session storage is unavailable.
  }

  document.querySelectorAll("[data-journey-path]").forEach((link) => {
    link.addEventListener("click", () => {
      const pathName = link.dataset.journeyPath?.trim();
      if (!pathName || !readConsent()?.analytics) return;
      trackEvent("journey_path_click", { path_name: pathName });
      if (journeyFirstChoiceTracked) return;
      journeyFirstChoiceTracked = true;
      try {
        sessionStorage.setItem(JOURNEY_FIRST_CHOICE_KEY, pathName);
      } catch {
        // The in-memory guard still prevents duplicates during this view.
      }
      trackEvent("journey_first_choice", { path_name: pathName });
    });
  });

  const copyText = async (value) => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return;
    }
    const field = document.createElement("textarea");
    field.value = value;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.append(field);
    field.select();
    document.execCommand("copy");
    field.remove();
  };

  document.querySelectorAll("[data-share-song]").forEach((button) => {
    button.addEventListener("click", async () => {
      const shareUrl = button.dataset.shareUrl || window.location.href;
      const shareTitle = button.dataset.shareTitle || document.title;
      const shareText = button.dataset.shareText || "";
      const status = button.closest(".pv-mountain__copy")?.querySelector("[data-share-status]");
      try {
        if (typeof navigator.share === "function") {
          await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
          trackEvent("song_share", { share_method: "native", song_name: "Mountain Day" });
          return;
        }
        await copyText(shareUrl);
        if (status) status.textContent = button.dataset.shareCopied || "Link copied.";
        trackEvent("song_share", { share_method: "copy", song_name: "Mountain Day" });
      } catch (error) {
        if (error?.name === "AbortError") return;
        if (status) status.textContent = shareUrl;
      }
    });
  });

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
  const videoBlocks = [...document.querySelectorAll("[data-video-id]")];
  const nativePreview = document.querySelector("[data-native-preview]");
  const nativePreviewToggle = nativePreview?.querySelector("[data-preview-toggle]");
  const nativePreviewMedia = nativePreview?.querySelector("[data-preview-media]");
  const nativePreviewSource = nativePreview?.querySelector("[data-preview-source]");
  const nativePreviewIcon = nativePreview?.querySelector(".pv-quick-preview__icon");
  const nativePreviewStatus = nativePreview?.querySelector("[data-preview-status]");
  const nativePreviewProgress = nativePreview?.querySelector("[data-preview-progress]");
  const nativePreviewProgressBar = nativePreview?.querySelector("[data-preview-progress-bar]");
  const nativePreviewTime = nativePreview?.querySelector("[data-preview-time]");
  const explicitNativePreviewContinue = nativePreview?.querySelector("[data-preview-continue]");
  const nativePreviewContinue = explicitNativePreviewContinue || nativePreview?.querySelector(".pv-quick-preview__link");
  const nativePreviewClose = nativePreview?.querySelector("[data-preview-close]");
  const previewDock = document.querySelector("[data-preview-dock]");
  const previewDockToggle = previewDock?.querySelector("[data-preview-dock-toggle]");
  const previewDockClose = previewDock?.querySelector("[data-preview-dock-close]");
  const previewDockProgress = previewDock?.querySelector("[data-preview-dock-progress]");
  const previewDockTime = previewDock?.querySelector("[data-preview-dock-time]");
  const previewDockContinue = previewDock?.querySelector("[data-preview-dock-continue]");
  const allNativeMedia = [...document.querySelectorAll("video, audio")];
  const nativeVideos = allNativeMedia.filter((media) => media instanceof HTMLVideoElement && media !== nativePreviewMedia);
  const previewLabels = {
    en: { continue: "Continue with the full song", play: "Play preview", pause: "Pause preview" },
    de: { continue: "Den ganzen Song weiterhören", play: "Hörprobe abspielen", pause: "Hörprobe pausieren" },
    fr: { continue: "Continuer avec le titre complet", play: "Lire l’extrait", pause: "Mettre l’extrait en pause" }
  };
  const activePreviewLabels = previewLabels[currentLanguage] || previewLabels.en;
  let nativePreviewLoading = false;
  let nativePreviewStarted = false;
  let nativePreviewCompleted = false;
  let nativePreviewToggleVisible = true;
  let previewDockDismissed = false;
  let previewStartTracked = false;
  let previewTenSecondsTracked = false;
  let previewCompleteTracked = false;

  const formatMediaTime = (seconds) => {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
    const rounded = Math.floor(seconds);
    return `${Math.floor(rounded / 60)}:${String(rounded % 60).padStart(2, "0")}`;
  };

  const getMediaDetails = (media) => {
    const container = media.closest("[data-native-video], [data-native-film], section, article, figure") || media.parentElement;
    const heading = container?.querySelector("h2, h3");
    const source = media.currentSrc || media.querySelector("source")?.src || "";
    return {
      video_title: media.dataset.videoTitle || container?.dataset.videoTitle || container?.dataset.filmTitle || media.getAttribute("aria-label") || heading?.textContent?.trim() || "PRAYZVIBES video",
      video_id: media.dataset.videoId || container?.dataset.videoId || source.split("/").pop()?.split("?")[0] || "native-video",
      video_placement: media.dataset.videoPlacement || container?.dataset.videoPlacement || container?.id || "page",
      video_provider: "native"
    };
  };

  const pauseYouTubeFrames = (exceptFrame = null) => {
    document.querySelectorAll('iframe[src*="youtube-nocookie.com/embed/"]').forEach((frame) => {
      if (frame === exceptFrame) return;
      frame.contentWindow?.postMessage(JSON.stringify({ event: "command", func: "pauseVideo", args: "" }), "https://www.youtube-nocookie.com");
    });
  };

  const pauseOtherNativeMedia = (activeMedia = null) => {
    allNativeMedia.forEach((media) => {
      if (media !== activeMedia && !media.paused) media.pause();
    });
  };

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
    nativePreview.dataset.previewState = state;
    nativePreview.classList.toggle("is-playing", isPlaying);
    nativePreview.classList.toggle("is-loading", state === "loading");
    nativePreview.classList.toggle("is-complete", state === "complete");
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
    if (previewDockToggle) {
      previewDockToggle.setAttribute("aria-pressed", String(isPlaying));
      previewDockToggle.setAttribute("aria-label", isPlaying ? activePreviewLabels.pause : activePreviewLabels.play);
    }
  };

  const updatePreviewProgress = () => {
    if (!nativePreviewMedia || !nativePreview) return;
    const duration = Number.isFinite(nativePreviewMedia.duration) ? nativePreviewMedia.duration : 0;
    const currentTime = Number.isFinite(nativePreviewMedia.currentTime) ? nativePreviewMedia.currentTime : 0;
    const fraction = duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0;
    const percentage = Math.round(fraction * 100);
    nativePreview.dataset.previewProgress = String(percentage);
    nativePreview.dataset.previewElapsed = String(Math.round(currentTime * 10) / 10);
    nativePreview.dataset.previewDuration = String(Math.round(duration * 10) / 10);
    nativePreview.style.setProperty("--preview-progress", `${percentage}%`);
    nativePreview.style.setProperty("--pv-preview-progress", `${percentage}%`);
    if (nativePreviewProgressBar) {
      nativePreviewProgressBar.style.width = `${percentage}%`;
      nativePreviewProgressBar.style.setProperty("--preview-progress", `${percentage}%`);
      nativePreviewProgressBar.style.setProperty("--pv-preview-progress", `${percentage}%`);
    }
    [nativePreviewProgress, previewDockProgress].forEach((progress) => {
      if (!progress) return;
      if (progress instanceof HTMLProgressElement) {
        progress.max = duration || 100;
        progress.value = duration ? currentTime : percentage;
      } else {
        progress.setAttribute("role", "progressbar");
        progress.setAttribute("aria-valuemin", "0");
        progress.setAttribute("aria-valuemax", String(duration || 100));
        progress.setAttribute("aria-valuenow", String(Math.round((duration ? currentTime : percentage) * 10) / 10));
        progress.style.setProperty("--preview-progress", `${percentage}%`);
        progress.style.setProperty("--pv-preview-progress", `${percentage}%`);
      }
    });
    const timeLabel = `${formatMediaTime(currentTime)} / ${formatMediaTime(duration)}`;
    if (nativePreviewTime) nativePreviewTime.textContent = timeLabel;
    if (previewDockTime) previewDockTime.textContent = timeLabel;
  };

  const revealPreviewContinue = () => {
    [nativePreviewContinue, previewDockContinue].forEach((link) => {
      if (!link) return;
      link.hidden = false;
      link.dataset.previewContinueVisible = "true";
    });
    if (nativePreviewClose) nativePreviewClose.hidden = false;
  };

  const updatePreviewDockVisibility = () => {
    if (!previewDock) return;
    const shouldShow = nativePreviewStarted && !nativePreviewCompleted && !previewDockDismissed && !nativePreviewToggleVisible;
    previewDock.hidden = !shouldShow;
    previewDock.dataset.previewDockState = shouldShow ? "visible" : "hidden";
  };

  const pauseNativePreview = () => {
    if (nativePreviewMedia && !nativePreviewMedia.paused) nativePreviewMedia.pause();
    if (previewDock) previewDock.hidden = true;
  };

  if (nativePreviewContinue) {
    nativePreviewContinue.dataset.previewContinue = "";
    nativePreviewContinue.hidden = true;
    if (!explicitNativePreviewContinue && !nativePreviewContinue.dataset.previewContinuePreserveLabel) {
      nativePreviewContinue.textContent = nativePreview.dataset.continueLabel || nativePreview.dataset.completeLabel || activePreviewLabels.continue;
    }
  }
  if (previewDockContinue) previewDockContinue.hidden = true;
  if (previewDock) previewDock.hidden = true;
  if (nativePreview) {
    nativePreview.dataset.previewCompleted = "false";
    setNativePreviewState("idle");
    updatePreviewProgress();
  }

  if (nativePreviewToggle && "IntersectionObserver" in window) {
    const previewVisibilityObserver = new IntersectionObserver((entries) => {
      nativePreviewToggleVisible = entries[0]?.isIntersecting ?? true;
      updatePreviewDockVisibility();
    }, { threshold: 0.15 });
    previewVisibilityObserver.observe(nativePreviewToggle);
  }

  nativePreviewToggle?.addEventListener("click", async () => {
    if (!nativePreviewMedia || !nativePreviewSource || nativePreviewLoading) return;
    if (!nativePreviewMedia.paused) {
      nativePreviewMedia.pause();
      return;
    }

    pauseOtherNativeMedia(nativePreviewMedia);
    pauseYouTubeFrames();

    if (nativePreviewMedia.ended || (Number.isFinite(nativePreviewMedia.duration) && nativePreviewMedia.currentTime >= nativePreviewMedia.duration)) {
      nativePreviewMedia.currentTime = 0;
      nativePreviewCompleted = false;
      previewStartTracked = false;
      previewTenSecondsTracked = false;
      previewCompleteTracked = false;
      nativePreview.dataset.previewCompleted = "false";
    }

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
    } catch {
      setNativePreviewState("error");
    } finally {
      nativePreviewLoading = false;
    }
  });

  document.querySelector('[data-journey-path="listen"]')?.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (!nativePreviewMedia?.paused || !nativePreviewToggle) return;
    nativePreviewToggle.click();
    // Do not prevent the anchor default: #watch remains the accessible fallback and destination.
  });

  previewDockToggle?.addEventListener("click", async () => {
    if (!nativePreviewMedia || nativePreviewLoading) return;
    if (!nativePreviewMedia.paused) {
      nativePreviewMedia.pause();
      return;
    }
    pauseOtherNativeMedia(nativePreviewMedia);
    pauseYouTubeFrames();
    try {
      await nativePreviewMedia.play();
    } catch {
      setNativePreviewState("error");
    }
  });

  previewDockClose?.addEventListener("click", () => {
    previewDockDismissed = true;
    pauseNativePreview();
    updatePreviewDockVisibility();
  });

  nativePreviewClose?.addEventListener("click", () => {
    pauseNativePreview();
    nativePreviewStarted = false;
    nativePreviewCompleted = false;
    if (nativePreviewMedia) nativePreviewMedia.currentTime = 0;
    nativePreview.dataset.previewCompleted = "false";
    nativePreviewContinue?.setAttribute("hidden", "");
    nativePreviewClose.hidden = true;
    updatePreviewProgress();
    setNativePreviewState("idle");
    updatePreviewDockVisibility();
  });

  nativePreviewMedia?.addEventListener("playing", () => {
    pauseOtherNativeMedia(nativePreviewMedia);
    pauseYouTubeFrames();
    nativePreviewStarted = true;
    nativePreviewCompleted = false;
    nativePreview.dataset.previewCompleted = "false";
    setNativePreviewState("playing");
    revealPreviewContinue();
    updatePreviewDockVisibility();
    if (!previewStartTracked) {
      previewStartTracked = true;
      trackEvent("preview_start", { release_title: "Mountain Day", preview_format: "native_24_second", placement: "hero" });
    }
  });
  nativePreviewMedia?.addEventListener("pause", () => {
    if (!nativePreviewCompleted) setNativePreviewState("paused");
  });
  nativePreviewMedia?.addEventListener("loadedmetadata", updatePreviewProgress);
  nativePreviewMedia?.addEventListener("timeupdate", () => {
    updatePreviewProgress();
    if (!previewTenSecondsTracked && nativePreviewMedia.currentTime >= 10) {
      previewTenSecondsTracked = true;
      trackEvent("preview_10s", { release_title: "Mountain Day", preview_format: "native_24_second", placement: "hero" });
    }
  });
  nativePreviewMedia?.addEventListener("ended", () => {
    nativePreviewCompleted = true;
    nativePreview.dataset.previewCompleted = "true";
    setNativePreviewState("complete");
    revealPreviewContinue();
    updatePreviewProgress();
    updatePreviewDockVisibility();
    if (!previewCompleteTracked) {
      previewCompleteTracked = true;
      trackEvent("preview_complete", { release_title: "Mountain Day", preview_format: "native_24_second", placement: "hero" });
    }
  });
  nativePreviewMedia?.addEventListener("error", () => {
    nativePreviewLoading = false;
    setNativePreviewState("error");
  });

  const nativeVideoMilestones = new WeakMap();
  nativeVideos.forEach((video) => {
    const state = { started: false, midpoint: false, complete: false };
    nativeVideoMilestones.set(video, state);
    const container = video.closest("[data-native-video], [data-native-film]");
    const playButton = container?.querySelector("[data-native-video-play], [data-native-film-play]");
    const endCard = container?.querySelector("[data-native-video-end-card], [data-native-film-end-card]");
    const replayButton = container?.querySelector("[data-native-video-replay], [data-native-film-replay]");
    if (endCard) endCard.hidden = true;

    playButton?.addEventListener("click", async () => {
      const details = getMediaDetails(video);
      trackEvent("video_intent", details);
      pauseOtherNativeMedia(video);
      pauseYouTubeFrames();
      try {
        await video.play();
      } catch {
        container?.setAttribute("data-native-video-state", "error");
        container?.setAttribute("data-native-film-state", "error");
      }
    });

    replayButton?.addEventListener("click", async () => {
      trackEvent("video_intent", { ...getMediaDetails(video), video_action: "replay" });
      pauseOtherNativeMedia(video);
      pauseYouTubeFrames();
      video.currentTime = 0;
      if (endCard) endCard.hidden = true;
      try {
        await video.play();
      } catch {
        container?.setAttribute("data-native-video-state", "error");
        container?.setAttribute("data-native-film-state", "error");
      }
    });

    video.addEventListener("play", () => {
      pauseOtherNativeMedia(video);
      pauseYouTubeFrames();
      const details = getMediaDetails(video);
      container?.setAttribute("data-native-video-state", "playing");
      container?.setAttribute("data-native-film-state", "playing");
      if (playButton) playButton.hidden = true;
      if (endCard) endCard.hidden = true;
      if (!state.started) {
        state.started = true;
        trackEvent("video_start", details);
      }
      const card = video.closest(".pv-film, .reel-card");
      if (card) {
        const filmPosition = filmCards.indexOf(card);
        trackEvent("reel_play", {
          reel_title: card.querySelector("h3")?.textContent?.trim() || details.video_title,
          reel_position: filmPosition >= 0 ? filmPosition + 1 : localReels.indexOf(video) + 1
        });
      }
    });

    video.addEventListener("timeupdate", () => {
      if (!state.midpoint && Number.isFinite(video.duration) && video.duration > 0 && video.currentTime >= video.duration * .5) {
        state.midpoint = true;
        trackEvent("video_50", getMediaDetails(video));
      }
    });

    video.addEventListener("ended", () => {
      container?.setAttribute("data-native-video-state", "complete");
      container?.setAttribute("data-native-film-state", "complete");
      if (endCard) endCard.hidden = false;
      if (!state.complete) {
        state.complete = true;
        trackEvent("video_complete", getMediaDetails(video));
      }
    });
  });

  const loadVideo = (block, { autoplay = false } = {}) => {
    if (!block || block.querySelector("iframe")) return;
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(block.dataset.videoId)}?autoplay=${autoplay ? "1" : "0"}&rel=0&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`;
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
      pauseOtherNativeMedia();
      pauseYouTubeFrames();
      trackEvent("video_intent", {
        video_id: block.dataset.videoId || "",
        video_title: block.dataset.videoTitle || "",
        video_placement: block.dataset.videoPlacement || block.closest("section")?.id || "page",
        video_provider: "youtube"
      });
      loadVideo(block, { autoplay: true });
    });
  });

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) return;
    pauseOtherNativeMedia();
    pauseYouTubeFrames();
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
  const brevoSuccess = document.querySelector("#success-message, [data-newsletter-success]");
  let newsletterSuccessTracked = false;
  const checkNewsletterSuccess = () => {
    if (!brevoSuccess || newsletterSuccessTracked) return;
    const styles = window.getComputedStyle(brevoSuccess);
    const isVisible = !brevoSuccess.hidden
      && brevoSuccess.getAttribute("aria-hidden") !== "true"
      && styles.display !== "none"
      && styles.visibility !== "hidden"
      && styles.opacity !== "0"
      && brevoSuccess.getClientRects().length > 0;
    if (!isVisible) return;
    newsletterSuccessTracked = true;
    trackEvent("newsletter_success", { form_id: brevoForm?.id || "newsletter" });
  };
  if (brevoSuccess && "MutationObserver" in window) {
    const successObserver = new MutationObserver(checkNewsletterSuccess);
    successObserver.observe(brevoSuccess, { attributes: true, childList: true, subtree: true, attributeFilter: ["class", "style", "hidden", "aria-hidden"] });
  }
  document.addEventListener("sib-form:success", checkNewsletterSuccess);
  document.addEventListener("newsletter:success", checkNewsletterSuccess);

  const getLinkPlacement = (link) => {
    if (link.dataset.listenPlacement) return link.dataset.listenPlacement;
    if (link.closest("[data-native-preview]")) return link.matches("[data-preview-continue], .pv-quick-preview__link") ? "hero_preview_continue" : "hero_preview";
    if (link.classList.contains("header-cta")) return "header";
    if (link.classList.contains("mobile-menu__cta")) return "mobile_menu";
    if (link.closest("footer")) return "footer";
    return link.closest("section")?.id || document.body.dataset.page || "page";
  };

  const getLinkedRelease = (link, url) => {
    if (link.dataset.release) return link.dataset.release;
    const signature = `${url.pathname} ${link.textContent}`.toLowerCase();
    if (signature.includes("5jnbx3") || signature.includes("mountain day")) return "Mountain Day";
    if (signature.includes("ragdlw") || signature.includes("transience")) return "Transience";
    if (link.closest("#watch")) return "Mountain Day";
    if (link.closest("#music")) return "Transience";
    return "PRAYZVIBES";
  };

  const listeningHosts = ["listen.music-hub.com", "open.spotify.com", "music.apple.com", "music.youtube.com", "deezer.com", "tidal.com", "soundcloud.com"];

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link || typeof window.gtag !== "function") return;
    const url = new URL(link.href, window.location.href);
    const linkText = link.textContent.trim().slice(0, 100);
    const placement = getLinkPlacement(link);
    if (url.origin !== window.location.origin) {
      trackEvent("outbound_click", { link_url: url.href, link_text: linkText });
    }
    if (link.closest("#live-preview")) trackEvent("live_click", { link_url: url.href, link_text: linkText });
    if (link.matches("[data-social-video]")) {
      trackEvent("social_video_click", {
        link_url: url.href,
        platform: link.dataset.videoPlatform || url.hostname,
        video_title: link.dataset.videoTitle || "PRAYZVIBES video",
        placement: link.dataset.videoPlacement || placement
      });
    }
    if (link.closest("#shop")) {
      trackEvent("shop_click", { link_url: url.href, link_text: linkText });
      trackEvent("product_click", {
        link_url: url.href,
        product_name: link.dataset.productName || link.closest("[data-product-name]")?.dataset.productName || linkText,
        product_route: link.dataset.merchRoute || "all",
        placement: link.dataset.productPlacement || "shop"
      });
    }
    if (link.closest("#worlds")) trackEvent("playlist_click", { link_url: url.href, link_text: linkText });
    const hostIsListeningService = listeningHosts.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`));
    const isListenLink = hostIsListeningService
      || url.pathname.toLowerCase().endsWith("/listen.html")
      || link.matches(".campaign-switch, .release-switch, [data-listen-placement]")
      || Boolean(link.closest("#listen, #music"));
    if (isListenLink) {
      const linkedRelease = getLinkedRelease(link, url);
      trackEvent("listen_click", {
        link_url: url.href,
        link_text: linkText,
        placement,
        release: linkedRelease,
        release_title: linkedRelease
      });
    }
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
