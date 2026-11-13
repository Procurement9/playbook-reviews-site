#!/usr/bin/env node
// No external requests, generation, publication or credential values in output.
import { appendFileSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const workflowDir = resolve(root, '.github/workflows');
const files = readdirSync(workflowDir).filter((name) => /\.ya?ml$/.test(name));
const referencedSecrets = new Set();
const referencedVariables = new Set();
for (const file of files) {
  const source = readFileSync(resolve(workflowDir, file), 'utf8');
  for (const match of source.matchAll(/secrets\.([A-Z][A-Z0-9_]*)/g)) referencedSecrets.add(match[1]);
  for (const match of source.matchAll(/vars\.([A-Z][A-Z0-9_]*)/g)) referencedVariables.add(match[1]);
}

const lines = [
  '# Workflow configuration audit',
  '',
  'This audit makes no provider calls and does not publish content.',
  '',
  `Workflow files inspected: ${files.length}.`,
  `Referenced secret names: ${[...referencedSecrets].sort().join(', ') || 'none'}.`,
  `Referenced variable names: ${[...referencedVariables].sort().join(', ') || 'none'}.`,
  '',
];
let failed = false;
for (const secret of referencedSecrets) {
  if (secret === 'GITHUB_TOKEN') {
    lines.push('- GITHUB_TOKEN: supplied automatically by GitHub; no personal token is required.');
  } else if (secret === 'NVIDIA_API_KEY') {
    const present = Boolean(process.env.NVIDIA_API_KEY?.trim());
    lines.push(`- NVIDIA_API_KEY: ${present ? 'present in this job (validity not tested)' : 'MISSING from this job; add a repository secret with this exact name'}.`);
    failed ||= !present;
  } else {
    lines.push('- An additional secret is referenced; its availability is not mapped into this audit.');
    failed = true;
  }
}
const model = process.env.NVIDIA_MODEL?.trim();
const safeModel = !model || /^[a-zA-Z0-9][a-zA-Z0-9._/-]{0,199}$/.test(model);
lines.push(`- NVIDIA_MODEL: ${!safeModel ? 'invalid model identifier format' : model ? 'optional override supplied' : 'optional; configured default will be used'}.`);
failed ||= !safeModel;
lines.push(
  '',
  'Deployment and accounting do not need a model-provider, Cloudflare, Buffer, or Google Drive secret.',
  'Draft generation is manual and is not called by the current workflows.',
  'Manual --drive upload requires a working, authorized gws CLI in its own execution environment.',
  'Private draft credentials and data are not inherited by GitHub Actions from Manus.',
  'Weekly publishing remains paused. Pushes to main still deploy the site; this audit is not an approval gate.',
);
const report = `${lines.join('\n')}\n`;
console.log(report);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, report);
process.exitCode = failed ? 1 : 0;
