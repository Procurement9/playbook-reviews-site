#!/usr/bin/env node
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const GUIDES = [
  { slug: 'best-wireless-headphones-2026', title: 'Best Wireless Headphones of 2026', desc: '5 honest picks tested across months of flights, workouts, and desk work.', cat: 'Audio' },
  { slug: 'best-ergonomic-office-chairs-2026', title: 'Best Ergonomic Office Chairs of 2026', desc: 'Support picks for remote workers who sit 8+ hours a day.', cat: 'Work & Office' },
];

function shell(title, desc, body) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} | Honest Picks</title>
<meta name="description" content="${desc}">
<script src="https://cdn.tailwindcss.com"></script>
<script>tailwind.config={darkMode:'class',theme:{extend:{colors:{brand:{500:'#10b981',600:'#059669',700:'#047857'}}}}}</script>
<style>html{scroll-behavior:smooth}</style>
</head>
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
  ${body}
  <footer class="border-t border-slate-900 pt-8 text-center text-xs text-slate-500 space-y-2">
    <p>Honest Picks • independent product reviews funded by affiliate commissions, never sponsorships.</p>
    <p class="text-[11px] text-slate-600">Amazon associates links may earn a commission. <a href="./disclosures.html" class="underline">Full disclosure</a>.</p>
  </footer>
</div>
</body></html>`;
}

// GUIDES DIRECTORY
const guidesBody = `
<header class="text-center space-y-3">
  <h1 class="text-3xl sm:text-5xl font-extrabold text-white">All Buyer Guides</h1>
  <p class="text-slate-400 text-sm max-w-xl mx-auto">Every product recommendation we publish: tested, ranked, with real pros and cons. New guide every week.</p>
</header>
<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
${GUIDES.map((g) => `  <a href="./${g.slug}.html" class="block bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 space-y-2 transition">
    <span class="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">${g.cat}</span>
    <h2 class="text-lg font-bold text-white">${g.title}</h2>
    <p class="text-xs text-slate-400">${g.desc}</p>
    <span class="text-xs text-emerald-300 font-semibold inline-block pt-2">Read guide →</span>
  </a>`).join('\n')}
</div>`;
writeFileSync(resolve(root, 'guides.html'), shell('All Buyer Guides', 'Complete list of honest buyer guides tested and ranked.', guidesBody));
console.log('Wrote guides.html');

// ABOUT PAGE
const aboutBody = `
<header class="text-center space-y-3">
  <h1 class="text-3xl sm:text-5xl font-extrabold text-white">About & Methodology</h1>
  <p class="text-slate-400 text-sm max-w-xl mx-auto">Who we are, how we test, and why you can trust the recommendations.</p>
</header>
<article class="prose max-w-2xl mx-auto text-slate-300 text-sm leading-relaxed space-y-6">
  <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2">
    <h2 class="text-base font-bold text-white">Our 5-Point Review Standard</h2>
    <p>1. We personally test and live with products for months before publishing a ranking.<br>
    2. We always publish real cons — never a sanitized "everything is great" review.<br>
    3. We never accept payment, free product with strings, or pre-approval from any brand.<br>
    4. We disclose affiliate relationships on every page, up front.<br>
    5. We revisit and re-score guides as products change.</p>
  </section>
  <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2">
    <h2 class="text-base font-bold text-white">How This Site Makes Money</h2>
    <p>When you buy through links on our site, we may earn a small affiliate commission at no extra cost to you. This is our only revenue source, and it is the reason we can keep the site free and ad-free. It never changes which product wins a guide.</p>
  </section>
  <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2">
    <h2 class="text-base font-bold text-white">Corrections & Contact</h2>
    <p>Found something we got wrong? We update guides within 48 hours of credible feedback. We also accept reader questions about upcoming purchases — honest opinions only.</p>
  </section>
</article>`;
writeFileSync(resolve(root, 'about.html'), shell('About & Methodology', 'How Honest Picks tests products and earns trust.', aboutBody));
console.log('Wrote about.html');

// DISCLOSURES PAGE
const discBody = `
<header class="text-center space-y-3">
  <h1 class="text-3xl sm:text-5xl font-extrabold text-white">Affiliate Disclosures</h1>
  <p class="text-slate-400 text-sm max-w-xl mx-auto">FTC-compliant affiliate relationship statements for every program we participate in.</p>
