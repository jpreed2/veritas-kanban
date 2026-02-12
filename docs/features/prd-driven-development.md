# PRD-Driven Autonomous Development

A systematic approach to autonomous AI-driven feature development that transforms product requirements into working code through iterative, quality-gated execution.

## Overview

PRD-Driven Autonomous Development is a pattern for building software where an AI agent reads a product requirements document (PRD), breaks it into implementable user stories, autonomously codes each story with quality gates, commits the work, and iterates until all stories are complete. Each iteration runs in fresh context, with memory preserved through git history, progress files, and the PRD itself.

Veritas Kanban natively supports the complete workflow—from PRD creation to autonomous implementation—without requiring external orchestration tools.

**Core benefits:**

- **Predictable quality** — Enforcement gates (reviewGate, closingComments, autoTelemetry) ensure deterministic quality checks
- **Compound learning** — Progress files capture lessons; later iterations benefit from earlier ones
- **Fresh context per iteration** — Each story starts clean; no context window bloat
- **Real-time visibility** — Squad Chat shows exactly what agents are doing each iteration
- **Full audit trail** — Git history + telemetry + time tracking = complete execution record

## How VK Supports This Pattern

Veritas Kanban provides native infrastructure for every phase of autonomous development:

| Phase                    | VK Feature                   | What It Does                                                   |
| ------------------------ | ---------------------------- | -------------------------------------------------------------- |
| **Requirements**         | Task Templates               | Define PRD-style templates with user stories as subtasks       |
| **Story Breakdown**      | Subtasks & Dependencies      | Break PRDs into implementable stories with acceptance criteria |
| **Autonomous Execution** | Sub-agent orchestration      | `sessions_spawn` for fresh-context iterations per story        |
| **Quality Gates**        | Enforcement Gates            | reviewGate (4×10 scoring), closingComments, autoTelemetry      |
| **Real-Time Monitoring** | Squad Chat                   | Live narrative of agent progress, step-by-step                 |
| **Memory Persistence**   | Git Workflow + Time Tracking | Worktree isolation, automatic commits, full time accounting    |
| **Success Tracking**     | Telemetry & Analytics        | Run success rates, token usage, duration metrics per story     |
| **Error Learning**       | Error Learning Service       | Record failures, similarity search for recurring issues        |

## Workflow Steps

### 1. Create the PRD Task Template

Define a reusable template for feature development with structured user stories.

**Template structure:**

- **Title template:** `Feature: {{feature_name}}`
- **Description template:**

  ```markdown
  ## Goal

  {{goal_description}}

  ## User Stories

  See subtasks below — each story is independently implementable.

  ## Acceptance Criteria

  - All user stories completed with passing tests
  - Code review score ≥ 8/10 in all dimensions
  - Documentation updated
  - Zero security vulnerabilities introduced
  ```

- **Subtask templates:**
  - Story 1: `US-001: {{story_1_title}}`
  - Story 2: `US-002: {{story_2_title}}`
  - Story 3: `US-003: {{story_3_title}}`
  - (continue as needed)
- **Default agent:** Your preferred coding agent (e.g., `veritas`, `codex`)
- **Enforcement gates:**
  - ✅ `reviewGate` enabled (4×10 scoring: Code, Docs, Safety, Testing)
  - ✅ `closingComments` required
  - ✅ `autoTelemetry` enabled

**Create template:**

```bash
# Via API
curl -X POST http://localhost:3001/api/templates \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Feature Development PRD",
    "category": "development",
    "taskDefaults": {
      "type": "code",
      "priority": "medium",
      "agent": "veritas"
    },
    "subtaskTemplates": [
      {"title": "US-001: {{story_1}}", "order": 0},
      {"title": "US-002: {{story_2}}", "order": 1},
      {"title": "US-003: {{story_3}}", "order": 2}
    ],
    "enforcementGates": {
      "reviewGate": true,
      "closingComments": true,
      "autoTelemetry": true
    }
  }'

# Or via UI: Templates page → Create Template
```

### 2. Instantiate the PRD

Apply the template to create a task with all user stories as subtasks.

**Via UI:**

1. Navigate to Templates page (`/templates`)
2. Find "Feature Development PRD"
3. Click "Create Task from Template"
4. Fill in template variables (feature_name, goal_description, story titles)
5. Click "Create"

**Via CLI:**

