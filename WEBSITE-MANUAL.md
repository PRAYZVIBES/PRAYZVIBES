# PRAYZVIBES website manual

## Regular changes

### Add a confirmed live date

Open `pages/live.html`. Add the real date only after the event is confirmed. Include date, city, venue, ticket link and status. Never publish an unconfirmed appearance.

### Add a release

Update the featured release and current-chapter sections in `index.html`, then update `pages/listen.html`, `pages/epk.html` and `feed.xml`. Upload the square cover to `images` and keep the existing filename until every reference has been changed and tested.

### Add press coverage

Open `index.html` and `pages/epk.html`. Copy one complete `press-card` and replace publication, headline and URL. Keep only the strongest three pieces on the homepage; the EPK may contain more.

### Replace a short video

- Mountain Day homepage short: `images/mountain-day-reel.mp4`
- Transience EP short: `images/transience-ep-short.mp4`
- Salzburg live teaser: `images/transience-tour-salzburg-teaser.mp4`

Keep MP4 filenames unchanged unless the matching HTML source is updated too.

### Update store links

- Digital music: Bandcamp
- CD and vinyl: ElasticStage
- Clothing and accessories: Fourthwall

Change a link only when the replacement page has been opened and tested.

### Keep the homepage focused

Mountain Day is the doorway and Transience is the current chapter. Add another campaign only when it has confirmed artwork, dates and working links; developing projects belong off the homepage until then.

## Files that should remain

- `robots.txt`: crawling instructions for search engines
- `sitemap.xml`: list of public pages for search engines
- `feed.xml`: RSS news feed
- `site.webmanifest`: installable-site information and icons
- `CNAME`: custom-domain connection for GitHub Pages
- `.nojekyll`: preserves the static website structure

## Safe workflow

1. Download a backup of the current repository.
2. Make one small change.
3. Test it locally or in a preview.
4. Upload and check desktop plus mobile.
5. If something sings out of key, restore the backup—no dramatic guitar smashing required.
