# Veritas Kanban

A local-first task management and AI agent orchestration platform built for Brad Groux and Veritas.

## Features

- 📋 **Kanban Board** - Visual task management with drag-and-drop
- 🤖 **AI Agent Orchestration** - Spawn Claude Code, Amp, Copilot, Gemini
- 🌳 **Git Worktrees** - Isolated branches for each coding task
- 📝 **Markdown Storage** - Human-readable task files with frontmatter
- 🔍 **Code Review** - Diff viewing and inline comments
- 🌙 **Dark Mode** - Easy on the eyes
- 🖥️ **CLI** - `vk` command for terminal-based task management
- 🔌 **MCP Server** - Model Context Protocol integration for AI assistants

## Quick Start

```bash
# Clone the repo
git clone https://github.com/dm-bradgroux/veritas-kanban.git
cd veritas-kanban

# Install dependencies
pnpm install

# Start development
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js 22+ |
| Language | TypeScript (strict) |
| Server | Express + WebSocket |
| Frontend | React 19 + Vite + shadcn/ui |
| Persistence | Markdown files (gray-matter) |
| Git | simple-git |

## Project Structure

```
veritas-kanban/
├── .devcontainer/     # Dev container config
├── server/            # Express API + WebSocket
├── web/               # React frontend
├── shared/            # Shared TypeScript types
├── cli/               # vk CLI tool
├── mcp/               # MCP server for AI assistants
├── tasks/             # Task storage (markdown files)
│   ├── active/        # Current tasks
│   └── archive/       # Completed tasks
└── .veritas-kanban/   # Config and runtime data
```

## CLI Usage

The `vk` command provides terminal-based task management:

```bash
# List all tasks
vk list

# List with filters
vk list --status in-progress --project rubicon

# Show task details
vk show <task-id>

# Create a task
vk create "Implement feature X" --type code --project myproject

# Update a task
vk update <task-id> --status in-progress --priority high

# Start an agent on a task
vk start <task-id> --agent claude-code

# Archive/delete
vk archive <task-id>
vk delete <task-id>

# JSON output for scripting
vk list --json | jq '.[] | select(.status == "review")'
```

### Install CLI Globally

```bash
cd cli && npm link
```

## MCP Server

The MCP (Model Context Protocol) server allows AI assistants like Claude to manage tasks.

### Tools Available

| Tool | Description |
|------|-------------|
| `list_tasks` | List tasks with optional filters |
| `get_task` | Get task details by ID |
| `create_task` | Create a new task |
| `update_task` | Update task fields |
| `start_agent` | Start an agent on a code task |
| `stop_agent` | Stop a running agent |
| `archive_task` | Archive a completed task |
| `delete_task` | Delete a task |

### Resources Available

| URI | Description |
|-----|-------------|
| `kanban://tasks` | All tasks |
| `kanban://tasks/active` | In-progress and review tasks |
| `kanban://task/{id}` | Specific task details |

### Configure in Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "veritas-kanban": {
      "command": "node",
      "args": ["/path/to/veritas-kanban/mcp/dist/index.js"],
      "env": {
        "VK_API_URL": "http://localhost:3001"
      }
    }
  }
}
```

## Repositories

- **Work**: https://github.com/dm-bradgroux/veritas-kanban
- **Personal**: https://github.com/BradGroux/veritas-kanban

## Development

### Prerequisites

- Node.js 22+
- pnpm 9+

### Commands

```bash
pnpm dev        # Start dev server (frontend + backend)
pnpm build      # Build for production
pnpm typecheck  # Run TypeScript checks
pnpm lint       # Run ESLint
```

### Dev Container

This project includes a VS Code Dev Container configuration. Open in VS Code and select "Reopen in Container" for a consistent development environment.

## Task File Format

Tasks are stored as markdown files with YAML frontmatter:

```markdown
---
id: "task_20260126_abc123"
title: "Implement feature X"
type: "code"
status: "in-progress"
priority: "high"
project: "rubicon"
---

## Description

Details about the task...
```

## License

MIT
