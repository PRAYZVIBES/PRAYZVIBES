# PRAYZVIBES website manual

## Regular changes

### Keep all three languages together

English pages live at the root and in `pages`. German duplicates live in `de` and French duplicates in `fr`. When wording, dates or releases change, update the equivalent page in all three locations. Keep each EN/DE/FR language-switch link pointed at the same page in the other languages.

The first visit uses the browser language: German opens `de`, French opens `fr`, and everything else stays in English. A manual choice is saved in the browser under `prayzvibes-language` and takes priority from then on.

### Add a confirmed live date

Open `pages/live.html`, `de/pages/live.html` and `fr/pages/live.html`. Add the real date only after the event is confirmed. Include date, city, venue, ticket link and status. Never publish an unconfirmed appearance.

### Add a release

Update the featured release and current-chapter sections in each language homepage, then update each language version of `listen.html` and `epk.html` plus the English `feed.xml`. Upload the square cover to `images` and keep the existing filename until every reference has been changed and tested.

The homepage campaign labels change automatically on 31 July and 7 August 2026. From 7 August, the script also moves the Transience section directly below the hero so the EP becomes the primary action while Mountain Day remains its doorway.

### Add press coverage

Open `index.html` and `pages/epk.html`. Copy one complete `press-card` and replace publication, headline and URL. Keep the homepage set short enough to scan; replace an existing card before removing the press path itself.

### Replace a short video

- Mountain Day homepage short: `images/mountain-day-reel.mp4`
- Transience EP short: `images/transience-ep-short.mp4`
- Salzburg live teaser: `images/transience-tour-salzburg-teaser.mp4`

Keep MP4 filenames unchanged unless the matching HTML source is updated too.

The homepage live section presents the photographer's Salzburg film as part of the **PRAYZVIBES Street Clips** series and embeds it from YouTube using video ID `a4l_CL8RDBw`. Keep the series name, visible Mind Methaphor attribution, location and accessible video title aligned in `index.html`, `de/index.html` and `fr/index.html`.

### Update PRAYZ REMIX

The current Spotify destination is playlist ID `0CPFAsBogOHppa1epmYLNO`. Update the same clean Spotify URL in all three homepages if the playlist changes.

### Update store links

- Digital music: Bandcamp
- CD and vinyl: ElasticStage
- Clothing and accessories: Fourthwall

Change a link only when the replacement page has been opened and tested.

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
