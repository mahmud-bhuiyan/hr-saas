# API Registry

**Living document.** Every API endpoint must be listed here when added or changed.

Also add or update tests in `tests/api/` (one test file per route group).

---

## How to update this file

When you add, change, or remove an endpoint:

1. Update the table below (method, path, auth, description).
2. Add or update `server/tests/api/<module>.test.ts` with Supertest coverage.
3. Run `cd server && npm test` — all tests must pass before marking the step done.

---

## Endpoints

### Health

| Method | Path | Auth | Roles | Description | Test file |
|--------|------|------|-------|-------------|-----------|
| GET | `/api/health` | No | — | Service health check | `server/tests/api/health.test.ts` |

---

### Auth *(Step 2 — not implemented yet)*

| Method | Path | Auth | Roles | Description | Test file |
|--------|------|------|-------|-------------|-----------|
| — | — | — | — | *Add rows when Step 2 is built* | — |

---

### Employees *(Step 4 — not implemented yet)*

| Method | Path | Auth | Roles | Description | Test file |
|--------|------|------|-------|-------------|-----------|
| — | — | — | — | *Add rows when Step 4 is built* | — |

---

## Template (copy for new endpoints)

```markdown
| POST | `/api/example` | Yes | company_admin, hr_manager | Create example | `server/tests/api/example.test.ts` |
```
