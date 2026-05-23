# mm-orchestrator

The orchestrator is the brain of Make-Me. It decides which phase to activate,
discovers relevant skills, manages the coaching loop, and handles session
handoff.

## When to Activate

Always. The orchestrator is the first sub-skill activated when Make-Me starts.
It reads the current state and decides what happens next.

## OpenCode Conventions

See SKILL.md § OpenCode Conventions for full conventions.

- Path prefix: use `<base-dir>` (from "Base directory for this skill:"
  injected by OpenCode) to construct all sub-skill paths
- Model routing: offer when routing between 2+ equally plausible phases
  (see SKILL.md § Model Routing Offer Protocol)
- Skill discovery: read `<available_skills>` from system prompt
  (see `<base-dir>/references/skill-discovery.md`)

## Process

### Step 1: Session Start

On every session start, check mnem for the current context:

```
mnem_global_mnem_search(label="MakeMe:Task", where={"status": "active"})
```

**If active task found:**

```
You have an active task: "[goal]" (phase: [phase]).

Where would you like to pick up?
1. Continue with [next suggested step]
2. Review what's been done so far
3. Start something new
```

**If no active task:**

```
What would you like to work on?
(Or describe what you need help with and I'll help you figure it out.)
```

Then activate `mm-understand` to create a new task.

**If multiple active tasks found:**

```
You have [N] active tasks:
1. "[task 1 goal]" (phase: [phase])
2. "[task 2 goal]" (phase: [phase])

Which one would you like to continue?
Or start something new?
```

### Step 2: Determine Current Phase

Read the active task's `phase` prop from its MakeMe:Task node. Use this to
determine which sub-skill to suggest next. The 5 canonical phases map to
sub-skills; template-specific sub-phases route to the canonical phase's
sub-skill:

| Canonical Phase | Sub-skill | Template sub-phases that route here |
|----------------|-----------|-------------------------------------|
| understand | `mm-understand` | all understand variants |
| plan | `mm-plan` | plan, outline, categorize, organize |
| research | `mm-research` | gather, evaluate |
| execute | `mm-execute` | draft, implement, test, decide, package, finalize, revise |
| review | `mm-review` | review |

If the current phase is a template sub-phase (e.g., "draft"), route to the
canonical sub-skill (e.g., `mm-execute`). The `phase_mapping` in each template
frontmatter defines these mappings.

If routing is ambiguous between 2+ equally plausible phases, apply the
Model Routing Offer Protocol (see SKILL.md § Model Routing Offer Protocol).

**Phase transition ownership:** The orchestrator owns all phase transitions.
When a sub-skill completes, it returns control to the orchestrator, which then
updates the Task node's `phase` prop and activates the next sub-skill. Sub-skills
should NOT update the `phase` prop directly.

### Step 3: Coach — Suggest 1-3 Next Steps

After significant actions or phase transitions, suggest 1-3 next steps. For
minor step completions where the next step is obvious, proceed without asking.
Format:

```
What's next?
1. [Specific actionable step] (recommended)
2. [Alternative step]
3. [Different direction]
```

Always mark one as recommended based on the current phase and plan progress.

### Step 4: Skill Discovery

When the orchestrator enters a phase that could benefit from external skills,
run the skill discovery protocol (see `<base-dir>/references/skill-discovery.md`):

1. Read the `<available_skills>` from the OpenCode system prompt
2. Reason semantically about which skills match the current task context
   (domain keywords, phase needs)
3. Score confidence: **High** (exact domain match), **Medium** (partial overlap),
   **Low** (tangential)
4. Present top 3 matches to the user
5. On confirmation → record `uses_skill` edge (props: `{skill: "skill-name"}`)

**Never delegate without user confirmation** (Hard Gate 2).

### Step 5: Phase Transitions

When a sub-skill completes its work, the orchestrator:

1. Updates the MakeMe:Task node's `phase` prop
2. Marks completed steps in the Task node content
3. Commits any MakeMe:Decision nodes for choices made
4. Suggests next steps (coach mode)

### Step 6: Session End

When the user ends the session or the task is pausing:

1. Update the MakeMe:Task node with current progress in content
2. Commit a summary of what was accomplished
3. Suggest where to pick up next time

## Checking for User Preferences

Before suggesting anything, check mnem for learned preferences:

```
mnem_global_mnem_retrieve(text="user preferences [domain]", label="MakeMe:Preference")
```

Skip suggestions that contradict known preferences. Example: if the user has a
`MakeMe:Preference` node saying they always skip the research phase for admin
tasks, don't suggest research for admin tasks.

## Adaptation

The orchestrator adapts its suggestions based on:

- **Phase progress**: Don't suggest research if the task already has a plan and
  research is complete.
- **Task type**: Use the `template` prop to know which phases are relevant.
  Admin tasks may skip research; code projects may skip outlines.
- **User preference**: Check mnem for `MakeMe:Preference` nodes about the
  current domain or task type.
- **Observed patterns**: Check mnem for `MakeMe:Pattern` nodes. If the user
  has completed 3+ similar tasks, suggest the observed workflow.

## Pitfalls

| Issue | Fix |
|-------|-----|
| Suggesting phases that don't apply | Check the template; skip phases not in the template's flow |
| Overwhelming user with 3 options every time | If the next step is obvious, proceed without asking. Coach mode is flexible. |
| Losing context between sessions | Always update MakeMe:Task content before session end; always check mnem on session start |
| Conflicting skills | If multiple skills match, present both and let user choose |
| User wants to skip Understand | Enforce Hard Gate 1: new tasks must start with Understand (or user overrides) |
| User wants to cancel a task | Set status to "cancelled", offer cleanup (archive or delete the Task node) |
| User rejects all suggestions | Accept the user's direction. Update the plan. Coach means user drives. |
