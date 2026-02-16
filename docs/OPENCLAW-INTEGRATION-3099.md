# OpenClaw Auto-Integration (Docker on Port 3099)

This setup gives you:

1. MCP tools so OpenClaw can use Veritas Kanban as a skill.
2. Automatic pickup flow (webhook wake + pending request worker).

## 1) OpenClaw MCP Config

Build MCP once:

```bash
cd mcp
pnpm build
```

Use this MCP server entry in your OpenClaw config:

```json
{
  "mcpServers": {
    "veritas-kanban": {
      "command": "node",
      "args": ["/absolute/path/to/veritas-kanban/mcp/dist/index.js"],
      "env": {
        "VK_API_URL": "http://localhost:3099",
        "VK_API_KEY": "<your-veritas-admin-or-agent-key>"
      }
    }
  }
}
```

## 2) Environment for Auto Pickup

Export these in the shell where the pickup/wake processes run:

```bash
export VK_API_URL=http://localhost:3099
export VK_API_KEY="<your-veritas-admin-or-agent-key>"
export VERITAS_PUBLIC_API_URL="http://localhost:3099"
export OPENCLAW_SPAWN_SCRIPT="/absolute/path/to/veritas-kanban/scripts/openclaw-spawn-adapter.example.sh"
```

`VERITAS_PUBLIC_API_URL` ensures callback URLs use `:3099`.

## 3) Implement Your Spawn Adapter

Copy and customize:

```bash
cp scripts/openclaw-spawn-adapter.example.sh scripts/openclaw-spawn-adapter.sh
chmod +x scripts/openclaw-spawn-adapter.sh
```

Then set:

```bash
export OPENCLAW_SPAWN_SCRIPT="/absolute/path/to/veritas-kanban/scripts/openclaw-spawn-adapter.sh"
```

Your adapter is called as:

```bash
openclaw-spawn-adapter.sh <task_id> <attempt_id> <prompt_file> <callback_url>
```

Inside that script, call your real `sessions_spawn` command and ensure the spawned agent POSTs completion to `<callback_url>`.

## 4) Run the Worker

One-shot pickup:

```bash
pnpm openclaw:pickup
```

Continuous polling worker:

```bash
pnpm openclaw:pickup:watch
```

## 5) Optional Wake Server

Start webhook receiver:

```bash
pnpm openclaw:wake-server
```

Default listen address: `http://0.0.0.0:8788`

Configure VK lifecycle hook (`onCreated`) webhook to:

`http://<your-openclaw-host>:8788/api/wake`

When a task is created, VK hits this endpoint and wake server triggers one pickup cycle.

## 6) Verification

1. Create a code task and start agent from VK UI (or API).
2. Confirm pending request appears:
   `vk agents:pending`
3. Confirm pickup worker logs:
   `[openclaw-pickup] Found ... pending request(s)`
4. Confirm your adapter runs and OpenClaw session starts.
5. Confirm callback marks task attempt complete.
