# mm-execute

Do the work — directly or by delegating to domain-specific skills.

## When to Activate

- The plan is approved and the user is ready to work on a step
- User says "let's do this", "execute step X", "work on [step name]"
- The orchestrator determines it's time to execute

## OpenCode Conventions

See SKILL.md § OpenCode Conventions for full conventions.

- agent_id: use `"opencode"` on all mnem write calls
- Path prefix: use `<base-dir>` for all sub-skill paths
- External skill activation: use `skill` tool (lowercase)

## Input

- The active `MakeMe:Task` node (plan, current step, success criteria)
- Any research findings from `mm-research`
- The user's available skills (discovered by the orchestrator)

## Process

### Step 1: Read Current State

Retrieve the active task and its plan:

```
task = mnem_global_mnem_search(label="MakeMe:Task", where={"status": "active"})
```

Identify the current step from the plan in the task's content field.

### Step 2: Check for Skill Delegation

For the current step, check if:
1. The step has a `delegate_to` field (set during planning)
2. An installed skill could handle this step (run skill discovery)

If a skill match is found:

```
This step could use [skill-name]. [skill-description]

Would you like to delegate this step to [skill-name]?
1. Yes, delegate to [skill-name]
2. No, I'll handle it myself
3. Show me what [skill-name] would do first
```

**Never delegate without user confirmation** (Hard Gate 2).

### Step 3: Execute the Step

**If delegating to a skill:**

1. Load the skill using the `skill` tool (lowercase)
2. Pass context: the task goal, current step, success criteria, any research findings
3. Let the skill do its work
4. **Validate results**: Check output against success criteria before updating the Task
   node. If output is inadequate, either re-delegate with clarifications or fall back
   to direct execution.
5. Capture results
6. Update the task plan with what was accomplished

**If executing directly:**

1. Work through the step using available tools
2. Produce the output (document, code, action, etc.)
3. Check against success criteria as you go
4. Pause after significant progress to let the user review

### Step 4: Mark Step Complete

After a step is done, update the Task node content:

```
## Progress

- [x] Understood requirements
- [x] Created outline with 5 sections
- [x] Gathered financial data — revenue $4.2M, expenses $3.1M, margins 26.2%
- [ ] Drafting sections (in progress)
```

### Step 5: Coach — Suggest Next Steps

After each step completion:

```
Step complete! What's next?
1. Move to [next step name] (recommended)
2. Review what we've done so far
3. Take a break and come back later
```

### Step 6: Handle Blockers

If a step is blocked (missing information, dependency not met, external factor):

1. Mark the step as blocked in the Task node content
2. Suggest alternatives:
   - Skip to the next unblocked step
   - Find a workaround
   - Unblock by doing research first
3. Commit a `MakeMe:Decision` node for how the blocker was handled

```
Step 3 is blocked — we don't have the team reorg data yet.

Options:
1. Skip to step 4 (draft sections without reorg info)
2. Research the reorg data now
3. Ask someone for the info, then continue

What would you like to do?
```

## Delegation Protocol

When delegating to an external skill:

1. **Context passing**: Tell the skill exactly what it needs — task goal, current
   step, success criteria, any research findings, and where output should go.
2. **Record the delegation**: Create a `uses_skill` self-edge on the Task node with
   props `{skill: "skill-name"}`. Since skills aren't mnem nodes, the edge is a
   self-loop (Task → Task) with the skill name stored as a prop.
3. **Capture results**: After the skill completes, update the Task node content
   with what was accomplished.
4. **Validate results**: Check output against success criteria. If inadequate,
   re-delegate with clarifications or fall back to direct execution.
5. **Handle partial completion**: If the skill only partially completes, mark
   the step as partially done and explain the gap.

## Delegating to Skills with Their Own State

Some skills (e.g., `writing-superpowers`) manage their own filesystem state
(e.g., a `writing/` directory). When delegating:

1. Let the skill manage its own internal state — do not duplicate it in mnem
2. Make-Me tracks only the **delegation fact** (which skill, which step)
3. To check progress on a delegated step, read the skill's state files
4. When the skill finishes, capture a summary in Make-Me's Task node content

## Adaptation During Execution

- If the user wants to skip a step, that's fine — update the plan and move on
- If a step takes much longer than expected, suggest breaking it into smaller steps
- If new information emerges, suggest updating the plan before continuing
- If the user changes direction, offer to create a new plan rather than forcing
  the old one

## What Good Execution Looks Like

- **Visible progress**: The user can see each step being completed
- **Regular checkpoints**: Pause after significant progress for review
- **Adaptable**: The plan bends when reality doesn't match expectations
- **Documented**: Every step completion is recorded in the Task node content

## Pitfalls

| Issue | Fix |
|-------|-----|
| Doing everything for the user | Make-Me is a coach, not a doer. Guide, suggest, help — but the user drives. |
| Forcing delegation | If the user wants to do it themselves, let them. Suggest delegation, don't demand it. |
| Not checking progress | After each step, verify against success criteria before moving on. |
| Ignoring blockers | If something is blocked, surface it immediately. Don't pretend progress is smooth. |
| Over-documenting minor steps | Not every keystroke needs to be recorded. Track meaningful progress, not every action. |
