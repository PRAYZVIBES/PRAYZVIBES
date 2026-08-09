import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

throw new Error(
  "Retired legacy generator: maintain the audited multilingual pages directly and run scripts/validate-final-draft.mjs before publishing."
);

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const languages = {
  en: {
    file: "index.html", media: "", lang: "en",
    kicker: "Street-shaped indie folk · Franconian Switzerland",
    hook: "Songs from Bavaria.<br>Made to travel.",
    releaseLine: "Transience · EP · out now",
    listen: "Listen to Transience", films: "Watch the films",
    chapter: "Current chapter", releaseCopy: "Four songs. One changing view.",
    themes: ["Perspective", "Memory", "Courage", "Release"],
    allPlatforms: "All platforms", buyPhysical: "CD & vinyl",
    shift: "Maybe the next step<br>isn’t farther away.",
    shiftCopy: "Maybe it begins with a little distance.",
    shiftNote: "Mountain Day opened the door. Transience keeps moving.",
    filmsLabel: "Three films · one chapter", filmsTitle: "Seen from<br>the road.",
    filmsCopy: "No feed. No noise. Just moments from the release, the mountain and Salzburg.",
    filmLabels: ["Release short", "Official short", "Street clip"],
    liveLabel: "Live & booking", liveTitle: "One voice.<br>One black guitar.<br>Rhythm underfoot.",
    liveCopy: "Original songs, selected covers and room for the moment. A compact solo format for festivals, intimate venues, streets and open air.",
    liveCta: "Explore live", watchSalzburg: "Watch Salzburg",
    storyLabel: "The story", storyTitle: "Music became a compass<br>on a hillside.",
    storyCopy: "That moment opened a self-taught path through different instruments and styles. The project began in a small wooden attic and found its shape in the streets. From Franconian Switzerland, PRAYZ writes, performs and produces independently.",
    storyCta: "Read the story",
    facts: [["Home", "Franconian Switzerland"], ["Sound", "Organic indie folk"], ["Live", "Solo · acoustic · multilingual"]],
    proLabel: "Press · labels · festivals", proTitle: "Everything needed.<br>Nothing inflated.",
    proCopy: "Biography, release information, verified coverage, live profile and direct contacts.",
    epk: "Open the EPK", booking: "Booking enquiry",
    pressTitle: "Early signals", pressItems: ["Illustrate Magazine · Interview", "Sinusoidal Music · Review", "Euro Indie Music Chart · Listing"],
    enter: "Choose your way in.", listenLabel: "Listen", worldsLabel: "Playlists & worlds", shopLabel: "Music & editions",
    supportLabel: "Support the road", stay: "Stay close.", stayCopy: "New songs, live dates and occasional notes from wherever the music leads next."
  },
  de: {
    file: "de/index.html", media: "../", lang: "de",
    kicker: "Indie-Folk, geprägt von der Straße · Fränkische Schweiz",
    hook: "Songs aus Bayern.<br>Für unterwegs.",
    releaseLine: "Transience · EP · jetzt draußen",
    listen: "Transience anhören", films: "Filme ansehen",
    chapter: "Aktuelles Kapitel", releaseCopy: "Vier Songs. Ein Blick in Bewegung.",
    themes: ["Perspektive", "Erinnerung", "Mut", "Loslassen"],
    allPlatforms: "Alle Plattformen", buyPhysical: "CD & Vinyl",
    shift: "Vielleicht liegt der nächste Schritt<br>nicht weiter weg.",
    shiftCopy: "Vielleicht beginnt er mit ein wenig Abstand.",
    shiftNote: "Mountain Day hat die Tür geöffnet. Transience zieht weiter.",
    filmsLabel: "Drei Filme · ein Kapitel", filmsTitle: "Gesehen von<br>unterwegs.",
    filmsCopy: "Kein Feed. Kein Lärm. Nur Momente aus dem Release, vom Berg und aus Salzburg.",
    filmLabels: ["Release-Short", "Offizieller Short", "Street Clip"],
    liveLabel: "Live & Booking", liveTitle: "Eine Stimme.<br>Eine schwarze Gitarre.<br>Rhythmus unter den Füßen.",
    liveCopy: "Eigene Songs, ausgewählte Covers und Raum für den Moment. Ein kompaktes Soloformat für Festivals, kleine Bühnen, Straßen und Open Air.",
    liveCta: "Live entdecken", watchSalzburg: "Salzburg ansehen",
    storyLabel: "Die Geschichte", storyTitle: "Auf einem Hügel<br>wurde Musik zum Kompass.",
    storyCopy: "Dieser Moment öffnete einen autodidaktischen Weg durch verschiedene Instrumente und Stile. Das Projekt begann auf einem kleinen Dachboden aus Holz und fand auf der Straße seine Form. In der Fränkischen Schweiz schreibt, spielt und produziert PRAYZ unabhängig.",
    storyCta: "Die Geschichte lesen",
    facts: [["Zuhause", "Fränkische Schweiz"], ["Sound", "Organischer Indie-Folk"], ["Live", "Solo · akustisch · mehrsprachig"]],
    proLabel: "Presse · Labels · Festivals", proTitle: "Alles Wesentliche.<br>Nichts aufgeblasen.",
    proCopy: "Biografie, Release-Informationen, verifizierte Presse, Live-Profil und direkte Kontakte.",
    epk: "EPK öffnen", booking: "Booking anfragen",
    pressTitle: "Erste Signale", pressItems: ["Illustrate Magazine · Interview", "Sinusoidal Music · Rezension", "Euro Indie Music Chart · Listing"],
    enter: "Wähl deinen Einstieg.", listenLabel: "Anhören", worldsLabel: "Playlists & Welten", shopLabel: "Musik & Editionen",
    supportLabel: "Die Reise unterstützen", stay: "Bleib nah.", stayCopy: "Neue Songs, Live-Termine und ab und zu eine Nachricht von dort, wohin die Musik als Nächstes führt."
  },
  fr: {
    file: "fr/index.html", media: "../", lang: "fr",
    kicker: "Indie folk façonné au contact de la rue · Suisse franconienne",
    hook: "Des chansons de Bavière.<br>Faites pour voyager.",
    releaseLine: "Transience · EP · disponible",
    listen: "Écouter Transience", films: "Voir les films",
    chapter: "Chapitre actuel", releaseCopy: "Quatre chansons. Un regard en mouvement.",
    themes: ["Perspective", "Mémoire", "Courage", "Lâcher-prise"],
    allPlatforms: "Toutes les plateformes", buyPhysical: "CD & vinyle",
    shift: "Le prochain pas n’est peut-être<br>pas plus loin.",
    shiftCopy: "Il commence peut-être par un peu de distance.",
    shiftNote: "Mountain Day a ouvert la porte. Transience poursuit sa route.",
    filmsLabel: "Trois films · un chapitre", filmsTitle: "Vu depuis<br>la route.",
    filmsCopy: "Pas de fil. Pas de bruit. Seulement des moments de la sortie, de la montagne et de Salzbourg.",
    filmLabels: ["Short de sortie", "Short officiel", "Street Clip"],
    liveLabel: "Live & booking", liveTitle: "Une voix.<br>Une guitare noire.<br>Le rythme sous le pied.",
    liveCopy: "Chansons originales, reprises choisies et de la place pour le moment. Un format solo compact pour festivals, petites salles, rues et plein air.",
    liveCta: "Découvrir le live", watchSalzburg: "Voir Salzbourg",
    storyLabel: "L’histoire", storyTitle: "Sur une colline,<br>la musique est devenue une boussole.",
    storyCopy: "Ce moment a ouvert un parcours autodidacte à travers différents instruments et styles. Le projet a commencé dans un petit grenier en bois avant de trouver sa forme dans la rue. Depuis la Suisse franconienne, PRAYZ écrit, interprète et produit en toute indépendance.",
    storyCta: "Lire l’histoire",
    facts: [["Chez soi", "Suisse franconienne"], ["Son", "Indie folk organique"], ["Live", "Solo · acoustique · multilingue"]],
    proLabel: "Presse · labels · festivals", proTitle: "Tout l’essentiel.<br>Rien d’exagéré.",
    proCopy: "Biographie, informations de sortie, presse vérifiée, profil live et contacts directs.",
    epk: "Ouvrir l’EPK", booking: "Demande de booking",
    pressTitle: "Premiers signaux", pressItems: ["Illustrate Magazine · Interview", "Sinusoidal Music · Chronique", "Euro Indie Music Chart · Classement"],
    enter: "Choisissez votre entrée.", listenLabel: "Écouter", worldsLabel: "Playlists & univers", shopLabel: "Musique & éditions",
    supportLabel: "Soutenir la route", stay: "Rester proche.", stayCopy: "Nouvelles chansons, dates live et quelques nouvelles de là où la musique nous emmène ensuite."
  }
};

