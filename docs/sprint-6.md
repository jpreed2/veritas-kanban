# Sprint 6: Polish & Quality of Life

**Goal:** Keyboard shortcuts, filtering, and UI polish.

**Started:** 2026-01-26
**Status:** Complete ✅

---

## Stories

| ID | Title | Status | Notes |
|----|-------|--------|-------|
| US-601 | Keyboard shortcuts | ✅ Complete | c, j/k, Enter, Esc, 1-4, ? |
| US-602 | Filter and search | ✅ Complete | Project/type dropdowns, text search |
| US-603 | Task templates | ✅ Complete | New from Template option |
| US-604 | Bulk actions | ✅ Complete | Multi-select, bulk status/archive/delete |
| US-605 | Activity log | ✅ Complete | Toggleable sidebar |

---

## Progress Log

### 2026-01-26

**US-601: Keyboard shortcuts** ✅
- Created `useKeyboard` context provider
- Implemented shortcuts:
  - `c` - Create new task
  - `j/k` or `↓/↑` - Navigate tasks
  - `Enter` - Open selected task
  - `Escape` - Close panel/clear selection
  - `1-4` - Move task to column (Todo/In Progress/Review/Done)
  - `?` - Toggle keyboard shortcuts help dialog
- Added keyboard icon to header
- Created `KeyboardShortcutsDialog` help modal
- Task selection highlighting with ring indicator

**US-602: Filter and search** ✅
- Created FilterBar component above board
- Search input with debounce (300ms)
- Project filter dropdown (auto-populated from tasks)
- Type filter dropdown (code/research/content/automation)
- Active filter count badge with "Clear all" button
- URL persistence (filters sync to query params)
- Added Badge UI component

**US-603: Task templates** ✅
- Created TemplateService for server-side template management
- Templates stored as markdown files in `.veritas-kanban/templates/`
- API endpoints: GET/POST/PATCH/DELETE /api/templates
- Template fields: name, description, taskDefaults (type, priority, project, descriptionTemplate)
- Template selector in CreateTaskDialog
- Template management UI in Settings dialog
- Added api.templates methods to api.ts

**US-604: Bulk actions** ✅
- Created BulkActionsProvider context for selection state
- BulkActionsBar component with:
  - Toggle selection mode
  - Select all / deselect all
  - Move to status dropdown
  - Archive selected
  - Delete selected (with confirmation)
- Checkbox selection on task cards when in selection mode
- Added useArchiveTask hook

**US-605: Activity log** ✅
- Created ActivityService for logging task events
- Activity stored in `.veritas-kanban/activity.json`
- API endpoints: GET/DELETE /api/activity
- Activity logging on task create, update, status change, archive, delete
- ActivitySidebar component with:
  - Slide-out panel from right
  - Filter by activity type
  - Refresh and clear buttons
  - Relative timestamps ("5m ago", "2h ago")
- Activity button in header
- Added ScrollArea UI component
