#!/usr/bin/env node
// Generates honest buyer-guide DRAFTS using NVIDIA NIM (with built-in AI fallback).
// Drafts are saved locally to drafts/ and optionally uploaded to your private
// Google Drive folder. They are NEVER committed or published automatically.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DRIVE_FOLDER_ID = '1lJfYRsnDuhVppFpEc0GDD-FnORzrK0jC'; // "Honest Picks - Private Drafts"

const nvidiaKey = process.env.NVIDIA_API_KEY?.trim();
const nvidiaModel = process.env.NVIDIA_MODEL?.trim() || 'nvidia/llama-3.1-nemotron-70b-instruct';
const openaiBase = process.env.OPENAI_API_BASE;
const openaiKey = process.env.OPENAI_API_KEY;
const openrouterKey = process.env.OPENROUTER_API_KEY;

function provider() {
  if (nvidiaKey) return { kind: 'nvidia', base: 'https://integrate.api.nvidia.com/v1', key: nvidiaKey, model: nvidiaModel };
  if (openaiBase && openaiKey) return { kind: 'builtin', base: openaiBase.replace(/\/$/, ''), key: openaiKey, model: 'gpt-6-luna' };
  if (openrouterKey) return { kind: 'openrouter', base: 'https://openrouter.ai/api/v1', key: openrouterKey, model: 'openai/gpt-4o-mini' };
  return null;
}

async function ask(messages, maxTokens = 2200) {
  const p = provider();
  if (!p) throw new Error('No AI provider configured (set NVIDIA_API_KEY, or use the built-in AI)');
  if (p.kind === 'nvidia' && !/^[a-zA-Z0-9][a-zA-Z0-9._/-]{0,199}$/.test(p.model)) {
    throw new Error('NVIDIA_MODEL has an invalid model identifier format');
  }
  const r = await fetch(`${p.base}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${p.key}` },
    body: JSON.stringify({ model: p.model, messages, temperature: 0.6, max_tokens: maxTokens }),
    signal: AbortSignal.timeout(90000),
  });
  if (!r.ok) throw new Error(`${p.kind} HTTP ${r.status}`);
  const data = await r.json();
  const t = data.choices?.[0]?.message?.content;
  if (!t) throw new Error('Empty model response');
  return { text: t, via: `${p.kind}/${p.model}` };
}

function nextTopic() {
  const qPath = resolve(ROOT, 'automation/content-queue.json');
  if (!existsSync(qPath)) return { title: 'Best budget laptops 2026', niche: 'laptops' };
  const queue = JSON.parse(readFileSync(qPath, 'utf8'));
  const pick = queue.find((t) => t.status !== 'done') || queue[0];
  return pick;
}

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function main() {
  const args = process.argv.slice(2);
  const topicArg = args.find((a, i) => args[i - 1] === '--topic');
  const uploadDrive = args.includes('--drive');
  const listFlag = args.includes('--list');

  if (listFlag) {
    const q = JSON.parse(readFileSync(resolve(ROOT, 'automation/content-queue.json'), 'utf8'));
    q.forEach((t, i) => console.log(`${String(i + 1).padStart(2)}. [${t.status || 'queued'}] ${t.title} (${t.niche})`));
    return;
  }

  const topic = topicArg ? { title: topicArg, niche: topicArg } : nextTopic();
  const slug = topic.slug || slugify(topic.title);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error('Draft slug is invalid');
  console.log(`Generating draft for: "${topic.title}" (${topic.niche})`);

  const system = `You are a careful, honest affiliate-review writer. Rules you must never violate:
1. NEVER invent products, models, prices, ratings, or test results. If unsure, mark clearly with [VERIFY].
2. Differentiate hands-on experience from desk research. This is a DESK-RESEARCH draft; say so.
3. Include real negatives (at least two cons per product) and honest verdicts.
4. Keep FTC-style disclosure honesty; never promise income or daily payments.
5. Format the guide in Markdown with: title (h1), intro paragraph stating the honest methodology, 4-5 recommended picks with badges/price/best-for/pros/cons, a comparison summary, who should skip this category, and a clear final verdict.`;

  const user = `Write a "Best ${topic.niche} of 2026" buyer guide titled "${topic.title}". Use realistic top picks (use [VERIFY] next to any spec, price, or model name that should be double-checked before publication). End with a short "Reviewer checklist" of facts the owner must verify before publishing.`;

  const { text: md, via } = await ask([
    { role: 'system', content: system },
    { role: 'user', content: user },
  ]);

  const draftsDir = resolve(ROOT, 'drafts');
  mkdirSync(draftsDir, { recursive: true });
  const mdPath = resolve(draftsDir, `${slug}.md`);
  const meta = `---\ntitle: "${topic.title}"\nslug: "${slug}"\nniche: "${topic.niche}"\ngenerated: "${new Date().toISOString()}"\nmodel: "${via}"\nstatus: "draft — pending owner review"\n---\n\n`;
  writeFileSync(mdPath, meta + md);
  console.log(`Draft saved: drafts/${slug}.md (via ${via})`);

  if (uploadDrive) {
    try {
      const jsonMeta = JSON.stringify({ name: `${topic.title} (DRAFT — review before publishing)`, parents: [DRIVE_FOLDER_ID], description: `Draft generated ${new Date().toISOString()} via ${via}. Publish to Honest Picks only after owner approval.` });
      const out = execFileSync('gws', [
        'drive', 'files', 'create', '--upload', mdPath,
        '--upload-content-type', 'text/markdown', '--json', jsonMeta,
        '--params', '{"fields":"id,name,webViewLink"}',
      ], { encoding: 'utf8', timeout: 60000, stdio: ['ignore', 'pipe', 'pipe'] });
      const res = JSON.parse(out);
      if (!res.id) throw new Error('Drive upload returned no file identifier');
      console.log(`Uploaded to private Drive: ${res.webViewLink || res.id}`);
    } catch {
      throw new Error('Drive upload failed; the draft remains local. Check gws authorization and folder access');
    }
  }

  console.log('\nNext steps:');
  console.log('  1. Review and edit the draft (verify [VERIFY] items).');
  console.log('  2. When approved, convert to the site generator or merge into pages/.');
  console.log('  3. Publish only after your approval — nothing published automatically.');
}

main().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });
