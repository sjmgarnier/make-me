---
name: code-project
description: "Build a feature, fix a bug, refactor code, or implement a technical change"
phases: [understand, plan, implement, test, review, finalize]
phase_mapping:
  implement: execute
  test: execute
  finalize: execute
delegates:
  implement: implement
  review: critical-code-reviewer
success_criteria_defaults:
  - "Code meets the stated requirements"
  - "Tests pass (existing and new)"
  - "Code follows project conventions and style"
  - "No regressions introduced"
---

# Code Project Template

## Suggested Flow

1. **Understand** — Define the technical goal and constraints
   - What's the change? (feature, bug fix, refactor, optimization)
   - What's the acceptance criteria?
   - What's the scope? (which files, modules, systems)
   - Any constraints? (deadline, backward compatibility, performance)

2. **Plan** — Design the approach
   - Identify affected files and modules
   - Sketch the implementation approach (pseudocode or outline)
   - List dependencies and potential side effects
   - Decide on a testing strategy

3. **Implement** — Write the code
   - Delegate to the `implement` skill if installed (recommended)
   - Follow the project's coding conventions
   - Write tests alongside or before the code (TDD if appropriate)
   - Commit incrementally with clear messages

4. **Test** — Verify the implementation
   - Run existing test suite — no regressions
   - Run new tests for the change
   - Check edge cases and error handling
   - Verify against acceptance criteria

5. **Review** — Check quality and correctness
   - Delegate to `critical-code-reviewer` if installed
   - Check against success criteria
   - Check for edge cases, error handling, security concerns
   - Verify code follows project style

6. **Finalize** — Clean up and deliver
   - Clean up debug code, TODO comments, unused imports
   - Update documentation if affected
   - Ensure CI passes
   - Create PR if applicable

## Code-Specific Success Criteria

- [ ] Code compiles/runs without errors
- [ ] All tests pass (existing + new)
- [ ] Edge cases are handled
- [ ] Code follows project style guide
- [ ] Documentation is updated if needed
- [ ] No security vulnerabilities introduced

## Tips

- Start by understanding the existing code — don't code in a vacuum
- Write tests first when possible (TDD), especially for bug fixes
- Commit early and often — smaller diffs are easier to review
- If the scope grows during implementation, pause and re-plan rather than hacking
- Use `implement` skill for the actual coding if available
- Use `critical-code-reviewer` skill for thorough review if available