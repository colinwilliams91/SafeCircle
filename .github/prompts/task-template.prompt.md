---
mode: agent
description: >
  Template for a well-structured task prompt. Copy and fill in the sections below.
  Use this as a starting point for any discrete unit of work handed to an agent.
---

# Task: <Short Task Title>

## Context
<!-- What is the broader goal this task contributes to? Point to CONTEXT.md if relevant. -->

## Objective
<!-- One-sentence statement of what must be true when this task is complete. -->

## Inputs
<!-- Files, APIs, data, or prior agent output that this task depends on. -->
- `CONTEXT.md` — current workspace state
- <!-- add other inputs -->

## Acceptance Criteria
<!-- Checklist of observable outcomes that define "done". -->
- [ ] <!-- criterion 1 -->
- [ ] <!-- criterion 2 -->

## Constraints
<!-- Rules the agent must follow for this specific task. -->
- Follow `.github/instructions/coding-standards.instructions.md`.
- Do not modify files outside the scope described in **Inputs**.
- Do not introduce new dependencies without documenting the reason.

## Output
<!-- What artefacts should the agent produce? -->
- Modified/created files: <!-- list -->
- Handoff message to Orchestrator/Reviewer using the standard format.

## Notes
<!-- Optional: hints, edge cases, known pitfalls. -->
