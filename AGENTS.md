# AGENTS.md

This file provides guidance to OpenCode when working in this repository.

## What This Repository Is

A skill marketplace containing the **Make Me** skill — a structured coaching
assistant that guides users through complex tasks via brainstorming, planning,
research, execution, and review phases.

There is no application code to build. The primary artifacts are Markdown files
consumed directly by Claude's or OpenCode's skill system.

## Directory Structure

```
make-me/
  AGENTS.md          # OpenCode project guidance (this file)
  CLAUDE.md          # Claude Code project guidance
  package.json       # Enables git URL installation in opencode.json
  skills/
    make-me-claude/  # Claude Code version of the Make Me skill
    make-me-opencode/# OpenCode version of the Make Me skill
  docs/              # Local-only planning/spec documents (gitignored)
```

## Skill Directories

| Directory | Target harness | Frontmatter compatibility |
|-----------|---------------|--------------------------|
| `skills/make-me-claude/` | Claude Code | `compatibility: claude-code` |
| `skills/make-me-opencode/` | OpenCode | `compatibility: opencode` |

## SKILL.md Format

Every skill requires YAML frontmatter:

```yaml
---
name: your-skill-name
compatibility: opencode
description: >
  Clear description of what this skill does and when to trigger it.
  Keep under 100 tokens.
---
```

The body is instructions written **for the agent** — imperative, step-by-step.

Recognized OpenCode frontmatter fields: `name`, `description`, `license`,
`compatibility`, `metadata`. Unknown fields are silently ignored.

## Sub-skill Activation (OpenCode)

Sub-skills in `skills/make-me-opencode/sub-skills/` are activated by reading
the file directly with the Read tool. When OpenCode loads a skill via the
`skill` tool, it injects:

```
Base directory for this skill: <absolute-path>
```

Use this injected value to construct sub-skill paths:

```
Read: <base-dir>/sub-skills/mm-orchestrator.md
```

## Notes

- `docs/` is local-only (`.gitignore`d) — internal planning documents, not
  part of the published skill.
- `package.json` at repo root enables installation via
  `"plugin": ["make-me@git+https://github.com/sjmgarnier/make-me"]` in
  `opencode.json`.
