---
applyTo: "**"
---

# Issue-Driven Orchestration (IDO) — Default Human-Team-Collaboration Protocol

Every unit of work — feature, fix, documentation change, refactor, or experiment —
**must originate as a GitHub Issue** before any agent or human begins implementation.
This is the default protocol for all human-team-AI-collaborative work in this
repository.

---

## Why IDO is the Default

| Problem | IDO Solution |
|---------|-------------|
| Ad-hoc prompts lose context between sessions | Issue body + comments = persistent, addressable context |
| Agents start work without shared intent | Issue assigns intent, acceptance criteria, and routing before a single line is written |
| PR review lacks a clear "done" definition | Issue acceptance criteria become the PR checklist |
| Human oversight gaps | Every dispatch is traceable to an issue number |
| Parallel workstreams collide | Labels and milestones serialise and prioritise across agents |

---

## Lifecycle — The IDO Flow

```
GitHub Issue (filed)
      │
      ▼
Label triage ──► `type:*`  `agent:*`  `status:triage`
      │
      ▼
Orchestrator reads issue → selects agent persona(s)
      │
      ├─── AI path ──► Assign to `copilot-swe-agent`
      │                 + customInstructions from issue body
      │
      └─── Human path ► Triage prompt → Orchestrator dispatch block
                         → Implementation → Review → PR
                         
PR opened (closes #ISSUE)
      │
      ▼
Reviewer: adversarial review (CONSENSUS required)
      │
      ▼
Human approval + merge
      │
      ▼
Documenter: update CONTEXT.md
Issue closed automatically via `closes #N`
```

---

## Label Taxonomy

All labels follow `<prefix>:<value>` convention.

### `type:` — What is the work?

| Label | Meaning |
|-------|---------|
| `type:feature` | New capability |
| `type:bug` | Something broken |
| `type:docs` | Documentation only |
| `type:refactor` | Code restructuring with no behaviour change |
| `type:test` | Test coverage work |
| `type:chore` | Dependency updates, tooling, CI |
| `type:research` | Spike / exploration (time-boxed) |

### `agent:` — Which agent persona should lead?

| Label | Agent File |
|-------|-----------|
| `agent:orchestrator` | `orchestrator.agent.md` |
| `agent:implementer` | `implementer.agent.md` |
| `agent:reviewer` | `reviewer.agent.md` |
| `agent:documenter` | `documenter.agent.md` |
| `agent:ralph` | `ralph.agent.md` |
| `agent:copilot` | GitHub Copilot coding agent (`copilot-swe-agent`) |

### `status:` — Where is this in the lifecycle?

| Label | Meaning |
|-------|---------|
| `status:triage` | Just filed; needs routing |
| `status:ready` | Acceptance criteria confirmed; implementation may start |
| `status:in-progress` | Agent or human is working on it |
| `status:blocked` | Waiting on dependency or decision |
| `status:review` | PR open; awaiting review |
| `status:done` | Merged and closed |

### `priority:` — How urgent?

| Label | Meaning |
|-------|---------|
| `priority:critical` | Blocking; must be resolved in current cycle |
| `priority:high` | Next item in queue |
| `priority:normal` | Standard queue position |
| `priority:low` | Nice to have; address when capacity allows |

---

## Routing Rules

Apply these rules **in order** when triaging a new issue:

1. If `agent:copilot` is set → assign to `copilot-swe-agent` via GitHub UI or API
   (see [Assign Copilot to an issue](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/assign-copilot-to-an-issue)).
   Pass the issue acceptance criteria as `customInstructions`.

2. If `agent:implementer` is set (no Copilot label) → use the
   `resolve-issue.prompt.md` prompt to generate an Orchestrator dispatch block.

3. If `agent:documenter` is set → Orchestrator dispatches to Documenter with
   `#<issue>` as the only input context.

4. If `agent:ralph` is set → trigger `ralph-loop.prompt.md` with the issue as
   "Current State".

5. If no `agent:` label is set → Orchestrator assigns one before any work starts.

---

## Assigning Issues to Copilot Coding Agent (API)

### Via GitHub CLI (REST)

```bash
gh api \
  --method POST \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  /repos/OWNER/REPO/issues \
  --input - <<< '{
    "title": "Issue title",
    "body": "Issue description.",
    "assignees": ["copilot-swe-agent[bot]"],
    "agent_assignment": {
      "target_repo": "OWNER/REPO",
      "base_branch": "main",
      "custom_instructions": "",
      "custom_agent": "",
      "model": ""
    }
  }'
```

### Via GraphQL (assign existing issue)

```bash
gh api graphql -f query='mutation {
  addAssigneesToAssignable(input: {
    assignableId: "ISSUE_ID",
    assigneeIds: ["BOT_ID"],
    agentAssignment: {
      targetRepositoryId: "REPOSITORY_ID",
      baseRef: "main",
      customInstructions: "Follow .github/instructions/ and CONTEXT.md",
      customAgent: "",
      model: ""
    }
  }) {
    assignable { ... on Issue { id title } }
  }
}' -H 'GraphQL-Features: issues_copilot_assignment_api_support,coding_agent_model_selection'
```

Get `BOT_ID` first:

```bash
gh api graphql -f query='query {
  repository(owner: "OWNER", name: "REPO") {
    suggestedActors(capabilities: [CAN_BE_ASSIGNED], first: 100) {
      nodes { login ... on Bot { id } }
    }
  }
}'
```

---

## customInstructions Template

When assigning to Copilot coding agent, populate `customInstructions` with:

```
Repository context: see .github/copilot-instructions.md and CONTEXT.md.
Coding standards: see .github/instructions/coding-standards.instructions.md.
Acceptance criteria for this task:
<paste the AC section from the issue>
Branch from: main (or the branch specified in the issue).
Do NOT modify files outside the scope described in the issue.
Open a draft PR when work starts; convert to ready when all AC are green.
```

---

## Human Collaboration Checkpoints

IDO does not remove humans — it structures where human judgment gates progress:

| Checkpoint | Human action |
|-----------|-------------|
| Issue filed | Author writes clear AC; triage assigns labels |
| `status:ready` set | A human (or Orchestrator) confirms scope before work starts |
| PR opened | At least one human reviewer approves before merge |
| RALPH exit | Human confirms all AC met before issue is closed |
| Post-merge | Human may trigger Documenter to update `CONTEXT.md` |

---

## Anti-Patterns to Avoid

- **Starting work without an issue** — creates untracked, untraceable changes.
- **Vague acceptance criteria** — agents will guess; results will diverge from intent.
- **Skipping the Reviewer** — no adversarial check = undetected regressions.
- **Closing issue without CONTEXT.md update** — breaks the inter-agent state bus.
- **Multiple `agent:` labels on a single issue** — use sub-tasks or linked issues instead.
