# Implementation Steps

Check off each step with the client/dev team before moving to the next.

| Step | Scope | Status |
|------|-------|--------|
| **1** | Foundation — separate client & server apps, Docker, dev scripts | ✅ Complete |
| **2** | Auth & tenant — register, login, JWT, RBAC middleware | ✅ Ready for review |
| **3** | App shell — layout, routing, design system, dashboard placeholder | ⬜ Pending |
| **4** | Employee management — CRUD, directory, profile | ⬜ Pending |
| **5** | Leave & absence — requests, approval, balance, calendar | ⬜ Pending |
| **6** | Document storage — S3 upload/download | ⬜ Pending |
| **7** | Admin & settings — company, departments, users | ⬜ Pending |
| **8** | Demo polish — seed data, staging deploy, bug fixes | ⬜ Pending |

---

## Step 1 — Done when

- [x] `npm install` succeeds in `client/` and `server/`
- [x] `npm run dev` starts client (port 5173) and server (port 5000)
- [x] Client shows HR SaaS welcome shell
- [x] `GET http://localhost:5000/api/v1/health` returns `{ status: "ok" }`
- [x] `docker compose up -d` starts MongoDB and Redis
- [x] `cd client && npm run build` succeeds
- [x] `docs/openapi.yaml` and Postman collection list all endpoints

**Review:** Confirm structure and stack before Step 2.

---

## Step 2 — Done when

- [ ] `POST /api/v1/auth/register` creates a tenant + company admin user
- [ ] `POST /api/v1/auth/login` returns access token and sets refresh cookie
- [ ] `POST /api/v1/auth/refresh` returns a new access token (with cookie)
- [ ] `POST /api/v1/auth/logout` clears refresh cookie
- [ ] `GET /api/v1/auth/me` returns current user when Bearer token is valid
- [ ] JWT middleware rejects invalid/expired tokens (401)
- [ ] RBAC `authorize()` and `authorizePermission()` middleware in place
- [ ] Tenant middleware (`resolveTenant`, `requireTenant`) in place
- [x] `docs/openapi.yaml` and Postman collection updated with auth endpoints

**Review:** Test auth flow manually (curl/Postman) before Step 3.

---

## Step 3 — Done when

- [ ] React Router with protected routes
- [ ] Login and register pages wired to auth API
- [ ] Dashboard placeholder after login
- [ ] Auth state persisted (access token + refresh on 401)

**Review:** Confirm UI shell and auth UX before Step 4.
