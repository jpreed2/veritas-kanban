#!/usr/bin/env node
import http from 'node:http';
import { spawn } from 'node:child_process';

const PORT = Number(process.env.OPENCLAW_WAKE_PORT || '8788');
const PICKUP_CMD = process.env.OPENCLAW_PICKUP_CMD || 'node scripts/openclaw-pickup.mjs --once';

let running = false;

function runPickup() {
  if (running) {
    return;
  }
  running = true;

  const child = spawn(PICKUP_CMD, {
    stdio: 'inherit',
    shell: true,
    env: process.env,
  });

  child.on('exit', () => {
    running = false;
  });
  child.on('error', (err) => {
    running = false;
    console.error(`[openclaw-wake] pickup failed: ${err.message}`);
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method !== 'POST') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, service: 'openclaw-wake-server' }));
    return;
  }

  // Drain body (hook payload is optional for this minimal implementation)
  req.resume();
  req.on('end', () => {
    runPickup();
    res.writeHead(202, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ accepted: true }));
  });
});

server.listen(PORT, () => {
  console.log(`[openclaw-wake] Listening on http://0.0.0.0:${PORT}`);
  console.log(`[openclaw-wake] pickup command: ${PICKUP_CMD}`);
});
