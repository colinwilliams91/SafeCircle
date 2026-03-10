# AI-DDLC Template Specification

Status: Draft v1 (language- and framework-agnostic)

Purpose: Define a reusable, skeletal workspace that orchestrates multiple AI agents to
deliver software through a structured, iterative development lifecycle.

---

## 1. Problem Statement

Manual AI-assisted development is unstructured: prompts are ad-hoc, agents operate in
isolation, there is no shared state between sessions, and quality gates are informal.

This template solves four problems:

- **Fragmentation** — Agents have no shared context, so each session starts blind.
  `CONTEXT.md` provides a persistent, file-based state bus that every agent reads and
  writes.
- **Inconsistency** — Without explicit roles, different agents make conflicting
  decisions. A typed roster (Orchestrator, Implementer, Reviewer, Documenter, RALPH)
  enforces separation of concerns.
- **Quality drift** — Iterating without a feedback loop produces stagnant or
  regressing output. The RALPH loop (Reflect → Assess → Learn → Plan → Hypothesize)
  drives convergence.
- **Portability** — Most AI templates are tightly coupled to a stack or framework.
  This scaffold is intentionally agnostic and ships with no language-specific
  assumptions.

---

## 2. Goals and Non-Goals

### 2.1 Goals

- Define a minimal, cloneable directory structure that works with GitHub Copilot in
  VSCode out of the box.
- Provide typed agent personas with explicit responsibilities and handoff contracts.
- Specify an iterative loop (RALPH) that drives implementation toward a measurable
  quality bar.
- Establish `CONTEXT.md` as the single source of truth for workspace state across all
  agents and sessions.
- Support adversarial review between heterogeneous LLMs (Claude implements,
  OpenAI reviews).
- Be trivially adaptable to any language, framework, or project.

### 2.2 Non-Goals

- Prescribing a specific CI/CD platform, runtime, or deployment target.
- Implementing a live orchestration server or persistent agent runtime.
- Mandating a specific LLM provider; agent files express preferences, not hard
  requirements.
- Providing production-ready code templates for any particular stack.
- Defining approval or sandbox policies for coding agents (left to each project).

---

## 3. System Overview

### 3.1 Main Components

1. **`CONTEXT.md`** — Workspace state document.
   - Single source of truth for all agents.
   - Contains: project overview, architecture decisions, active work, conventions,
     agent roster, open questions, changelog.
   - Owned by the Documenter; read by every other agent at session start.

2. **Agent Definitions** (`.github/agents/*.agent.md`)
   - Structured Markdown files that define an agent's identity, responsibilities,
     tools, and output contracts.
   - Loaded by GitHub Copilot as persona contexts.

3. **Prompts** (`.github/prompts/*.prompt.md`)
   - Reusable, parameterised task descriptions that an operator pastes into Copilot
     Chat to invoke a specific workflow.
   - Decoupled from agent definitions so either can evolve independently.

4. **Coding Standards** (`.github/instructions/*.instructions.md`)
   - Workspace-scoped rules applied automatically by Copilot to every chat session.
   - Cover naming, testing, secrets, dependency management, and commit style.

5. **RALPH Loop**
   - An iterative improvement protocol executed as a cycle of agent invocations.
   - Terminates when Reviewer issues `CONSENSUS` and all Assess items are resolved.

6. **Plugin Configurations** (`.github/plugins/`)
   - Optional extensions bundled with their usage documentation.
   - Example: Context7 MCP for live library documentation injection.

7. **Utility Scripts** (`.github/scripts/`)
   - Shell helpers that automate maintenance operations (e.g., prompting the
     Documenter to refresh `CONTEXT.md`).

8. **Skills** (`.agents/skills/`)
  - Shared capability modules installed for multi-harness use.
  - The base template may vendor reusable skills here and track them via `skills-lock.json`.

### 3.2 Abstraction Layers

The workspace is cleanest to fork when kept in these layers:

