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

# Writing Project Template

## Suggested Flow

1. **Understand** — Define topic, audience, tone, length, deadline
   - Who is this for? What do they already know?
   - What's the one thing the reader should take away?
   - Any constraints (format, length, deadline)?

2. **Plan** — Outline structure, assign section lengths
   - Create a section-by-section outline
   - Estimate word count per section
   - Identify which sections need research

3. **Research** — Gather sources, quotes, data
   - Find supporting evidence for key claims
   - Collect quotes, statistics, examples
   - Flag gaps that need filling

4. **Draft** (canonical: execute) — Write the first draft
   - Delegate to `writing-draft` (part of writing-superpowers) if installed (recommended)
   - Follow the outline, don't edit while drafting
   - Aim for completeness, not perfection

5. **Review** (canonical: review) — Check against success criteria
   - Does it address the target audience?
   - Is the structure clear?
   - Are facts accurate and sourced?
   - Does it meet length requirements?

6. **Revise** (canonical: execute) — Implement review findings
   - Fix structural issues first, then polish
   - Add missing evidence, tighten prose
   - Check transitions between sections

7. **Finalize** (canonical: execute) — Format, proofread, deliver
   - Final proofread for typos and grammar
   - Format to meet requirements
   - Deliver in the requested format

## Writing-Specific Success Criteria

- [ ] Thesis or argument is clear from the start
- [ ] Evidence supports all claims
- [ ] Tone is consistent throughout
- [ ] Structure serves the argument (not the other way around)
- [ ] Meets format requirements (length, style, citations)

## Tips

- Research and outline can overlap; draft cannot start without outline
- Use `writing-superpowers` sub-skills for phases 4-7 if installed (`writing-draft` for drafting, `writing-review` for review)
- For short pieces (< 1,000 words), consider combining plan and research
- Writing benefits from time away — suggest a break between draft and review
- The "write drunk, edit sober" principle: draft without editing, review without writing