const tracks = [
  ["01", "Mountain Day", "https://listen.music-hub.com/5JnBx3"],
  ["02", "High Week", "https://listen.music-hub.com/0GJSF1"],
  ["03", "Big Jump", "https://listen.music-hub.com/icif7V"],
  ["04", "Transcendance", "https://listen.music-hub.com/gWgPQa"]
];

const films = [
  ["Transience", "transience-ep-short.mp4", "transience.jpg"],
  ["Mountain Day", "mountain-day-reel.mp4", "artist-cornfield-hero.jpg"],
  ["Salzburg", "transience-tour-salzburg-teaser.mp4", "artist-live-forest.jpg"]
];

function extractNewsletter(html) {
  const start = html.indexOf('    <section class="newsletter-section');
  if (start < 0) return "";
  const end = html.indexOf("    </section>", start);
  return end < 0 ? "" : html.slice(start, end + 14);
}

function createMain(c, newsletter) {
  const image = (name) => `${c.media}images/${name}`;
  const page = (name) => `pages/${name}.html`;
  const trackRows = tracks.map(([number, title, href], index) => `<a href="${href}" target="_blank" rel="noopener noreferrer"><span>${number}</span><strong>${title}</strong><em>${c.themes[index]}</em><b aria-hidden="true">↗</b></a>`).join("\n");
  const filmCards = films.map(([title, video, poster], index) => `<article class="pv-film reveal"><div class="pv-film__media"><video class="reel-card__video" controls playsinline preload="metadata" poster="${image(poster)}" aria-label="${title} · ${c.filmLabels[index]}"><source src="${image(video)}" type="video/mp4"></video><span>0${index + 1}</span></div><p>${c.filmLabels[index]}</p><h3>${title}</h3></article>`).join("\n");
  const pressLinks = [
    "https://illustratemagazine.com/exclusive-interview-with-prayzvibes/",
    "https://sinusoidalmusic.com/reviews/music-reviews/prayzvibes-high-week-indie-single-review/",
    "https://meiweb.it/indie-music-like/torna-anche-settimana-leuro-indie-music-chart-in-testa-tony-mack-3/"
  ];

  return `  <main id="main-content" class="pv-home">
    <section class="pv-hero" id="top" aria-labelledby="pv-hero-title">
      <img class="pv-hero__image" src="${image("artist-cornfield-hero.jpg")}" alt="PRAYZVIBES with a black acoustic guitar in a field">
      <div class="pv-hero__shade" aria-hidden="true"></div>
      <div class="pv-hero__content">
        <p class="pv-kicker">${c.kicker}</p>
        <h1 id="pv-hero-title"><span>PRAYZ</span><span>VIBES</span></h1>
        <p class="pv-hero__hook">${c.hook}</p>
        <div class="pv-actions"><a class="pv-button pv-button--light" href="https://prayzvibes.bandcamp.com/album/prayzvibes-transience" target="_blank" rel="noopener noreferrer">${c.listen}</a><a class="pv-text-link" href="#films">${c.films} <span>↓</span></a></div>
      </div>
      <a class="pv-release-note" href="#music"><span>${c.releaseLine}</span><b>↘</b></a>
    </section>

    <section class="pv-release" id="music" aria-labelledby="pv-release-title">
      <div class="pv-release__art reveal"><img src="${image("transience-logo-web.webp")}" alt="Transience EP artwork"><span>07 · 08 · 2026</span></div>
      <div class="pv-release__content reveal"><p class="pv-kicker">${c.chapter}</p><h2 id="pv-release-title">TRANSIENCE</h2><p class="pv-release__line">${c.releaseCopy}</p><div class="pv-tracklist">${trackRows}</div><div class="pv-actions"><a class="pv-button pv-button--dark" href="https://prayzvibes.bandcamp.com/album/prayzvibes-transience" target="_blank" rel="noopener noreferrer">${c.allPlatforms}</a><a class="pv-text-link pv-text-link--dark" href="https://elasticstage.com/prayzvibes/releases/transience-singleep" target="_blank" rel="noopener noreferrer">${c.buyPhysical} <span>↗</span></a></div></div>
    </section>

    <section class="pv-shift"><div class="pv-shift__copy reveal"><p class="pv-kicker">Mountain Day</p><h2>${c.shift}</h2><p>${c.shiftCopy}</p><span>${c.shiftNote}</span></div><div class="pv-shift__image reveal"><img src="${image("mountain-day.jpg")}" alt="Mountain Day artwork"></div></section>

    <section class="pv-films" id="films" aria-labelledby="pv-films-title"><header class="pv-heading reveal"><p class="pv-kicker">${c.filmsLabel}</p><h2 id="pv-films-title">${c.filmsTitle}</h2><p>${c.filmsCopy}</p></header><div class="pv-film-grid">${filmCards}</div></section>

    <section class="pv-live" id="live-preview" aria-labelledby="pv-live-title"><div class="pv-live__media reveal"><div class="video-consent" data-video-id="wAsCW6AL5iY" data-video-title="TRANSIENCE TOUR — Chapter 1: Salzburg"><img src="${image("artist-live-forest.jpg")}" alt="PRAYZVIBES seated outdoors with an acoustic guitar"><div class="video-shade" aria-hidden="true"></div><button class="video-load" type="button"><span aria-hidden="true">▶</span> ${c.watchSalzburg}</button></div></div><div class="pv-live__copy reveal"><p class="pv-kicker">${c.liveLabel}</p><h2 id="pv-live-title">${c.liveTitle}</h2><p>${c.liveCopy}</p><a class="pv-button pv-button--light" href="${page("live")}">${c.liveCta}</a></div></section>

    <section class="pv-story" id="about" aria-labelledby="pv-story-title"><div class="pv-story__copy reveal"><p class="pv-kicker">${c.storyLabel}</p><h2 id="pv-story-title">${c.storyTitle}</h2><p>${c.storyCopy}</p><a class="pv-text-link pv-text-link--dark" href="${page("about")}">${c.storyCta} <span>→</span></a></div><div class="pv-story__portrait reveal"><img src="${image("artist-cornfield-about.jpg")}" alt="Portrait of PRAYZVIBES with acoustic guitar"></div><dl class="pv-facts">${c.facts.map(([term, value]) => `<div><dt>${term}</dt><dd>${value}</dd></div>`).join("")}</dl></section>

    <section class="pv-professional" id="press" aria-labelledby="pv-professional-title"><div class="pv-professional__intro reveal"><p class="pv-kicker">${c.proLabel}</p><h2 id="pv-professional-title">${c.proTitle}</h2><p>${c.proCopy}</p><div class="pv-actions"><a class="pv-button pv-button--light" href="${page("epk")}">${c.epk}</a><a class="pv-button pv-button--outline" href="mailto:booking@prayzvibes.com">${c.booking}</a></div></div><div class="pv-press"><p>${c.pressTitle}</p>${c.pressItems.map((item, index) => `<a href="${pressLinks[index]}" target="_blank" rel="noopener noreferrer"><span>0${index + 1}</span><strong>${item}</strong><b>↗</b></a>`).join("")}</div></section>

    <section class="pv-explore" id="listen" aria-labelledby="pv-explore-title"><header><p class="pv-kicker">PRAYZVIBES</p><h2 id="pv-explore-title">${c.enter}</h2></header><div class="pv-explore__grid"><div><h3>${c.listenLabel}</h3><a href="https://listen.music-hub.com/5JnBx3" target="_blank" rel="noopener noreferrer">All platforms ↗</a><a href="https://open.spotify.com/artist/3JEChrOjEFJkgIKf8rvKLO" target="_blank" rel="noopener noreferrer">Spotify ↗</a><a href="https://www.youtube.com/@prayzvibes" target="_blank" rel="noopener noreferrer">YouTube ↗</a><a href="https://prayzvibes.bandcamp.com/" target="_blank" rel="noopener noreferrer">Bandcamp ↗</a></div><div id="worlds"><h3>${c.worldsLabel}</h3><a href="https://open.spotify.com/playlist/0Qlhm9KHhAuczNnpgyADT3" target="_blank" rel="noopener noreferrer">PRAYZ LIFE ↗</a><a href="https://open.spotify.com/playlist/5FbyN1Rs6E0v1HGEfBivga" target="_blank" rel="noopener noreferrer">PRAYZ STREETS ↗</a><a href="https://open.spotify.com/playlist/3F4q7LOlrP1hnkQUBlHz60" target="_blank" rel="noopener noreferrer">PRAYZ & CO ↗</a><a href="https://open.spotify.com/playlist/0CPFAsBogOHppa1epmYLNO" target="_blank" rel="noopener noreferrer">PRAYZ REMIX ↗</a></div><div id="shop"><h3>${c.shopLabel}</h3><a href="https://prayzvibes.bandcamp.com/" target="_blank" rel="noopener noreferrer">Bandcamp ↗</a><a href="https://elasticstage.com/prayzvibes" target="_blank" rel="noopener noreferrer">ElasticStage ↗</a><a href="https://prayzvibes-shop.fourthwall.com/" target="_blank" rel="noopener noreferrer">Fourthwall ↗</a><a id="support" href="https://ko-fi.com/prayzvibes" target="_blank" rel="noopener noreferrer">${c.supportLabel} ↗</a></div></div></section>

    <section class="pv-stay"><p class="pv-kicker">${c.stay}</p><h2>${c.stayCopy}</h2></section>
${newsletter}
  </main>`;
}

