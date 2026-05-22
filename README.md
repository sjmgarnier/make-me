# Make Me

A Claude Code skill that coaches you through complex tasks as a structured
guide and orchestrator — not a doer.

Tell it what you want to accomplish. Make Me clarifies your goal, breaks it
into steps, finds what you need, delegates to specialized skills, and validates
the result against your success criteria. After significant actions it suggests
1–3 next steps; you pick. This is **coach mode** — you drive, it guides.

## What It Does

- **Understand** — Clarifies goal, scope, constraints, and success criteria
- **Plan** — Breaks the task into steps; picks a workflow template if relevant
- **Research** — Finds information (web, files, memory) when the plan needs it
- **Execute** — Does the work; delegates to specialized skills when available
- **Review** — Validates results against your success criteria before marking done
- **Track** — Maintains progress across sessions using [mnem](https://github.com/mnem-ai/mnem)

Built-in templates: writing project, research report, admin clearout, code
project, planning decision, meeting prep.

## Requirements

- [Claude Code](https://claude.ai/code) or Claude Desktop
- [mnem](https://github.com/mnem-ai/mnem) for state persistence across sessions
  (`mnem init && mnem integrate` — without it, Make Me works in session-only mode)

## Installation

Register this repository as a Claude Code marketplace, then install the plugin:

```bash
/plugin marketplace add sjmgarnier/make-me
/plugin install make-me@make-me
```

## Usage

Make Me activates automatically when you say things like:

- `help me with [task]`
- `make me [deliverable]`
- `I want to [goal]`

Or invoke it directly:

```
Use the make-me skill to help me write a blog post about X.
```

## How It Works

Make Me runs a loop: **Understand → Plan → Research → Execute → Review**, with
a **Track** sub-skill running throughout. The loop is not strictly linear — the
orchestrator can skip phases, loop back, or reorder based on the task.

State is stored in the [mnem](https://github.com/mnem-ai/mnem) global graph so
tasks resume across sessions, even after context compaction.

## License

MIT — see [LICENSE](LICENSE).
