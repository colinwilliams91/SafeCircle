# Context7 MCP Plugin

This plugin bundles the configuration and usage conventions for the
[Context7](https://context7.com) Model Context Protocol (MCP) server.

Context7 provides up-to-date, version-specific library documentation directly
inside agent prompts — eliminating hallucinated APIs.

---

## Configuration

Two committed config files provide Context7 to all harnesses — no manual setup
required after cloning:

| File | Key format | Harnesses |
|------|-----------|-----------|
| `.mcp.json` (repo root) | `mcpServers` | Claude Code, Codex CLI, and any harness following the cross-IDE MCP standard |
| `.vscode/mcp.json` | `servers` | VS Code, Cursor, Windsurf |

### `.mcp.json` (root — harness-agnostic)

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    }
  }
}
```

### `.vscode/mcp.json` (VS Code family)

```json
{
  "servers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    }
  }
}
```

For machine-local overrides (e.g. to pin a version or supply an API key), create
**`.mcp.local.json`** or **`.vscode/mcp.local.json`** — both patterns are git-ignored.

> **Never add API keys or secrets to either committed config file.** Use environment
> variables or the `.local` override files for sensitive values.

---

## Usage in Prompts

Add `use context7` at the end of any prompt that references a library:

```
Refactor the authentication middleware to use the latest passport.js API. use context7
```

Context7 will resolve the correct version of the docs and inject them into the
agent context automatically.

---

## Caching (Future)

To minimise API calls and token usage, a local cache layer is planned:

- Cache location (git-ignored): `.context7/`
- Strategy: store resolved doc snippets keyed by `library@version+query`.
- Invalidation: TTL-based or on explicit `context7 --refresh`.

This will be implemented as a harness inside the repo once the caching strategy
is finalised. See `CONTEXT.md` → Open Questions for tracking.

---

## Related Files

| File | Purpose |
|------|---------|
| `.github/plugins/context7/README.md` | This file |
| `CONTEXT.md` | Workspace state including active library versions |
| `.gitignore` | Ensures `.context7/` cache is never committed |
