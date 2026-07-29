import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.resolve(scriptDirectory, "..");
const args = process.argv.slice(2);

function readArgument(name, fallback = "") {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

const requestedPhase = readArgument("--phase", "auto");
const suppliedNow = readArgument("--now");
const now = suppliedNow ? new Date(suppliedNow) : new Date();
if (Number.isNaN(now.getTime())) throw new Error(`Invalid --now value: ${suppliedNow}`);

const mountainDayRelease = new Date("2026-07-30T22:00:00Z");
const transienceRelease = new Date("2026-08-06T22:00:00Z");
const automaticPhase = now >= transienceRelease ? "ep" : now >= mountainDayRelease ? "single" : "before";
const phase = requestedPhase === "auto" ? automaticPhase : requestedPhase;
if (!["before", "single", "ep"].includes(phase)) {
  throw new Error(`Unknown phase "${phase}". Use before, single, ep or auto.`);
}

const languages = {
  en: {
    file: "index.html",
    socialAlt: {
      mountain: "PRAYZVIBES presents Mountain Day in a Bavarian field",
      transience: "PRAYZVIBES presents the Transience EP"
    },
    phases: {
      before: {
        title: "PRAYZVIBES | Street-born Indie Folk from Bavaria",
        description: "PRAYZVIBES is an independent songwriter, producer and live artist from Franconian Switzerland. Pre-save Mountain Day and enter the four-song Transience chapter.",
        ogTitle: "PRAYZVIBES | Mountain Day",
        ogDescription: "Songs from Franconian Switzerland, made to travel. Mountain Day opens the Transience chapter on 31 July.",
        twitterTitle: "PRAYZVIBES | Mountain Day",
        twitterDescription: "A different view above the noise. Mountain Day arrives 31 July.",
        campaignLabel: "Pre-save Mountain Day",
        campaignHref: "https://listen.music-hub.com/5JnBx3",
        hero: "Mountain Day. A different view, above the noise.",
        anchorLabel: "Latest release",
        anchorHref: "#featured",
        mountainRelease: "New single &middot; 31 July 2026",
        mountainAction: "Pre-save",
        epRelease: "EP &middot; 7 August 2026",
        epAction: "Pre-order EP"
      },
      single: {
        title: "PRAYZVIBES | Mountain Day — Out Now",
        description: "Mountain Day is out now. Street-born indie folk from Franconian Switzerland, Bavaria. Listen to the new PRAYZVIBES single and enter the Transience chapter.",
        ogTitle: "PRAYZVIBES | Mountain Day — Out Now",
        ogDescription: "A different view above the noise. Listen to Mountain Day, the new PRAYZVIBES single.",
        twitterTitle: "PRAYZVIBES | Mountain Day — Out Now",
        twitterDescription: "Mountain Day is out now. Listen to the new PRAYZVIBES single.",
        campaignLabel: "Listen to Mountain Day",
        campaignHref: "https://listen.music-hub.com/5JnBx3",
        hero: "Mountain Day is out now. A different view, above the noise.",
        anchorLabel: "Latest release",
        anchorHref: "#featured",
        mountainRelease: "Out now",
        mountainAction: "Listen everywhere",
        epRelease: "EP &middot; 7 August 2026",
        epAction: "Pre-order EP"
      },
      ep: {
        title: "PRAYZVIBES | Transience — Out Now",
        description: "Transience is out now. Four street-born indie-folk songs from PRAYZVIBES: Mountain Day, High Week, Big Jump and Transcendance.",
        ogTitle: "PRAYZVIBES | Transience — Out Now",
        ogDescription: "Four songs. One changing view. Listen to the new Transience EP from PRAYZVIBES.",
        twitterTitle: "PRAYZVIBES | Transience — Out Now",
        twitterDescription: "Transience is out now. Four songs, one changing view.",
        campaignLabel: "Listen to Transience",
        campaignHref: "https://prayzvibes.bandcamp.com/album/prayzvibes-transience",
        hero: "Transience is out now. Four songs, one changing view.",
        anchorLabel: "Current chapter",
        anchorHref: "#music",
        mountainRelease: "Out now",
        mountainAction: "Listen everywhere",
        epRelease: "EP &middot; out now",
        epAction: "Listen to the EP"
      }
    }
  },
  de: {
    file: "de/index.html",
    socialAlt: {
      mountain: "PRAYZVIBES präsentiert Mountain Day in einem bayerischen Feld",
      transience: "PRAYZVIBES präsentiert die Transience EP"
    },
    phases: {
      before: {
        title: "PRAYZVIBES | Indie-Folk von der Straße aus Bayern",
        description: "PRAYZVIBES ist unabhängiger Songwriter, Produzent und Live-Artist aus der Fränkischen Schweiz. Merk dir Mountain Day vor und öffne das vier Songs starke Kapitel Transience.",
        ogTitle: "PRAYZVIBES | Mountain Day",
        ogDescription: "Songs aus der Fränkischen Schweiz, gemacht für unterwegs. Mountain Day öffnet am 31. Juli das Kapitel Transience.",
        twitterTitle: "PRAYZVIBES | Mountain Day",
        twitterDescription: "Ein anderer Blick über dem Lärm. Mountain Day erscheint am 31. Juli.",
        campaignLabel: "Mountain Day vormerken",
        campaignHref: "https://listen.music-hub.com/5JnBx3",
        hero: "Mountain Day. Ein anderer Blick, über dem Lärm.",
        anchorLabel: "Neueste Veröffentlichung",
        anchorHref: "#featured",
        mountainRelease: "Neue Single &middot; 31. Juli 2026",
        mountainAction: "Vormerken",
        epRelease: "EP &middot; 7. August 2026",
        epAction: "EP vorbestellen"
      },
      single: {
        title: "PRAYZVIBES | Mountain Day — jetzt draußen",
        description: "Mountain Day ist jetzt draußen. Indie-Folk von der Straße aus der Fränkischen Schweiz. Hör die neue PRAYZVIBES Single und öffne das Kapitel Transience.",
        ogTitle: "PRAYZVIBES | Mountain Day — jetzt draußen",
        ogDescription: "Ein anderer Blick über dem Lärm. Hör Mountain Day, die neue Single von PRAYZVIBES.",
        twitterTitle: "PRAYZVIBES | Mountain Day — jetzt draußen",
        twitterDescription: "Mountain Day ist jetzt draußen. Hör die neue PRAYZVIBES Single.",
        campaignLabel: "Mountain Day anhören",
        campaignHref: "https://listen.music-hub.com/5JnBx3",
        hero: "Mountain Day ist jetzt da. Ein anderer Blick, über dem Lärm.",
        anchorLabel: "Neueste Veröffentlichung",
        anchorHref: "#featured",
        mountainRelease: "Jetzt draußen",
        mountainAction: "Überall anhören",
        epRelease: "EP &middot; 7. August 2026",
        epAction: "EP vorbestellen"
      },
      ep: {
        title: "PRAYZVIBES | Transience — jetzt draußen",
        description: "Transience ist jetzt draußen. Vier Indie-Folk-Songs von PRAYZVIBES: Mountain Day, High Week, Big Jump und Transcendance.",
        ogTitle: "PRAYZVIBES | Transience — jetzt draußen",
        ogDescription: "Vier Songs. Ein Blick in Bewegung. Hör die neue Transience EP von PRAYZVIBES.",
        twitterTitle: "PRAYZVIBES | Transience — jetzt draußen",
        twitterDescription: "Transience ist jetzt draußen. Vier Songs, ein Blick in Bewegung.",
        campaignLabel: "Transience anhören",
        campaignHref: "https://prayzvibes.bandcamp.com/album/prayzvibes-transience",
        hero: "Transience ist jetzt da. Vier Songs, ein Blick in Bewegung.",
        anchorLabel: "Aktuelles Kapitel",
        anchorHref: "#music",
        mountainRelease: "Jetzt draußen",
        mountainAction: "Überall anhören",
        epRelease: "EP &middot; jetzt draußen",
        epAction: "EP anhören"
      }
    }
  },
  fr: {
    file: "fr/index.html",
    socialAlt: {
      mountain: "PRAYZVIBES présente Mountain Day dans un champ bavarois",
      transience: "PRAYZVIBES présente l’EP Transience"
    },
    phases: {
      before: {
        title: "PRAYZVIBES | Indie folk né dans la rue en Bavière",
        description: "PRAYZVIBES est auteur-compositeur, producteur et artiste live indépendant, venu de Suisse franconienne. Pré-enregistrez Mountain Day et entrez dans Transience.",
        ogTitle: "PRAYZVIBES | Mountain Day",
        ogDescription: "Des chansons de Suisse franconienne, faites pour voyager. Mountain Day ouvre le chapitre Transience le 31 juillet.",
        twitterTitle: "PRAYZVIBES | Mountain Day",
        twitterDescription: "Un autre regard, au-dessus du bruit. Mountain Day arrive le 31 juillet.",
        campaignLabel: "Pré-enregistrer Mountain Day",
        campaignHref: "https://listen.music-hub.com/5JnBx3",
        hero: "Mountain Day. Un autre regard, au-dessus du bruit.",
        anchorLabel: "Dernière sortie",
        anchorHref: "#featured",
        mountainRelease: "Nouveau single &middot; 31 juillet 2026",
        mountainAction: "Pré-enregistrer",
        epRelease: "EP &middot; 7 août 2026",
        epAction: "Précommander l’EP"
      },
      single: {
        title: "PRAYZVIBES | Mountain Day — disponible",
        description: "Mountain Day est disponible. De l’indie folk né dans la rue, venu de Suisse franconienne en Bavière. Écoutez le nouveau single de PRAYZVIBES.",
        ogTitle: "PRAYZVIBES | Mountain Day — disponible",
        ogDescription: "Un autre regard, au-dessus du bruit. Écoutez Mountain Day, le nouveau single de PRAYZVIBES.",
        twitterTitle: "PRAYZVIBES | Mountain Day — disponible",
        twitterDescription: "Mountain Day est disponible. Écoutez le nouveau single de PRAYZVIBES.",
        campaignLabel: "Écouter Mountain Day",
        campaignHref: "https://listen.music-hub.com/5JnBx3",
        hero: "Mountain Day est sorti. Un autre regard, au-dessus du bruit.",
        anchorLabel: "Dernière sortie",
        anchorHref: "#featured",
        mountainRelease: "Disponible",
        mountainAction: "Écouter partout",
        epRelease: "EP &middot; 7 août 2026",
        epAction: "Précommander l’EP"
      },
      ep: {
        title: "PRAYZVIBES | Transience — disponible",
        description: "Transience est disponible. Quatre chansons indie folk de PRAYZVIBES : Mountain Day, High Week, Big Jump et Transcendance.",
        ogTitle: "PRAYZVIBES | Transience — disponible",
        ogDescription: "Quatre chansons. Un regard en mouvement. Écoutez le nouvel EP Transience de PRAYZVIBES.",
        twitterTitle: "PRAYZVIBES | Transience — disponible",
        twitterDescription: "Transience est disponible. Quatre chansons, un regard en mouvement.",
        campaignLabel: "Écouter Transience",
        campaignHref: "https://prayzvibes.bandcamp.com/album/prayzvibes-transience",
        hero: "Transience est sorti. Quatre chansons, un regard en mouvement.",
        anchorLabel: "Chapitre actuel",
        anchorHref: "#music",
        mountainRelease: "Disponible",
        mountainAction: "Écouter partout",
        epRelease: "EP &middot; disponible",
        epAction: "Écouter l’EP"
      }
    }
  }
};

function replaceMeta(html, selector, value) {
  const attribute = selector.startsWith("og:") ? "property" : "name";
  const pattern = new RegExp(`(<meta\\s+${attribute}="${selector}"\\s+content=")[^"]*(">)`);
  if (!pattern.test(html)) throw new Error(`Missing ${attribute}="${selector}"`);
  return html.replace(pattern, `$1${value}$2`);
}

function updatePage(html, copy, socialAlt) {
  const socialFile = phase === "ep"
    ? "social-preview-transience.jpg"
    : "social-preview-mountain-day.jpg";
  const socialDescription = phase === "ep" ? socialAlt.transience : socialAlt.mountain;
  const socialUrl = `https://www.prayzvibes.com/images/${socialFile}`;

  html = html.replace(/<title>[^<]*<\/title>/, `<title>${copy.title}</title>`);
  html = replaceMeta(html, "description", copy.description);
  html = replaceMeta(html, "og:title", copy.ogTitle);
  html = replaceMeta(html, "og:description", copy.ogDescription);
  html = replaceMeta(html, "og:image", socialUrl);
  html = replaceMeta(html, "og:image:alt", socialDescription);
  html = replaceMeta(html, "twitter:title", copy.twitterTitle);
  html = replaceMeta(html, "twitter:description", copy.twitterDescription);
  html = replaceMeta(html, "twitter:image", socialUrl);

  if (/<meta name="pv:release-phase"/.test(html)) {
    html = replaceMeta(html, "pv:release-phase", phase);
  } else {
    html = html.replace(
      /(<meta name="theme-color" content="[^"]+">)/,
      `$1\n  <meta name="pv:release-phase" content="${phase}">`
    );
  }

  html = html.replace(
    /<a class="([^"]*\bcampaign-switch\b[^"]*)"([^>]*)>([^<]*)<\/a>/g,
    (full, classes, attributes) => {
      const label = attributes.match(new RegExp(`data-${phase}-label="([^"]+)"`))?.[1] || copy.campaignLabel;
      const href = attributes.match(new RegExp(`data-${phase}-href="([^"]+)"`))?.[1] || copy.campaignHref;
      const updatedAttributes = attributes.replace(/href="[^"]*"/, `href="${href}"`);
      return `<a class="${classes}"${updatedAttributes}>${label}</a>`;
    }
  );

  html = html.replace(
    /<p class="([^"]*\bcampaign-text\b[^"]*)"([^>]*)>[\s\S]*?<\/p>/g,
    `<p class="$1"$2>${copy.hero}</p>`
  );

  html = html.replace(
    /<a class="([^"]*\bcampaign-anchor\b[^"]*)"([^>]*)><span>[^<]*<\/span>([\s\S]*?)<\/a>/g,
    (full, classes, attributes, tail) => {
      const label = attributes.match(new RegExp(`data-${phase}-label="([^"]+)"`))?.[1] || copy.anchorLabel;
      const href = attributes.match(new RegExp(`data-${phase}-href="([^"]+)"`))?.[1] || copy.anchorHref;
      const updatedAttributes = attributes.replace(/href="[^"]*"/, `href="${href}"`);
      return `<a class="${classes}"${updatedAttributes}><span>${label}</span>${tail}</a>`;
    }
  );

  html = html.replace(
    /<p class="([^"]*\brelease-text\b[^"]*)"([^>]*)>[\s\S]*?<\/p>/g,
    (full, classes, attributes) => {
      const isMountainDay = attributes.includes("2026-07-31");
      const label = isMountainDay ? copy.mountainRelease : copy.epRelease;
      return `<p class="${classes}"${attributes}>${label}</p>`;
    }
  );

  html = html.replace(
    /<a class="([^"]*\brelease-switch\b[^"]*)"([^>]*)>[^<]*<\/a>/g,
    (full, classes, attributes) => {
      const isMountainDay = attributes.includes("2026-07-31");
      const label = isMountainDay ? copy.mountainAction : copy.epAction;
      return `<a class="${classes}"${attributes}>${label}</a>`;
    }
  );

  return html;
}

let changedFiles = 0;
for (const language of Object.values(languages)) {
  const filePath = path.join(siteRoot, ...language.file.split("/"));
  const original = fs.readFileSync(filePath, "utf8");
  const updated = updatePage(original, language.phases[phase], language.socialAlt);
  if (updated !== original) {
    fs.writeFileSync(filePath, updated, "utf8");
    changedFiles += 1;
  }
}

console.log(`PRAYZVIBES release phase: ${phase}. Updated ${changedFiles} homepage file(s).`);
