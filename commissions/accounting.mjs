#!/usr/bin/env node
// Commission & payout accounting for Honest Picks.
// Zero dependencies: node commissions/accounting.mjs <command> ...
//
// Commands:
//   init                        create ledger/config scaffolds if missing
//   link-check                  audit: count placeholder (not-yet-monetized) affiliate links per guide
//   record <date> <amount> <guide-slug> [product] [notes]
//                               log a commission (estimated or confirmed)
//   payout <date> <amount> <method> [notes]
//                               log money received out of the commission balance
//   report [YYYY-MM]            monthly summary: commissions, payouts, balance, monetization status
//   link-status                 per-guide monetization matrix (links vs placeholders, tag set?)
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const dir = __dirname;

const CONFIG_FILE = resolve(dir, 'affiliate-config.json');
const LEDGER_FILE = resolve(dir, 'ledger.json');
const CSV_FILE = resolve(dir, 'ledger.csv');
const QUEUE_FILE = resolve(dir, '../automation/content-queue.json');

const EMPTY_CONFIG = {
  amazonTag: '',
  paymentAccounts: {
    directDeposit: { provider: '', status: 'not-set-up', notes: '' },
    amazonGiftCard: { status: 'not-set-up', notes: '' },
    other: { provider: '', status: 'not-set-up', notes: '' },
  },
  createdAt: new Date().toISOString(),
};

const EMPTY_LEDGER = { updatedAt: new Date().toISOString(), commissions: [], payouts: [] };

function ensureFiles() {
  if (!existsSync(CONFIG_FILE)) writeFileSync(CONFIG_FILE, JSON.stringify(EMPTY_CONFIG, null, 2));
  if (!existsSync(LEDGER_FILE)) writeFileSync(LEDGER_FILE, JSON.stringify(EMPTY_LEDGER, null, 2));
  writeCsv();
}

function loadJson(p, fallback) {
  return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : fallback;
}

function saveLedger(ledger) {
  ledger.updatedAt = new Date().toISOString();
  writeFileSync(LEDGER_FILE, JSON.stringify(ledger, null, 2));
  writeCsv(ledger);
}

function writeCsv(ledger) {
  const L = ledger || loadJson(LEDGER_FILE, EMPTY_LEDGER);
  const rows = [
    'date,type,guide,product,amount,method,notes',
    ...L.commissions.map((c) => [c.date, 'commission', c.guide, c.product, c.amount, c.status, c.notes].join(',')),
    ...L.payouts.map((p) => [p.date, 'payout', '', '', p.amount, p.method, p.notes].join(',')),
  ];
  writeFileSync(CSV_FILE, rows.join('\n') + '\n');
}

function guideFiles() {
  return readdirSync(root).filter((f) => f.endsWith('.html') && !['index.html', 'guides.html', 'about.html', 'disclosures.html', 'niche-guide-template.html'].includes(f));
}

function linkCheck() {
  const queue = loadJson(QUEUE_FILE, { queue: [] }).queue;
  const published = queue.filter((q) => q.status === 'published');
  const rows = [];
  let totalPlaceholders = 0;
  for (const f of guideFiles()) {
    const html = readFileSync(resolve(root, f), 'utf8');
    const placeholders = (html.match(/amzn\.to\/example-[a-z]+/g) || []).length;
    const real = (html.match(/amzn\.to\/example-/g) || []).length ? 0 : (html.match(/amazon\.com\/dp\/|amzn\.to\//g) || []).length;
    totalPlaceholders += placeholders;
    rows.push({ file: f, placeholders, realLinks: Math.max(0, real - placeholders) });
  }
  rows.sort((a, b) => b.placeholders - a.placeholders);
  console.log('MONETIZATION STATUS');
  console.log('--------------------');
  for (const r of rows) console.log(`  ${r.file.padEnd(42)} placeholders: ${String(r.placeholders).padStart(2)}  real links: ${r.realLinks}`);
  console.log('--------------------');
  console.log(`  published guides: ${published.length}  guide pages: ${rows.length}  placeholder links total: ${totalPlaceholders}`);
  const config = loadJson(CONFIG_FILE, EMPTY_CONFIG);
  console.log(`  amazonTag configured: ${config.amazonTag ? 'YES (' + config.amazonTag + ')' : 'NO - no commissions can be earned yet'}`);
  return totalPlaceholders;
}

function record(date, amount, guide, product, notes) {
  const ledger = loadJson(LEDGER_FILE, EMPTY_LEDGER);
  ledger.commissions.push({ date, guide, product: product || '', amount: Number(amount), status: 'estimated', notes: notes || '' });
  saveLedger(ledger);
  console.log(`Recorded commission: ${date} ${amount} ${guide}${product ? ' (' + product + ')' : ''}`);
}

function payout(date, amount, method, notes) {
  const ledger = loadJson(LEDGER_FILE, EMPTY_LEDGER);
  ledger.payouts.push({ date, amount: Number(amount), method, notes: notes || '' });
  saveLedger(ledger);
  console.log(`Recorded payout: ${date} ${amount} via ${method}`);
}

function money(n) {
  return Number(n || 0).toFixed(2);
}

function report(month) {
  const ledger = loadJson(LEDGER_FILE, EMPTY_LEDGER);
  const filter = month ? (d) => d.date?.startsWith(month) : () => true;
  const commissions = ledger.commissions.filter(filter);
  const payouts = ledger.payouts.filter(filter);
  const gross = commissions.reduce((s, c) => s + Number(c.amount), 0);
  const paid = payouts.reduce((s, p) => s + Number(p.amount), 0);
  const byGuide = {};
  for (const c of commissions) byGuide[c.guide] = (byGuide[c.guide] || 0) + Number(c.amount);
  const total = ledger.commissions.reduce((s, c) => s + Number(c.amount), 0);
  const totalPaid = ledger.payouts.reduce((s, p) => s + Number(p.amount), 0);
  console.log(`ACCOUNTING REPORT${month ? ' — ' + month : ' — all time'}`);
  console.log('------------------');
  console.log(`  Commissions: $${money(gross)}  (${commissions.length} entries${month ? '' : ' lifetime'})`);
  console.log(`  Payouts:     $${money(paid)}  (${payouts.length})`);
  console.log(`  Balance due: $${money(gross - paid)}${month ? `  (lifetime balance $${money(total - totalPaid)})` : ''}`);
  console.log('  By guide:');
  for (const [g, v] of Object.entries(byGuide).sort((a, b) => b[1] - a[1])) console.log(`    ${g.padEnd(38)} $${money(v)}`);
  const config = loadJson(CONFIG_FILE, EMPTY_CONFIG);
  console.log('  Payout accounts: ' + Object.entries(config.paymentAccounts || {}).map(([k, v]) => `${k}=${v?.status || '?'}`).join(', '));
  return total;
}

const [cmd, ...args] = process.argv.slice(2);
try {
  switch (cmd) {
    case 'init': ensureFiles(); console.log('Initialized commissions/ (config + ledger + csv).'); break;
    case 'link-check': ensureFiles(); process.exitCode = linkCheck() > 0 ? 1 : 0; break;
    case 'record': ensureFiles(); record(args[0], args[1], args[2], args[3], args[4]); break;
    case 'payout': ensureFiles(); payout(args[0], args[1], args[2], args[3]); break;
    case 'report': ensureFiles(); report(args[0]); break;
    default:
      console.log('Usage: node commissions/accounting.mjs <init|link-check|record|payout|report> ...');
      process.exitCode = 2;
  }
} catch (e) {
  console.error('Error:', e.message);
  process.exitCode = 1;
}
