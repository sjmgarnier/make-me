# mm-track

Progress tracking, session handoff, pattern detection, and cleanup. Runs
cross-cutting throughout all phases.

## When to Activate

- **Throughout**: Update state after every phase transition and step completion
- **On session start**: Retrieve active task, suggest resume point
- **On session end**: Update progress, commit summary
- **On task completion**: Offer cleanup, preserve valuable knowledge

## OpenCode Conventions

See SKILL.md § OpenCode Conventions for full conventions.

- agent_id: use `"opencode"` on all mnem write calls
- Path prefix: use `<base-dir>` for all sub-skill paths

## Process During a Task

### Phase Transitions

When a Make-Me phase completes:

1. **The orchestrator** updates the Task node's `phase` prop to the new phase
   (sub-skills return control to the orchestrator; they do not update `phase` directly)
2. Mark completed steps in the Task node content
3. Commit `MakeMe:Decision` nodes for any choices made during the phase

```
# Pseudocode — use mnem_global_mnem_commit to update:
task.props.phase = "execute"
# Update content to mark completed steps
# Commit decision nodes if applicable
```

### Step Completion

When a step in the plan is completed:

1. Update the checkbox in the Task node content: `- [x] Step name`
2. Add a brief note on what was accomplished
3. Suggest next steps (coach mode)

### Progress Checkpoints

At natural pause points (every 2-3 steps, or when the user asks):

```
Progress check:
- [x] Understood requirements
- [x] Created outline
- [x] Gathered data
- [ ] Drafting (step 4 of 6)

About 50% complete. On track?
```

### Pattern Detection

After 3 or more similar tasks have been completed, offer to create a template:

```
I notice you've completed [N] tasks of type "[task type]" now.
Your typical workflow is:

1. Understand → 2. Plan → 3. Research → 4. Execute → 5. Review

I'll save this as a Pattern in memory so future "[task type]" tasks
can start with this workflow. (Automatic template creation from patterns
is coming in v2.)
```

To detect patterns:

1. Search mnem for `MakeMe:Pattern` nodes matching the task type
2. Check the `observation_count` prop — if it's >= 3, offer to update the pattern
3. If the pattern doesn't exist yet, check completed `MakeMe:Task` nodes for
   similar types and count them
4. Create or update a `MakeMe:Pattern` node using `mnem_global_mnem_resolve_or_create`
   (with `task_type` as the anchor name) to prevent duplicates

### Commit Decisions

Whenever the user makes a significant choice (template selection, plan
adjustment, delegation decision, scope change):

```
mnem_global_mnem_commit(
  agent_id="opencode",
  nodes=[{
    ntype="MakeMe:Decision",
    summary="[Brief description of what was decided]",
    props={
      "rationale": "[Why this choice was made]",
      "alternatives": ["custom workflow", "no template"]
    }
  }],
  edges=[{
    etype="made_during",
    src="<decision-uuid>",
    dst="<task-uuid>"
  }]
)
```

## Session Handoff

### On Session Start

1. `mnem_global_mnem_search(label="MakeMe:Task", where={"status": "active"})`
2. If active task found:
   - Read the task's content (plan, progress)
   - Present resume point: "You were working on [goal]. Last completed: [step]."
   - Suggest next step
3. If no active task:
   - "What would you like to work on?"
   - Activate `mm-understand`
4. Check for any pending `MakeMe:Decision` nodes that need attention

### On Session End

1. Update the Task node content with current progress
2. Note any pending steps and blockers
3. Suggest where to pick up next session
4. Optionally commit a session summary to mnem

```
## Session Summary (2026-01-20)

Completed:
- [x] Understood goal and scope
- [x] Created outline
- [x] Gathered financial data

Still to do:
- [ ] Draft sections (4 of 5 remaining)
- [ ] Review against criteria
- [ ] Finalize

Next session: Continue drafting sections 2-5.
```

## Task Completion and Cleanup

When a task is marked as complete (after Review confirms all criteria are met):

### Step 1: Mark Task Complete

