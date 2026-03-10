# AGENTS.md

This repository uses [CONTEXT.md](CONTEXT.md) as the single source of truth.

If your harness reads `AGENTS.md`, start here and then read these files in order:

1. [CONTEXT.md](CONTEXT.md)
2. [.github/copilot-instructions.md](.github/copilot-instructions.md)
3. [.github/instructions/coding-standards.instructions.md](.github/instructions/coding-standards.instructions.md)

Working rules:

- Treat `CONTEXT.md` as the authoritative project state and architecture record.
- Prefer `.github/` for Copilot-specific agents, prompts, and instructions.
- Use `.agents/skills/` for shared, portable skill modules.
- Do not duplicate guidance into this file; update `CONTEXT.md` instead.