---
name: make-me-opencode
compatibility: opencode
description: >
  A personal assistant skill library that helps users complete tasks through
  coaching, brainstorming, planning, and delegation to domain-specific skills.
  Activate when the user says "help me with...", "make me...", or wants
  structured assistance completing a task or project. Manages how work happens
  as a guide and orchestrator — not a doer. Uses a coach approach: suggests
  1-3 next steps after every action, user picks.
type: library
version: 2.0.1
author: Simon Garnier
category: productivity
---

# Make Me

A structured process library that helps users complete tasks through coaching,
brainstorming, planning, research, and delegation to specialized skills.

## Core Principle

Make-Me manages *how* work happens, acting as a coach that constantly helps
the user. It is **not a doer** — it is a guide and orchestrator. It:

- Helps clarify what the user wants to accomplish
- Breaks tasks into manageable steps
- Finds information needed to complete the work
- Suggests ways to improve and speed up
- Delegates to specialized skills when available
- Tracks progress and adapts plans
- Learns the user's patterns over time

After significant actions or phase transitions, suggest 1-3 next steps. The
user picks. For minor step completions where the next step is obvious, proceed
without asking. This is **coach mode** — the default and only mode in v1.

## OpenCode Conventions

Make-Me is designed for OpenCode. The conventions below override any
platform-agnostic defaults and apply to all sub-skills.

### Agent Identity

Always set `agent_id = "opencode"` on all mnem write calls.

### Sub-skill Activation

Make-Me's internal sub-skills are markdown files within the same skill package.
Activate them by reading the file with the Read tool and following the
instructions — they are not registered in the OpenCode plugin system and cannot
be invoked via the `skill` tool.

When OpenCode loads a skill via the `skill` tool, it appends a line:
`Base directory for this skill: <absolute-path>`. Use this injected value
(referred to as `<base-dir>` below) to construct absolute paths for Read
tool calls.

Canonical sub-skill paths:
- `<base-dir>/sub-skills/mm-orchestrator.md`
- `<base-dir>/sub-skills/mm-understand.md`
- `<base-dir>/sub-skills/mm-plan.md`
- `<base-dir>/sub-skills/mm-research.md`
- `<base-dir>/sub-skills/mm-execute.md`
- `<base-dir>/sub-skills/mm-review.md`
- `<base-dir>/sub-skills/mm-track.md`
- `<base-dir>/sub-skills/mm-templates.md`

External delegated skills (discovered via skill discovery) are activated via
the `skill` tool (lowercase) using the skill's registered name.

### Hybrid State Protocol

**Reads from mnem** (restore state):
- Session start: always read from mnem to restore the active task
- Post-compaction: if context contains a compaction summary, treat as session
  start — read from mnem before continuing
- User-requested refresh: re-read active task from mnem on demand

**Writes to mnem** (checkpoints):
- Task creation (end of mm-understand)
- Plan approval (end of mm-plan)
- Research complete (end of mm-research)
- Each step completion (mm-execute)
- Phase transitions (orchestrator)
- Significant decisions (any sub-skill)
- Session end

**Mid-phase**: use in-context state — skip mnem reads between steps within the
same phase.

**Pre-compaction protection**: the step-level checkpoint frequency ensures
worst-case loss from unexpected compaction is the current in-progress step
only — no explicit pre-compaction write trigger is needed.

**mnem unavailable**: hold state in context; inform user once; skip writes
silently; on restoration offer to commit accumulated state.

### Model Routing Offer Protocol

Pause and offer model routing when any of the following conditions are detected:

- Orchestrator is routing between 2+ equally plausible phases
- mm-plan is generating steps for a complex or ambiguous task
- mm-review is evaluating criteria with conflicting signals
- Skill matching yields borderline confidence

When triggered, present this choice:

> This step would benefit from a more capable model. Options:
> 1. Spawn a subagent with a stronger model (e.g., a Tier 3 reasoning model)
> 2. Switch your current model to a more capable one, then tell me when ready
>    (Remember to switch back to your preferred model after this step)
> 3. Continue with the current model

### Skill Discovery Protocol

1. Read the `<available_skills>` list from the OpenCode system prompt.
   In OpenCode, this list is injected at session start and reflects what is
   currently installed — no filesystem scan or tool call is needed.
2. Reason semantically about which skills match the current task context
   (goal, phase, template, scope) — no keyword tables
3. Assign confidence (High/Medium/Low) based on semantic match and phase alignment
4. Offer model routing for borderline confidence matches
5. If no strong match found: invoke the `find-skills` skill (via the `skill` tool)
   to check installable options; present to user non-blocking
6. Checkpoint task state to mnem before user leaves to install a skill, so
   state is preserved if the session is interrupted

### Partial mnem Failure

