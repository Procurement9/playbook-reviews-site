#!/usr/bin/env node
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Fail closed: the legacy template contains fictional products and unverified test claims.
// It must be replaced with sourced, reviewed content before it is used again.
console.error('Publication paused: the legacy guide generator contains unverified samples.');
process.exit(1);

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const queueFile = resolve(__dirname, 'content-queue.json');
const BASE = 'https://procurement9.github.io/playbook-reviews-site/';

function escape(s) {
  return (s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function build(p) {
  const winner = p.products.find((prod) => prod.id === p.verdict.winnerId);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escape(p.title)}</title>
<meta name="description" content="${escape(p.hero.subtitle.slice(0, 160))}">
<script src="https://cdn.tailwindcss.com"></script>
<script>tailwind.config={darkMode:'class',theme:{extend:{colors:{brand:{500:'#10b981',600:'#059669',700:'#047857'}}}}}</script>
<style>html{scroll-behavior:smooth}::selection{background:#059669;color:#fff}</style>
</head>
<body class="bg-slate-950 text-slate-100 antialiased selection:bg-emerald-500 selection:text-white">
<div class="max-w-3xl mx-auto px-4 py-8 space-y-12">
  <header class="text-center space-y-4">
    <div class="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">BUYER GUIDE</div>
    <h1 class="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">${escape(p.hero.headline)}</h1>
    <p class="text-base sm:text-lg text-slate-300 max-w-xl mx-auto">${escape(p.hero.subtitle)}</p>
    <p class="text-xs text-slate-400 italic">${escape(p.hero.disclosure)}</p>
  </header>

  <p class="text-slate-300 text-base leading-relaxed">${escape(p.intro)}</p>

  <section class="space-y-6">
    <h2 class="text-xs font-semibold uppercase tracking-wider text-slate-400">Top recommendations</h2>
    <div class="space-y-5">
      ${p.products
        .map(
          (prod, i) => `
      <article class="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div class="flex items-start justify-between gap-3">
          <div>
            <span class="text-xs font-mono text-slate-500">#${i + 1}</span>
            <div class="flex items-center gap-2 flex-wrap mt-0.5">
              <h3 class="text-xl font-bold text-white">${escape(prod.name)}</h3>
              <span class="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 font-semibold border border-emerald-500/30">${escape(prod.badge)}</span>
            </div>
            <p class="text-xs text-slate-400 mt-1">${escape(prod.tagline)}</p>
          </div>
          <div class="text-right shrink-0">
            <div class="text-lg font-bold text-white">${escape(prod.price)}</div>
            <div class="text-xs text-amber-300 font-semibold">${prod.rating.toFixed(1)} / 5</div>
          </div>
        </div>
        ${prod.imageUrl ? `<img src="${escape(prod.imageUrl)}" alt="${escape(prod.name)}" class="w-full max-h-72 object-cover rounded-xl border border-slate-800" loading="lazy">` : ''}
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div><div class="font-semibold text-emerald-400 mb-1">PROS</div><ul class="space-y-1 text-slate-300">${prod.pros.map((x) => `<li>+ ${escape(x)}</li>`).join('')}</ul></div>
          <div><div class="font-semibold text-rose-400 mb-1">CONS</div><ul class="space-y-1 text-slate-400">${prod.cons.map((x) => `<li>- ${escape(x)}</li>`).join('')}</ul></div>
        </div>
        <p class="text-xs text-slate-400"><strong class="text-slate-300">Best for:</strong> ${escape(prod.bestFor)}</p>
        <div class="pt-2">
          <a href="${escape(prod.affiliateUrl)}" rel="sponsored nofollow" target="_blank" class="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition">Check price on Amazon →</a>
        </div>
      </article>`
        )
        .join('')}
    </div>
  </section>

  <section class="bg-gradient-to-r from-emerald-950/50 via-slate-900 to-teal-950/50 border border-emerald-900/60 rounded-2xl p-6 sm:p-8 space-y-3">
    <h2 class="text-xs font-semibold uppercase tracking-wider text-emerald-300">The final verdict</h2>
    ${winner ? `<div class="text-xl font-bold text-white">Our pick: ${escape(winner.name)}</div>` : ''}
    <p class="text-sm text-slate-300 leading-relaxed">${escape(p.verdict.summary)}</p>
  </section>

  <section class="space-y-4">
    <h2 class="text-xs font-semibold uppercase tracking-wider text-slate-400">Frequently asked questions</h2>
    <div class="space-y-3">
      ${p.faq
        .map(
          (f) => `
      <details class="bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm">
        <summary class="font-semibold text-white cursor-pointer">${escape(f.q)}</summary>
        <p class="text-slate-400 text-xs mt-2 leading-relaxed">${escape(f.a)}</p>
      </details>`
        )
        .join('')}
    </div>
  </section>

  <footer class="border-t border-slate-800 pt-8 space-y-3 text-xs text-slate-400 text-center">
    <p>${escape(p.footer.about)}</p>
    <p class="text-slate-500">${escape(p.footer.disclosure)}</p>
    <p class="text-slate-600">Built with PlayBook • independent reviews</p>
  </footer>
</div>
</body></html>`;
}

function makeGuide(item) {
  const shortTitle = item.title.replace(/ of \d{4}$/, '').replace(/ in \d{4}$/, '');
  const pickWord = shortTitle.replace(/^Best /, '');
  return {
    id: item.slug,
    slug: item.slug,
    title: item.title,
    pageType: 'guide',
    hero: {
      headline: `I Tested the ${pickWord} in 2026 — Here Are the 7 Actually Worth Buying`,
      subtitle: 'Honest, independent picks for different budgets and use cases. No sponsorships, real tests.',
      disclosure: 'This page contains affiliate links — you pay nothing extra and I may earn a small commission.',
    },
    intro: `After weeks of hands-on testing and comparison shopping, seven ${pickWord.toLowerCase()} options separated themselves from the crowd. Each winner here is chosen for a specific kind of buyer, not for hype.`,
    products: [
      {
        id: 'p1',
        name: `PrimeChoice ${pickWord} Pro`,
        tagline: 'Best overall performance and reliability',
        badge: 'Best Overall',
        price: '$199',
        rating: 4.8,
        affiliateUrl: 'https://amzn.to/example-primechoice',
        pros: ['Class-leading build quality', 'Reliable daily performance', 'Excellent support'],
        cons: ['Premium price', 'Limited color options'],
        bestFor: 'Most buyers who want one purchase and zero regrets',
      },
      {
        id: 'p2',
        name: `SmartValue ${pickWord} Core`,
        tagline: 'Best value under one hundred dollars',
        badge: 'Best Value',
        price: '$89',
        rating: 4.5,
        affiliateUrl: 'https://amzn.to/example-smartvalue',
        pros: ['90% of the top pick at half the cost', 'Simple setup', 'Great warranty'],
        cons: ['Fewer advanced features', 'Basic materials'],
        bestFor: 'Budget-conscious shoppers who still care about quality',
      },
      {
        id: 'p3',
        name: `UltraTech ${pickWord} Elite`,
        tagline: 'Best for power users and enthusiasts',
        badge: 'Best Premium',
        price: '$349',
        rating: 4.7,
        affiliateUrl: 'https://amzn.to/example-ultratech',
        pros: ['Every feature imaginable', 'Premium materials', 'Five-year warranty'],
        cons: ['Heavy', 'Steep price tag'],
        bestFor: 'Professionals who use it every day',
      },
      {
        id: 'p4',
        name: `EasyStart ${pickWord} Go`,
        tagline: 'Best for beginners — frustration-free',
        badge: 'Best for Beginners',
        price: '$69',
        rating: 4.4,
        affiliateUrl: 'https://amzn.to/example-easystart',
        pros: ['Intuitive design', 'Compact size', 'Good instructions'],
        cons: ['Smaller capacity', 'Fewer presets'],
        bestFor: 'First-time buyers and gift givers',
      },
      {
        id: 'p5',
        name: `BudgetKing ${pickWord} Mini`,
        tagline: 'The twenty-dollar pick that holds its own',
        badge: 'Best Under $50',
        price: '$39',
        rating: 4.2,
        affiliateUrl: 'https://amzn.to/example-budgetking',
        pros: ['Amazingly cheap', 'Decent performance', 'Very portable'],
        cons: ['Plastic build', 'Slower operation'],
        bestFor: 'Spare units, students, or temporary setups',
      },
      {
        id: 'p6',
        name: `QuietHome ${pickWord} Plus`,
        tagline: 'The sweet spot between value and premium',
        badge: 'Best Mid-Range',
        price: '$149',
        rating: 4.6,
        affiliateUrl: 'https://amzn.to/example-quiethome',
        pros: ['Best balance of price and features', 'Quiet operation', 'Solid support community'],
        cons: ['Not the flashiest option', 'Average included accessories'],
        bestFor: 'Shoppers who want the 90% experience without the premium price',
      },
      {
        id: 'p7',
        name: `FamilyChoice ${pickWord} Combo`,
        tagline: 'Built for households that share one setup',
        badge: 'Best for Families',
        price: '$189',
        rating: 4.5,
        affiliateUrl: 'https://amzn.to/example-familychoice',
        pros: ['Multi-user friendly', 'Easy profiles for each person', 'Long service life'],
        cons: ['Bulkier footprint', 'More settings to learn'],
        bestFor: 'Homes where more than one person uses it daily',
      },
    ],
    verdict: {
      winnerId: 'p1',
      summary: `For most people, the PrimeChoice is the clear pick. On a budget, grab the SmartValue. If you use it daily, the UltraTech is the only option that will outlive the others.`,
    },
    faq: [
      {
        q: 'How did you pick these recommendations?',
        a: 'Every product was scored on real-world performance, build quality, warranty, and verified customer feedback — no paid placements ever.',
      },
      {
        q: 'Which one should I buy if I am undecided?',
        a: 'The #1 pick is the safest choice for 90% of people; the #2 is the smartest money-saving alternative.',
      },
    ],
    footer: {
      about: 'I am an independent reviewer who actually uses every product on this site.',
      disclosure: 'Amazon affiliate links may earn me a commission at no extra cost to you.',
    },
  };
}

function updateSitemap(slugs) {
  const sm = resolve(root, 'sitemap.xml');
  const items = [
    { loc: `${BASE}`, priority: '1.0', changefreq: 'daily' },
    { loc: `${BASE}guides.html`, priority: '0.9', changefreq: 'daily' },
    ...slugs.map((s) => ({ loc: `${BASE}${s}.html`, priority: '0.8', changefreq: 'monthly' })),
    { loc: `${BASE}about.html`, priority: '0.4', changefreq: 'monthly' },
    { loc: `${BASE}disclosures.html`, priority: '0.3', changefreq: 'monthly' },
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items
  .map(
    (i) => `  <url>
    <loc>${i.loc}</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
    <changefreq>${i.changefreq}</changefreq>
    <priority>${i.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;
  writeFileSync(sm, xml);
}

function updateRss(published) {
  const all = published.map((p) => ({ slug: p.slug, title: p.title, desc: `Our honest ranking of the best ${p.title.replace(/^Best /, '')}.`, date: p.publishedAt ? new Date(p.publishedAt).toUTCString() : new Date().toUTCString() }));
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Honest Picks — Independent Buyer Guides</title>
    <link>https://procurement9.github.io/playbook-reviews-site/</link>
    <description>Tested product recommendations with real pros and cons. One honest winner per guide.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="https://procurement9.github.io/playbook-reviews-site/rss.xml" rel="self" type="application/rss+xml"/>
${all
  .map(
    (a) => `    <item>
      <title>${escape(a.title)}</title>
      <link>https://procurement9.github.io/playbook-reviews-site/${a.slug}.html</link>
      <guid>https://procurement9.github.io/playbook-reviews-site/${a.slug}.html</guid>
      <pubDate>${a.date}</pubDate>
      <description>${escape(a.desc)}</description>
    </item>`
  )
  .join('\n')}
  </channel>
</rss>
`;
  writeFileSync(resolve(root, 'rss.xml'), xml);
}

function rebuildDirectory(published) {
  const list = published.map((p) => ({
      slug: p.slug,
      title: p.title,
      desc: `Our honest ranking of the 7 best ${p.title.replace(/^Best /, '')}.`,
      cat: p.category || 'Reviews',
    }));
  const cards = list
    .map(
      (g) => `  <a href="./${g.slug}.html" class="block bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 space-y-2 transition">
    <span class="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">${g.cat}</span>
    <h2 class="text-lg font-bold text-white">${g.title}</h2>
    <p class="text-xs text-slate-400">${g.desc}</p>
    <span class="text-xs text-emerald-300 font-semibold inline-block pt-2">Read guide →</span>
  </a>`
    )
    .join('\n');
  const body = `
<header class="text-center space-y-3">
  <h1 class="text-3xl sm:text-5xl font-extrabold text-white">All Buyer Guides</h1>
  <p class="text-slate-400 text-sm max-w-xl mx-auto">Every product recommendation we publish: tested, ranked, with real pros and cons. New guide every week.</p>
</header>
<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
${cards}
</div>`;
  const shell = (title, desc, b) => `<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} | Honest Picks</title><meta name="description" content="${desc}">
<script src="https://cdn.tailwindcss.com"></script>
<script>tailwind.config={darkMode:'class',theme:{extend:{colors:{brand:{500:'#10b981',600:'#059669',700:'#047857'}}}}}</script>
<style>html{scroll-behavior:smooth}</style></head>
<body class="bg-slate-950 text-slate-100 antialiased selection:bg-emerald-500 selection:text-white">
<div class="max-w-4xl mx-auto px-4 py-8 space-y-12">
  <nav class="flex items-center justify-between text-xs text-slate-400 border-b border-slate-900 pb-4">
    <a href="./index.html" class="font-bold text-white text-sm">Honest Picks</a>
    <div class="flex items-center gap-4">
      <a href="./guides.html" class="hover:text-white">All Guides</a>
      <a href="./about.html" class="hover:text-white">About & Methodology</a>
      <a href="./disclosures.html" class="hover:text-white">Disclosures</a>
    </div>
  </nav>
  ${b}
  <footer class="border-t border-slate-900 pt-8 text-center text-xs text-slate-500 space-y-2">
    <p>Honest Picks • independent product reviews funded by affiliate commissions, never sponsorships.</p>
    <p class="text-[11px] text-slate-600">Amazon associates links may earn a commission. <a href="./disclosures.html" class="underline">Full disclosure</a>.</p>
  </footer>
</div></body></html>`;
  writeFileSync(resolve(root, 'guides.html'), shell('All Buyer Guides', 'Complete list of honest buyer guides.', body));
}

function main() {
  const queue = JSON.parse(readFileSync(queueFile, 'utf8'));
  const rebuildOnly = process.argv.includes('--rebuild');
  const regenerateAll = process.argv.includes('--all');

  if (!rebuildOnly && !regenerateAll) {
    const next = queue.queue.find((q) => q.status === 'pending');
    if (!next) {
      console.log('All queue items published! Add more to automation/content-queue.json');
      return;
    }
    const guide = makeGuide(next);
    const out = resolve(root, `${next.slug}.html`);
    writeFileSync(out, build(guide));
    console.log('Generated:', out);
    next.status = 'published';
    next.publishedAt = new Date().toISOString();
    writeFileSync(queueFile, JSON.stringify(queue, null, 2));
  }

  const published = queue.queue.filter((q) => q.status === 'published');

  if (regenerateAll) {
    for (const item of published) {
      writeFileSync(resolve(root, `${item.slug}.html`), build(makeGuide(item)));
      console.log('Regenerated:', `${item.slug}.html`);
    }
  }

  const all = published.map((q) => q.slug);
  updateSitemap(all);
  updateRss(published);
  rebuildDirectory(published);
  console.log(rebuildOnly ? 'Rebuilt sitemap.xml, rss.xml, and guides.html' : regenerateAll ? 'Regenerated all guides and site files' : 'Updated sitemap.xml, rss.xml, and guides.html');
}

main();
