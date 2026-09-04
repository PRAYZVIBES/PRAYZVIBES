import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const files = fs.readdirSync(root, { recursive: true }).filter((file) => typeof file === "string");
const htmlFiles = files.filter((file) => file.endsWith(".html"));
const publishableFiles = files.filter((file) => /\.(?:html|css|js|xml|json|webmanifest|md)$/i.test(file));
const errors = [];
let localReferences = 0;

function fail(message) {
  errors.push(message);
}

function isExternal(reference) {
  return /^(?:https?:|mailto:|tel:|data:|javascript:|#)/i.test(reference);
}

function resolveReference(htmlFile, reference) {
  const clean = reference.split(/[?#]/)[0];
  if (!clean || isExternal(reference)) return null;
  return clean.startsWith("/")
    ? path.join(root, clean.slice(1))
    : path.resolve(path.dirname(path.join(root, htmlFile)), clean);
}

for (const htmlFile of htmlFiles) {
  const absolute = path.join(root, htmlFile);
  const html = fs.readFileSync(absolute, "utf8");
  const redirect = /http-equiv=["']refresh["']/i.test(html);
  const normalizedHtmlFile = htmlFile.replaceAll("\\", "/");

  if (!redirect && !/final\.css/.test(html)) fail(`${htmlFile}: final.css is missing`);
  if (/studio\.css/.test(html)) fail(`${htmlFile}: stale studio.css reference`);
  if (!redirect && /^(?:de\/|fr\/)?pages\/.+\.html$/.test(normalizedHtmlFile)) {
    const shopNavLinks = (html.match(/href=["']\.\.\/index\.html#shop["']/g) || []).length;
    if (shopNavLinks !== 2) fail(`${htmlFile}: expected Shop in desktop and mobile navigation`);
  }

  const ids = [...html.matchAll(/\sid=["']([^"']+)["']/gi)].map((match) => match[1]);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length) fail(`${htmlFile}: duplicate IDs: ${[...new Set(duplicates)].join(", ")}`);

  for (const image of html.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\salt=["'][^"']*["']/i.test(image[0])) fail(`${htmlFile}: image without alt text`);
  }

  for (const anchor of html.matchAll(/<a\b[^>]*\starget=["']_blank["'][^>]*>/gi)) {
    const rel = anchor[0].match(/\srel=["']([^"']+)["']/i)?.[1] ?? "";
    if (!rel.split(/\s+/).includes("noopener")) fail(`${htmlFile}: target=_blank link without noopener`);
  }

  for (const aria of html.matchAll(/\s(?:aria-labelledby|aria-describedby|aria-controls)=["']([^"']+)["']/gi)) {
    for (const id of aria[1].trim().split(/\s+/)) {
      if (id && !ids.includes(id)) fail(`${htmlFile}: unresolved ARIA reference #${id}`);
    }
  }

  for (const link of html.matchAll(/\shref=["']([^"']*#([^"']+))["']/gi)) {
    const reference = link[1];
    if (/^(?:https?:|mailto:|tel:|javascript:)/i.test(reference)) continue;
    const [filePart, rawFragment] = reference.split("#", 2);
    const target = filePart ? resolveReference(htmlFile, filePart) : absolute;
    if (!target || !fs.existsSync(target) || path.extname(target).toLowerCase() !== ".html") continue;
    let fragment = rawFragment;
    try { fragment = decodeURIComponent(rawFragment); } catch {}
    const targetHtml = fs.readFileSync(target, "utf8");
    if (!new RegExp(`\\sid=["']${fragment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`).test(targetHtml)) {
      fail(`${htmlFile}: unresolved fragment ${reference}`);
    }
  }

  for (const match of html.matchAll(/\s(?:src|href|poster)=["']([^"']+)["']/gi)) {
    const target = resolveReference(htmlFile, match[1]);
    if (!target) continue;
    localReferences += 1;
    if (!fs.existsSync(target)) fail(`${htmlFile}: missing local reference ${match[1]}`);
  }
}

const homepageLocales = new Map([
  ["index.html", "en"],
  ["de/index.html", "de"],
  ["fr/index.html", "fr"],
]);

const tjplDisclosureByLocale = new Map([
  ["en", /participation is paid partner content/i],
  ["de", /Teilnahme von PRAYZVIBES ist bezahlter Partnerinhalt/i],
  ["fr", /participation de PRAYZVIBES est un contenu partenaire rémunéré/i],
]);

for (const [homepage, locale] of homepageLocales) {
  const html = fs.readFileSync(path.join(root, homepage), "utf8");
  for (const id of ["watch", "music", "live-preview", "about", "shop", "support", "epk"]) {
    if (!new RegExp(`id=["']${id}["']`).test(html)) fail(`${homepage}: missing #${id}`);
  }
  if ((html.match(/<h1\b/g) || []).length !== 1) fail(`${homepage}: expected exactly one h1`);
  const editorialFilms = [...html.matchAll(/\bclass=["']([^"']*)["']/g)]
    .filter((match) => match[1].split(/\s+/).includes("pv-film"));
  if (editorialFilms.length !== 0) fail(`${homepage}: legacy three-film rail is still present`);
  if (!/class=["'][^"']*pv-mountain\b/.test(html)) fail(`${homepage}: missing fan-first Mountain Day chapter`);
  if (!/class=["'][^"']*pv-story--fan-first\b/.test(html)) fail(`${homepage}: missing fan-first story chapter`);
  if ((html.match(/class=["'][^"']*pv-shop-feature\b/g) || []).length !== 1) fail(`${homepage}: expected one Living Charge shop feature`);
  if ((html.match(/href=["']#shop["']/g) || []).length < 2) fail(`${homepage}: expected Shop in desktop and mobile navigation`);
  if (!/href=["']https:\/\/prayzvibes-shop\.fourthwall\.com\/collections\/all["']/.test(html)) fail(`${homepage}: missing verified Living Charge collection link`);
  for (const signal of ["SEE CLEARLY", "LISTEN DEEPLY", "CREATE RESONANCE", "LIVE CONSCIOUSLY"]) {
    if (!html.includes(signal)) fail(`${homepage}: missing Living Charge signal ${signal}`);
  }
  if ((html.match(/class=["'][^"']*pv-shop-feature__product-link\b/g) || []).length !== 4) fail(`${homepage}: expected four direct Living Charge product links`);
  if ((html.match(/class=["'][^"']*pv-support-note\b/g) || []).length !== 1) fail(`${homepage}: expected one homepage support invitation`);
  if (!/class=["'][^"']*pv-support-note\b[\s\S]*?href=["']pages\/support\.html["']/.test(html)) fail(`${homepage}: homepage support invitation does not reach the localized support page`);
  if (!/id=["']next-release["']/.test(html)) fail(`${homepage}: missing fan-facing Eagle Spirit destination`);
  if (!/data-native-preview/.test(html) || !/data-preview-progress/.test(html) || !/data-preview-continue/.test(html)) fail(`${homepage}: incomplete Mountain Day listening ladder`);
  if (!/data-preview-dock/.test(html)) fail(`${homepage}: missing opt-in Mountain Day mini player`);
  if (!/data-native-film/.test(html) || !/data-native-film-play/.test(html) || !/data-native-film-end-card/.test(html)) fail(`${homepage}: incomplete Salzburg viewing ladder`);
  if (!/href=["']https:\/\/www\.youtube\.com\/shorts\/8YVRH68o0Rk["']/.test(html)) fail(`${homepage}: missing Mountain Day YouTube Short link`);
  if (!/href=["']https:\/\/www\.instagram\.com\/reel\/Dbt-fOaIXEH\/["']/.test(html)) fail(`${homepage}: missing Mountain Day Instagram Reel link`);
  if (!/href=["']https:\/\/www\.youtube\.com\/shorts\/wAsCW6AL5iY["']/.test(html)) fail(`${homepage}: missing Salzburg YouTube Short link`);
  if ((html.match(/\sdata-social-video(?:\s|>)/g) || []).length !== 3) fail(`${homepage}: expected three social video links`);
  if (!/data-video-id=["']8YVRH68o0Rk["']/.test(html)) fail(`${homepage}: missing current Mountain Day short`);
  if (!/06-mountain-day-integrated-v4\.jpg/.test(html)) fail(`${homepage}: missing integrated Mountain Day poster collage`);
  if (!/transience-tour-salzburg-teaser\.mp4/.test(html)) fail(`${homepage}: missing Salzburg live proof`);
  if (!/05-salzburg-create-resonance-integrated-v4\.jpg/.test(html)) fail(`${homepage}: missing integrated Salzburg poster collage`);
  if (!/id=["']sib-form["']/.test(html)) fail(`${homepage}: missing Brevo form`);
  if (!/name=["']EMAIL["'][^>]*required/.test(html)) fail(`${homepage}: missing required newsletter email field`);
  if (!/name=["']newsletter_consent["'][^>]*required/.test(html)) fail(`${homepage}: missing required newsletter consent`);
  if (!/name=["']email_address_check["']/.test(html)) fail(`${homepage}: missing Brevo honeypot`);
  if (!new RegExp(`name=["']locale["']\\s+value=["']${locale}["']`).test(html)) fail(`${homepage}: wrong Brevo locale`);
  if (/class=["'][^"']*pv-hero-press\b/.test(html)) fail(`${homepage}: obsolete TJPL homepage hero badge remains`);
  if (!/href=["']pages\/press-tjpl\.html["']/.test(html)) fail(`${homepage}: TJPL Issue 45 press record does not reach the localized context page`);
  if (!/id=["']berlin-2026-11-04["']/.test(html)) fail(`${homepage}: missing confirmed Berlin guest date`);
  if (!/"@type":\s*"MusicEvent"/.test(html)) fail(`${homepage}: missing Berlin MusicEvent structured data`);
  if (/pv-explore|pv-merch|first-response-coin/i.test(html)) fail(`${homepage}: legacy utility or symbolic-coin content remains`);
  if (/\b(?:Andreas|engineer|engineering|Ingenieur|Energietechnik|ingénieur|ingénierie)\b/i.test(html)) fail(`${homepage}: private name or engineering biography remains`);
}

const removedTjplPdf = path.join(root, "downloads", "tjpl-news-issue-45-prayzvibes-cover-feature.pdf");
if (fs.existsSync(removedTjplPdf)) fail("downloads: removed TJPL Issue 45 PDF is still publicly packaged");
for (const [page, locale] of [["pages/press-tjpl.html", "en"], ["de/pages/press-tjpl.html", "de"], ["fr/pages/press-tjpl.html", "fr"]]) {
  const html = fs.readFileSync(path.join(root, page), "utf8");
  if (!/href=["']https:\/\/www\.tjplnews\.com\/post\/tjpl-news-magazine-issue-45-september-2026["']/.test(html)) fail(`${page}: missing direct official TJPL Issue 45 link`);
  if (/https:\/\/www\.tjplnews\.com\/magazine["']/.test(html)) fail(`${page}: generic TJPL magazine link remains`);
  if (!/PRAYZVIBES climbs above the surrounding noise in search of a different perspective on (?:&lsquo;|‘)Mountain Day(?:&rsquo;|’)/.test(html)) fail(`${page}: missing short attributed TJPL excerpt`);
  if (/cover (?:story|feature|collaboration|partnership)|full-page|appears on the cover|ganzseit|auf dem Cover|dossier de couverture|en couverture|pleine page/i.test(html)) fail(`${page}: false TJPL cover or full-page claim remains`);
  if (!/artist poster|Künstlerposter|Affiche artiste/i.test(html)) fail(`${page}: TJPL image is not identified as the supplied artist poster`);
  if (!tjplDisclosureByLocale.get(locale)?.test(html)) fail(`${page}: missing localized TJPL paid-partnership disclosure`);
}

for (const page of ["pages/live.html", "de/pages/live.html", "fr/pages/live.html"]) {
  const html = fs.readFileSync(path.join(root, page), "utf8");
  for (const signal of ["berlin-2026-11-04", "2026-11-04T20:00:00+01:00", "Schönfließer Straße 7", "10439 Berlin", "LimitedAvailability"]) {
    if (!html.includes(signal)) fail(`${page}: missing Berlin event signal ${signal}`);
  }
  if (!/"@type":"MusicEvent"/.test(html)) fail(`${page}: missing Berlin MusicEvent structured data`);
}

const headerPages = htmlFiles
  .map((file) => [file, fs.readFileSync(path.join(root, file), "utf8")])
  .filter(([, html]) => /<nav class=["']main-nav["']/.test(html));
if (headerPages.length !== 39) fail(`HTML: expected 39 header-bearing pages, found ${headerPages.length}`);
for (const [file, html] of headerPages) {
  const normalized = file.replaceAll("\\", "/");
  if (/^(?:de\/|fr\/)?index\.html$/.test(normalized)) continue;
  const supportLinks = [...html.matchAll(/<a\b[^>]*\bdata-nav-support\b[^>]*>/g)].map((match) => match[0]);
  if (supportLinks.length !== 2) fail(`${file}: expected Support in desktop and mobile navigation`);
  const expectedHref = /^(?:de\/|fr\/)?index\.html$/.test(normalized) ? "#support" : "support.html";
  if (supportLinks.filter((anchor) => new RegExp(`\\bhref=["']${expectedHref.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`).test(anchor)).length !== 2) {
    fail(`${file}: Support navigation points to the wrong destination`);
  }
  const currentCount = supportLinks.filter((anchor) => /\baria-current=["']page["']/.test(anchor)).length;
  if (/(?:^|\/)support\.html$/.test(normalized) ? currentCount !== 2 : currentCount !== 0) {
    fail(`${file}: wrong Support aria-current state`);
  }
}

for (const relative of publishableFiles) {
  const content = fs.readFileSync(path.join(root, relative), "utf8");
  if (/juniper\s*wild|juniperwild/i.test(content)) fail(`${relative}: forbidden Juniper reference`);
  if (/\b(?:pre-save|pre-order|presave|preorder|vorbestell|vormerk|précommand|pré-enregistr)/i.test(content)) {
    fail(`${relative}: obsolete pre-release wording`);
  }
  if (/Ã[\u0080-\u00BF]|Â[· ]|â(?:€|€™|€“|€”|†)/.test(content)) fail(`${relative}: probable encoding damage`);
}

const script = fs.readFileSync(path.join(root, "script.js"), "utf8");
try {
  new Function(script);
} catch (error) {
  fail(`script.js: ${error.message}`);
}

const css = fs.readFileSync(path.join(root, "final.css"), "utf8");
const openBraces = (css.match(/{/g) || []).length;
const closeBraces = (css.match(/}/g) || []).length;
if (openBraces !== closeBraces) fail(`final.css: brace mismatch ${openBraces}/${closeBraces}`);
if (!/html\s*{\s*font-size:\s*18px/.test(css)) fail("final.css: desktop base type is below the agreed size");
if (!/@media \(max-width: 640px\)[\s\S]*?html\s*{\s*font-size:\s*16\.5px/.test(css)) fail("final.css: mobile base type safeguard is missing");

for (const asset of ["fonts/PermanentMarker-Regular.ttf", "fonts/PermanentMarker-Apache-2.0.txt"]) {
  if (!fs.existsSync(path.join(root, asset))) fail(`${asset}: local graffiti font asset is missing`);
}
if (!css.includes('font-family: "PV Permanent Marker"')) fail("final.css: local graffiti font face is missing");

const editorialHeroAssets = [
  "images/photo-street-integrated-v4/01-hero-see-clearly-integrated-v4.jpg",
  "images/photo-street-integrated-v4/01-hero-see-clearly-integrated-v4-480.jpg",
  "images/photo-street-integrated-v4/01-hero-see-clearly-integrated-v4-800.jpg",
  "images/photo-street-integrated-v4/01-hero-see-clearly-integrated-v4-941.jpg",
  "images/photo-street-integrated-v4/02-story-integrated-v4.jpg",
  "images/photo-street-integrated-v4/03-epk-living-charge-integrated-v4.jpg",
  "images/photo-street-integrated-v4/04-live-forest-integrated-v4.jpg",
  "images/photo-street-integrated-v4/05-salzburg-create-resonance-integrated-v4.jpg",
  "images/photo-street-integrated-v4/06-mountain-day-integrated-v4.jpg",
];
for (const asset of editorialHeroAssets) {
  if (!fs.existsSync(path.join(root, asset))) fail(`${asset}: editorial homepage cover asset is missing`);
}

for (const file of ["index.html", "de/index.html", "fr/index.html"]) {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  const streetLinks = html.match(/class=["']pv-street-gallery__link["']/g) || [];
  const streetActions = html.match(/class=["']pv-street-gallery__cta["']/g) || [];
  if (streetLinks.length !== 4 || streetActions.length !== 4) {
    fail(`${file}: expected four functional street-gallery routes`);
  }
  if (!html.includes("01-hero-see-clearly-integrated-v4-800.jpg")) fail(`${file}: integrated street collage is not active on the homepage`);
}

for (const file of ["pages/live.html", "de/pages/live.html", "fr/pages/live.html"]) {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  if (!/id=["']dates["']/.test(html)) fail(`${file}: live-dates overview is missing`);
  if (!html.includes('datetime="2026-11-04T20:00:00+01:00"')) fail(`${file}: confirmed Berlin date is missing from the schedule`);
}

const streetSignalAssets = [
  "images/living-charge/street-signals/street-listen-deeply-v4.webp",
  "images/living-charge/street-signals/street-create-resonance-v4.webp",
  "images/living-charge/street-signals/street-see-clearly-v4.webp",
  "images/living-charge/street-signals/street-live-consciously-v4.webp",
  "images/living-charge/street-signals/street-living-charge-viaduct-full-v4.webp",
  "images/living-charge/street-signals/street-listen-deeply-full-v4.webp",
  "images/living-charge/street-signals/street-create-resonance-full-v4.webp",
  "images/living-charge/street-signals/street-live-consciously-full-v4.webp",
  "images/living-charge/street-signals/roller-line-v4.svg",
];
const streetSignalSources = [
  css,
  ...htmlFiles.map((file) => fs.readFileSync(path.join(root, file), "utf8")),
].join("\n");
for (const asset of streetSignalAssets) {
  if (!fs.existsSync(path.join(root, asset))) fail(`${asset}: street-signal asset is missing`);
  if (!streetSignalSources.includes(asset)) fail(`site: street-signal asset is not referenced: ${asset}`);
}
if (/images\/thresholds\/journey-0[1-5]/.test(css)) fail("final.css: legacy cinematic journey imagery is still active");
if (!/\.pv-path\[data-journey-path\]::after\s*{\s*content:\s*none;\s*}/.test(css)) fail("final.css: journey turtle overlay is not disabled");

const berlinPanelAssets = [
  "images/events/prayzvibes-berlin-open-mic-2026-11-04-home-panel-900x976.webp",
  "images/events/prayzvibes-berlin-open-mic-2026-11-04-live-panel-1600x1102.webp",
];
for (const asset of berlinPanelAssets) {
  if (!fs.existsSync(path.join(root, asset))) fail(`${asset}: Berlin panel asset is missing`);
  const basename = path.basename(asset);
  if (!htmlFiles.some((file) => fs.readFileSync(path.join(root, file), "utf8").includes(basename))) {
    fail(`${asset}: Berlin panel asset is not referenced by HTML`);
  }
}

const renderedPages = htmlFiles
  .map((file) => [file, fs.readFileSync(path.join(root, file), "utf8")])
  .filter(([, html]) => !/http-equiv=["']refresh["']/i.test(html));
const assetVersions = new Set();
for (const [file, html] of renderedPages) {
  for (const match of html.matchAll(/(?:final\.css|script\.js)\?v=([^"']+)/g)) assetVersions.add(match[1]);
  if ((html.match(/final\.css\?v=/g) || []).length !== 1) fail(`${file}: expected one versioned final.css reference`);
  if ((html.match(/script\.js\?v=/g) || []).length !== 1) fail(`${file}: expected one versioned script.js reference`);
}
const expectedAssetVersions = new Set(["20260904-original-photo-street-v1"]);
if ([...assetVersions].some((version) => !expectedAssetVersions.has(version)) || assetVersions.size !== expectedAssetVersions.size) {
  fail(`HTML: inconsistent asset versions: ${[...assetVersions].join(", ") || "none"}`);
}

if (errors.length) {
  console.error(`Validation failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Validated ${htmlFiles.length} HTML files and ${localReferences} local references.`);
console.log("Release state, Juniper removal, encoding, IDs, media, JavaScript and responsive type safeguards all pass.");