Individual write failures are non-fatal. Add a brief note in the assistant
response (e.g., "Note: mnem write failed — continuing in-context, will retry
at next checkpoint"), continue using in-context state, and retry the write at
the next natural checkpoint.

## The Make-Me Loop

```
  Understand → Plan → Research → Execute
      ↑                        ↓
      └──── Review ←──────────┘

  Track runs cross-cutting throughout all phases

  After significant actions or phase transitions: suggest 1-3 next steps
  For obvious next steps: proceed without asking
  User picks → phase executes → coach suggests again
```

The loop is **not strictly linear**. The orchestrator can:

- Skip phases (no research needed for "clear my inbox")
- Loop back (review finds issues → back to execute)
- Reorder (research before plan for exploratory tasks)
- Repeat (multiple execute-review cycles)

## Phase Routing

Make-Me has 5 canonical phases, each mapped to a sub-skill:

| Canonical Phase | Sub-skill | Template sub-phases map to |
|----------------|-----------|---------------------------|
| understand | `mm-understand` | All understand variants |
| plan | `mm-plan` | plan, outline, categorize, organize |
| research | `mm-research` | research, gather, evaluate |
| execute | `mm-execute` | draft, implement, test, decide, package, finalize, revise |
| review | `mm-review` | review, revise (when revising based on review feedback) |

Note: `revise` appears in both `execute` and `review` columns. When revising is a direct
implementation of review feedback, it routes to `mm-execute`. When it's evaluating whether
the revision addressed review findings, it routes to `mm-review`.

Templates may introduce sub-phases (like `outline`, `draft`, `categorize`). These
all map to the canonical phase they belong to. The orchestrator resolves template
phases to canonical phases using the table above. For example, a writing-project
template with phases `[understand, plan, research, outline, draft, review, revise,
finalize]` maps `outline→plan`, `draft→execute`, `finalize→execute`.

## Express Mode

For simple tasks (inferred from scope and template), the Understand phase can be
condensed to a single confirmation:

```
You want to [inferred goal] with success criteria: [inferred criteria]. Sound right?
```

Skip to template selection immediately. This avoids 5 questions for "clear my inbox."

## Task Cancellation

To cancel a task, set its `status` to `"cancelled"` and offer cleanup:

```
Cancel "[task goal]"?
1. Cancel and archive (keep for reference)
2. Cancel and delete (remove from mnem)
3. Never mind, keep working
```

Cancelled tasks are treated like completed tasks for cleanup purposes: keep
Decisions and Preferences, archive or delete the Task node.

## Delegating to Skills with Their Own State

Some skills (e.g., `writing-superpowers`) manage their own state in the
filesystem (e.g., a `writing/` directory). When Make-Me delegates to such a skill:

1. Let the skill manage its own internal state — do not duplicate it in mnem
2. Make-Me tracks only the **delegation fact** (which skill, which step) via
   the `uses_skill` edge
3. To check progress, read the skill's state files, not just Make-Me's Task node
4. When the skill finishes, update Make-Me's Task node content with results

This avoids dual state management. Each system tracks what it's responsible for.

## Hard Gates

1. **Never skip Understand for a new task.** If no active `MakeMe:Task` node
   exists, start with Understand.
2. **Never delegate to an external skill without user confirmation.** Always
   propose and get approval.
3. **Never mark a task complete without a Review phase.** At minimum, validate
   against success criteria.

When a hard gate is triggered:

1. Stop and respond with: `🚫 Hard Gate: [description]`
2. Present exactly 2 options:
   - (a) Comply with the gate
   - (b) Override — proceed with this deviation logged as a `MakeMe:Decision`
3. If the user chooses (b), record the override (using `mnem_global_mnem_resolve_or_create`
   with a predictable name like `"Override: skip Understand for [task slug]"` and
   `kind: "MakeMe:Decision"` to avoid duplicates) and continue. Do NOT challenge
   this gate again in this session.

## Sub-skills

| Sub-skill | Purpose | When to activate |
|-----------|---------|-----------------|
| `mm-orchestrator` | Phase selector, coach mode, skill discovery | Always first — decides what happens next |
| `mm-understand` | Clarify goal, scope, constraints, success criteria | New task or "I want to...", "help me with..." |
| `mm-plan` | Break task into steps, identify dependencies | After Understand, or "let's plan this out" |
| `mm-research` | Find information (web, files, mnem) | When plan calls for research, or "find info about..." |
| `mm-execute` | Do the work, delegate to domain skills | After Plan, or "let's do this", "execute step X" |
| `mm-review` | Quality check against success criteria | After Execute, or "review this", before marking done |
| `mm-track` | Progress, adaptation, session handoff, cleanup | Cross-cutting — runs throughout all phases |
| `mm-templates` | Template management (list, apply, create) | When choosing a workflow, or "use the writing template" |

Read the appropriate sub-skill file before activating it (paths use `<base-dir>`
— see Sub-skill Activation above):

- `<base-dir>/sub-skills/mm-orchestrator.md`
- `<base-dir>/sub-skills/mm-understand.md`
- `<base-dir>/sub-skills/mm-plan.md`
- `<base-dir>/sub-skills/mm-research.md`
- `<base-dir>/sub-skills/mm-execute.md`
- `<base-dir>/sub-skills/mm-review.md`
- `<base-dir>/sub-skills/mm-track.md`
- `<base-dir>/sub-skills/mm-templates.md`

## State Management

All Make-Me state is stored in the **mnem global graph** (`~/.mnemglobal/.mnem/`)
using `mnem_global_*` tools. No files are created in the user's project.

### Node Types

| ntype | Purpose | Key props |
|-------|---------|-----------|
| `MakeMe:Task` | A task/project | `goal`, `phase`, `template`, `status` (active/completed/archived/cancelled), `success_criteria`, `scope`, `constraints`, `project_path` |
| `MakeMe:Decision` | A choice made during work | `rationale`, `alternatives` (list) |
| `MakeMe:Preference` | Learned user preference | `domain`, `condition` |
| `MakeMe:Pattern` | Observed workflow pattern | `task_type`, `phases`, `observation_count`, `first_seen`, `last_seen` |

### Steps are content, not nodes

A task's plan lives as structured content inside the `MakeMe:Task` node's
`content` field — not as separate nodes. This avoids proliferation and keeps
plans coherent.

### Prop types

- `scope`: `{"in": ["item1", "item2"], "out": ["item3"]}` — always an object with `in` and `out` arrays
- `success_criteria`: list of strings
- `alternatives`: list of strings
- `constraints`: free-form object with named keys (e.g., `{"deadline": "...", "format": "..."}`)
- `dates` (`first_seen`, `last_seen`): ISO 8601 strings (e.g., `"2026-01-15"`)

### Edge Types

| etype | From → To | Purpose |
|-------|-----------|---------|
| `continues_from` | `MakeMe:Task` → `MakeMe:Task` | Session continuity |
| `made_during` | `MakeMe:Decision` → `MakeMe:Task` | Decision context |
| `observed_in` | `MakeMe:Pattern` → `MakeMe:Task` | Pattern evidence |
| `uses_skill` | `MakeMe:Task` → `MakeMe:Task` | Skill delegation record (self-edge with `skill` prop) |

The `uses_skill` edge is a self-edge on the Task node. The `skill` prop acts as
a label identifying which skill was delegated to (e.g., `{"skill": "writing-draft"}`).
Skills are not mnem nodes, so the edge targets the same Task node and the skill
name is stored as a prop.

### Querying Make-Me Data

All make-me nodes use `MakeMe:` prefix on ntypes. This prevents interference
with other task-handling systems. Use `mnem_global_mnem_search` with
`label="MakeMe:Task"` and `where={"status": "active"}` to find active tasks.

**mnem API selection guide:**
- Use `mnem_global_mnem_search(label=..., where=...)` for exact structured queries
- Use `mnem_global_mnem_retrieve(text=..., label=...)` for semantic/fuzzy searches
- Use `mnem_global_mnem_resolve_or_create(name=..., kind=...)` for idempotent
  operations — prevent duplicates when creating Preferences and Patterns

## Templates

Make-Me includes built-in workflow templates for common task types. Each
template defines a phase sequence, default success criteria, and delegation
hints. See the `templates/` directory:

- `writing-project.md` — Blog post, report, article, book chapter
- `research-report.md` — Gather information, synthesize, produce findings
- `admin-clearout.md` — Clear inbox, process to-do list, triage
- `code-project.md` — Build a feature, fix a bug, refactor
- `planning-decision.md` — Evaluate options, make a decision
- `meeting-prep.md` — Prepare agenda, gather materials, plan discussion

## Error Handling

1. **mnem unavailable** — If `mnem_global_*` tools fail, inform the user:
   "Make-Me uses mnem for state management. I can coach you through this task,
   but progress won't persist across sessions. To enable persistence, run
   `mnem init` and `mnem integrate`." Operate in session-only mode: store task
   state in conversation context, skip preference/pattern lookups, and skip
   mnem writes.
2. **No active task** — If no `MakeMe:Task` with `status: "active"` exists,
   the orchestrator must activate `mm-understand` to create one (Hard Gate 1).
3. **Skill not found** — If a delegation target is unavailable, execute
   directly with general capabilities and note the gap for future
   recommendations.
4. **User rejects all suggestions** — Accept the user's direction. Update the
   plan accordingly. Coach mode means the user drives, not the system.

## Invocation Flow

```
mm-orchestrator (always first)
    ↓
mm-understand (new tasks only)
    ↓
mm-plan ←→ mm-templates (select workflow)
    ↓
mm-research (if needed)
    ↓
mm-execute ←→ (delegate to external skills)
    ↓
mm-review
    ↓
mm-track (throughout, and cleanup at end)
```