```bash
vk create "Feature: OAuth2 Integration" \
  --template "feature-dev-prd" \
  --vars '{"feature_name":"OAuth2 Integration","goal":"Add social login","story_1":"Google OAuth setup","story_2":"GitHub OAuth setup","story_3":"OAuth callback handler"}'
```

**Result:** A task with:

- Title: "Feature: OAuth2 Integration"
- 3 subtasks (US-001, US-002, US-003)
- Enforcement gates enabled
- Agent pre-assigned

### 3. Start Autonomous Execution

Spawn a sub-agent to autonomously work through the story list.

**Orchestrator prompt pattern:**

```markdown
TASK: {{task.id}} — Feature: OAuth2 Integration

PRD:
{{task.description}}

USER STORIES (implement in order):
{{task.subtasks}}

PROGRESS FILE: {{workspace}}/.veritas-kanban/progress.md

INSTRUCTIONS:

1. Read the progress file (previous iterations' learnings)
2. Pick the next incomplete user story
3. Implement the story with tests
4. Run quality checks: typecheck, lint, unit tests
5. If checks fail, fix and retry (max 2 attempts)
6. If checks pass, commit with message: "feat(story-id): description"
7. Append to progress file: what you did, what you learned
8. Mark subtask complete via API: POST /api/tasks/{{task.id}}/subtasks/{{subtask.id}}/complete
9. Repeat from step 2 until all stories done

QUALITY GATES (enforced by reviewGate):

- Code: Well-structured, idiomatic, no duplication
- Docs: Inline comments, README updates
- Safety: Input validation, error handling, no secrets
- Testing: Unit tests, edge cases covered

When all subtasks complete, call task completion:
POST /api/tasks/{{task.id}}/complete
-d '{"summary":"Completed OAuth2 integration — 3 stories, all tests passing"}'
```

**Spawn the agent:**

```bash
# Via CLI
vk automation:start {{task.id}}

# Or via API
curl -X POST http://localhost:3001/api/automation/{{task.id}}/start \
  -H "Authorization: Bearer {{api_key}}"
```

**What happens:**

- Agent spawns in fresh OpenClaw session
- Reads progress file (empty on first run)
- Picks US-001 (first incomplete story)
- Implements, tests, commits
- Updates progress file with learnings
- Marks US-001 complete
- Repeats for US-002, US-003
- Each story runs in isolated context (fresh session)

### 4. Monitor Progress

Watch real-time agent activity through multiple channels.

**Squad Chat (primary):**

```bash
# Agent posts at every major step
[VERITAS] Starting Feature: OAuth2 Integration — 3 stories
[VERITAS] US-001: Implementing Google OAuth setup
[VERITAS] US-001: Tests passing — committing (a3f9b2c)
[VERITAS] US-001: Complete — marked as done
[VERITAS] US-002: Implementing GitHub OAuth setup
...
```

**Dashboard widgets:**

- **Agent Status Indicator** — Shows agent as "working" on your task
- **Success Rate** — Live success rate for this agent
- **Token Usage** — Real-time token burn tracking
- **Run Duration** — How long this iteration has been running

**Activity page:**

- Full timeline of agent status changes
- Task status transitions (todo → in-progress → done per subtask)
- Time tracking per story

**Task detail panel:**

- **Git tab** — See commits as they happen
- **Diff tab** — Review code changes before merge
- **Metrics tab** — Attempt history, token counts, duration

### 5. Quality Gate Enforcement

VK automatically enforces quality checks before task closure.

**reviewGate (4×10 scoring):**

When agent calls task completion, VK blocks closure until:

1. **Code score ≥ 8/10** — Structure, idioms, duplication
2. **Docs score ≥ 8/10** — Inline comments, README updates
3. **Safety score ≥ 8/10** — Input validation, error handling
4. **Testing score ≥ 8/10** — Unit tests, edge cases

Agent must submit review via:

```bash
POST /api/tasks/{{task.id}}/review
  -d '{
    "decision": "approved",
    "scores": {"code": 9, "docs": 8, "safety": 10, "testing": 9},
    "summary": "All quality gates passed"
  }'
```

**closingComments:**

Agent must add a closing comment summarizing the work:

```bash
POST /api/tasks/{{task.id}}/comments
  -d '{
    "text": "Completed OAuth2 integration:\n- Google OAuth (US-001)\n- GitHub OAuth (US-002)\n- Callback handler (US-003)\nAll tests passing, security review clean.",
    "author": "veritas"
  }'
```

