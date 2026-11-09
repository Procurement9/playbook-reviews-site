# Honest Picks — Automated Affiliate Content System

This repository runs a fully automated affiliate product-review site. New buyer guides are generated and published weekly without manual work, the sitemap updates automatically, and deploy workflows ship everything to GitHub Pages on every push.

## System Architecture

```
content-queue.json  ──>  generate-guide.mjs  ──>  [slug].html
                                              ──>  guides.html (directory)
                                              ──>  sitemap.xml (Google)
                                              ──>  rss.xml (Buffer / Hootsuite)
generate-social.mjs  ──>  posts/*.md (Instagram/TikTok/Pinterest/Facebook/YouTube)
.github/workflows/deploy.yml  ──>  GitHub Pages (live site)
.github/workflows/weekly-content.yml  ──>  every Sunday @ 09:00 UTC
```

## One-Time Setup

1. **Enable GitHub Pages once:** repo **Settings → Pages** (direct link: https://github.com/Procurement9/playbook-reviews-site/settings/pages). Under **Build and deployment / Source**, select **GitHub Actions** → **Save**.
   The `.github/workflows/deploy.yml` workflow will then deploy the site automatically on every push.
2. **Swap affiliate tags:** replace `https://amzn.to/example-*` placeholders with your real Amazon Associates tag:
   ```bash
   sed -i 's|amzn.to/example-soundpulse|amzn.to/YOUR-REAL-TAG|g' *.html
   git commit -am "Set real Amazon affiliate tag" && git push
   ```
3. **Submit to Google:** after the site is live, add your URL to **Google Search Console** and submit `sitemap.xml`.
4. **Queue more niches:** edit `automation/content-queue.json` — 18 niches are queued, good for 4+ months of weekly drops.

## Automated Social Scheduling (Buffer / Hootsuite)

Three ways to connect the weekly automated content to one-click social posting:

### Method A — RSS auto-posting (easiest, free)

Your site exposes an RSS feed at:
`https://procurement9.github.io/playbook-reviews-site/rss.xml`

**Buffer:** free Buffer accounts can connect RSS feeds through Zapier or third-party RSS tools (see Method B). Buffer's own Feeds feature is available on paid plans: connect the feed → every new guide appears as a queued draft with the image and link → click **Approve** once per week.

**Hootsuite:** Streams → **Add Stream → RSS/Atom →** enter the feed URL above → select social accounts → choose **Auto-publish new items** or **Drafts only** (one-click approve). Every Sunday guide posts automatically to your chosen platforms.

### Method B — Zapier (true zero-click, free plan)

Create one Zap:
- **Trigger:** RSS by Zapier → "New Item in Feed" → URL: `https://procurement9.github.io/playbook-reviews-site/rss.xml`
- **Action 1:** Buffer → "Create Update" → choose account, use RSS title + link + description as caption
- *(Optional) Action 2:* repeat for Facebook/Pinterest
- Result: every Sunday when the weekly workflow pushes a new guide, posts are queued to your Buffer calendar automatically with zero clicks.

### Method C — Buffer/Hootsuite extension (semi-auto, 5 min/week, most control)

The weekly workflow saves ready-to-post copy in `posts/` for Instagram, TikTok, Pinterest, Facebook, and YouTube Short. Open the post set, copy-paste each platform caption into the Buffer/Hootsuite extension while on the guide page, and pick your time slot. This lets you attach custom images per platform.

## Manual Commands

- Generate one guide now: `node automation/generate-guide.mjs`
- Generate social posts: `node automation/generate-social.mjs`
- Rebuild homepage/trust pages: `node automation/build-site-pages.mjs`

## Weekly Flow (automated)

Every Sunday the workflow:
1. Picks the next pending niche from the queue
2. Generates the new guide page
3. Rebuilds `guides.html`, `sitemap.xml`, and `rss.xml`
4. Generates a fresh 5-platform social post set in `posts/`
5. Commits and pushes — deploy workflow immediately ships the update

## Success Metrics (tracked in your PlayBook Earnings Tracker)

Target for months 3-6: 5-8 guides live, ~5,000 monthly visits, 5% click rate, 6-8% conversion, $100-300/mo in commissions. Scale by adding niches.
