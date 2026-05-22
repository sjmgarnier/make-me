# mm-research

Find information needed to complete a task — from local files, mnem memory,
or the web.

## When to Activate

- A plan step requires research (phase: research)
- User says "find info about...", "I need to know...", "what does X mean?"
- The orchestrator determines information is needed before proceeding

## Claude Conventions

See SKILL.md § Claude Conventions for full conventions.

- Mid-phase: build research brief in context; do not re-read task from mnem
  during Steps 1–5
- Checkpoint: write research brief to Task node in Step 6

## Input

- The active `MakeMe:Task` node (to understand what information is needed)
- The current plan (which steps need research)
- Any research brief already gathered

## Process

### Step 1: Identify Information Needs

Read the task's plan from the Task node content. For each pending step, ask:

- What information does this step require?
- What facts, data, or references would make this step easier?
- Are there gaps in the user's knowledge that could block progress?

List the information needs clearly:

```
To complete this task, we need:
1. Q1 financial data (revenue, expenses, margins)
2. Product updates from January-March
3. Team reorganization details from February

Which of these should I research first?
```

### Step 2: Search Local Sources

Before going to the web, check what's already available:

**Local files:**
- Search the project directory for relevant documents
- Check README, docs/, data/ directories
- Look for spreadsheets, PDFs, notes

**mnem memory:**
```
mnem_global_mnem_retrieve(text="[topic]", label="MakeMe:Task")
```

Check for prior tasks on similar topics — their findings may still be relevant.

**User knowledge:**
- Ask the user if they already have the information
- "Do you have the Q1 financial data somewhere?"

### Step 3: Search External Sources

If local sources don't cover all needs:

- Use web search for public information
- Use domain-specific sources when available (APIs, databases, etc.)
- Ask the user for access to private sources they control

### Step 4: Organize Findings

Structure the research results as a brief. Add it to the Task node content:

```
## Research Brief

### Q1 Financial Data
- Revenue: $4.2M (source: finance dashboard, retrieved 2026-01-20)
- Expenses: $3.1M (source: same)
- Margins: 26.2% (calculated)
- ⚠️ Data is preliminary — final numbers expected Jan 31

### Product Updates
- Feature X launched Feb 1
- Feature Y in beta (source: product team Slack, #announcements)
- Feature Z delayed to Q2

### Gaps
- Team reorg details not found — need to ask HR or check internal wiki
```

### Step 5: Flag Gaps and Unknowns

If research couldn't find everything:

```
I found most of what we need, but there are gaps:
- Team reorganization details: not available in local files or public sources
- Final Q1 numbers: preliminary only

Options:
1. Proceed with what we have, flag gaps in the output
2. Ask [person] for the missing information
3. Mark this step as blocked and move on to other steps
```

### Step 6: Update Task and Suggest Next Steps

Update the Task node content with the research brief. Then suggest:

```
Research complete! What's next?
1. Move to the next planned step (recommended)
2. Dig deeper into a specific gap
3. Adjust the plan based on what we found
```

## What Good Research Looks Like

- **Specific**, not vague: "Q1 revenue was $4.2M" not "revenue went up"
- **Sourced**: every fact has a source (URL, file path, person, date)
- **Gaps are explicit**: if we don't know something, say so clearly
- **Brief but sufficient**: enough detail to act on, not a wall of text
- **Actionable**: the user can proceed (or make a decision about gaps)

## Pitfalls

| Issue | Fix |
|-------|-----|
| Research paralysis | Set a time limit. If you can't find it in 10 minutes, flag it as a gap and move on. |
| Unsourced claims | Every finding needs a source. If you can't verify it, mark it as "unverified". |
| Too much information | Stick to what the plan requires. Don't research tangentially. |
| Ignoring local sources | Always check local files and mnem before the web. The user usually has more context than Google. |
| Not involving the user | If a gap requires human knowledge (internal data, private docs), ask the user directly. |