1. **Policy Layer** (`CONTEXT.md` + instructions)
   - Project conventions, active decisions, team agreements.

2. **Agent Layer** (`agents/*.agent.md`)
   - Role definitions and inter-agent contracts.

3. **Workflow Layer** (`prompts/*.prompt.md`)
   - Invocation templates for recurring task types.

4. **Integration Layer** (`plugins/`, `scripts/`)
   - External tools and automation helpers.

5. **Execution Layer** (LLM sessions in Copilot Chat)
   - The actual agent runs; outputs feed back into `CONTEXT.md`.

---

## 4. Core Domain Model

### 4.1 Entities

#### 4.1.1 Agent

A named persona with a defined role, preferred LLM, tool access, and output contract.

Fields:

- `name` (string) — Human-readable identifier, e.g. `Orchestrator`.
- `description` (string) — One-sentence summary of the agent's role.
- `tools` (list of strings) — Copilot tool IDs the agent is permitted to use.
- `preferred_llm` (string or null) — e.g. `Claude`, `OpenAI`, or `Any`.
- `responsibilities` (list) — Ordered list of duties.
- `output_contract` (object) — Structured handoff format the agent must produce.

#### 4.1.2 Task

A discrete unit of work dispatched by the Orchestrator to a single agent.

Fields:

- `title` (string) — One-line description.
- `agent` (string) — Name of the assigned agent.
- `inputs` (list) — Files, context, or prior outputs required.
- `acceptance_criteria` (list) — Observable conditions that define "done".
- `dependencies` (list or `NONE`) — Tasks that must complete first.
- `status` (enum) — `pending`, `in_progress`, `review`, `done`.

#### 4.1.3 RALPH Iteration

One execution of the five-phase improvement loop.

Fields:

- `iteration_number` (integer) — 1-based counter within a task.
- `reflect` (string) — Current state summary.
- `assess` (list) — Gaps, bugs, or risks identified.
- `learn` (list) — Lessons carried forward from prior iterations.
- `plan` (object) — `{action: string, assigned_to: string}`.
- `hypothesize` (string) — Measurable success criterion.
- `exit_conditions_met` (boolean) — True when loop may terminate.

#### 4.1.4 Review Verdict

The output of a Reviewer agent run.

Fields:

- `verdict` (enum) — `APPROVED`, `CHANGES REQUESTED`, `CONSENSUS`.
- `blockers` (list) — Items with `{description, file, line}` that must be fixed.
- `suggestions` (list) — Optional improvements that do not block merge.
- `rationale` (string) — Brief justification for the verdict.

#### 4.1.5 Architecture Decision

A documented design choice recorded in `CONTEXT.md`.

Fields:

- `id` (string) — e.g. `AD-001`.
- `decision` (string) — What was decided.
- `rationale` (string) — Why this choice was made.
- `status` (enum) — `proposed`, `accepted`, `superseded`.

### 4.2 Identifiers and Normalisation Rules

- **Agent names** — `PascalCase`; match the `name` field in the agent file.
- **Task identifiers** — Kebab-case slugs derived from the title, e.g.
  `add-auth-middleware`.
- **Architecture decision IDs** — `AD-NNN` (zero-padded to three digits).
- **Open question IDs** — `OQ-NNN`.
- **Changelog entries** — ISO-8601 date (`YYYY-MM-DD`).

---

## 5. Agent Specifications

### 5.1 Orchestrator

**File:** `.github/agents/orchestrator.agent.md`
**Preferred LLM:** Any
**Role:** Decomposes high-level requests, dispatches sub-tasks, and owns the merge gate.

**Dispatch contract (output per task):**

```
TASK: <one-line description>
AGENT: <agent name>
INPUT: <files / context required>
EXPECTED OUTPUT: <observable success criterion>
DEPENDENCY: <task slug | NONE>
```

