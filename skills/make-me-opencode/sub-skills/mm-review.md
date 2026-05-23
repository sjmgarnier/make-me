# mm-review

Quality check: evaluate output against success criteria and identify gaps.

## When to Activate

- After execution steps are complete (or between steps)
- User says "review this", "check my work", "is this done?"
- Before marking a task as complete (Hard Gate 3)

## OpenCode Conventions

See SKILL.md § OpenCode Conventions for full conventions.

- agent_id: use `"opencode"` on all mnem write calls
- Model routing: offer when evaluating criteria with conflicting signals
  (see SKILL.md § Model Routing Offer Protocol)
- Path prefix: use `<base-dir>` for all sub-skill paths

## Input

- The active `MakeMe:Task` node (success criteria, plan, progress)
- The output of the execution phase (what was actually produced)

## Process

### Step 1: Read Success Criteria

Retrieve the task's success criteria from the Task node's `success_criteria` prop:

```
task = mnem_global_mnem_search(label="MakeMe:Task", where={"status": "active"})
```

### Step 2: Evaluate Against Each Criterion

Go through each success criterion and evaluate:

| Criterion | Status | Notes |
|-----------|--------|-------|
| Addresses target audience | ✅ Pass | Written for executives, includes financial highlights |
| Clear structure and flow | ✅ Pass | 5 sections, logical flow |
| No factual errors | ⚠️ Warning | Q1 margins calculated from preliminary data |
| Meets format requirements | ❌ Fail | Only 3,200 words, target is 5,000 |

Be specific in your evaluation. Don't just say "looks good" — actually check.

### Step 3: Check for Gaps

Beyond the success criteria, look for:

- **Missing sections**: Was anything in the plan not addressed?
- **Quality issues**: Is the output well-structured, clear, and professional?
- **Factual accuracy**: Are claims supported by evidence?
- **Completeness**: Does this cover everything the user asked for?
- **Consistency**: Are there contradictions or inconsistencies?

### Step 4: Produce Review Summary

Add the review to the Task node content:

```
## Review

| Criterion | Status | Notes |
|-----------|--------|-------|
| Addresses target audience | ✅ | Written for executives |
| Clear structure and flow | ✅ | 5 sections, logical |
| No factual errors | ⚠️ | Margins from preliminary data |
| Meets format requirements | ❌ | 3,200 words (target: 5,000) |

### Gaps
- Section 4 (team highlights) is thin — only 2 paragraphs
- No executive summary at the start
- Financial data is preliminary

### Suggested Actions
1. Expand team highlights with specific achievements
2. Add executive summary (300-500 words)
3. Flag financial data as preliminary in the document
4. Add ~1,800 words to meet length requirement
```

### Step 5: Recommend Next Step

Based on the review results:

**All criteria pass:**
```
Everything looks good! The task meets all success criteria.

1. Mark task as complete (recommended)
2. One more round of polish
3. Get external feedback before finalizing
```

**Some criteria fail:**
```
A few criteria need attention:

[criteria that failed]

1. Revise to address gaps (recommended)
2. Accept as-is and mark complete
3. Adjust the success criteria
```

**Major issues found:**
```
There are significant gaps:

[issues found]

1. Go back to execution and fix these (recommended)
2. Re-plan with adjusted scope
3. Accept as-is with documented limitations
```

### Step 6: Handle Success Criteria Changes

If the user wants to change success criteria after review:

1. That's valid — criteria evolve as understanding deepens
2. Commit a `MakeMe:Decision` node explaining why criteria changed
3. Update the Task node's `success_criteria` prop
4. Re-evaluate against the new criteria

## Iterative Review

Review is not a one-shot activity. After revision:

1. Update the Task node content with changes made
2. Re-evaluate only the criteria that previously failed
3. If all now pass → suggest marking complete
4. If still failing → iterate again or adjust criteria

## What Good Review Looks Like

- **Specific**: "Section 3 has no supporting data" not "needs improvement"
- **Actionable**: Clear suggestions for what to fix, not just what's wrong
- **Balanced**: Acknowledge what works, don't just flag problems
- **Criteria-aligned**: Every issue maps back to a success criterion
- **Realistic**: Suggestions should be achievable, not aspirational

## Pitfalls

| Issue | Fix |
|-------|-----|
| Nitpicking minor issues | Focus on criteria violations and significant gaps. Minor polish can happen later. |
| Rubber-stamping | Actually evaluate. Don't just say "looks good" without checking. |
| Moving goalposts | If success criteria were set in Understand, don't silently raise the bar during Review. |
| Ignoring the user's standards | The user decides what "done" means. If they say it's done, it's done (modulo Hard Gate 3). |
| Over-reviewing simple tasks | For "clear my inbox", a simple "all emails processed" check is sufficient. |
