# mm-plan

Break a task into concrete steps, identify dependencies, and establish a
workflow.

## When to Activate

- After `mm-understand` completes (the orchestrator transitions the phase to "plan")
- User says "let's plan this out", "break this down", "what steps should I take"
- The orchestrator determines planning is needed

## OpenCode Conventions

See SKILL.md § OpenCode Conventions for full conventions.

- agent_id: use `"opencode"` on all mnem write calls
- Model routing: offer when generating steps for a complex or ambiguous task
  (see SKILL.md § Model Routing Offer Protocol)
- Checkpoint: write plan to mnem in Step 6, after user approves in Step 5

## Input

- The active `MakeMe:Task` node (goal, scope, constraints, success_criteria)
- The selected template (if any) from `mm-templates`
- Any `MakeMe:Pattern` nodes for similar task types

## Process

### Step 1: Gather Context

Retrieve the active task and any relevant patterns:

```
# Get the active task
mnem_global_mnem_search(label="MakeMe:Task", where={"status": "active"})

# Check for patterns matching this task type
mnem_global_mnem_retrieve(text="[task type] workflow pattern", label="MakeMe:Pattern")
```

If a matching pattern exists, use it as the starting point:

```
I noticed you've done [N] similar tasks before. Your typical workflow is:
[pattern phases]

Want me to use this as a starting point?
```

### Step 2: Apply Template (If Selected)

If the user chose a template during Understand, read it:

```
Read the template file from `<base-dir>/templates/[template-name].md`
```

Use the template's:
- Phase sequence (the order of steps)
- Default success criteria (merge with the user's)
- Delegation hints (which steps can be delegated to which skills)
- Tips and phase-specific guidance

### Step 3: Generate the Plan

Create a step-by-step plan. Each step includes:

1. **Step name** — clear, action-oriented ("Gather Q1 financial data", not "Research")
2. **Phase** — which Make-Me phase this step belongs to (understand, plan, research, execute, review)
3. **Dependencies** — which steps must complete before this one starts
4. **Delegate-to** — which external skill can handle this step (if any)
5. **Effort** — rough estimate: small (minutes), medium (hours), large (days)

Present the plan to the user:

```
Here's a plan for "[goal]":

1. ☐ Understand requirements (phase: understand) — small
2. ☐ Create outline (phase: plan) — small
3. ☐ Gather financial data (phase: research) — medium
4. ☐ Draft sections (phase: execute, could delegate to: writing-draft) — large
5. ☐ Review against criteria (phase: review) — small
6. ☐ Finalize and deliver (phase: execute) — small

Dependencies: 3 → 4, 4 → 5

Want me to adjust anything?
```

### Step 4: Skill Discovery for Delegation

For steps that could benefit from specialized skills, run the discovery
protocol (see `references/skill-discovery.md`):

1. Scan skill directories for matching skills
2. Present findings to the user
3. On confirmation, mark the step's `delegate_to` field

### Step 5: Get User Approval

Ask the user to approve the plan:

```
Does this plan look right?
1. Yes, let's go
2. I want to adjust some steps
3. Let me think about it and come back
```

If the user wants adjustments, modify the plan and re-present. Loop until
approved or abandoned.

### Step 6: Commit the Plan

Update the MakeMe:Task node with the approved plan. Note: this is pseudocode —
use `mnem_global_mnem_commit` to update the Task node in practice:

```
# Pseudocode for the plan content update:
##
## Plan
##
1. [ ] Understand requirements (phase: understand) — small
2. [ ] Create outline (phase: plan) — small
3. [ ] Gather financial data (phase: research) — medium
4. [ ] Draft sections (phase: execute, delegate: writing-draft) — large
5. [ ] Review against criteria (phase: review) — small
6. [ ] Finalize and deliver (phase: execute) — small
##
## Progress
##
- [ ] Not started yet

# Then update the phase:
# mnem_global_mnem_commit to update Task node props: phase = "plan"
# agent_id = "opencode"
```

Also commit any decisions made during planning as `MakeMe:Decision` nodes.

### Step 7: Suggest Next Steps

```
Plan is set! What's next?
1. Start with step 1 — [first step name] (recommended)
2. Jump to a specific step
3. Do some research first
```

## Adapting the Plan

Plans are not set in stone. The user can:

- **Add steps**: "I need to also get approval from Sarah"
- **Remove steps**: "Skip the research, I already have the data"
- **Reorder steps**: "Let me draft first, then research to fill gaps"
- **Change delegation**: "Don't use writing-draft, I'll draft myself"

Every adaptation triggers a plan update and a `MakeMe:Decision` node for the
change reason.

## What a Good Plan Looks Like

- Steps are **action-oriented** (verbs, not nouns): "Draft the introduction" not "Introduction"
- Steps are **small enough** to be completable in one session
- Dependencies are **explicit**, not assumed
- The plan **covers all success criteria** — every criterion has at least one step addressing it
- Delegation opportunities are **identified** but not forced

## Pitfalls

| Issue | Fix |
|-------|-----|
| Over-planning simple tasks | For small tasks (1-3 steps), keep the plan minimal. Don't break "clear inbox" into 8 steps. |
| Under-planning complex tasks | If success criteria aren't all addressed by steps, add more steps or flag the gap. |
| Rigid adherence | Plans should adapt. If the user wants to change direction, update the plan rather than resisting. |
| Forgetting dependencies | Always check: "Can step 4 start without step 3 being done?" If not, mark the dependency. |
| Template mismatch | If the template's flow doesn't fit, customize it. Templates are starting points, not straitjackets. |
