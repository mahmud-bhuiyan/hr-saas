# Implementation Steps

Check off each step with the client/dev team before moving to the next.

| Step | Scope | Status |
|------|-------|--------|
| **1** | Foundation — separate client & server apps, Docker, dev scripts | ✅ Complete |
| **2** | Auth & tenant — register, login, JWT, RBAC, super admin, company onboarding | ✅ Complete |
| **3** | App shell — layout, routing, design system, dashboard, profile | ✅ Complete |
| **4** | Employee management — CRUD, directory, profile, direct reports | ✅ Ready for review |
| **5** | Leave & absence — requests, approval, balance, calendar | ✅ Complete |
| **6** | Document storage — S3 upload/download | ✅ Ready for review |
| **7** | Admin & settings — company, departments, users | ✅ Ready for review |
| **8** | Demo polish — staging deploy, bug fixes, manual demo data | ✅ Complete |

---

## Out-of-plan additions (log)

Features added during implementation that extend the original step list. Keep this section updated when scope grows mid-sprint.

| Added | Step | Description |
|-------|------|---------------|
| Super admin role | 2 | Platform operator; bootstrap via `npm run seed:superadmin` or first-user `POST /api/v1/admins` |
| Registration approval | 2 | Self-register creates **pending** tenant; super admin approves/rejects before login |
| Super admin add company | 2 | `POST /api/v1/admin/registrations` — create approved company + admin in one step |
| User profile & password | 2–3 | `GET/PATCH /api/v1/auth/me`, profile page, change-password modal |
| UI component kit | 3 | Reusable primitives in `client/src/components/ui/` (Button, Table, Modal, FormModal, etc.) |
| Companies page (super admin) | 3 | `/dashboard/registrations` — pending queue + add company |
| Manager team-scoped employee read | 4 | Managers see direct reports only (`employee:read:team`) |
| Direct reports org view | 4 | `GET /api/v1/employees/:id/reports` + profile section |
| Platform site customization | 7 | Super admin: global site name, theme color, logo, favicon |
| Per-tenant branding overrides | 7 | Company admin: logo + primary color override (pulled forward from Stage 3) |
| ImgBB logo/favicon upload | 7 | Super admin: upload or URL for platform logo/favicon via `IMGBB_API_KEY` |
| Logo/favicon display settings | 7 | Super admin: logo size/fit/name toggle; favicon MIME type + preview |
| Document storage (Step 6) | 6 | S3 presigned upload/download; `document:read:own` for employees; MinIO in docker compose |
| User light/dark theme preference | 3 | Per-user `colorScheme` on User model; `PATCH /api/v1/auth/me`; header toggle; `ThemeContext` + localStorage cache; dark-mode styling on dashboard surfaces |

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

- [x] `POST /api/v1/auth/register` creates a tenant + company admin user (**pending** approval)
- [x] `POST /api/v1/auth/login` returns access token and sets refresh cookie
- [x] `POST /api/v1/auth/refresh` returns a new access token (with cookie)
- [x] `POST /api/v1/auth/logout` clears refresh cookie
- [x] `GET /api/v1/auth/me` returns current user when Bearer token is valid (includes `colorScheme`)
- [x] `PATCH /api/v1/auth/me` updates profile, optional password, and optional `colorScheme` (`light` | `dark`)
- [x] JWT middleware rejects invalid/expired tokens (401)
- [x] RBAC `authorize()` and `authorizePermission()` middleware in place
- [x] Tenant middleware (`resolveTenant`, `requireTenant`) in place
- [x] Super admin bootstrap (`POST /api/v1/admins`, `npm run seed:superadmin`)
- [x] Super admin: list / approve / reject pending registrations
- [x] Super admin: create company directly (auto-approved)
- [x] `docs/openapi.yaml` and Postman collection updated with auth + admin endpoints

**Review:** Test auth flow manually (curl/Postman) before Step 3.

---

## Step 3 — Done when

- [x] React Router with protected routes (`ProtectedRoute`, `GuestRoute`)
- [x] Login and register pages wired to auth API
- [x] Dashboard placeholder after login
- [x] Auth state persisted (access token + refresh on 401)
- [x] App shell with sidebar nav and role-based menu items
- [x] Reusable UI component kit (`client/src/components/ui/`)
- [x] User profile page (`/dashboard/profile`) with change password
- [x] Companies page for super admin (`/dashboard/registrations`)
- [x] User light/dark theme toggle in app shell header (`ThemeContext` + localStorage; synced to DB via `PATCH /api/v1/auth/me`)