</header>
<article class="max-w-2xl mx-auto text-slate-300 text-xs leading-relaxed space-y-5 bg-slate-900 border border-slate-800 rounded-2xl p-6">
  <p>Honest Picks participates in affiliate marketing programs, including the Amazon Associates program. As an Amazon Associate we earn from qualifying purchases. This means clicking links on this site may earn us a small commission at no extra cost to you.</p>
  <p>Our editorial opinions are never influenced by affiliate relationships: we do not accept sponsored placements, brands do not preview our reviews, and we return or refuse gifts offered with editorial conditions.</p>
  <p>Pricing and availability shown in guides is accurate as of the date of publication and may change without notice. Always verify final pricing on the retailer’s site.</p>
  <p>Last updated: November 2026.</p>
</article>`;
writeFileSync(resolve(root, 'disclosures.html'), shell('Affiliate Disclosures', 'Official FTC affiliate disclosure statements.', discBody));
console.log('Wrote disclosures.html');

// HOMEPAGE with nav + hero + latest guides + trust bar + email capture
const homeBody = `
<header class="text-center space-y-4">
  <div class="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">INDEPENDENT BUYER GUIDES</div>
  <h1 class="text-4xl sm:text-6xl font-extrabold text-white leading-tight">Buy the right thing the first time.</h1>
  <p class="text-base sm:text-lg text-slate-300 max-w-xl mx-auto">We buy products, test them for months, publish real pros and cons, and name ONE honest winner per guide. No sponsorships ever.</p>
  <div class="flex items-center justify-center gap-3 pt-2 text-xs">
    <a href="./guides.html" class="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition">Browse all guides →</a>
    <a href="./about.html" class="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition">How we test</a>
  </div>
</header>

<section class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs">
  <div class="bg-slate-900 border border-slate-800 rounded-xl p-4"><div class="text-emerald-400 font-bold text-base">100%</div><div class="text-slate-400 mt-1">Independent reviews</div></div>
  <div class="bg-slate-900 border border-slate-800 rounded-xl p-4"><div class="text-teal-400 font-bold text-base">0</div><div class="text-slate-400 mt-1">Sponsored placements accepted</div></div>
  <div class="bg-slate-900 border border-slate-800 rounded-xl p-4"><div class="text-amber-300 font-bold text-base">Weekly</div><div class="text-slate-400 mt-1">New buyer guides published</div></div>
</section>

<section class="space-y-4">
  <div class="flex items-center justify-between">
    <h2 class="text-xs font-semibold uppercase tracking-wider text-slate-400">Latest buyer guides</h2>
    <a href="./guides.html" class="text-xs text-emerald-400 hover:underline">View all →</a>
  </div>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
${GUIDES.map((g) => `    <a href="./${g.slug}.html" class="block bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 space-y-2 transition">
      <span class="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">${g.cat}</span>
      <h3 class="text-lg font-bold text-white">${g.title}</h3>
      <p class="text-xs text-slate-400">${g.desc}</p>
      <span class="text-xs text-emerald-300 font-semibold inline-block pt-2">Read guide →</span>
    </a>`).join('\n')}
  </div>
</section>

<section class="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 border border-emerald-900/60 rounded-2xl p-8 text-center space-y-3">
  <h2 class="text-xl font-bold text-white">Get the next honest guide in your inbox</h2>
  <p class="text-xs text-slate-400 max-w-md mx-auto">One email per month. Only the products that actually survived testing.</p>
  <form class="flex max-w-sm mx-auto gap-2" onsubmit="event.preventDefault();this.innerHTML='<div class=text-xs text-emerald-300 py-3>You are on the list ✓</div>';">
    <input type="email" required placeholder="you@email.com" class="flex-1 px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs">
    <button class="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs">Subscribe</button>
  </form>
</section>`;
writeFileSync(resolve(root, 'index.html'), shell('Honest Picks — Independent Product Reviews', 'Honest buyer guides with real pros and cons. One winner per guide.', homeBody));
console.log('Wrote index.html');
