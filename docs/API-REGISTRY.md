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

All API routes are versioned under `/api/v1`. Add future breaking changes under `/api/v2`, etc.

### Health

| Method | Path | Auth | Roles | Description | Test file |
|--------|------|------|-------|-------------|-----------|
| GET | `/` | No | — | Root — confirms server is running | `server/tests/api/root.test.ts` |
| GET | `/api/v1/health` | No | — | Service health check | `server/tests/api/health.test.ts` |

---

### Auth *(Step 2 — in progress)*

| Method | Path | Auth | Roles | Description | Test file |
|--------|------|------|-------|-------------|-----------|
| POST | `/api/v1/admins` | Bootstrap: No (first user only). Otherwise: Yes | super_admin | Create admin user. Bootstrap allows unauthenticated `super_admin` when DB has zero users. | `server/tests/api/admin.test.ts` |

---

### Employees *(Step 4 — not implemented yet)*

| Method | Path | Auth | Roles | Description | Test file |
|--------|------|------|-------|-------------|-----------|
| — | — | — | — | *Add rows when Step 4 is built* | — |

---

## Template (copy for new endpoints)

```markdown
| POST | `/api/v1/example` | Yes | company_admin, hr_manager | Create example | `server/tests/api/example.test.ts` |
```
