# PRAYZVIBES website manual

## Regular changes

### Add a confirmed live date

Open `pages/live.html`. Add the real date only after the event is confirmed. Include date, city, venue, ticket link and status. Never publish an unconfirmed appearance.

### Add a release

Open `index.html`, find `release-grid`, copy one complete `release-card`, then replace the cover filename, title, Bandcamp URL and smart link. Upload the new square cover to `images`.

### Add press coverage

Open `index.html` and `pages/epk.html`. Copy one complete `press-card` and replace publication, headline, description and URL. Keep only the strongest four pieces on the homepage; the EPK may contain more.

### Update store links

- Digital music: Bandcamp
- CD and vinyl: ElasticStage
- Clothing and accessories: Fourthwall

Change a link only when the replacement page has been opened and tested.

### Publish PRAYZ REMIX later

Replace the “In the making” teaser only when the first remix has final artwork, release date, Bandcamp link and streaming smart link.

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
