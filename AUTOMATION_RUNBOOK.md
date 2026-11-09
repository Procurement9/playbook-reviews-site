# Honest Picks — Automated Affiliate Content System

This repository runs a fully automated affiliate product-review site. New buyer guides are generated and published weekly without manual work, the sitemap updates automatically, and deploy workflows ship everything to GitHub Pages on every push.

## System Architecture

```
content-queue.json  ──>  generate-guide.mjs  ──>  [slug].html
                                              ──>  guides.html (directory)
                                              ──>  sitemap.xml (Google)
generate-social.mjs  ──>  posts/*.md (Instagram/TikTok/Pinterest/Facebook/YouTube)
.github/workflows/deploy.yml  ──>  GitHub Pages (live site)
.github/workflows/weekly-content.yml  ──>  every Sunday @ 09:00 UTC
```

## One-Time Setup

1. **Enable GitHub Pages:** repository **Settings → Pages → Source: Deploy from a branch → main → Save**.
   The `.github/workflows/deploy.yml` workflow will then deploy the site on every push.
2. **Swap affiliate tags:** replace `https://amzn.to/example-*` placeholders with your real Amazon Associates tag:
   ```bash
   sed -i 's|amzn.to/example-soundpulse|amzn.to/YOUR-REAL-TAG|g' *.html
   git commit -am "Set real Amazon affiliate tag" && git push
   ```
3. **Submit to Google:** after the site is live, add your URL to **Google Search Console** and submit `sitemap.xml`.
4. **Queue more niches:** edit `automation/content-queue.json` — 18 niches are queued, good for 4+ months of weekly drops.

## Manual Commands

- Generate one guide now: `node automation/generate-guide.mjs`
- Generate social posts: `node automation/generate-social.mjs`
- Rebuild homepage/trust pages: `node automation/build-site-pages.mjs`

## Weekly Flow (automated)

Every Sunday the workflow:
1. Picks the next pending niche from the queue
2. Generates the new guide page
3. Rebuilds `guides.html` and `sitemap.xml`
4. Generates a fresh 5-platform social post set in `posts/`
5. Commits and pushes — deploy workflow immediately ships the update

## Social Posting Routine

Grab the weekly post set from `posts/` and publish across platforms (10 minutes/week):
- **Instagram:** caption with #hashtags + link-in-bio
- **TikTok:** 60-second hook/body/truth/CTA script
- **Pinterest:** title + description + board idea linking to the guide
- **Facebook:** short honest-verdict post with link
- **YouTube Short:** outline-based recording

## Success Metrics (tracked in your PlayBook Earnings Tracker)

Target for months 3-6: 5-8 guides live, ~5,000 monthly visits, 5% click rate, 6-8% conversion, $100-300/mo in commissions. Scale by adding niches.
