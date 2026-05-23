---
name: planning-decision
description: "Evaluate options, make a decision, document the outcome"
phases: [understand, research, evaluate, decide, review, document]
phase_mapping:
  evaluate: research
  decide: execute
  review: review
  document: execute
delegates: {}
success_criteria_defaults:
  - "Decision is clearly stated and justified"
  - "Alternatives were considered"
  - "Trade-offs are documented"
  - "Stakeholders are aligned (if applicable)"
---

# Planning/Decision Template

## Suggested Flow

1. **Understand** — Define the decision to make
   - What's the decision? (Write it as a clear question)
   - Who needs to be involved?
   - What's the deadline for deciding?
   - What are the constraints? (budget, time, technical, organizational)
   - What does "done" look like? (A yes/no? A ranked list? A plan?)

2. **Research** — Gather information relevant to the decision
   - What facts do we need?
   - Who has relevant expertise or experience?
   - What's the context? (past decisions, organizational dynamics, market conditions)
   - Are there precedents? (how was this type of decision made before?)
   - Any data or analysis that would inform the choice?

3. **Evaluate** — Assess the options
   - List all viable options (even the unconventional ones)
   - For each option, evaluate:
     - **Pros**: What makes this option attractive?
     - **Cons**: What are the risks or downsides?
     - **Cost**: Time, money, effort, opportunity cost
     - **Feasibility**: Can we actually do this?
   - Consider worst-case scenarios for each option
   - Rank or score the options if appropriate

4. **Decide** (canonical: execute) — Make the call
   - Which option best balances pros, cons, and constraints?
   - Is this a reversible decision? (If yes, bias toward action)
   - Is there a way to split the difference or iterate?
   - Who needs to approve? (Get alignment before documenting)

5. **Review** (canonical: review) — Validate the decision
   - Does the decision meet the success criteria?
   - Were all viable alternatives considered?
   - Is the rationale clear and documented?
   - Do stakeholders agree?

6. **Document** (canonical: execute) — Record the decision and rationale
   - State the decision clearly
   - Explain the rationale (why this option, why not the others)
   - List alternatives considered and why they were rejected
   - Note any conditions, caveats, or follow-up actions
   - Store as a `MakeMe:Decision` node in mnem for future reference

## Decision-Specific Success Criteria

- [ ] The decision question is specific and answerable
- [ ] At least 2-3 viable alternatives were evaluated
- [ ] Trade-offs are explicitly documented
- [ ] The chosen option aligns with stated constraints
- [ ] Rationale is clear enough that someone else could understand why

## Tips

- Don't over-research — set a time box for gathering information
- "Decide not to decide" is a valid decision — just document it
- For reversible decisions, bias toward action: try the simplest option first
- Use a decision matrix (option × criteria) for complex evaluations
- Document the decision even if it seems obvious — future-you will thank you
- Check mnem for `MakeMe:Decision` nodes — maybe this decision was made before