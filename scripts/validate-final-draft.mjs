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

for (const [homepage, locale] of homepageLocales) {
  const html = fs.readFileSync(path.join(root, homepage), "utf8");
  for (const id of ["watch", "music", "live-preview", "about", "shop", "epk"]) {
    if (!new RegExp(`id=["']${id}["']`).test(html)) fail(`${homepage}: missing #${id}`);
  }
  if ((html.match(/<h1\b/g) || []).length !== 1) fail(`${homepage}: expected exactly one h1`);
  const editorialFilms = [...html.matchAll(/\bclass=["']([^"']*)["']/g)]
    .filter((match) => match[1].split(/\s+/).includes("pv-film"));
  if (editorialFilms.length !== 0) fail(`${homepage}: legacy three-film rail is still present`);
  if (!/class=["'][^"']*pv-mountain\b/.test(html)) fail(`${homepage}: missing fan-first Mountain Day chapter`);
  if (!/class=["'][^"']*pv-story--fan-first\b/.test(html)) fail(`${homepage}: missing fan-first story chapter`);
  if ((html.match(/class=["'][^"']*pv-shop-feature\b/g) || []).length !== 1) fail(`${homepage}: expected one Living Charge shop feature`);
  if ((html.match(/href=["']#shop["']/g) || []).length !== 2) fail(`${homepage}: expected Shop in desktop and mobile navigation`);
  if (!/href=["']https:\/\/prayzvibes-shop\.fourthwall\.com\/collections\/all["']/.test(html)) fail(`${homepage}: missing verified Living Charge collection link`);
  for (const signal of ["SEE CLEARLY", "LISTEN DEEPLY", "CREATE RESONANCE", "LIVE CONSCIOUSLY"]) {
    if (!html.includes(signal)) fail(`${homepage}: missing Living Charge signal ${signal}`);
  }
  if ((html.match(/class=["'][^"']*pv-shop-feature__product-link\b/g) || []).length !== 4) fail(`${homepage}: expected four direct Living Charge product links`);
  if (!/id=["']next-release["']/.test(html)) fail(`${homepage}: missing fan-facing Eagle Spirit destination`);
  if (!/data-native-preview/.test(html) || !/data-preview-progress/.test(html) || !/data-preview-continue/.test(html)) fail(`${homepage}: incomplete Mountain Day listening ladder`);
  if (!/data-preview-dock/.test(html)) fail(`${homepage}: missing opt-in Mountain Day mini player`);
  if (!/data-native-film/.test(html) || !/data-native-film-play/.test(html) || !/data-native-film-end-card/.test(html)) fail(`${homepage}: incomplete Salzburg viewing ladder`);
  if (!/href=["']https:\/\/www\.youtube\.com\/shorts\/8YVRH68o0Rk["']/.test(html)) fail(`${homepage}: missing Mountain Day YouTube Short link`);
  if (!/href=["']https:\/\/www\.instagram\.com\/reel\/Dbt-fOaIXEH\/["']/.test(html)) fail(`${homepage}: missing Mountain Day Instagram Reel link`);
  if (!/href=["']https:\/\/www\.youtube\.com\/shorts\/wAsCW6AL5iY["']/.test(html)) fail(`${homepage}: missing Salzburg YouTube Short link`);
  if ((html.match(/\sdata-social-video(?:\s|>)/g) || []).length !== 3) fail(`${homepage}: expected three social video links`);
  if (!/data-video-id=["']8YVRH68o0Rk["']/.test(html)) fail(`${homepage}: missing current Mountain Day short`);
  if (!/mountain-day-reel-poster\.jpg/.test(html)) fail(`${homepage}: missing authentic Mountain Day poster`);
  if (!/transience-tour-salzburg-teaser\.mp4/.test(html)) fail(`${homepage}: missing Salzburg live proof`);
  if (!/artist-live-salzburg-13s55-e11f9305ea66\.jpg/.test(html)) fail(`${homepage}: missing authentic Salzburg poster`);
  if (!/id=["']sib-form["']/.test(html)) fail(`${homepage}: missing Brevo form`);
  if (!/name=["']EMAIL["'][^>]*required/.test(html)) fail(`${homepage}: missing required newsletter email field`);
  if (!/name=["']newsletter_consent["'][^>]*required/.test(html)) fail(`${homepage}: missing required newsletter consent`);
  if (!/name=["']email_address_check["']/.test(html)) fail(`${homepage}: missing Brevo honeypot`);
  if (!new RegExp(`name=["']locale["']\\s+value=["']${locale}["']`).test(html)) fail(`${homepage}: wrong Brevo locale`);
  if (/TJPL|pv-explore|pv-merch|first-response-coin/i.test(html)) fail(`${homepage}: legacy campaign, utility or symbolic-coin content remains`);
  if (/\b(?:Andreas|engineer|engineering|Ingenieur|Energietechnik|ingénieur|ingénierie)\b/i.test(html)) fail(`${homepage}: private name or engineering biography remains`);
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

const renderedPages = htmlFiles
  .map((file) => [file, fs.readFileSync(path.join(root, file), "utf8")])
  .filter(([, html]) => !/http-equiv=["']refresh["']/i.test(html));
const assetVersions = new Set();
for (const [file, html] of renderedPages) {
  for (const match of html.matchAll(/(?:final\.css|script\.js)\?v=([^"']+)/g)) assetVersions.add(match[1]);
  if ((html.match(/final\.css\?v=/g) || []).length !== 1) fail(`${file}: expected one versioned final.css reference`);
  if ((html.match(/script\.js\?v=/g) || []).length !== 1) fail(`${file}: expected one versioned script.js reference`);
}
if (assetVersions.size !== 1 || !assetVersions.has("20260813-social-reels")) {
  fail(`HTML: inconsistent asset versions: ${[...assetVersions].join(", ") || "none"}`);
}

if (errors.length) {
  console.error(`Validation failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Validated ${htmlFiles.length} HTML files and ${localReferences} local references.`);
console.log("Release state, Juniper removal, encoding, IDs, media, JavaScript and responsive type safeguards all pass.");
