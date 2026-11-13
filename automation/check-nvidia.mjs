#!/usr/bin/env node
// Minimal, non-publishing NVIDIA NIM connectivity check. Never log credentials or full bodies.
const base = 'https://integrate.api.nvidia.com/v1';
const model = 'nvidia/llama-3.1-nemotron-70b-instruct';
const key = process.env.NVIDIA_API_KEY;

if (!key) {
  console.error('NVIDIA key is missing. Add NVIDIA_API_KEY as a GitHub Actions secret.');
  process.exit(1);
}

try {
  const modelsResponse = await fetch(`${base}/models`, {
    signal: AbortSignal.timeout(20000),
    redirect: 'error',
    headers: { Authorization: `Bearer ${key}` },
  });
  if (!modelsResponse.ok) throw new Error(`Model listing returned HTTP ${modelsResponse.status}`);
  const models = await modelsResponse.json();
  const listed = Array.isArray(models?.data) && models.data.some((m) => m.id === model);
  if (!listed) console.warn(`Note: "${model}" not found in model listing; proceeding with inference check.`);

  const response = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    redirect: 'error',
    signal: AbortSignal.timeout(45000),
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: 'Reply with OK only.' }],
      max_tokens: 8,
      stream: false,
    }),
  });
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw new Error(`Authentication failed (HTTP ${response.status}). Verify your NVIDIA_API_KEY.`);
    if (response.status === 429) throw new Error('NVIDIA rate limit reached (HTTP 429); retry shortly.');
    throw new Error(`Inference request failed (HTTP ${response.status}).`);
  }
  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (typeof text !== 'string' || !text.trim()) throw new Error('The provider returned no assistant response.');
  console.log('NVIDIA NIM authentication and minimal inference succeeded.');
} catch (error) {
  const safe = error instanceof Error && /^(Model listing returned HTTP \d+|Authentication failed|NVIDIA rate limit|Inference request failed|The provider returned no assistant)/.test(error.message)
    ? error.message : 'Connection failed or timed out; check NVIDIA NIM availability.';
  console.error(safe);
  process.exit(1);
}
