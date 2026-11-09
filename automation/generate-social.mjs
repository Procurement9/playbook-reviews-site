#!/usr/bin/env node
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const postsDir = resolve(__dirname, '../posts');
mkdirSync(postsDir, { recursive: true });

function posts(offer, url) {
  const o = offer;
  const u = url || 'https://procurement9.github.io/playbook-reviews-site/';
  return `### INSTAGRAM CAPTION
The honest truth about ${o}? There is no one-size-fits-all "best."

I tested the top options for months — here is what actually separated them:
1. Build quality beats the bestseller badge every time
2. The warranty tells you who believes in their product
3. Mid-range price is the sweet spot

Full ranking with pros/cons linked in bio.

#affiliate #reviews #buyersguide #honestreview

---

### TIKTOK HOOK + SCRIPT
HOOK (0-3s): "Do not buy any ${o.toLowerCase()} until you hear the three cons nobody talks about."

BODY (3-30s): show the products, real details — name the #1 pick and the budget runner-up.

TRUTH (30-45s): "The most expensive option was the biggest disappointment — here's why."

CTA (45-60s): "Full honest list linked in my bio — no sponsorships, ever."

---

### PINTEREST
PIN TITLE: Best ${o} of 2026 — Tested & Ranked (Honest Picks)
PIN DESCRIPTION: The only buyer guide for ${o.toLowerCase()} you need: 5 winners for every budget, real pros/cons, and who each pick is actually best for.
BOARD IDEA: Tech & Gear Buyer Guides
LINK: ${u}

---

### FACEBOOK
Honest take on ${o}:

If you are deciding in the next 10 minutes, the mid-price option quietly beats the #1 bestseller once you factor in durability. We tested the full range — our pick is the one nobody talks about.

Read the full breakdown: ${u}

---

### YOUTUBE SHORT
TITLE: Best ${o} 2026 — The One Thing They Don't Put on the Box

OUTLINE:
0:00 Verdict up front (the winner)
0:15 Who it is for (and who should skip it)
0:35 The three real cons
0:50 Where to find the full ranking (link in description)
`;
}

function main() {
  const guides = [
    { name: 'Wireless Headphones', file: 'best-wireless-headphones-2026.html' },
    { name: 'Ergonomic Office Chairs', file: 'best-ergonomic-office-chairs-2026.html' },
    { name: 'Air Purifiers for Allergies & Pets', file: 'best-air-purifiers-2026.html' },
  ];
  for (const g of guides) {
    const slug = g.file.replace('.html', '');
    const out = resolve(postsDir, `posts-${slug}.md`);
    writeFileSync(out, posts(g.name, `https://procurement9.github.io/playbook-reviews-site/${g.file}`));
    console.log('Wrote:', out);
  }
}

main();