**autoTelemetry:**

VK automatically records:

- Run start/stop events
- Token usage (input, output, cache)
- Success/failure status
- Duration metrics

No agent action required — telemetry is automatic.

### 6. Iterate Until Complete

Agent continues through the story list until all subtasks are marked complete.

**Progress file example (`.veritas-kanban/progress.md`):**

```markdown
# Feature: OAuth2 Integration — Progress Log

## Iteration 1: US-001 (Google OAuth setup)

**Started:** 2026-02-12 10:30
**Duration:** 8m 32s
**Commit:** a3f9b2c

**What I did:**

- Created OAuth2 config for Google
- Added redirect URI handler
- Wrote unit tests for token exchange

**What I learned:**

- Google requires HTTPS redirect URIs in production
- Token expiry is 1 hour — need refresh token logic

**Status:** ✅ Complete

---

## Iteration 2: US-002 (GitHub OAuth setup)

**Started:** 2026-02-12 10:39
**Duration:** 6m 18s
**Commit:** f7d2e1a

**What I did:**

- Created OAuth2 config for GitHub
- Reused redirect handler from US-001 (DRY principle)
- Wrote unit tests

**What I learned:**

- GitHub's OAuth flow is simpler than Google's
- Scopes: need `user:email` for email access

**Status:** ✅ Complete

---

## Iteration 3: US-003 (OAuth callback handler)

**Started:** 2026-02-12 10:46
**Duration:** 12m 44s
**Commit:** 9e8a3bc

**What I did:**

- Unified callback handler for both providers
- Added error handling for failed exchanges
- Updated docs with OAuth setup instructions

**What I learned:**

- State parameter prevents CSRF — critical security check
- Need to handle "user denied access" gracefully

**Status:** ✅ Complete

---

## Summary

**Total duration:** 27m 34s
**Stories completed:** 3/3
**Commits:** 3
**Quality gates:** All passed
**Final review score:** Code 9, Docs 8, Safety 10, Testing 9
```

**Iteration mechanics:**

- Each story runs in a fresh OpenClaw session
- Agent reads progress file at start of each iteration
- Agent writes learnings to progress file after each story
- Later stories benefit from earlier learnings (compound learning)
- No context window bloat — each iteration starts clean

### 7. Review and Merge

Once all stories complete and quality gates pass, review the work.

**Review workflow:**

1. Open task detail panel → Diff tab
2. Review all commits and file changes
3. Check review scores (should be ≥ 8/10 in all dimensions)
4. Approve or request changes via Review panel
5. If approved, click "Merge" to merge worktree branch

**Merge process:**

```bash
# VK handles merge automatically via UI
# Or manually via CLI:
cd {{workspace}}
git merge {{task.branch}}
git branch -d {{task.branch}}
git worktree remove .veritas-kanban/worktrees/{{task.id}}
```

**Post-merge:**

- Task status automatically changes to "Done"
- Time tracking stops
- Telemetry records final duration and token counts
- Activity log updated with merge event

## Example: Building an OAuth2 Feature

**Scenario:** Add OAuth2 social login support (Google, GitHub, Microsoft).

### Step 1: Create PRD task

Template variables:

- `feature_name`: "OAuth2 Social Login"
- `goal`: "Enable users to log in with Google, GitHub, or Microsoft accounts"
- `story_1`: "Google OAuth provider setup"
- `story_2`: "GitHub OAuth provider setup"
- `story_3`: "Microsoft OAuth provider setup"
- `story_4`: "Unified OAuth callback handler"
- `story_5`: "User account linking logic"
- `story_6`: "OAuth settings UI"

### Step 2: Agent spawns

```bash
vk automation:start OAUTH-042
```

### Step 3: Autonomous execution

Agent works through stories 1-6 sequentially:

- Each story: implement → test → commit → update progress → mark complete
- Fresh context per story (no bleed between iterations)
- Progress file grows with learnings

### Step 4: Quality gates

After story 6, agent attempts task completion. VK blocks until:

- reviewGate scores submitted (all ≥ 8/10)
- closingComments added
- All subtasks marked complete

### Step 5: Merge

Human reviews in Diff tab, approves, merges.

### Result

- 6 commits (one per story)
- 27 files changed
- 43 minutes total duration
- 156k tokens consumed
- 100% test coverage
- Zero security issues