**Merge gate:** Never merge an implementation unless Reviewer has issued `CONSENSUS`.
Escalate to the human operator if consensus is not reached after two RALPH iterations.

### 5.2 Implementer

**File:** `.github/agents/implementer.agent.md`
**Preferred LLM:** Claude
**Role:** Writes, refactors, and debugs code.

**Handoff contract (output when done):**

```
IMPLEMENTATION SUMMARY
Task: <slug>
Files changed: <list>
Tests added/updated: <list>
Known limitations: <any caveats>
Ready for review: YES
```

**Constraints:**

- Follow `.github/instructions/coding-standards.instructions.md`.
- Implement the smallest change that satisfies the task specification.
- Never commit secrets or environment-specific values.

### 5.3 Reviewer

**File:** `.github/agents/reviewer.agent.md`
**Preferred LLM:** OpenAI
**Role:** Adversarial review; critiques implementation until `CONSENSUS`.

**Review checklist (all items must be addressed before `APPROVED`):**

- Correctness — does the code match the spec?
- Security — injection vectors, leaked secrets, unsafe input?
- Performance — avoidable allocations, blocking calls, algorithmic complexity?
- Readability — would a new contributor understand this in 60 seconds?
- Tests — edge cases covered? tests meaningful?
- Dependencies — justified and vulnerability-checked?
- CONTEXT.md alignment — consistent with documented decisions?

**Verdict contract:**

```
REVIEW VERDICT: <APPROVED | CHANGES REQUESTED>
BLOCKERS:
- <issue> (file:line)
SUGGESTIONS:
- <suggestion>
RATIONALE: <brief explanation>
```

### 5.4 Documenter

**File:** `.github/agents/documenter.agent.md`
**Preferred LLM:** Any
**Role:** Keeps `CONTEXT.md` accurate after every significant change.

**Update trigger:** Run after any implementation is merged, any architectural decision
is made, or any RALPH loop iteration completes.

**Operating procedure:**
1. Scan the workspace with `@codebase` / `#codebase`.
2. Diff the current `CONTEXT.md` against the actual workspace state.
3. Update only changed sections; preserve structure.
4. Commit message format: `docs(context): <what changed and why>`.

### 5.5 RALPH

**File:** `.github/agents/ralph.agent.md`
**Preferred LLM:** Any
**Role:** Loop driver — does not write code or reviews directly; facilitates iteration.

See Section 6 for the complete RALPH loop specification.

---

## 6. RALPH Loop Specification

### 6.1 Overview

RALPH (Reflect → Assess → Learn → Plan → Hypothesize) is the iterative quality loop
that governs how implementation and review cycles converge on a done state.

```
┌─────────────────────────────────────────────────────────────────┐
│  ① REFLECT    What is the current state?                        │
│       ↓                                                         │
│  ② ASSESS     What gaps, bugs, or risks remain?                │
│       ↓                                                         │
│  ③ LEARN      What do past iterations teach us?                │
│       ↓                                                         │
│  ④ PLAN       What is the minimal next action?                 │
│       ↓                                                         │
│  ⑤ HYPOTHESIZE  What does success look like?                   │
│       ↓                                                         │
│  EXECUTE (Implementer) → REVIEW (Reviewer) ──────────────────┐ │
│  ↑                                                            │ │
│  └── loop until EXIT CONDITIONS MET ──────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Phase Definitions

| Phase | Governing Question | Produced By |
|-------|--------------------|-------------|
| Reflect | What was done and what is the current code/doc state? | RALPH |
| Assess | What is still broken, missing, or risky? | RALPH |
| Learn | What patterns from prior iterations apply here? | RALPH |
| Plan | What is the single most impactful next action? | RALPH |
| Hypothesize | What observable outcome proves success? | RALPH |
| Execute | Implement the plan. | Implementer |
| Review | Validate the implementation. | Reviewer |

### 6.3 Iteration Output Contract

```
RALPH LOOP — Iteration <N>

