/* Native details remain fully usable without JavaScript. No tracking or media loading. */
(() => {
  const thoughts = [...document.querySelectorAll(".pv-thought")];
  if (!thoughts.length) return;
  function openThought(id, focus = false) {
    const thought = thoughts.find(item => item.id === id);
    if (!thought) return;
    thoughts.forEach(item => { item.open = item === thought; });
    if (focus) thought.querySelector("summary").focus({ preventScroll: true });
    return thought;
  }
  document.querySelectorAll("[data-open-thought]").forEach(link => {
    link.addEventListener("click", event => {
      if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      const thought = openThought(link.dataset.openThought, true);
      if (!thought) return;
      const hash = "#" + thought.id;
      if (location.hash !== hash) history.pushState(null, "", hash);
      thought.scrollIntoView({ block: "start", behavior: "auto" });
    });
  });
  thoughts.forEach(thought => {
    thought.addEventListener("toggle", () => {
      if (thought.open) thoughts.forEach(other => { if (other !== thought) other.open = false; });
    });
    thought.addEventListener("keydown", event => {
      if (event.key !== "Escape" || !thought.open) return;
      thought.open = false;
      thought.querySelector("summary").focus({ preventScroll: true });
      event.preventDefault();
    });
  });
  // A shared URL can point to a specific thought; nothing opens on ordinary arrival.
  if (location.hash.startsWith("#thought-")) openThought(location.hash.slice(1));
  window.addEventListener("hashchange", () => {
    if (location.hash.startsWith("#thought-")) openThought(location.hash.slice(1));
  });
  window.addEventListener("load", () => {
    if (!location.hash.startsWith("#thought-")) return;
    const thought = openThought(location.hash.slice(1));
    if (thought) thought.scrollIntoView({ block: "start", behavior: "auto" });
  });
})();
