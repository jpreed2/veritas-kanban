# Sprint 1: Foundation & Core Kanban

**Goal:** Basic task board with CRUD operations and file persistence.

**Started:** 2026-01-26
**Status:** In Progress

---

## Stories

| ID | Title | Status | Notes |
|----|-------|--------|-------|
| US-101 | Project scaffolding with dev container | ✅ Complete | |
| US-102 | Task file schema and parser | ✅ Complete | gray-matter, 15 unit tests |
| US-103 | REST API for task CRUD | ✅ Complete | Full CRUD + archive + zod validation |
| US-104 | Kanban board UI shell | ⏳ Todo | Scaffolded, needs data binding |
| US-105 | Task card component | ⏳ Todo | Scaffolded |
| US-106 | Create task dialog | ⏳ Todo | Scaffolded |
| US-107 | Task detail panel | ⏳ Todo | |
| US-108 | Drag and drop between columns | ⏳ Todo | |
| US-109 | Push to GitHub repositories | ⏳ Todo | |

---

## Progress Log

### 2026-01-26

**US-101: Project scaffolding** ✅
- Created monorepo with pnpm workspaces
- Dev container configured with Node.js 22
- Server package: Express + WebSocket
- Web package: React 19 + Vite + shadcn/ui
- Shared package: TypeScript types
- Git initialized with both remotes (work + personal)
- Typecheck passes
- Dev server running at http://localhost:3000

**US-102: Task file schema and parser** ✅
- Full Task interface in `shared/src/types.ts`
- TaskService with injectable paths for testing
- gray-matter for markdown parsing
- Slug generation for filenames
- 15 unit tests covering:
  - Parsing (valid, minimal, git metadata, attempts)
  - Creation (full fields, minimal, slug generation)
  - Updates (fields, file rename on title change)
  - Deletion
  - Archival
- Fixed: undefined value handling in frontmatter

**US-103: REST API for task CRUD** ✅
- `GET /api/tasks` — list all active tasks
- `GET /api/tasks/:id` — get single task
- `POST /api/tasks` — create task
- `PATCH /api/tasks/:id` — update task
- `DELETE /api/tasks/:id` — delete task
- `POST /api/tasks/:id/archive` — archive completed task
- Zod validation schemas
- Proper error handling and status codes
- Vite proxy configured for frontend → API
