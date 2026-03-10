# CONTEXT.md — Workspace State

> **Owner:** Documenter Agent (`/.github/agents/documenter.agent.md`)
> **Protocol:** This file is the single source of truth for all agents. Read it at
> the start of every session. Request an update after any meaningful change.

---

## Project Overview

| Field | Value |
|-------|-------|
| **Repository** | `ai-ddlc-template` |
| **Purpose** | Personal AI-Driven Development Lifecycle template |
| **Primary harness** | GitHub Copilot in VSCode |
| **Implementation LLM** | Claude |
| **Review LLM** | OpenAI (adversarial) |
| **Doc context tool** | Context7 MCP |
| **Iteration model** | RALPH loop |
| **Portable skill path** | `.agents/skills/` |

### Goals
- Provide a lightweight, language-agnostic scaffold for AI-driven development.
- Facilitate multi-agent parallelisation with a clear inter-agent protocol.
- Be easily cloned and adapted to any project stack.

---

## Architecture Decisions

| ID | Decision | Rationale |
|----|----------|-----------|
| AD-001 | Copilot workspace files live under `.github/` | GitHub Copilot discovers workspace instructions there; keeps root clean |
| AD-002 | Claude implements, OpenAI reviews | Leverage model diversity for adversarial quality checks |
| AD-003 | RALPH loop drives iteration | Structured reflection prevents aimless cycling |
| AD-004 | `CONTEXT.md` is the inter-agent bus | Stateless agents need a shared, file-based state store |
| AD-005 | Context7 MCP for library docs | Avoids hallucinated APIs; future caching will reduce token cost |
| AD-006 | Secrets never committed | `.gitignore` blocks `.env`, `*.secret.md`, `mcp.local.json`, etc. |
| AD-007 | Issue-Driven Orchestration is the default human-team workflow | Every work unit begins as a GitHub Issue; enforced via `issue-driven-orchestration.instructions.md`, `issue-intake.agent.md`, `resolve-issue.prompt.md`, `labels.yml`, and the enhanced PR template |
| AD-008 | Shared skills live under `.agents/skills/` | Matches the multi-harness installer layout and keeps reusable skills portable across Copilot, Claude, Codex, Cursor, and similar tools |
| AD-009 | Root adapter files point back to `CONTEXT.md` | Gives non-Copilot harnesses a stable entrypoint without duplicating project guidance |

---

## Active Work

_No tasks currently in flight. Update this section when work begins._

| Task | Agent | Status | Branch |
|------|-------|--------|--------|
| — | — | — | — |

---

## Conventions

- **File naming:** `kebab-case` for all files.
- **Agent files:** `<name>.agent.md` in `.github/agents/`.
- **Prompt files:** `<name>.prompt.md` in `.github/prompts/`.
- **Instruction files:** `<name>.instructions.md` in `.github/instructions/`.
- **Shared skills:** capability modules live in `.agents/skills/`.
- **Harness adapters:** root `AGENTS.md`, `CLAUDE.md`, and `.cursorrules` defer to `CONTEXT.md`.
- **Commits:** Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, …).
- **Secrets:** Always via environment variables; never hard-coded.
- **IDO default:** All work starts as a GitHub Issue. See `.github/instructions/issue-driven-orchestration.instructions.md`.
- **Label taxonomy:** `type:*`, `agent:*`, `status:*`, `priority:*`. Definitions in `.github/labels.yml`.
- See `.github/instructions/coding-standards.instructions.md` for full rules.

---

## Agent Roster

| Agent | File | LLM Preference | Status |
|-------|------|----------------|--------|
| Issue Intake | `.github/agents/issue-intake.agent.md` | Any | Active |
| Orchestrator | `.github/agents/orchestrator.agent.md` | Any | Active |
| Implementer | `.github/agents/implementer.agent.md` | Claude | Active |
| Reviewer | `.github/agents/reviewer.agent.md` | OpenAI | Active |
| Documenter | `.github/agents/documenter.agent.md` | Any | Active |
| RALPH | `.github/agents/ralph.agent.md` | Any | Active |

---

## Open Questions

| ID | Question | Owner | Deadline |
|----|----------|-------|---------|
| OQ-001 | Context7 caching strategy — local file vs. Redis vs. SQLite? | Human | TBD |
| OQ-002 | Should a custom harness live inside this repo or as a separate package? | Human | TBD |
| OQ-003 | Which CLI agent orchestrator (if any) to add later? | Human | TBD |

---

## Changelog

| Date | Change | Agent |
|------|--------|-------|
| 2026-02-21 | Initial scaffold created | Copilot |
| 2026-03-09 | Documented `.agents/skills/` as the canonical shared skills path and added root harness adapters | Copilot |
| 2026-03-09 | Added a root Cursor adapter that routes to `CONTEXT.md` | Copilot |

---

_Last updated by: Copilot — agents should keep this current._
