# Implementation Steps

Check off each step with the client/dev team before moving to the next.

| Step | Scope | Status |
|------|-------|--------|
| **1** | Monorepo foundation — client, server, shared packages, Docker, dev scripts | ✅ Ready for review |
| **2** | Auth & tenant — register, login, JWT, RBAC middleware | ⬜ Pending |
| **3** | App shell — layout, routing, design system, dashboard placeholder | ⬜ Pending |
| **4** | Employee management — CRUD, directory, profile | ⬜ Pending |
| **5** | Leave & absence — requests, approval, balance, calendar | ⬜ Pending |
| **6** | Document storage — S3 upload/download | ⬜ Pending |
| **7** | Admin & settings — company, departments, users | ⬜ Pending |
| **8** | Demo polish — seed data, staging deploy, bug fixes | ⬜ Pending |

---

## Step 1 — Done when

- [ ] `npm install` succeeds at repo root
- [ ] `npm run dev` starts client (port 5173) and server (port 4000)
- [ ] Client shows HR SaaS welcome shell
- [ ] `GET http://localhost:4000/api/v1/health` returns `{ status: "ok" }`
- [ ] `docker compose up -d` starts MongoDB and Redis
- [ ] `cd client && npm run build` succeeds
- [ ] `docs/API-REGISTRY.md` lists all endpoints

**Review:** Confirm structure and stack before Step 2.
