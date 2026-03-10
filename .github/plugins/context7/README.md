# Context7 MCP Plugin

This plugin bundles the configuration and usage conventions for the
[Context7](https://context7.com) Model Context Protocol (MCP) server.

Context7 provides up-to-date, version-specific library documentation directly
inside agent prompts — eliminating hallucinated APIs.

---

## Configuration

Context7 is configured in your **global / workspace `mcp.json`**. A minimal entry:

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

> **Never commit `mcp.json` files that contain API keys.** Use environment
> variables or a secrets manager. The pattern `mcp.local.json` is git-ignored.

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
