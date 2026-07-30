# PRAYZVIBES website manual

## Regular changes

### Keep all three languages together

English pages live at the root and in `pages`. German duplicates live in `de` and French duplicates in `fr`. When wording, dates or releases change, update the equivalent page in all three locations. Keep each EN/DE/FR language-switch link pointed at the same page in the other languages.

The first visit uses the browser language: German opens `de`, French opens `fr`, and everything else stays in English. A manual choice is saved in the browser under `prayzvibes-language` and takes priority from then on.

### Add a confirmed live date

Open `pages/live.html`, `de/pages/live.html` and `fr/pages/live.html`. Add the real date only after the event is confirmed. Include date, city, venue, ticket link and status. Never publish an unconfirmed appearance.

### Add a release

Update the featured release and current-chapter sections in each language homepage, then update each language version of `listen.html` and `epk.html` plus the English `feed.xml`. Upload the square cover to `images` and keep the existing filename until every reference has been changed and tested.

The homepage campaign labels change automatically in the visitor's browser on 31 July and 7 August 2026. From 7 August, the script also moves the Transience section directly below the hero so the EP becomes the primary action while Mountain Day remains its doorway.

The GitHub Action in `.github/workflows/release-state.yml` also updates the static titles, search descriptions, social preview copy and no-JavaScript fallback wording. It uses `images/social-preview-mountain-day.jpg` before and during the single campaign, then switches to `images/social-preview-transience.jpg` for the EP campaign. It runs shortly after midnight in Bavaria on both release days and commits only if the public release state changed. If GitHub's scheduled run is delayed, open **Actions → Update release state → Run workflow**, leave the phase on `auto`, and run it once.

The release-day copy is stored in `scripts/apply-release-phase.mjs`. Keep the English, German and French entries aligned. The fixed local Mountain Day player appears only after the single release time; its play button scrolls to and starts `images/mountain-day-reel.mp4`.

### Add press coverage

Open `index.html` and `pages/epk.html`. Copy one complete `press-card` and replace publication, headline and URL. Keep the homepage set short enough to scan; replace an existing card before removing the press path itself.

### Replace a short video

- Mountain Day homepage short: `images/mountain-day-reel.mp4`
- Transience EP short: `images/transience-ep-short.mp4`
- Salzburg live teaser: `images/transience-tour-salzburg-teaser.mp4`

Keep MP4 filenames unchanged unless the matching HTML source is updated too. The shipped website copies are web-optimized H.264/AAC files at 720 × 1280. Preserve the original 1080 × 1920 master exports outside the website repository and make replacements from those masters, not from the compressed web copies.

The homepage live section presents the photographer's Salzburg film as part of the **PRAYZVIBES Street Clips** series and embeds it from YouTube using video ID `a4l_CL8RDBw`. Keep the series name, visible Mind Methaphor attribution, location and accessible video title aligned in `index.html`, `de/index.html` and `fr/index.html`.

### Update PRAYZ REMIX

The current Spotify destination is playlist ID `0CPFAsBogOHppa1epmYLNO`. Update the same clean Spotify URL in all three homepages if the playlist changes.

PRAYZ Worlds, PRAYZ REMIX and the High Week film share the compact **Further roads** section. Keep all five destinations available when changing that layout.

### Update store links

- Digital music: Bandcamp
- CD and vinyl: ElasticStage
- Clothing and accessories: Fourthwall

Change a link only when the replacement page has been opened and tested.

### Update direct support

The direct-support destination is `https://ko-fi.com/prayzvibes`.

Keep the homepage support section, the localized `support.html` pages and footer links aligned in all three languages. The wording should stay voluntary and low-pressure. Do not promise rewards, memberships or a recurring publishing schedule unless those offers are active and can be fulfilled.

Ko-fi clicks are tracked as `support_click` with a `support_source` only after analytics consent. Payment itself happens on Ko-fi; the PRAYZVIBES website never collects payment data. Website links use harmless UTM source tags; the ready-to-copy social versions are in `SOCIAL-TRACKING-LINKS.md`.

Use `AUDIENCE-DASHBOARD.md` for the small monthly review. It explains the release, live, shop, support, playlist, EPK and newsletter signals without turning the project into a spreadsheet exercise.

### Keep the homepage focused

Mountain Day is the doorway and Transience is the current chapter. Developing work may appear as a quiet notebook note, but it must not compete with those two campaigns.

The compact JUNIPER & PRAYZ bridge belongs directly after the homepage Live section. It links to the shared project's Instagram while the separate website remains in staging, without turning the duo into a PRAYZVIBES navigation category or release campaign. Replace that destination with `https://www.juniperprayz.com/` only after the domain serves the approved JUNIPER & PRAYZ website. Keep `images/juniper-prayz-duo.jpg` and `images/juniper-prayz-wild-halo.svg` aligned with the approved JUNIPER & PRAYZ identity, and update all three language versions together.

### Protect the functional baseline

Before simplifying a section, confirm that its destination remains available somewhere equally visible. Keep these paths working:

- all four Transience tracks and their platform links
- Bandcamp, CD/vinyl and Fourthwall shop routes
- Spotify, YouTube, Bandcamp and Deezer
- Live, booking, About, Listen, EPK and contact pages
- PRAYZ Worlds playlists
- consent-based High Week video
- newsletter, privacy choices and partner-store notices

## Files that should remain

- `robots.txt`: crawling instructions for search engines
- `sitemap.xml`: list of public pages for search engines
- `feed.xml`: RSS news feed
- `site.webmanifest`: installable-site information and icons
- `CNAME`: custom-domain connection for GitHub Pages
- `.nojekyll`: preserves the static website structure
- `de` and `fr`: complete localized sites

## Safe workflow

1. Download a backup of the current repository.
2. Make one small change.
3. Test it locally or in a preview.
4. Upload and check desktop plus mobile.
5. If something sings out of key, restore the backup—no dramatic guitar smashing required.
