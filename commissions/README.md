# Honest Picks — Commission Accounts & Accounting

How commissions get earned, paid out, and tracked. The site earns affiliate commissions
(that is the "data broker payout" of the Digital ATM/PlayBook program: payments come from
the affiliate programs your links drive, not from data sales — there is no mechanism for
big-tech/data brokers to deposit money directly).

## 1. Payment accounts — only you can create these

These need your real identity and tax info, so they cannot be automated. Create them in order:

| # | Account | Where | Purpose | How payouts work |
|---|---------|-------|---------|------------------|
| 1 | Amazon Associates | https://affiliate-program.amazon.com | The storefront for ALL current links (every product card links to Amazon) | Earns referral fees on qualified purchases |
| 2 | Amazon payout method | Inside Associates → "Payments" | Receives your commission money | US bank (direct deposit) or Amazon gift card balance; monthly payout after ~$10 threshold; US tax verification required (W-9) |
| 3 | (optional) PayPal | https://www.paypal.com | Backup receiving account + link-tool payouts | Some networks (CJ, ShareASale, Rakuten) pay via PayPal |

Steps for #1+#2 (Amazon Associates):
1. Sign up at https://affiliate-program.amazon.com with the Honest Picks site URL.
2. Amazon reviews the site (takes 1–5 days). Do NOT show real Amazon links publicly
   until you've made 3 qualifying sales within 180 days ("Active" status).
3. In Associates → Account Settings, grab your **Tracking ID** (looks like `honestpicks-20`).
4. Set the payout: Associates → Payments → choose direct deposit or gift card, submit tax info (W-9).
5. Save the tracking ID here: `commissions/affiliate-config.json` → `amazonTag`.

Other networks to add as the guides grow: CJ Affiliate, ShareASale, Rakuten, eBay Partner
Network (any program with real products for your categories).

## 2. Accounting — the module in this repo

`commissions/accounting.mjs` is a zero-dependency ledger CLI. Data lives in
`commissions/ledger.json` (+ a human-readable `ledger.csv` mirror).

    node commissions/accounting.mjs init                 # create config + ledger (first run only)
    node commissions/accounting.mjs link-check           # audit: how many links are still placeholders
    node commissions/accounting.mjs record 2026-11-10 12.50 best-espresso-machines-2026 "PrimeChoice Pro" "amazon"   # log a commission
    node commissions/accounting.mjs payout 2026-12-01 40.00 direct-deposit "amazon payout"                           # log money received
    node commissions/accounting.mjs report 2026-11       # monthly summary (omit month = lifetime)

Notes:
- Commissions are logged as `estimated`; upgrade them to `confirmed` by editing
  `ledger.json` (status field) once the network reports them.
- `link-check` exits non-zero while placeholder links remain — handy as a CI gate
  once real product links exist.
- The private PlayBook app on Manus has its own Earnings Tracker (browser-local);
  this ledger is the durable book of record for the public site.

## 3. Making the site commission-ready (next step, needs real products)

Today every product card still uses placeholder URLs (`amzn.to/example-*`) and the
product names/brands are fictional. Real commissions need:
1. Real products (ASINs) in the guide pages — replace the template brands with actual items.
2. Real affiliate URLs: `https://www.amazon.com/dp/<ASIN>?tag=<amazonTag>`.
3. `affiliate-config.json` → `amazonTag` set to your Tracking ID.

Until then `link-check` will keep reporting the placeholder count, and no earnings
can accrue. When you have real links, update the generator's product entries and refresh
the pages with `node automation/generate-guide.mjs --all`.
