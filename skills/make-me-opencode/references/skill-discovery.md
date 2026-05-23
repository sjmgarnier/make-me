# Skill Discovery

How Make-Me discovers and proposes relevant external skills during task
execution. This protocol is OpenCode-native.

## Discovery Algorithm

### Step 1: Read Available Skills

Read the `<available_skills>` XML block injected into the OpenCode system
prompt at session start. Each entry has `<name>`, `<description>`, and
`<location>`. No filesystem scan or tool call is needed.

### Step 2: Semantic Match

Reason about which available skills match the current task context (from the
active `MakeMe:Task` node):

- The task's `goal` prop
- The current `phase` prop
- The `template` prop (if any)
- The `scope` prop (if any)

Use semantic judgment — no keyword tables. A skill description like "draft
long-form narrative non-fiction" matches a writing task without needing to
match the word "write" explicitly.

### Step 3: Score Confidence

Assign confidence levels based on semantic match strength and phase alignment:

- **High**: Strong semantic match + phase alignment (e.g., writing task in
  draft phase → writing skill)
- **Medium**: Partial match (e.g., writing task in plan phase → writing skill
  is relevant but not primary)
- **Low**: Tangential (e.g., any task → `find-skills`)

### Step 4: Handle Borderline Matches

If the top match is Medium confidence, offer the model routing protocol before
presenting:

> "Skill matching is uncertain here. How would you like to proceed?
>
> 1. Spawn a subagent with a stronger model to evaluate (takes a moment)
> 2. I switch to a stronger model for this step
> 3. Continue with my current judgment"

### Step 5: Present to User

Show top matches (up to 3):

```
I found skills that could help with this step:

1. **writing-superpowers** (high confidence)
   Draft writing projects with discipline and organization.
   → Use for: drafting sections

2. **find-skills** (low confidence)
   Discover and install agent skills.
   → Use for: finding more specialized tools

Would you like to use any of these?
```

### Step 6: No Strong Match — Check Installable Skills

If no High-confidence match is found among installed skills:

1. Inform the user: "I didn't find a strong match among installed skills."
2. Ask: "Want me to search for installable skills that might help?" (`find-skills`
   is a discovery utility, not a delegation target — this prompt satisfies Hard
   Gate 2 before invoking it)
3. If yes: invoke the `find-skills` skill (via the `skill` tool)
4. Present findings non-blocking: "I found [skill] in the registry — want to
   check it out before continuing?"
5. **Checkpoint task state to mnem** before the user leaves to install
   (preserves state if the session is interrupted)
6. If the user declines search or install: proceed with general capabilities
   (see also: Fallback section below)

### Step 7: Delegate

On user confirmation:

1. Record a `uses_skill` self-edge on the Task node using the skill's
   registered name as it appears in the `<available_skills>` block:
   `props: {skill: "registered-skill-name"}` (e.g., `{skill: "writing-superpowers"}`)
2. Activate the skill via the `skill` tool using its registered name
3. Pass context: task goal, current step, success criteria, any research findings
4. Let the skill execute
5. Make-Me validates results against the task's success criteria (this is
   Make-Me's post-delegation check, not a re-execution of the skill's own review)
6. Update the Task node content with what was accomplished
7. Checkpoint to mnem with `agent_id: "opencode"`

## Caching

The `<available_skills>` list is already in the system prompt for the session —
no scan or caching is needed.

## Fallback

If `find-skills` is unavailable or returns no results:

1. Inform the user: "I didn't find a specialized skill for this step."
2. Proceed with general capabilities
3. Note the gap in the Task node content for future reference