REFLECT:
  <3–5 bullet summary of current state>

ASSESS:
  - <gap / bug / risk>

LEARN:
  - <lesson from prior iteration, or "First iteration — no prior data.">

PLAN:
  Next action: <one sentence>
  Assigned to: <Implementer | Reviewer | Documenter>

HYPOTHESIZE:
  Success looks like: <measurable / observable criterion>
```

### 6.4 Exit Conditions

The loop terminates when **all three** conditions are true:

1. Reviewer has issued `CONSENSUS`.
2. Every item in the Assess phase is resolved.
3. The Hypothesize criterion is confirmed by tests or observable behaviour.

If consensus is not reached after **two iterations**, the RALPH agent escalates to the
human operator.

### 6.5 Invocation

Use `.github/prompts/ralph-loop.prompt.md` to invoke a RALPH iteration from Copilot
Chat. Paste the current task state into the prompt, then run it.

---

## 7. Inter-Agent Communication Protocol

### 7.1 `CONTEXT.md` as State Bus

All agents communicate exclusively through `CONTEXT.md` and the workspace file tree.
There is no live message-passing or shared memory between agents.

Protocol:

1. Every agent **reads** `CONTEXT.md` before acting.
2. Every agent **writes** to `CONTEXT.md` only through the Documenter (or on explicit
   Orchestrator instruction).
3. Agents use the **handoff contracts** defined in Section 5 to signal completion and
   pass structured output to the next agent.

### 7.2 Session Handoff Pattern

When one agent completes and the next must begin:

```
[Current Agent] → emits handoff contract output
[Operator]      → pastes output + next agent's prompt into Copilot Chat
[Next Agent]    → reads CONTEXT.md + handoff output, begins work
```

There is no automated message relay; the human operator is the routing layer between
Copilot Chat sessions.

### 7.3 Conflict Resolution

If Implementer and Reviewer disagree after two RALPH iterations:

1. RALPH agent documents both positions in `CONTEXT.md` → Open Questions.
2. Operator makes the deciding call.
3. Documenter updates `CONTEXT.md` with the resolution as an Architecture Decision.

---

## 8. Workspace Contract (`CONTEXT.md`)

### 8.1 Required Sections

Every `CONTEXT.md` must contain the following sections:

| Section | Purpose |
|---------|---------|
| Project Overview | Name, purpose, tech stack, target environment |
| Architecture Decisions | Key design choices with ID, decision, and rationale |
| Active Work | In-progress tasks, assigned agents, and current status |
| Conventions | Naming, structure, and coding standards in force |
| Agent Roster | Active agents, preferred LLMs, and current roles |
| Open Questions | Unresolved decisions requiring human input |
| Changelog | Timestamped log of significant changes |

### 8.2 Update Frequency

`CONTEXT.md` must be refreshed:

- After every merged implementation.
- After every architectural decision.
- After every completed RALPH loop.
- At the start of any new multi-session task.

### 8.3 Staleness Detection

Use `.github/scripts/sync-context.sh` to check when `CONTEXT.md` was last committed
and emit a Copilot Chat prompt to trigger a Documenter refresh.

---

## 9. Configuration and Extension

### 9.1 Adapting to a New Project

To use this template in a new project:

1. Update `CONTEXT.md` → Project Overview with the project name, stack, and goals.
2. Add project-specific conventions to `.github/instructions/`.
3. Add task-specific prompts to `.github/prompts/`.
4. Drop shared capability modules into `.agents/skills/` as needed.
5. Configure external plugins in `.github/plugins/`.
6. Everything else (agents, RALPH loop, inter-agent protocol) remains unchanged.

**Example** — adapting for a Python/FastAPI project:

```markdown
<!-- In CONTEXT.md → Project Overview -->
| Tech Stack | Python 3.12, FastAPI, SQLAlchemy, pytest |
| Target Env | Docker container on Railway |
```

```markdown
<!-- In .github/instructions/python-conventions.instructions.md -->
- Use `snake_case` for all variables and functions.
- Type-annotate every public function signature.
- Use `pytest` with `pytest-asyncio` for async test cases.
```

### 9.2 Adding a New Agent

1. Create `.github/agents/<name>.agent.md` following the schema in Section 4.1.1.
2. Add the agent to the Agent Roster in `CONTEXT.md`.
3. Update `.github/copilot-instructions.md` if the new agent changes the dispatch
   protocol.
4. Document the agent's handoff contract in this SPEC under Section 5.

### 9.3 Adding a Plugin

1. Create `.github/plugins/<plugin-name>/README.md` documenting:
   - What the plugin provides.
   - Configuration (reference environment variables; never hard-code keys).
   - Usage pattern inside prompts.
   - Any caching or performance notes.
2. Add the plugin to the relevant agent's `tools` list if applicable.
3. Add any new git-ignored paths to `.gitignore`.

### 9.4 Extension Points Summary

| Extension Point | How to Extend |
|-----------------|--------------|
| Agent roster | Add `*.agent.md` files to `.github/agents/` |
| Coding standards | Add `*.instructions.md` files to `.github/instructions/` |
| Task workflows | Add `*.prompt.md` files to `.github/prompts/` |
| Capabilities | Add modules to `.agents/skills/` |
| Integrations | Add subdirectories to `.github/plugins/` |
| Automation | Add scripts to `.github/scripts/` |

---

## 10. Conventions

### 10.1 File Naming

| Artifact | Pattern | Example |
|----------|---------|---------|
| Agent definition | `<name>.agent.md` | `orchestrator.agent.md` |
| Prompt template | `<name>.prompt.md` | `task-template.prompt.md` |
| Instruction file | `<name>.instructions.md` | `coding-standards.instructions.md` |
| Utility script | `<name>.sh` (Unix) or `<name>.ps1` (Windows) | `sync-context.sh` |
| Plugin README | `README.md` inside plugin subdirectory | `plugins/context7/README.md` |

### 10.2 Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>

[optional body]
[optional footer]
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`, `ci`.

