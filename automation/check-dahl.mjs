#!/usr/bin/env node
// A minimal, non-publishing connectivity check. Never log credentials or provider bodies.
const base = 'https://inference.dahl.global/v1';
const model = 'MiniMaxAI/MiniMax-M2.7';
const key = process.env.DAHL_API_KEY;

if (!key) {
  console.error('Dahl key is missing. Add DAHL_API_KEY as a GitHub Actions secret.');
  process.exit(1);
}

try {
  const modelsResponse = await fetch(`${base}/models`, {
    signal: AbortSignal.timeout(20000),
    redirect: 'error',
  });
  if (!modelsResponse.ok) throw new Error(`Model listing returned HTTP ${modelsResponse.status}`);
  const models = await modelsResponse.json();
  if (!models.data?.some((entry) => entry.id === model)) {
    throw new Error('The configured model is not currently listed; select a current model.');
  }

  const response = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    redirect: 'error',
    signal: AbortSignal.timeout(45000),
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: 'Reply with OK only.' }],
      max_tokens: 16,
      stream: false,
    }),
  });
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw new Error(`Authentication failed (HTTP ${response.status}).`);
    if (response.status === 402) throw new Error('The key has no allocated token balance (HTTP 402).');
    throw new Error(`Inference request failed (HTTP ${response.status}).`);
  }
  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (typeof text !== 'string' || !text.trim()) throw new Error('The provider returned no assistant response.');
  console.log('Dahl authentication and minimal inference succeeded.');
} catch (error) {
  // Do not print arbitrary upstream exception messages that could include sensitive data.
  const safe = error instanceof Error && /^(Model listing returned HTTP \d+|The configured model|Authentication failed|The key has no allocated|Inference request failed|The provider returned no assistant)/.test(error.message)
    ? error.message : 'Connection failed or timed out; check provider availability.';
  console.error(safe);
  process.exit(1);
}
