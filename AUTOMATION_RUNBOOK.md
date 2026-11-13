# Honest Picks — editorial and automation status

## Important correction

The earlier demo guides and social templates contained sample products, placeholder affiliate links, prices, ratings, and unsupported claims of hands-on testing. They must not be treated as factual or scheduled to social media. The affected live pages now show correction notices; prior versions remain in Git history.

The earlier statement that the system would automatically publish reliable weekly guides was incorrect. The scheduled weekly publishing workflow is paused. The old guide and social generators intentionally exit with an error to prevent unreviewed publishing. The content queue is retained for planning only; its historical `published` statuses do not establish that a guide is currently live or verified. The RSS feed has no items while review is in progress. Any posts already queued in a third-party scheduler must be reviewed or removed there separately.

## Travel and dining

The public site includes Hotels, Restaurants, and Flights pages. These link to external Google search services and provide comparison checklists. They do not show live offers, make bookings, or contain the owner's affiliate tracking. Provider availability, terms, and prices must be verified on the provider's site. No earnings are implied.

To rebuild the current static pages locally after editing the generator, run:

```sh
node automation/build-site-pages.mjs
```

GitHub Pages deployment remains separate from the paused content generator. Inspect the actual deployment status before claiming that a change is live. The monthly accounting workflow and commission files are not changed by this correction.

## NVIDIA NIM connection check

NVIDIA NIM replaces Dahl as the configured AI provider. The manually triggered **NVIDIA NIM connection check** workflow tests a minimal model request (`nvidia/llama-3.1-nemotron-70b-instruct`) without generating or publishing website content. It runs only from `main`, has read-only repository permissions, and uses a GitHub Actions secret named `NVIDIA_API_KEY`. Create the secret in the repository's **Settings → Secrets and variables → Actions**; never commit the key or put it in a draft, issue, or workflow log. Obtain a key from https://build.nvidia.com/settings/api-keys. You manage the token balance and credits manually in your NVIDIA account. A successful check verifies connectivity, not the quality or safety of generated content.

## Draft-and-approval workflow

1. **Generate a private draft** (never published automatically):
   ```sh
   # Local only (saved to drafts/)
   node automation/generate-draft.mjs --topic "best wireless noise-canceling headphones"
   # Local + upload to your private Google Drive folder
   node automation/generate-draft.mjs --topic "best wireless noise-canceling headphones" --drive
   # List topics from the queue
   node automation/generate-draft.mjs --list
   ```
   The generator uses NVIDIA NIM when `NVIDIA_API_KEY` is present, with the built-in AI as fallback. Drafts are written to `drafts/` (git-ignored, never committed) and optionally uploaded to the private **"Honest Picks - Private Drafts"** Google Drive folder (`1lJfYRsnDuhVppFpEc0GDD-FnORzrK0jC`).

2. **Review and verify**: the owner checks every `[VERIFY]` item, confirms specs/prices/models, and edits the draft.

3. **Publish with approval**: only after the owner approves, convert the verified draft into the site generator (e.g. `automation/build-site-pages.mjs`) or merge it into `pages/`, commit to `main`, and push. The existing deploy workflow then publishes the page to GitHub Pages.

No content is published automatically. The weekly content workflow remains paused until you explicitly choose to re-enable it.

## Before resuming automation

1. Research and verify real products and sources; distinguish hands-on testing from desk research.
2. Use authentic links and disclosures only for affiliate programs actually joined; do not promise earnings or daily payments.
3. Implement a reviewed draft-and-approval workflow that does not automatically publish unsupported claims.
4. Check platform/media requirements and any already-connected Buffer, Hootsuite, or Zapier automations. This project does not establish that any of those accounts are connected.