for (const c of Object.values(languages)) {
  const filePath = path.join(root, ...c.file.split("/"));
  let html = fs.readFileSync(filePath, "utf8");
  const newsletter = extractNewsletter(html);
  const start = html.indexOf('  <main id="main-content"');
  const end = html.indexOf("  </main>", start);
  if (start < 0 || end < 0) throw new Error(`Missing main in ${c.file}`);
  html = html.slice(0, start) + createMain(c, newsletter) + html.slice(end + 9);
  html = html.replace(/\n\s*<link rel="stylesheet" href="(?:\.\.\/)?studio\.css">/, "");
  if (!html.includes("final.css")) html = html.replace(/(<link rel="stylesheet" href="(?:\.\.\/)?style\.css">)/, `$1\n  <link rel="stylesheet" href="${c.media}final.css">`);
  fs.writeFileSync(filePath, html, "utf8");
}

for (const relativePath of fs.readdirSync(root, { recursive: true })) {
  if (!relativePath.endsWith(".html")) continue;
  const filePath = path.join(root, relativePath);
  let html = fs.readFileSync(filePath, "utf8");
  html = html
    .replace(/\sdata-(?:before|single|ep|after)-(?:label|href|text)="[^"]*"/g, "")
    .replace(/\sdata-release-date="[^"]*"/g, "")
    .replace(/\bcampaign-switch\b/g, "")
    .replace(/\brelease-switch\b/g, "")
    .replace(/\bcampaign-text\b/g, "")
    .replace(/\brelease-text\b/g, "")
    .replace(/class="\s+/g, 'class="')
    .replace(/\s+"/g, '"');
  html = html.replace(/\n\s*<link rel="stylesheet" href="(?:\/|(?:\.\.\/)*)studio\.css">/, "");
  if (html.includes("final.css") || /http-equiv="refresh"/i.test(html)) {
    fs.writeFileSync(filePath, html, "utf8");
    continue;
  }
  const depth = relativePath.split(path.sep).length - 1;
  const prefix = "../".repeat(depth);
  html = html.replace(/(<link rel="stylesheet" href="(?:\/|(?:\.\.\/)*)style\.css">)/, `$1\n  <link rel="stylesheet" href="${relativePath.endsWith("404.html") ? "/" : prefix}final.css">`);
  fs.writeFileSync(filePath, html, "utf8");
}

console.log("Built the final evaluated PRAYZVIBES draft.");
