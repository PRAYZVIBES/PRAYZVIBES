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

  if (!redirect && !/final\.css/.test(html)) fail(`${htmlFile}: final.css is missing`);
  if (/studio\.css/.test(html)) fail(`${htmlFile}: stale studio.css reference`);

  const ids = [...html.matchAll(/\sid=["']([^"']+)["']/gi)].map((match) => match[1]);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length) fail(`${htmlFile}: duplicate IDs: ${[...new Set(duplicates)].join(", ")}`);

  for (const match of html.matchAll(/\s(?:src|href|poster)=["']([^"']+)["']/gi)) {
    const target = resolveReference(htmlFile, match[1]);
    if (!target) continue;
    localReferences += 1;
    if (!fs.existsSync(target)) fail(`${htmlFile}: missing local reference ${match[1]}`);
  }
}

for (const homepage of ["index.html", "de/index.html", "fr/index.html"]) {
  const html = fs.readFileSync(path.join(root, homepage), "utf8");
  for (const id of ["music", "films", "live-preview", "about", "press", "listen", "worlds", "shop", "support"]) {
    if (!new RegExp(`id=["']${id}["']`).test(html)) fail(`${homepage}: missing #${id}`);
  }
  if ((html.match(/<h1\b/g) || []).length !== 1) fail(`${homepage}: expected exactly one h1`);
  const editorialFilms = [...html.matchAll(/\bclass=["']([^"']*)["']/g)]
    .filter((match) => match[1].split(/\s+/).includes("pv-film"));
  if (editorialFilms.length !== 3) fail(`${homepage}: expected three editorial films`);
  if (!/data-video-id=["']8YVRH68o0Rk["']/.test(html)) fail(`${homepage}: missing current Mountain Day short`);
  if (!/https:\/\/www\.youtube\.com\/shorts\/8YVRH68o0Rk/.test(html)) fail(`${homepage}: missing Mountain Day YouTube link`);
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

if (errors.length) {
  console.error(`Validation failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Validated ${htmlFiles.length} HTML files and ${localReferences} local references.`);
console.log("Release state, Juniper removal, encoding, IDs, media, JavaScript and responsive type safeguards all pass.");
