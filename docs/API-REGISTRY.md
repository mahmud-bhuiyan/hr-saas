# API Registry

**Living document.** Every API endpoint must be listed here when added or changed.

---

## How to update this file

When you add, change, or remove an endpoint:

1. Update the table below (method, path, auth, description).

---

## Endpoints

All API routes are versioned under `/api/v1`. Add future breaking changes under `/api/v2`, etc.

### Health

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | `/` | No | — | Root — confirms server is running |
| GET | `/api/v1/health` | No | — | Service health check |

---

### Auth *(Step 2 — in progress)*

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| POST | `/api/v1/admins` | Bootstrap: No (first user only). Otherwise: Yes | super_admin | Create admin user. Bootstrap allows unauthenticated `super_admin` when DB has zero users. |

---

### Employees *(Step 4 — not implemented yet)*

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| — | — | — | — | *Add rows when Step 4 is built* |

---

## Template (copy for new endpoints)

```markdown
| POST | `/api/v1/example` | Yes | company_admin, hr_manager | Create example |
```
