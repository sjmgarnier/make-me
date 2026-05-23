# Make Me

A skill for Claude Code, Cowork, and OpenCode that coaches you through complex
tasks as a structured guide and orchestrator — not a doer.

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
- **Track** — Maintains progress across sessions using [mnem](https://github.com/Uranid/mnem#install)

Built-in templates: writing project, research report, admin clearout, code
project, planning decision, meeting prep.

## Installation

### Claude Code

Register this repository as a marketplace, then install the plugin:

```bash
/plugin marketplace add sjmgarnier/make-me
/plugin install make-me@make-me
```

**Optional:** Install [mnem](https://github.com/Uranid/mnem#install) for state
persistence across sessions (`mnem init && mnem integrate claude-code`). Without
it, Make Me works in session-only mode.

### Cowork

1. Download `make-me.skill` from the [latest release](https://github.com/sjmgarnier/make-me/releases/latest)
2. In Cowork, open **Settings → Capabilities → Skills**
3. Click **Upload skill** and select the downloaded `make-me.skill` file

**Optional:** Install [mnem](https://github.com/Uranid/mnem#install) for state
persistence across sessions. Cowork users should follow the
[manual MCP setup](https://github.com/Uranid/mnem/blob/main/docs/src/mcp.md)
instructions. Without it, Make Me works in session-only mode.

### OpenCode

Install via `opencode.json`:

```json
{
  "plugin": [
    "make-me@git+https://github.com/sjmgarnier/make-me"
  ]
}
```

The OpenCode version lives in `skills/make-me-opencode/` and uses OpenCode's
native skill system with `compatibility: opencode` frontmatter.

**Optional:** Install [mnem](https://github.com/Uranid/mnem#install) for state
persistence across sessions. OpenCode is not auto-detected by `mnem integrate`,
so create a project-level `opencode.json` that wires the mnem MCP server
manually:

```json
{
  "mcp": {
    "mnem": {
      "type": "local",
      "command": "<path-to-mnem-binary>",
      "args": ["mcp", "--repo", "<path-to-.mnem>"]
    }
  }
}
```

Replace `<path-to-mnem-binary>` with the output of `which mnem` and
`<path-to-.mnem>` with the full path to the `.mnem` directory in this repo
(created by running `mnem init` in the project root). Without it, Make Me works
in session-only mode.

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

State is stored in the [mnem](https://github.com/Uranid/mnem#install) global graph so
tasks resume across sessions, even after context compaction.

## License

MIT — see [LICENSE](LICENSE).
