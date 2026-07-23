(() => {
  "use strict";

  const GA_ID = "G-YL0ZXL9Q4D";
  const CONSENT_KEY = "prayzvibes-consent-v1";
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
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
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

  const videoBlocks = document.querySelectorAll("[data-video-id]");
  const loadVideo = (block) => {
    if (!block || block.querySelector("iframe")) return;
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(block.dataset.videoId)}?autoplay=1&rel=0`;
    iframe.title = "PRAYZVIBES official music video";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    block.replaceChildren(iframe);
  };

  const applyConsent = (choices) => {
    if (choices?.analytics) loadAnalytics();
    if (choices?.media) videoBlocks.forEach(loadVideo);
  };

  let banner = document.querySelector("[data-cookie-banner]");
  if (!banner) {
    document.body.insertAdjacentHTML("beforeend", '<div class="cookie-banner" data-cookie-banner role="dialog" aria-labelledby="cookie-title" aria-describedby="cookie-copy" hidden><div><h2 id="cookie-title">Your choice, your rhythm.</h2><p id="cookie-copy">Essential storage keeps the site working. With permission, analytics helps PRAYZVIBES understand what resonates.</p></div><div class="cookie-actions"><button class="button button--small button--ghost-dark" type="button" data-consent="essential">Essential only</button><button class="button button--small button--dark" type="button" data-open-preferences>Choose</button><button class="button button--small button--primary" type="button" data-consent="all">Accept all</button></div></div>');
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
      const saved = readConsent() || { analytics: false, media: false };
      saved.media = true;
      applyConsent(writeConsent(saved));
    });
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

  const storeExitDialog = document.querySelector("[data-store-exit-dialog]");
  const storeExitCopy = storeExitDialog?.querySelector("[data-store-exit-copy]");
  const storeExitContinue = storeExitDialog?.querySelector("[data-store-exit-continue]");
  let storeExitLastFocused = null;
  const storeDestinations = [
    { matches: (host) => host.endsWith("bandcamp.com"), name: "Bandcamp", purpose: "music and digital artwork" },
    { matches: (host) => host === "elasticstage.com" || host.endsWith(".elasticstage.com"), name: "ElasticStage", purpose: "CD and vinyl editions" },
    { matches: (host) => host === "prayzvibes-shop.fourthwall.com", name: "Fourthwall", purpose: "PRAYZVIBES merchandise" }
  ];

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
        event.preventDefault();
        event.stopPropagation();
        storeExitLastFocused = link;
        storeExitCopy.textContent = `You’re leaving prayzvibes.com for ${destination.name}, the official partner for ${destination.purpose}. It will open in a new tab.`;
        storeExitContinue.href = destinationUrl.href;
        storeExitContinue.textContent = `Continue to ${destination.name} ↗`;
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
    if (url.origin === window.location.origin) return;
    window.gtag("event", "outbound_click", { link_url: url.href, link_text: link.textContent.trim().slice(0, 100) });
  });
})();
