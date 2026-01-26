# Changelog

All notable changes to Veritas Kanban.

## [0.8.0] - 2026-01-26

### Added
- **Clawdbot Agent Integration** — Replaced direct PTY spawning with `sessions_spawn` delegation
- Agent requests written to `.veritas-kanban/agent-requests/` for Veritas to pick up
- Completion callback endpoint `/api/agents/:id/complete`
- CLI commands: `vk agents:pending`, `vk agents:status`, `vk agents:complete`

### Fixed
- Sidebar X button overlapping with action icons (Archive, Activity, Preview, Conflicts)

## [0.7.0] - 2026-01-26 (Sprint 7)

### Added
- **Archive Management**
  - Archive sidebar with search and filters
  - Restore archived tasks to board
  - Auto-archive suggestions for completed projects
  
- **Task Organization**
  - Subtasks with progress tracking
  - Task dependencies with blocking
  - Multiple task attempts with history
  
- **Git Workflow**
  - GitHub PR creation from UI
  - Merge conflict resolution UI
  - Preview mode with embedded dev server
  
- **Time Tracking**
  - Start/stop timer on tasks
  - Manual time entry
  - Time summary per project
  
- **UI Polish**
  - Running indicator on task cards (animated glow)
  - Activity log sidebar

## [0.6.0] - 2026-01-26 (Sprint 6)

### Added
- Keyboard shortcuts (`?` for help, `c` create, `j/k` navigate, `1-4` status)
- Filter bar with search, project, and type filters
- Task templates (create from template)
- Bulk actions (multi-select, bulk status change, archive, delete)
- Activity logging

## [0.5.0] - 2026-01-26 (Sprint 5)

### Added
- **CLI** (`vk` command)
  - Task CRUD operations
  - Agent control commands
  - Summary and memory export
  - Notification management
  
- **MCP Server**
  - 15 tools for AI assistants
  - 3 resources (tasks, active, single task)
  - Stdio transport for Claude Desktop
  
- **Sub-agent Integration**
  - Task automation field
  - Agent completion tracking
  
- **Memory Sync**
  - Summary endpoints
  - Markdown export for daily notes
  
- **Teams Notifications**
  - Notification queue system
  - Multiple notification types

## [0.4.0] - 2026-01-26 (Sprint 4)

### Added
- Unified diff viewer with file tree
- Line-level comments on code changes
- Approval workflow (approve/request changes/reject)
- Merge and close functionality

## [0.3.0] - 2026-01-26 (Sprint 3)

### Added
- Agent panel with process management
- Agent output streaming via WebSocket
- Agent configuration (Claude Code, Amp, Copilot, Gemini)
- Task attempt tracking

## [0.2.0] - 2026-01-26 (Sprint 2)

### Added
- Git worktree management
- Branch creation per task
- Worktree status display
- Merge back to base branch
- Worktree cleanup

## [0.1.0] - 2026-01-26 (Sprint 1)

### Added
- Initial project setup (monorepo with pnpm workspaces)
- Express server with WebSocket support
- React frontend with Vite and shadcn/ui
- Kanban board with 4 columns
- Task CRUD operations
- Drag-and-drop between columns
- Task detail panel
- Markdown file storage with frontmatter
- Dark mode UI
