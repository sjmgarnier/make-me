# CLAUDE.md

This file provides guidance to Claude Code when working in this repository.

## What This Repository Is

A Claude Code skill marketplace containing the **Make Me** skill — a structured
coaching assistant that guides users through complex tasks via brainstorming,
planning, research, execution, and review phases.

There is no application code to build. The primary artifacts are Markdown files
consumed directly by Claude's skill system.

## Directory Structure

```
make-me/
  SKILL.md           # Main skill definition with YAML frontmatter
  sub-skills/        # Internal sub-skill files (activated by reading, not via Skill tool)
  templates/         # Workflow templates (writing, research, code, etc.)
  references/        # Supplementary docs loaded on demand
marketplace.json     # Marketplace manifest
```

## SKILL.md Format

Every skill requires YAML frontmatter:

```yaml
---
name: your-skill-name
description: >
  Clear description of what this skill does and when to trigger it.
  Keep under 100 tokens.
---
```

The body is instructions written **for Claude** — imperative, step-by-step.

## Key Conventions

- Sub-skills in `make-me/sub-skills/` are activated by reading the file directly
  with the Read tool, not via the Skill tool. They are implementation details of
  the main skill.
- Templates in `make-me/templates/` define phase sequences and success criteria
  for common task types.
- The `docs/` directory is local-only (`.gitignore`d) — it contains internal
  planning documents and is not part of the published skill.