**Review:** Confirm UI shell and auth UX before Step 4.

---

## Step 4 — Done when

- [x] Employee CRUD API endpoints (`/api/v1/employees`)
- [x] Employee directory page (list, search, filter by department/status)
- [x] Add employee form (modal)
- [x] Edit employee on profile page; deactivate via status
- [x] Employee profile page with direct reports (simple org view)
- [x] Permission-based access (`employee:create/read/update`, team read for managers)
- [x] `docs/openapi.yaml` and Postman collection updated

**Not in Step 4 (deferred):** Link employee record to login user (invite flow) — target Step 7 or later.

**Review:** Test employee flows before Step 5.

---

## Step 5 — Done when

- [x] Leave types (annual, sick, unpaid)
- [x] Submit leave request API + employee UI
- [x] Approval queue for manager / HR
- [x] Leave balance per employee (fixed entitlement)
- [x] Team leave calendar (read-only month view)
- [x] Email notification on submit and approve/decline
- [x] `docs/openapi.yaml` and Postman collection updated

**Review:** Test leave flows before Step 6.

---

## Step 6 — Done when

- [x] S3/R2 upload and download with permission checks
- [x] Document categories (contract, ID, certification, other)
- [x] Document list and upload UI
- [x] Optional expiry date on documents
- [x] `docs/openapi.yaml` and Postman collection updated

**Review:** Test document flows before Step 7.

---

## Step 7 — Done when

- [x] Company profile settings (name, address, logo)
- [x] Departments CRUD (replace free-text department on employees)
- [x] User list with role assignment
- [x] Platform site settings (super admin): site name, primary color, logo, favicon
- [x] Logo/favicon ImgBB upload + display customization (height, fit, favicon type)
- [x] Public `GET /api/v1/platform/site-config` + super_admin PATCH endpoints
- [x] Tenant branding overrides (company admin): logo URL + primary color
- [x] Client: dynamic theme, title, favicon from site config
- [x] Super admin screen: `/dashboard/platform/site-settings`
- [x] Company admin screen: `/dashboard/settings/branding`
- [x] Dashboard summary cards wired to real counts (role-based: super admin, tenant admin, manager, employee)
- [x] `docs/openapi.yaml` and Postman collection updated (platform + branding endpoints)

**Review:** Test settings before Step 8.

---

## Step 8 — Done when

- [x] Demo seed data — manual setup / staging data (automated seed scripts removed after manual test)
- [x] Staging deployment (client + server)
- [x] Bug fixes on demo walkthrough path (Stage 2 path addressed in S2-8)
- [x] Forgot password flow — shipped in S2-1 (`/forgot-password`, `/reset-password`)
- [x] Client demo sign-off per [00-client-demo-plan.md](./00-client-demo-plan.md) Section 7
- [x] Automated demo seed scripts and demo-era unit tests removed intentionally — manual staging data only (`npm run seed:superadmin` for platform bootstrap)

**Review:** Demo 1 complete. See [STAGE-3-IMPLEMENTATION-STEPS.md](./STAGE-3-IMPLEMENTATION-STEPS.md) for Stage 3.

---

## Stage 2 — Operations

Demo 1 Steps 1–8 are complete. Stage 2 is complete. Stage 3 planning and build tracker:

| Document | Purpose |
|----------|---------|
| [10-stage-2-operations-plan.md](./10-stage-2-operations-plan.md) | Client-facing scope, screens, timeline, sign-off |
| [STAGE-2-IMPLEMENTATION-STEPS.md](./STAGE-2-IMPLEMENTATION-STEPS.md) | Dev checklist — Steps S2-1 through S2-8 |
| [11-stage-3-scheduling-payroll-plan.md](./11-stage-3-scheduling-payroll-plan.md) | Stage 3 client-facing scope |
| [STAGE-3-IMPLEMENTATION-STEPS.md](./STAGE-3-IMPLEMENTATION-STEPS.md) | Dev checklist — Steps S3-1 through S3-8 |

**Next step:** S3-4 — Payroll export backend. See [STAGE-3-IMPLEMENTATION-STEPS.md](./STAGE-3-IMPLEMENTATION-STEPS.md).
