# ai-ddlc-template

Lightweight, language-agnostic scaffold for an **AI-Driven Development Lifecycle (AI-DDLC)**
using GitHub Copilot in VSCode with multi-agent parallelisation.

---

## Quick Start

1. **Clone or use as template** – click *Use this template* on GitHub.
2. **Open in VSCode** – Copilot will automatically pick up
   `.github/copilot-instructions.md` as workspace instructions.
3. **Read `CONTEXT.md`** – this is the live state document that all agents share.
4. **Copy a prompt** – use `.github/prompts/task-template.prompt.md` to kick off
   any new task.
5. **Drive iteration with RALPH** – use `.github/prompts/ralph-loop.prompt.md`
   when you need structured improvement cycles.

---

## Directory Structure

```
.github/
├── agents/               # AI persona definitions (.agent.md)
│   ├── orchestrator.agent.md   – task decomposition & dispatch
│   ├── implementer.agent.md    – code writing (Claude)
│   ├── reviewer.agent.md       – adversarial review (OpenAI)
│   ├── documenter.agent.md     – keeps CONTEXT.md current
│   └── ralph.agent.md          – RALPH loop driver
├── instructions/         # Coding standards (.instructions.md)
│   └── coding-standards.instructions.md
├── plugins/              # Bundled plugin configs
│   └── context7/         – Context7 MCP docs plugin
├── prompts/              # Reusable task prompts (.prompt.md)
│   ├── task-template.prompt.md
│   └── ralph-loop.prompt.md
├── scripts/              # Utility/maintenance scripts
│   └── sync-context.sh   – reminds Documenter to refresh CONTEXT.md
├── skills/               # Capability modules (add as needed)
└── copilot-instructions.md  – master workspace instructions for Copilot
CONTEXT.md                   # Centralized agent-alignment document
```

---

## Multi-Agent Protocol

```
User → Orchestrator → Implementer (Claude)
                    ↘ Reviewer (OpenAI) ←→ RALPH loop
                    → Documenter → CONTEXT.md
```

- **Claude** writes and refactors code.
- **OpenAI** performs adversarial review until consensus.
- **RALPH** (Reflect → Assess → Learn → Plan → Hypothesize) drives each iteration.
- **Documenter** keeps `CONTEXT.md` current so all agents stay aligned.

---

## Secrets & Safety

All AI-sensitive patterns are git-ignored (see `.gitignore`):

- `*.secret.md`, `*.private.md` – private prompt/instruction variants
- `.context7/`, `ai-cache/` – Context7 and general AI caches
- `mcp.local.json` – machine-local MCP config (may contain API keys)
- `**/output/` – raw LLM output scratch files

---

## Adapting to a New Project

1. Update the **Project Overview** section of `CONTEXT.md`.
2. Add project-specific instructions to `.github/instructions/`.
3. Add task prompts to `.github/prompts/`.
4. Drop `.github/skills/` modules as needed.
5. Everything else stays the same — the scaffold is stack-agnostic.