Examples:

```
feat(agents): add data-analyst agent for reporting tasks
docs(context): update active work after auth middleware merged
chore(scripts): add db-seed utility script
```

### 10.3 Secrets

- Never commit secrets, API keys, tokens, or passwords to any file.
- Reference sensitive values via environment variables.
- Use `.env` (git-ignored) or an external secrets manager for local development.
- Machine-local config overrides must use the `*.local.*` naming pattern (git-ignored).

### 10.4 Dependency Management

- Prefer the standard library for all scaffolding utilities.
- Add third-party dependencies only when the benefit clearly justifies the addition.
- Pin exact versions in lock files.
- Check all new dependencies against the GitHub Advisory Database before adoption.

---

## 11. Glossary

| Term | Definition |
|------|-----------|
| **AI-DDLC** | AI-Driven Development Lifecycle — a structured approach to software development where AI agents handle implementation, review, and documentation. |
| **Agent** | A named AI persona with defined responsibilities, tool access, and an output contract. |
| **Harness** | The tool or platform used to orchestrate agent sessions (GitHub Copilot in VSCode for this template). |
| **RALPH Loop** | Iterative quality protocol: Reflect → Assess → Learn → Plan → Hypothesize. |
| **CONTEXT.md** | The persistent, file-based state bus shared by all agents. |
| **Handoff Contract** | The structured output format an agent must produce to signal completion and pass work to the next agent. |
| **Consensus** | A `CONSENSUS` verdict from the Reviewer indicating both Implementer and Reviewer agree the work meets the acceptance criteria. |
| **MCP** | Model Context Protocol — a standard for injecting external context (e.g. library docs via Context7) into LLM prompts. |
| **Context7** | An MCP server that provides up-to-date, version-specific library documentation to agent prompts. |
