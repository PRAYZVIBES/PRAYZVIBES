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

  if (!redirect && !/atelier-world\.css/.test(html)) fail(`${htmlFile}: atelier-world.css is missing`);
  if (!redirect && /href=["'][^"']*(?:final|street-editorial|pasteup|atelier|material|atelier-workroom|atelier-spaces)\.css/.test(html)) fail(`${htmlFile}: superseded design layer is still loaded`);
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
  ["en", /This is paid partner content, as labelled by TJPL/i],
  ["de", /Der Beitrag ist bezahlter Partnerinhalt, wie von TJPL gekennzeichnet/i],
  ["fr", /Il s’agit d’un contenu sponsorisé, signalé comme tel par TJPL/i],
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
  if (/pv-atlas-host|data-pv-tag/.test(html)) fail(`${homepage}: synthetic outdoor atlas trace remains`);
  if ((html.match(/data-room-link=/g) || []).length !== 3) fail(`${homepage}: expected the three-room Living Current rail`);
  for (const room of ["outside", "atelier", "stage"]) {
    if (!html.includes(`data-room-link="${room}"`)) fail(`${homepage}: missing ${room} room link`);
  }
  if (!/data-share-berlin/.test(html)) fail(`${homepage}: missing Berlin sharing action`);
  if (!/downloads\/prayzvibes-wabe-berlin-2026-11-04\.ics/.test(html)) fail(`${homepage}: missing Berlin calendar download`);
  if (/pv-studio-resonance/.test(html)) fail(`${homepage}: detached CREATE RESONANCE collage remains outside Living Charge`);
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
  if (!/mountain-day-reel-poster\.jpg/.test(html)) fail(`${homepage}: missing original Mountain Day film thumbnail`);
  if (!/transience-tour-salzburg-teaser\.mp4/.test(html)) fail(`${homepage}: missing Salzburg live proof`);
  if (!/poster=["'][^"']*artist-live-salzburg-13s55-e11f9305ea66-720\.webp["']/.test(html)) fail(`${homepage}: Salzburg film must use its real performance still`);
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

// Validate the stylesheet actually loaded by v23, not the archived cascade.
const css = fs.readFileSync(path.join(root, "atelier-world.css"), "utf8");
const openBraces = (css.match(/{/g) || []).length;
const closeBraces = (css.match(/}/g) || []).length;
if (openBraces !== closeBraces) fail(`atelier-world.css: brace mismatch ${openBraces}/${closeBraces}`);
if (!/html\s*{\s*font-size:\s*18px/.test(css)) fail("atelier-world.css: base type is below the agreed size");
const rootSizes = [...css.matchAll(/html\s*{[^}]*font-size:\s*([^;}]+)/g)].map(match => match[1].trim());
if (rootSizes.some(size => size !== '18px')) fail("atelier-world.css: mobile or conditional root type shrinks below the 18px baseline");
if (!/@media \(max-width: 520px\)/.test(css) || !/@media \(max-width: 900px\)/.test(css)) fail("atelier-world.css: responsive layout safeguards are missing");

for (const asset of ["fonts/PermanentMarker-Regular.ttf", "fonts/PermanentMarker-Apache-2.0.txt"]) {
  if (!fs.existsSync(path.join(root, asset))) fail(`${asset}: local graffiti font asset is missing`);
}
if (!/font-family:\s*["']PV Permanent Marker["']/.test(css)) fail("atelier-world.css: local graffiti font face is missing");

const editorialHeroAssets = [
  "images/artist-cornfield-original-press-480.webp",
  "images/artist-cornfield-original-press-800.webp",
  "images/artist-cornfield-original-press-941.webp",
  "images/artist-cornfield-about.jpg",
  "images/artist-cornfield-epk.jpg",
  "images/artist-live-forest.jpg",
  "images/artist-live-salzburg-13s55-e11f9305ea66-720.webp",
  "images/mountain-day-reel-poster.jpg",
];
for (const asset of editorialHeroAssets) {
  if (!fs.existsSync(path.join(root, asset))) fail(`${asset}: editorial homepage cover asset is missing`);
}

for (const file of ["index.html", "de/index.html", "fr/index.html"]) {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  if (/pv-street-gallery|living-charge-street/.test(html)) fail(`${file}: small street-art gallery should be removed`);
  if (!html.includes("images/artist-cornfield-original-press-800.webp")) fail(`${file}: responsive derivative of original B photo is not active on the homepage`);
  if (!html.includes("images/living-charge/mark-see-clearly.svg")) fail(`${file}: original SEE CLEARLY mark is missing`);
  if (!html.includes("images/artist-live-forest.jpg")) fail(`${file}: original E forest photo is missing`);
  for (const mark of ["see-clearly", "listen-deeply", "create-resonance", "live-consciously"]) {
    if (!html.includes(`images/living-charge/mark-${mark}.svg`)) fail(`${file}: original Living Charge mark ${mark} is missing`);
  }
}

for (const file of ["pages/live.html", "de/pages/live.html", "fr/pages/live.html"]) {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  if (!/id=["']dates["']/.test(html)) fail(`${file}: live-dates overview is missing`);
  if (!html.includes('datetime="2026-11-04T20:00:00+01:00"')) fail(`${file}: confirmed Berlin date is missing from the schedule`);
}

const originalMarkAssets = [
  "images/living-charge/mark-see-clearly.svg",
  "images/living-charge/mark-listen-deeply.svg",
  "images/living-charge/mark-create-resonance.svg",
  "images/living-charge/mark-live-consciously.svg",
];
const originalMarkSources = [
  css,
  ...htmlFiles.map((file) => fs.readFileSync(path.join(root, file), "utf8")),
].join("\n");
for (const asset of originalMarkAssets) {
  if (!fs.existsSync(path.join(root, asset))) fail(`${asset}: original Living Charge mark is missing`);
  if (!originalMarkSources.includes(asset)) fail(`site: original Living Charge mark is not referenced: ${asset}`);
}
if (/images\/thresholds\/journey-0[1-5]/.test(css)) fail("atelier-world.css: legacy cinematic journey imagery is still active");
if (/\.pv-path[^{}]*::after\s*{[^}]*url\(/.test(css)) fail("atelier-world.css: a decorative journey overlay has returned");

const atelierMaterial = "images/atelier-v25-material-wall-1920.webp";
if (!fs.existsSync(path.join(root, atelierMaterial))) fail(`${atelierMaterial}: photorealistic atelier material is missing`);
if (!css.includes(atelierMaterial)) fail(`${atelierMaterial}: atelier material is not referenced`);
if (/outdoor-graffiti-atlas-v2/.test(css)) fail("atelier-world.css: synthetic outdoor atlas is still active");

const berlinPanelAssets = [
  "images/events/arno-zillmers-open-mic-original-v14.jpg",
  "images/artist-live-forest.jpg",
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
const expectedAssetVersions = new Map([
  ['atelier-world.css', '20260906-atelier-v23'],
  ['script.js', '20260905-local-refinement-v9'],
]);
for (const [file, html] of renderedPages) {
  for (const [asset, version] of expectedAssetVersions) {
    const normalizedFile = file.replaceAll('\\', '/');
    const homepage = /^(?:de\/|fr\/)?index\.html$/.test(normalizedFile);
    const expectedVersion = asset === 'atelier-world.css' && homepage
      ? '20260906-living-current-v25'
      : version;
    const refs = [...html.matchAll(new RegExp(asset.replace('.', '\\.') + '\\?v=([^"\']+)', 'g'))];
    if (refs.length !== 1 || refs[0]?.[1] !== expectedVersion) fail(`${file}: expected one ${asset}?v=${expectedVersion} reference`);
  }
}

for (const file of ["index.html", "de/index.html", "fr/index.html"]) {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  if (!/atelier-world\.js\?v=20260906-living-current-v25/.test(html)) fail(`${file}: homepage Living Current script version is stale`);
}

if (errors.length) {
  console.error(`Validation failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Validated ${htmlFiles.length} HTML files and ${localReferences} local references.`);
console.log("Release state, Juniper removal, encoding, IDs, media, JavaScript and responsive type safeguards all pass.");
