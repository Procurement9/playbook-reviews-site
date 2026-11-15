# Honest Picks — workflow configuration and editorial status

## Required credentials

The only user-provided secret referenced by the current GitHub Actions workflows is **NVIDIA_API_KEY**. Store it under **Repository secrets**, not Variables, at [Actions settings](https://github.com/Procurement9/playbook-reviews-site/settings/secrets/actions). The latest NVIDIA check before this configuration update, [run 43368715318](https://github.com/Procurement9/playbook-reviews-site/actions/runs/43368715318), received an empty value. This means the key was unavailable to that job; it does not prove the key itself is invalid.

The connected GitHub integration returns HTTP 403 when listing both repository secrets and variables. Therefore their complete remote inventory cannot be independently inspected or edited with this connection. Never place credentials in repository files, drafts, issues or logs. NVIDIA usage, credits and key rotation are managed manually by the owner. Obtain keys from [NVIDIA](https://build.nvidia.com/settings/api-keys); no tokens are created by this project.

**NVIDIA_MODEL** is an optional, non-secret repository variable. When omitted, the scripts use `nvidia/llama-3.1-nemotron-70b-instruct`. Model availability and inference access must still be checked with a valid key. The model identifier can be changed without committing a credential.

The deployment workflow uses **GITHUB_TOKEN**, which GitHub supplies automatically. The monthly report uses checkout's GitHub authentication and a computed shell variable `MONTH`. Neither needs a user-created AI key, database password, Cloudflare token or Google Drive credential.

The manual **Workflow configuration audit** workflow reports whether required credentials are available to its own job, without making provider calls or printing credential values. The **NVIDIA NIM connection check** first runs that audit, then makes a minimal inference call only if configuration passes. Both are main-branch-only, read-only and manual-dispatch-only; they do not generate drafts or publish pages.

## Private drafts: manual operation only

No current GitHub Actions workflow invokes `automation/generate-draft.mjs`, uploads to Drive, or runs scheduled AI drafting. The weekly content workflow is paused; the only configured cron is the monthly accounting report. A working local draft command is not evidence of an automated end-to-end pipeline.

```sh
# Save a private local draft, using credentials supplied by the execution environment.
node automation/generate-draft.mjs --topic "best wireless noise-canceling headphones"
# Save locally and upload with an already-authorized Google Workspace CLI.
node automation/generate-draft.mjs --topic "best wireless noise-canceling headphones" --drive
node automation/generate-draft.mjs --list
```

For manual generation, the script selects NVIDIA when `NVIDIA_API_KEY` is present. If it is absent, the optional pair `OPENAI_API_BASE` and `OPENAI_API_KEY` can select the built-in runtime, otherwise `OPENROUTER_API_KEY` can select OpenRouter. These alternatives are **not required by the current workflows**. Selection is based on availability; a failed NVIDIA request does not automatically retry another provider. Do not copy Manus runtime credentials to GitHub. `.env.example` contains empty placeholders; the scripts do not load it automatically.

`--drive` requires an installed `gws` CLI authorized for the intended Google account and write access to the selected private folder. Manus Google Workspace authorization is not inherited by GitHub Actions. There is no Drive-authentication workflow or named Google credential secret in this repository. Do not guess or create one. If upload fails, the command fails and the local draft remains available.

Drafts go into `drafts/`, which is git-ignored, and optionally into the private **Honest Picks - Private Drafts** folder in the selected ministryestateandtrust account. Git ignore reduces accidental commits; it is not encryption or access control. Draft content is not guaranteed factual: verify every claim, source, product and price before approval. Never publish raw model output automatically.

## Approval and publication

Publication of a reviewed article remains manual: the owner approves the exact verified content, it is integrated into the site's actual HTML or generator, and an authorized push to `main` deploys it. No `pages/` article-import pipeline is implemented by the draft generator. The existing Pages configuration deploys from `main`; there is no verified technical owner-approval gate. Keep unapproved content out of every public branch, pull request and artifact. No schedule or approval system was enabled by this audit.

Commission ledgers and reports reside in a public repository. Never store bank credentials, account numbers, private client data or payment tokens there. The accounting workflow is a report generator, not a payment or bank integration.

## Editorial correction and travel pages

Earlier demo guides contained placeholder products, links, prices, ratings and unsupported hands-on claims. The affected pages now show correction notices. Historical queue statuses do not prove content is verified or live. Legacy guide/social generators remain blocked and the RSS feed has no items pending review. Review any existing third-party social queues separately.

Hotels, Restaurants and Flights pages contain external search links and comparison checklists, not live offers or booking integrations. Buffer, Hootsuite, 9Router and Cloudflare are not wired into the current workflows. They do not need secrets for the workflows that are actually configured; connecting them would require separate endpoint and credential setup.

To rebuild the current static pages after an approved generator change:

```sh
node automation/build-site-pages.mjs
```

Rebuilding and publishing are separate. Verify the actual deployment result before claiming a change is live.
