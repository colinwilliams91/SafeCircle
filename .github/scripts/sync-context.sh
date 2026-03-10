#!/usr/bin/env bash
# sync-context.sh
#
# Utility: Remind the Documenter agent to regenerate CONTEXT.md.
# Run manually or wire into a git hook / CI step.
#
# Usage:
#   .github/scripts/sync-context.sh [--dry-run]
#
# First-time setup (commit with execute bit):
#   git add --chmod=+x .github/scripts/sync-context.sh
#
# The script itself does not edit CONTEXT.md — that is the Documenter agent's
# responsibility. This script validates the file exists and is non-empty, then
# prints a prompt you can paste directly into GitHub Copilot Chat.

set -euo pipefail

CONTEXT_FILE="$(git rev-parse --show-toplevel)/CONTEXT.md"
DRY_RUN=false

for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=true ;;
    *) echo "Unknown argument: $arg" >&2; exit 1 ;;
  esac
done

# ── Validation ──────────────────────────────────────────────────────────────
if [[ ! -f "$CONTEXT_FILE" ]]; then
  echo "ERROR: CONTEXT.md not found at $CONTEXT_FILE" >&2
  exit 1
fi

if [[ ! -s "$CONTEXT_FILE" ]]; then
  echo "WARNING: CONTEXT.md exists but is empty."
fi

LAST_MODIFIED=$(git log -1 --format="%ar" -- "$CONTEXT_FILE" 2>/dev/null || echo "unknown")
echo "CONTEXT.md last committed: $LAST_MODIFIED"

# ── Prompt output ────────────────────────────────────────────────────────────
if [[ "$DRY_RUN" == "false" ]]; then
  echo ""
  echo "──────────────────────────────────────────────────────────────────"
  echo "Paste the following into GitHub Copilot Chat to trigger an update:"
  echo "──────────────────────────────────────────────────────────────────"
  cat <<'PROMPT'
@workspace You are the Documenter agent defined in .github/agents/documenter.agent.md.
Scan the entire codebase using #codebase, compare it against the current CONTEXT.md,
and update CONTEXT.md to accurately reflect the workspace state.
Preserve the existing section structure. Use conventional commit style for your summary.
PROMPT
  echo "──────────────────────────────────────────────────────────────────"
fi
