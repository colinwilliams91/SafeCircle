---
applyTo: "**"
---

# Coding Standards & Best Practices

These rules apply workspace-wide. Agents must follow them unless a task explicitly
overrides a rule with documented justification.

---

## 1. Language & Framework Agnosticism

- Scaffold and tooling **must not** assume a specific language or framework.
- Use environment variables and configuration files (never hard-coded values) for
  anything that differs between environments or projects.

## 2. Minimal Change Principle

- Make the **smallest modification** that satisfies the requirement.
- Do not refactor unrelated code in the same commit.

## 3. Secrets & Credentials

- **Never** commit secrets, API keys, tokens, or passwords.
- Store sensitive values in `.env` (git-ignored) or an external secrets manager.
- Reference secrets via environment variables: `process.env.MY_KEY` / `os.environ["MY_KEY"]`.

## 4. Naming Conventions

| Artifact | Convention |
|----------|-----------|
| Files | `kebab-case` |
| Variables / functions | `camelCase` (JS/TS) or `snake_case` (Python/Go/Rust) |
| Classes / types | `PascalCase` |
| Constants | `UPPER_SNAKE_CASE` |
| Agent files | `<name>.agent.md` |
| Prompt files | `<name>.prompt.md` |
| Instruction files | `<name>.instructions.md` |

## 5. Testing

- Every non-trivial function must have a corresponding test.
- Tests live adjacent to the code they cover (e.g. `foo.test.ts` next to `foo.ts`).
- Test names describe behaviour: `"returns empty array when input is null"`.

## 6. Documentation

- Public APIs and exported functions must have doc-comments.
- Architectural decisions must be recorded in `CONTEXT.md`.
- The Documenter agent is responsible for keeping `CONTEXT.md` current.

## 7. Dependency Management

- Prefer the standard library; add third-party dependencies only when necessary.
- All new dependencies must be checked for known vulnerabilities before adoption.
- Pin exact versions in lock files; use semver ranges only in `package.json` / `pyproject.toml`.

## 8. Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>

[optional body]
[optional footer]
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`, `ci`.
