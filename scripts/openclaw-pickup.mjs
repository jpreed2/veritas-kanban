#!/usr/bin/env node
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

const VK_API_URL = process.env.VK_API_URL || 'http://localhost:3099';
const VK_API_KEY = process.env.VK_API_KEY || process.env.VERITAS_ADMIN_KEY || '';
const OPENCLAW_SPAWN_SCRIPT = process.env.OPENCLAW_SPAWN_SCRIPT || '';
const VERITAS_PUBLIC_API_URL = process.env.VERITAS_PUBLIC_API_URL || VK_API_URL;

const once = process.argv.includes('--once');
const intervalSeconds = Number(process.env.OPENCLAW_PICKUP_INTERVAL_SECONDS || '20');

function headers() {
  const h = { 'Content-Type': 'application/json' };
  if (VK_API_KEY) h['X-API-Key'] = VK_API_KEY;
  return h;
}

function unwrapEnvelope(payload) {
  if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
    return payload.data;
  }
  return payload;
}

function callbackUrlFor(taskId) {
  return `${VERITAS_PUBLIC_API_URL.replace(/\/$/, '')}/api/agents/${taskId}/complete`;
}

async function fetchPendingRequests() {
  const res = await fetch(`${VK_API_URL.replace(/\/$/, '')}/api/agents/pending`, {
    headers: headers(),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to fetch pending requests: HTTP ${res.status} ${text}`);
  }

  const body = await res.json();
  const requests = unwrapEnvelope(body);
  return Array.isArray(requests) ? requests : [];
}

async function writePromptFile(request) {
  const dir = path.join(os.tmpdir(), 'vk-openclaw-prompts');
  await fs.mkdir(dir, { recursive: true });
  const file = path.join(dir, `${request.taskId}-${request.attemptId}.md`);
  await fs.writeFile(file, String(request.prompt || ''), 'utf8');
  return file;
}

async function runSpawnAdapter(request, promptFile, callbackUrl) {
  if (!OPENCLAW_SPAWN_SCRIPT) {
    console.log(
      `[openclaw-pickup] OPENCLAW_SPAWN_SCRIPT is not set; dry-run task=${request.taskId} attempt=${request.attemptId}`
    );
    return;
  }

  await new Promise((resolve, reject) => {
    const child = spawn(
      OPENCLAW_SPAWN_SCRIPT,
      [request.taskId, request.attemptId, promptFile, callbackUrl],
      {
        stdio: 'inherit',
        shell: true,
        env: {
          ...process.env,
          VK_TASK_ID: request.taskId,
          VK_ATTEMPT_ID: request.attemptId,
          VK_PROMPT_FILE: promptFile,
          VK_CALLBACK_URL: callbackUrl,
        },
      }
    );

    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Spawn adapter exited with code ${code}`));
    });
    child.on('error', reject);
  });
}

async function tick() {
  const requests = await fetchPendingRequests();
  if (!requests.length) {
    console.log('[openclaw-pickup] No pending agent requests');
    return;
  }

  console.log(`[openclaw-pickup] Found ${requests.length} pending request(s)`);

  for (const request of requests) {
    if (!request?.taskId || !request?.attemptId) {
      continue;
    }
    const promptFile = await writePromptFile(request);
    const callbackUrl = callbackUrlFor(request.taskId);
    await runSpawnAdapter(request, promptFile, callbackUrl);
  }
}

async function main() {
  if (once) {
    await tick();
    return;
  }

  console.log(
    `[openclaw-pickup] Watching ${VK_API_URL}/api/agents/pending every ${intervalSeconds}s`
  );
  await tick();
  setInterval(() => {
    tick().catch((err) => console.error(`[openclaw-pickup] ${err.message}`));
  }, Math.max(5, intervalSeconds) * 1000);
}

main().catch((err) => {
  console.error(`[openclaw-pickup] Fatal: ${err.message}`);
  process.exit(1);
});
