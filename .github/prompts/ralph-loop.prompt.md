---
mode: agent
description: >
  Drives a single RALPH loop iteration. Paste the current state of the work below
  and the agent will produce a structured Reflect → Assess → Learn → Plan →
  Hypothesize output that the Orchestrator can act on.
---

# RALPH Loop — Iteration Prompt

## Current State
<!-- Paste a summary of what has been done so far, or reference CONTEXT.md. -->

## Previous Iteration Outcome
<!-- What was the hypothesis last time, and was it confirmed or refuted? -->
- Hypothesis: <!-- -->
- Outcome: <!-- CONFIRMED | REFUTED | PARTIAL -->
- Evidence: <!-- test results, reviewer verdict, user feedback -->

## Instructions for RALPH Agent

Using the information above, produce the RALPH loop output:

1. **REFLECT** – Summarise the current code/doc state in 3–5 bullet points.
2. **ASSESS** – List every gap, bug, or risk you can identify.
3. **LEARN** – What do previous iterations (if any) tell us? Patterns to avoid or reuse?
4. **PLAN** – Identify the single most impactful next action and assign it to an agent.
5. **HYPOTHESIZE** – State a measurable/observable success criterion for the next iteration.

Output using the template from `.github/agents/ralph.agent.md`.

## Exit Check
Answer YES or NO to each:
- [ ] Reviewer issued `CONSENSUS`?
- [ ] All Assess items resolved?
- [ ] Hypothesized outcome confirmed?

If all YES → loop is complete. Notify Orchestrator to merge and update `CONTEXT.md`.
