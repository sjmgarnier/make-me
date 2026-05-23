# mm-templates

Manage workflow templates: list available templates, apply one to a new task,
create new ones from observed patterns, and edit existing templates.

## When to Activate

- During `mm-understand` when the user selects a template
- User says "use the writing template", "apply admin template", "list templates"
- The orchestrator suggests a template based on task type
- After 3+ similar tasks completed (pattern → template offer)

## OpenCode Conventions

See SKILL.md § OpenCode Conventions for full conventions.

- agent_id: use `"opencode"` on all mnem write calls
- Path prefix: use `<base-dir>` for all template paths

## Input

- The active `MakeMe:Task` node (goal, scope) — for matching a template
- Available template files in `<base-dir>/templates/`

## Process

### List Templates

Read all template files from the skill's template directory and present them:

```
Available templates:

1. **Writing project** — Blog post, report, article, book chapter
   Phases: understand → plan → research → draft* → review → revise* → finalize*
   (* = maps to execute)

2. **Research report** — Gather information, synthesize, produce findings
   Phases: understand → research → plan → draft* → review → finalize*
   (* = maps to execute)

3. **Admin clearout** — Clear inbox, process to-do list, triage
   Phases: understand → categorize* → execute → review
   (* = maps to plan)

4. **Code project** — Build a feature, fix a bug, refactor
   Phases: understand → plan → implement* → test* → review → finalize*
   (* = maps to execute)

5. **Planning/decision** — Evaluate options, make a decision
   Phases: understand → research → evaluate* → decide* → review → document*
   (* = evaluate→research, decide/document→execute)

6. **Meeting prep** — Prepare agenda, gather materials, plan discussion
   Phases: understand → gather* → organize* → review → package*
   (* = gather→research, organize→plan, package→execute)

Which template fits your task? (Or type "custom" for no template)
```

### Apply a Template

When the user selects a template:

1. **Read the template file** from `<base-dir>/templates/[template-name].md`
2. **Parse the frontmatter**: extract `phases`, `delegates`, `success_criteria_defaults`
3. **Create a MakeMe:Task node** with:
   - `goal` from Understand phase
   - `phase`: "plan" (understand is complete; orchestrator transitions phase before activation)
   - `template`: template name
   - `success_criteria`: merge template defaults with user-specified criteria
   - `status`: "active"
   - Content: generate the plan from the template's phases

4. **Populate the plan content** using the template's suggested flow:

```
## Plan

1. [ ] Understand requirements (phase: understand)
2. [ ] Create outline (phase: plan)
3. [ ] Gather data and sources (phase: research)
4. [ ] Write first draft (phase: execute, delegate: writing-draft)
5. [ ] Review against criteria (phase: review)
6. [ ] Revise and finalize (phase: execute)

## Template: writing-project
## Success Criteria
- Addresses the target audience
- Clear structure and flow
- No factual errors
- Meets format requirements
```

5. **Set delegation hints** from the template's `delegates` field — these are
   noted in the plan steps but not automatically delegated

6. **Confirm with the user**:

```
I've set up the "writing-project" template for your task:

Phases: understand → plan → research → execute (draft) → review → execute (revise) → execute (finalize)
Success criteria: [merged list]
Delegation: draft phase → writing-draft (if writing-superpowers is installed)

Adjust anything?
```

### Create a Template from a Pattern

After 3+ similar tasks have been completed (detected by `mm-track`):

1. **Extract the common workflow** from completed MakeMe:Task nodes
2. **Identify common success criteria** across those tasks
3. **Propose a template** to the user:

```
You've completed 3 report-writing tasks with this workflow:

1. Understand requirements
2. Plan the outline
3. Research data and sources
4. Draft sections
5. Review against criteria
6. Revise and finalize

Common success criteria: clear structure, accurate data, professional tone.

Want me to save this as a "report-writing" template?
```

4. **If the user agrees**, create a new template file in `<base-dir>/templates/`
   following the standard template format

**Note:** Template creation from patterns is not yet available. To create a new
template, manually add a markdown file to the `templates/` directory following
the format below. See the v2 plan in `docs/plan-v2.md` for future automation.

### Edit a Template

Templates are markdown files in `<base-dir>/templates/`. To edit:

1. Read the template file
2. Present current content to the user
3. Accept changes
4. Write the updated template file

**Caution:** Template edits affect all future tasks that use that template.
Past tasks are not affected (they already have their plan stored in mnem).

## Template File Format

Each template is a markdown file with YAML frontmatter:

```yaml
---
name: writing-project
description: "Blog post, report, article, book chapter"
phases: [understand, plan, research, draft, review, revise, finalize]
phase_mapping:
  draft: execute
  review: review
  revise: execute
  finalize: execute
delegates:
  draft: writing-draft
  review: writing-review
success_criteria_defaults:
  - "Addresses the target audience"
  - "Clear structure and flow"
  - "No factual errors"
  - "Meets word count / format requirements"
---
```

Followed by:

- **Suggested Flow** — numbered list of phases with brief descriptions
- **Phase-Specific Success Criteria** — criteria relevant to this template
- **Tips** — practical advice for this type of task
- **Customization Notes** — what users commonly adjust

## Matching Templates to Tasks

During `mm-understand`, match the user's goal to available templates:

1. Compare the task description keywords against template descriptions
2. Score matches: writing tasks → writing-project, research tasks → research-report, etc.
3. Present top 2-3 matches to the user
4. Allow manual override ("no, this is actually a code project")

## Pitfalls

| Issue | Fix |
|-------|-----|
| Template doesn't fit perfectly | Templates are starting points, not straitjackets. Suggest customizing the plan after applying. |
| User picks wrong template | Let them. If the plan doesn't work, they can adjust. Don't override their choice. |
| Over-templating simple tasks | For "clear my inbox", suggest the admin-clearout template but keep it brief. Don't add unnecessary structure. |
| Not updating templates | After completing a task with a template, note what worked and what didn't. Offers to refine the template over time. |
