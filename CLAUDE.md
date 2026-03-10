# CLAUDE.md

This repository routes Claude-style harnesses through [CONTEXT.md](CONTEXT.md).

Read these files before acting:

1. [CONTEXT.md](CONTEXT.md)
2. [.github/instructions/coding-standards.instructions.md](.github/instructions/coding-standards.instructions.md)
3. [.github/copilot-instructions.md](.github/copilot-instructions.md)

Repository conventions:

- `CONTEXT.md` is the shared state bus and architecture source of truth.
- `.agents/skills/` contains shared skill modules intended to work across harnesses.
- `.github/` contains Copilot-oriented workflow files and agent definitions.
- Keep changes minimal and update shared guidance in `CONTEXT.md`, not here.