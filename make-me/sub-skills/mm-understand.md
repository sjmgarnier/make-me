# mm-understand

Clarify the goal, scope, constraints, and success criteria for a new task.

## When to Activate

- User says "I want to...", "help me with...", "make me...", or any expression of a new goal
- No active `MakeMe:Task` node exists
- The orchestrator determines a new task is needed

## Claude Conventions

See SKILL.md § Claude Conventions for full conventions.

- Checkpoint: write task node to mnem immediately after creation (Step 3)
- Initial phase: task is created with `phase="plan"` because Understand is
  completing — this is creation-time initialization, not a phase transition
  owned by the orchestrator

## Input

- The user's initial description of what they want to accomplish
- Any context from mnem (prior preferences, patterns, related completed tasks)

## Express Mode

For simple tasks (e.g., "clear my inbox", "write a quick email"), the orchestrator
can activate express mode. Instead of asking all 5 questions, combine them into
a single confirmation:

```
You want to [inferred goal] with success criteria: [inferred criteria]. Sound right?
```

If confirmed, skip to template selection. This avoids excessive ceremony for
tasks that are straightforward and well-scoped.

The orchestrator decides when to use express mode based on:
- Task scope (small/obvious = express)
- Template match confidence (high = express)
- User preference (if `MakeMe:Preference` says they prefer less structure = express)

## Process

### Step 1: Check for Prior Context

Before asking any questions, check mnem:

```
mnem_global_mnem_retrieve(text="user preferences", label="MakeMe:Preference")
```

Also check for similar completed tasks that might inform this one:

```
mnem_global_mnem_retrieve(text="[task domain keywords]", label="MakeMe:Task")
```

Skip any questions where mnem already has the answer. Do NOT re-ask known facts.

### Step 2: Ask Questions One at a Time

Ask each question individually. Wait for the user's answer before asking the
next one. This prevents overwhelming the user and allows follow-up questions.

**Question 1: Goal**

```
What would you like to accomplish?
```

Store the answer in the task's `goal` prop. If the initial user message already
contains a clear goal, confirm it rather than asking from scratch:

```
Just to confirm — you want to [restate goal]. Is that right?
```

**Question 2: Success Criteria**

```
What does "done" look like? How will you know this is complete?
```

Store as `success_criteria` (list). If the user picks a template, the template
will suggest default success criteria that can be customized.

**Question 3: Constraints**

```
Any constraints I should know about? (deadline, tools, format, budget, quality requirements)
```

Store as `constraints` (object with named constraints). If no constraints,
that's fine — not every task has them.

**Question 4: Scope**

```
What's in scope? And just as important — what's out of scope?
```

Store as `scope` (object with `in` and `out` arrays). If the user isn't sure,
suggest a default scope based on the task type.

**Question 5: Template Selection (Smart Matching)**

Rather than listing all 6 templates, start with an inference:

```
This sounds like a [inferred type] task. I'd suggest the [template-name] template,
which follows: [phases].

Use this template, pick a different one, or go custom?
1. Use [template-name] (recommended)
2. See all templates
3. Build a custom workflow
```

This reduces choice overload from 6 options to a confirmation.

If the user picks a template, apply it (see `mm-templates`). If they want
custom, proceed with a generic workflow.

### Step 3: Create the Task Node

After gathering enough information, create the task in mnem:

```
mnem_global_mnem_commit(
  agent_id="claude-desktop",
  nodes=[{
    ntype="MakeMe:Task",
    summary="Write Q1 quarterly report for stakeholders",
    content="## Plan\n(To be created in mm-plan)\n\n## Progress\n(Not started yet)",
    props={
      "goal": "Write Q1 quarterly report for stakeholders",
      "phase": "plan",
      "template": "writing-project",
      "status": "active",
      "success_criteria": ["Addresses target audience", "Clear structure", "Accurate numbers", "Professional tone"],
      "scope": {"in": ["financials", "product updates", "team highlights"], "out": ["HR matters", "individual performance"]},
      "constraints": {"deadline": "2026-02-15", "format": "Google Docs", "max_length": "5000 words"},
      "project_path": "/path/to/project"
    }
  }]
)
```

### Step 4: Commit Decisions Made

If the user made any significant choices during understanding (e.g., chose a
template, decided on scope), commit them as `MakeMe:Decision` nodes:

```
mnem_global_mnem_commit(
  agent_id="claude-desktop",
  nodes=[{
    ntype="MakeMe:Decision",
    summary="Used writing-project template for quarterly report",
    props={
      "rationale": "Task is a report with defined audience and structure",
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

### Step 5: Hand Off to Planner

After the task node is created:

```
Great! I've captured your goal and set up the task.

Next steps:
1. Plan it out — break this into steps (recommended)
2. Start working right away
3. Research first, then plan

What would you like to do?
```

This triggers the orchestrator to activate `mm-plan`.

## What Understanding Looks Like

A completed Understand phase produces:

- A `MakeMe:Task` node with: goal, success_criteria, scope, constraints, template, status="active", phase="plan"
  (The task is created with `phase="plan"` directly because Understand is
  completing — this is creation-time initialization, not a phase transition.
  The orchestrator's phase transition rule applies to subsequent phase changes
  on an already-existing task.)
- Optionally, `MakeMe:Decision` nodes for template/scoping choices
- Enough context that `mm-plan` can create a concrete step-by-step plan

## Pitfalls

| Issue | Fix |
|-------|-----|
| Asking too many questions at once | One question at a time. Always. |
| Re-asking known facts | Check mnem for preferences and prior tasks before asking |
| Vague goals | If the goal is vague ("I need to do something about email"), ask a clarifying follow-up before storing |
| Over-scoping | If scope is too broad, suggest narrowing: "That's a lot. Would you like to focus on [X] first?" |
| User wants to skip straight to doing | Enforce Hard Gate 1: at minimum, confirm the goal and success criteria before proceeding |
| Too much ceremony for simple tasks | Use express mode: combine questions into a single confirmation for small tasks |