## Configuration Tips

### 1. Enable all enforcement gates for autonomous work

```json
{
  "enforcementGates": {
    "reviewGate": true,
    "closingComments": true,
    "autoTelemetry": true,
    "timeTracking": true
  }
}
```

### 2. Structure PRDs with clear acceptance criteria

```markdown
## User Story: US-001

**Title:** Google OAuth provider setup
**Acceptance Criteria:**

- OAuth2 config created with client ID/secret
- Redirect URI handler implemented
- Token exchange logic with error handling
- Unit tests covering success and failure cases
- README updated with Google OAuth setup instructions
```

### 3. Use progress files for cross-iteration memory

- Agent writes learnings after each story
- Later stories read progress file at start
- Captures: what worked, what failed, gotchas, patterns

### 4. Tune agent prompts for deterministic quality

```markdown
QUALITY CHECKS (run before commit):

1. pnpm typecheck — must exit 0
2. pnpm lint — must exit 0
3. pnpm test — must exit 0, coverage ≥ 80%

If any check fails:

- Fix the issue
- Re-run checks
- If 2 failures, escalate to human (POST /api/tasks/{{id}}/block)
```

### 5. Set telemetry tags for analysis

```json
{
  "telemetryTags": ["autonomous", "oauth", "feature-dev"]
}
```

Query later:

```bash
# Get all autonomous development runs
GET /api/telemetry/events?tags=autonomous&type=run.completed

# Analyze success rate
GET /api/metrics/success-rate?tags=autonomous
```

## When to Use

**✅ Use PRD-Driven Autonomous Development when:**

- **Requirements are clear** — Well-defined user stories with acceptance criteria
- **Stories are independent** — Each story can be implemented without complex dependencies
- **Quality is measurable** — You have deterministic quality checks (tests, linters, typecheck)
- **Iterations are small** — Each story is 30 minutes or less of work
- **Memory needs are low** — Context carries via git + progress files, not multi-turn chat
- **You want reproducibility** — Same PRD + same instructions = same result (modulo LLM variability)

**❌ Don't use when:**

- **Requirements are vague** — "Make it better" or "Add some features" without specifics
- **Stories are tightly coupled** — Story 3 can't start until Story 2's implementation details are known
- **Quality is subjective** — No automated checks, human judgment required for every decision
- **Iterations are long** — Stories require hours of work with many back-and-forth decisions
- **High context needs** — Agent must remember nuanced design decisions across many turns
- **Rapid exploration** — You're prototyping and pivoting frequently

## When NOT to Use

### Exploratory development

If you're not sure what you want, or you're rapidly iterating on a prototype, use interactive chat-based development instead. PRD-driven autonomous development assumes you know the destination — it's optimized for execution, not exploration.

### Complex architectural decisions

Stories that require weighing multiple design tradeoffs (e.g., "Design the data model for multi-tenancy") benefit from interactive conversation, not autonomous iteration. Use PRD-driven development _after_ architecture is settled.

### High-risk changes

Database migrations, authentication changes, or anything that could cause data loss should have human oversight at every step. Don't run these autonomously.

### Research tasks

If the task is "Research the best approach to X," that's not a PRD — that's an exploratory task. Use research-type tasks with interactive agents instead.

## Comparison to Interactive Development

| Dimension        | PRD-Driven Autonomous                   | Interactive Chat-Based                       |
| ---------------- | --------------------------------------- | -------------------------------------------- |
| **Context**      | Fresh per iteration                     | Continuous conversation                      |
| **Memory**       | Git + progress files                    | LLM context window                           |
| **Speed**        | Parallel/batch-able                     | Sequential, human-paced                      |
| **Oversight**    | Quality gates only                      | Human in the loop constantly                 |
| **Best for**     | Known requirements, repetitive patterns | Exploration, complex decisions               |
| **Failure mode** | Predictable (quality gate rejects)      | Unpredictable (context drift, hallucination) |

### Hybrid approach

Use interactive development to design and build the first iteration, then use PRD-driven autonomous development to replicate the pattern across multiple similar features.

**Example:**

- Iteration 1 (interactive): Build OAuth2 for Google — human guides every decision
- Iteration 2+ (autonomous): Add GitHub, Microsoft, Twitter OAuth using the same pattern

---

_Last updated: 2026-02-12 · [Back to Features](../FEATURES.md)_
