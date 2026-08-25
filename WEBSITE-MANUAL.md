# PRAYZVIBES website manual

## Regular changes

### Keep all three languages together

English pages live at the root and in `pages`. German duplicates live in `de` and French duplicates in `fr`. When wording, dates or releases change, update the equivalent page in all three locations. Keep each EN/DE/FR language-switch link pointed at the same page in the other languages.

The legacy `scripts/build-final-draft.mjs` generator is retired because it no longer represents the audited site. Maintain the multilingual pages directly and run `scripts/validate-final-draft.mjs` before every publication.

The first visit uses the browser language: German opens `de`, French opens `fr`, and everything else stays in English. A manual choice is saved in the browser under `prayzvibes-language` and takes priority from then on.

### Add a confirmed live date

Open `pages/live.html`, `de/pages/live.html` and `fr/pages/live.html`. Add the real date only after the event is confirmed. Include date, city, venue, ticket link and status. Never publish an unconfirmed appearance.

### Add a release

Update the featured release and current-chapter sections in each language homepage, then update each language version of `listen.html`, the dedicated release page and `epk.html` plus the English `feed.xml`. Upload the square cover to `images` and keep the existing filename until every reference has been changed and tested.

The website now has a permanent post-release state. Transience is the current chapter; Mountain Day remains its doorway. When the next release arrives, replace the visible copy and metadata deliberately in all three languages rather than reactivating the retired 2026 pre-release scheduler.

### Add press coverage

Update the three homepages and the three `epk.html` pages together. Copy one complete press row/card and replace publication, headline and URL. Keep the homepage set short enough to scan; replace an existing card before removing the press path itself. Paid or partner placements must stay visibly separated from independent coverage.

### Keep the five journey routes working

The homepage journey bar is intentional: **01 Listen**, **02 Invite**, **03 Meet PRAYZ**, **04 Shop**, **05 Stay close**. The Living Charge marks behind these routes are decorative identifiers, not a separate homepage campaign.

- 01 starts the native 24-second Mountain Day preview and lands at the Mountain Day section.
- 02 opens the live proof and routes enquiries through the localized `book.html` page.
- 03 leads to the personal story.
- 04 leads to the Living Charge shop presentation.
- 05 keeps the Eagle Spirit email field visible.

Keep EPK access as an unnumbered professional utility. Do not add a sixth journey tile.

### Maintain booking paths

The public booking route is `pages/book.html`, with equivalent pages below `de/pages` and `fr/pages`. Keep direct email, SofaConcerts and BackstagePro available there. Homepage booking buttons should point to this page rather than forcing an email application to open immediately.

### Replace a short video

- Mountain Day homepage short: `images/mountain-day-reel.mp4`
- Transience EP short: `images/transience-ep-short.mp4`
- Salzburg live teaser: `images/transience-tour-salzburg-teaser.mp4`

Keep MP4 filenames unchanged unless the matching HTML source is updated too. The shipped website copies are web-optimized H.264/AAC files at 720 × 1280. Preserve the original 1080 × 1920 master exports outside the website repository and make replacements from those masters, not from the compressed web copies.

The homepage live section embeds the official **TRANSIENCE TOUR — Chapter 1: Salzburg** short from the PRAYZVIBES YouTube channel using video ID `wAsCW6AL5iY`. Keep the Salzburg location and accessible video title aligned in `index.html`, `de/index.html` and `fr/index.html`.

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


### Protect the functional baseline

Before simplifying a section, confirm that its destination remains available somewhere equally visible. Keep these paths working:

- all four Transience tracks and their platform links
- Bandcamp, CD/vinyl and Fourthwall shop routes
- Spotify, YouTube, Bandcamp and Deezer
- Live, booking, About, Listen, EPK and contact pages
- PRAYZ Worlds playlists
- consent-based High Week video
- newsletter and privacy choices

## Files that should remain

- `robots.txt`: crawling instructions for search engines
- `sitemap.xml`: list of public pages for search engines
- `feed.xml`: RSS news feed
- `site.webmanifest`: installable-site information and icons
- `CNAME`: custom-domain connection for GitHub Pages
- `.nojekyll`: preserves the static website structure
- `de` and `fr`: complete localized sites

## Safe workflow

1. Confirm the repository is clean and create a Git commit before changing the published branch.
2. Make one small change.
3. Test it locally or in a preview.
4. Upload and check desktop plus mobile.
5. If something sings out of key, restore the backup—no dramatic guitar smashing required.