```
# Pseudocode — use mnem_global_mnem_commit to update:
task.props.status = "completed"
task.props.phase = "completed"
```

### Step 2: Offer Cleanup Review

Present the user with what to keep, archive, and delete:

```
Task complete! Let me clean up.

For "Write Q1 quarterly report":

KEEP (permanent value):
  ✓ Decision: "Used writing-superpowers for drafting"
  ✓ Decision: "Used writing-project template"
  These will be remembered for future tasks.

ARCHIVE (keep but not in active retrieval):
  ○ The task itself
  ○ Research findings
  These stay in mnem but won't clutter active views.

DELETE (no long-term value):
  ✗ Intermediate progress notes
  ✗ Scratch data
  These will be removed permanently.

[Keep All] [Archive All] [Let me choose] [Skip cleanup]
```

### Step 3: Execute Cleanup

Based on user choice:

**Keep**: `MakeMe:Decision` and `MakeMe:Preference` nodes stay as-is. These
are always valuable.

**Archive**: Update Task node's `status` to "archived". The node remains in
mnem but won't appear in active retrieval.

**Delete**: Remove nodes that have no long-term value using
`mnem_global_mnem_tombstone_node`. If this tool is unavailable, skip the deletion and note in the Task node content that manual cleanup is needed.

**Create Pattern**: If this is the 3rd+ similar task type, create a
`MakeMe:Pattern` node using `mnem_global_mnem_resolve_or_create` to prevent
duplicates:

```
# Use resolve_or_create with task_type as anchor to avoid duplicate patterns
mnem_global_mnem_resolve_or_create(
  agent_id="opencode",
  name="Pattern: report-writing workflow",
  kind="MakeMe:Pattern",
  extra_props={
    "task_type": "report",
    "phases": ["understand", "plan", "research", "draft", "review"],
    "observation_count": 3,
    "first_seen": "2026-01-15",
    "last_seen": "2026-01-20"
  }
)
```

Then link it to the task with an `observed_in` edge (requires a separate
`mnem_global_mnem_commit` call with the returned UUID as `src`).

### Step 4: Commit Preference

If the user expressed any preferences during the task (e.g., "I always use the
writing template for reports"), create a `MakeMe:Preference` node using
`mnem_global_mnem_resolve_or_create` to prevent duplicates:

```
mnem_global_mnem_resolve_or_create(
  agent_id="opencode",
  name="Prefers writing-project template for report tasks",
  kind="MakeMe:Preference",
  extra_props={
    "domain": "writing",
    "condition": "task type is report"
  }
)
```

## Task Cancellation

A task can be cancelled at any point. Set the Task node's `status` to
`"cancelled"` and offer cleanup:

```
Cancel "[task goal]"?
1. Cancel and archive (keep Task node for reference)
2. Cancel and delete (remove Task node from mnem)
3. Never mind, keep working
```

Cancelled tasks follow the same cleanup flow as completed tasks: keep Decisions
and Preferences, archive or delete the Task node. Use the same cleanup prompts
as task completion.

## Cross-Session Memory

Key things to preserve across sessions:

| Preserve? | What | Node type |
|-----------|------|-----------|
| Always | Decisions (what and why) | `MakeMe:Decision` |
| Always | Preferences (learned habits) | `MakeMe:Preference` |
| Always | Patterns (observed workflows) | `MakeMe:Pattern` |
| Until archived | Task goals and progress | `MakeMe:Task` |
| Until deleted | Research findings | `MakeMe:Task` content |
| Until deleted | Intermediate progress | `MakeMe:Task` content |

## Pitfalls

| Issue | Fix |
|-------|-----|
| Committing too much | Only commit decisions, preferences, and patterns — not every step detail. |
| Not committing enough | If a preference is expressed, commit it immediately. Don't assume you'll remember. |
| Cluttering mnem with completed tasks | Archive completed tasks. Don't leave them as "active". |
| Forgetting to update phase transitions | Always update `phase` after a phase completes. The orchestrator depends on it. |
| Offering cleanup when not needed | Only offer cleanup when a task is truly complete, not on every session end. |
