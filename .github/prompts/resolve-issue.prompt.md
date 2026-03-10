---
mode: agent
description: >
  Turns a GitHub Issue into a complete Orchestrator dispatch block, optionally
  assigning it to the Copilot coding agent. Use this as the standard entry point
  for any IDO-sourced work item.
---

# Resolve Issue — IDO Entry-Point Prompt

## Instructions

Replace every `<!-- … -->` placeholder with values from the target issue, then paste
this into GitHub Copilot Chat (agent mode) or hand it to the Orchestrator agent.

---

## Step 1 — Fetch the issue

```bash
# Fetch full issue metadata (replace OWNER, REPO, ISSUE_NUMBER)
gh issue view ISSUE_NUMBER --repo OWNER/REPO --json \
  number,title,body,labels,assignees,milestone,comments
```

Store the output; you will reference it throughout this prompt.

---

## Step 2 — Triage checklist

Before dispatching, confirm all of the following:

- [ ] Issue has a `type:*` label
- [ ] Issue has an `agent:*` label
- [ ] Issue has at least one acceptance criterion (AC)
- [ ] Issue is marked `status:ready` (not `status:triage`)
- [ ] No blocking `status:blocked` label is present

If any box is unchecked, apply the missing label(s) and add a triage comment before
proceeding.

---

## Step 3a — AI path (Copilot coding agent)

Use this path when the issue carries the `agent:copilot` label.

```bash
# 1. Look up Copilot bot ID
gh api graphql -f query='query {
  repository(owner: "OWNER", name: "REPO") {
    suggestedActors(capabilities: [CAN_BE_ASSIGNED], first: 100) {
      nodes { login ... on Bot { id } }
    }
  }
}'

# 2. Assign Copilot to the issue with custom instructions
gh api graphql -f query='mutation {
  addAssigneesToAssignable(input: {
    assignableId: "ISSUE_GRAPHQL_ID",
    assigneeIds: ["BOT_ID"],
    agentAssignment: {
      targetRepositoryId: "REPO_GRAPHQL_ID",
      baseRef: "main",
      customInstructions: "CUSTOM_INSTRUCTIONS_BELOW",
      customAgent: "",
      model: ""
    }
  }) {
    assignable { ... on Issue { id title } }
  }
}' -H 'GraphQL-Features: issues_copilot_assignment_api_support,coding_agent_model_selection'
```

**`customInstructions` value** — paste as a single-line string:

```
Repository context: .github/copilot-instructions.md and CONTEXT.md.
Coding standards: .github/instructions/coding-standards.instructions.md.
Issue-Driven Orchestration rules: .github/instructions/issue-driven-orchestration.instructions.md.
Acceptance criteria: <paste AC block from issue>.
Do NOT modify files outside the issue scope.
Open a draft PR immediately; convert to ready when all AC pass.
Commit style: Conventional Commits (feat|fix|docs|refactor|test|chore).
Link the PR to this issue with "Closes #ISSUE_NUMBER".
```

---

## Step 3b — Human-team path (Orchestrator dispatch)

Use this path when `agent:orchestrator`, `agent:implementer`, or `agent:documenter`
is set (no `agent:copilot` label).

Fill in the Orchestrator dispatch block below and paste it into the Orchestrator
agent session:

```
TASK: <!-- one-line description from issue title -->
AGENT: <!-- pick from: Implementer | Reviewer | Documenter | RALPH -->
INPUT:
  - CONTEXT.md
  - Issue #ISSUE_NUMBER: <!-- issue URL -->
  - <!-- any additional files or prior output -->
EXPECTED OUTPUT: <!-- what success looks like, derived from AC -->
DEPENDENCY: <!-- upstream tasks that must complete first, or NONE -->
ACCEPTANCE CRITERIA:
  <!-- paste AC list from issue, formatted as checkboxes -->
CONSTRAINTS:
  - Follow .github/instructions/coding-standards.instructions.md
  - Follow .github/instructions/issue-driven-orchestration.instructions.md
  - Do not modify files outside the issue scope
  - PR must link "Closes #ISSUE_NUMBER"
```

---

## Step 4 — Update issue status

After dispatch, update the issue label from `status:ready` → `status:in-progress`:

```bash
gh issue edit ISSUE_NUMBER --repo OWNER/REPO \
  --remove-label "status:ready" \
  --add-label "status:in-progress"
```

Add a comment linking to the resulting work:

```bash
gh issue comment ISSUE_NUMBER --repo OWNER/REPO \
  --body "Dispatched to <!-- agent name -->. Tracking branch: <!-- branch -->."
```

---

## Step 5 — PR review gate

When the implementation PR is opened:

1. Verify "Closes #ISSUE_NUMBER" appears in the PR body.
2. Reviewer agent performs adversarial review (see `reviewer.agent.md`).
3. At least one human approves before merge.
4. After merge, update issue to `status:done` and trigger Documenter:

```bash
gh issue edit ISSUE_NUMBER --repo OWNER/REPO \
  --remove-label "status:review" \
  --add-label "status:done"
```

---

## Notes

- If the issue spawns multiple independent sub-tasks, create child issues and
  link them with `depends on #N` or `blocks #N` in the body.
- For research/spike issues (`type:research`), time-box the work in the issue
  body and close with a findings comment rather than a PR.
- See `.github/instructions/issue-driven-orchestration.instructions.md` for the
  complete IDO protocol.
