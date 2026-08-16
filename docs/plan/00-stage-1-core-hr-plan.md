# HR SaaS — Stage 1 Plan (Client Presentation)

**Purpose:** Deliver a working first demo that proves the platform direction, core UX, and multi-tenant foundation — enough for the client to validate the product before committing to later stages.

**Target companies:** SMEs with 5–100 employees (expand to 1,000 later).

**Stack:** React + Node.js + MongoDB — separate `client/` and `server/` apps (not a shared monorepo package).

**Implementation tracker:** [STAGE-1-IMPLEMENTATION-STEPS.md](./STAGE-1-IMPLEMENTATION-STEPS.md) · Module details in [modules/](./modules/)

---

## 1. What the Client Will See

A live web app where a company admin can sign up, add staff, manage leave, and store HR documents — with role-based access so managers and employees see only what they should.

### Demo narrative (15–20 minute walkthrough)

| Step | Who | What happens |
|------|-----|--------------|
| 0 | Super admin | Creates company directly **or** approves self-registration request |
| 1 | Company admin | Registers company (if self-serve) → approved → lands on dashboard |
| 2 | Company admin | Adds employee records (departments as free text until Settings module) |
| 3 | Company admin / HR | Opens employee directory → views profile → edits details |
| 4 | Employee | Logs in → views own profile → submits leave request |
| 5 | Manager | Sees approval queue → approves or declines leave |
| 6 | Employee | Sees updated leave balance and request status |
| 7 | HR | Uploads contract PDF to employee folder → sets optional expiry |
| 8 | Company admin | Updates company name/logo in settings |

This flow covers **signup → people → leave workflow → documents → settings**, which is the heart of a small-business HR tool.

---

## 2. In Scope — Stage 1

### 2.1 Authentication & Company Setup

- Company self-registration (creates tenant + first admin user, **pending super admin approval**)
- Super admin: approve / reject registration requests
- Super admin: add company directly (creates approved tenant + admin — no wait)
- Login / logout
- User profile and change password
- Forgot password (email-based reset) — **done** (S2-1: `/forgot-password`, `/reset-password`)
- Secure sessions (short-lived access token + refresh cookie)
- Each company’s data fully isolated from other companies

### 2.2 Roles (Stage 1 subset)

| Role | Can do in Stage 1 |
|------|------------------|
| **Super admin** | Platform operator: approve/reject registrations, add companies, bootstrap admins, customize platform site (name, theme color, logo, favicon) |
| **Company admin** | Everything in Stage 1 for their tenant |
| **HR manager** | Manage employees, documents, approve leave |
| **Manager** | View team, approve team leave |
| **Employee** | View own profile, request leave, view own documents |

### 2.3 Employee Management

- Employee directory (list, search, filter by department/status) — **done**
- Add / edit / deactivate employee — **done**
- Employee profile: personal details, job title, department, start date, manager, employment status — **done**
- Simple org view (manager → direct reports list) — **done**
- Link employee record to login user (invite email or admin-created login with default password) — **done**

### 2.4 Leave & Absence

- Leave types: annual, sick, unpaid (fixed list for Stage 1)
- Submit leave request (date range, optional half-day, reason)
- Single-step approval (manager or HR approves/declines)
- Leave balance per employee (fixed annual entitlement for Stage 1 — no complex accrual engine yet)
- Team leave calendar (read-only month view)
- Email notification on submit and on approve/decline (basic templates)

### 2.5 Document Storage

- Upload files (PDF, images, common office formats) to employee or company folder
- Categories: contract, ID, certification, other
- Download with permission check
- Optional expiry date on document (shown in list; reminder emails in Stage 2)
- Files stored in cloud storage (S3 / R2), not in the database

### 2.6 Admin & Settings (thin)

- Company profile: name, address, logo
- Departments (add / rename / archive)
- User list with role assignment
- **Platform site settings (super admin):** site name, primary theme color, logo, favicon — visible to all users on login, register, and app shell
- Dashboard shell: placeholder cards for headcount, pending leave count, recent activity

### 2.7 Platform Quality (required for demo credibility)

- Responsive layout (desktop + tablet; mobile-friendly, not native app) — **in progress**
- Consistent UI (design system — Tailwind + reusable components in `client/src/components/ui/`) — **done**
- Loading states, error messages, empty states — **done** on built screens
- Audit log for sensitive changes (employee edits, document uploads) — backend only for Stage 1; UI in Stage 2

---

## 3. Out of Scope — Stage 1 (Later Stages)

Be explicit with the client so expectations stay aligned.

| Feature | Planned stage | Notes |
|---------|---------------|-------|
| Clock-in / attendance | Stage 2 | Web + mobile clock |
| Shift rota / scheduling | Stage 3 | Drag-and-drop rota grid |
| Timesheets & overtime | Stage 2 | Built on attendance |
| Expense claims | Stage 2 | Receipt upload + approval |
| Payroll calculation | Stage 3 | Export to Xero/QuickBooks instead of building tax engine |
| Stripe billing / per-seat pricing | Stage 2 | Free demo tenants for Stage 1 |
| Bulk CSV employee import | Stage 2 | Manual add only in Stage 1 |
| Advanced leave rules (accrual, carry-over, Bradford Factor) | Stage 2–3 | Fixed entitlement in Stage 1 |
| Multi-step approval chains | Stage 2 | Single approver in Stage 1 |
| Reporting dashboards & exports | Stage 2 | Basic counts on dashboard only |
| SMS notifications | Stage 2 | Email only in Stage 1 |
| GPS on clock-in | Stage 2 | |
| SSO / Microsoft Google login | Stage 3+ | |
| Per-tenant white-label (each company’s own theme/logo) | Stage 1 (partial) | Logo + primary color override for company admin; full profile in Step 7 |

---

## 4. Screens Checklist (Stage 1)

### Public
- [x] Login
- [x] Register company
- [x] Forgot password / reset password (shipped in S2-1)

### Super admin
- [x] Companies — pending queue, approve/reject, add company directly
- [x] Platform site settings — site name, theme color, logo, favicon (`/super-admin/site/*`)
- [x] Manage company modules — enable/disable HR modules per tenant (modal on companies page)
- [x] Company branding overrides — logo + primary color (`/dashboard/settings/company?tab=branding`)

### Dashboard
- [x] Home dashboard (summary cards + quick links — **placeholders**; real counts in Step 7)
- [x] App shell theme toggle (light/dark) — per-user preference in DB + localStorage via `ThemeContext`

### Account
- [x] My profile (view all account details / edit name, email, photo, change password)

### Employees
- [x] Employee directory
- [x] Add employee (modal)
- [x] Employee profile (view / edit; leave & document tabs — Step 5–6)
- [x] Direct reports on profile (simple org view)

### Leave
- [x] Request leave (employee)
- [x] My leave history & balance
- [x] Approval queue (manager / HR)
- [x] Team calendar

### Documents
- [x] Document list (by employee or company)
- [x] Upload document
- [x] Download document

### Settings
- [x] Company profile
- [x] Departments
- [x] Users & roles

---

## 5. Timeline Estimate

Assumes **1–2 full-stack developers** working focused hours.

| Week | Focus | Deliverable |
|------|-------|-------------|
| **1–2** | Foundation | Monorepo, auth, tenant isolation, RBAC, app shell, CI |
| **3–4** | Employees | Directory, profile CRUD, departments, manager link |
| **5–6** | Leave | Requests, approval, balance, calendar, email |
| **7** | Documents | Upload/download, categories, S3 integration |
| **8** | Polish | Settings, dashboard, bug fixes, demo seed data, deploy staging |

**Total: ~8 weeks** to client-ready Stage 1.

Solo developer: plan **12–14 weeks**.

---

## 6. Demo Environment

- **Staging URL** for client (e.g. `demo.hr-platform.com`)
- Pre-seeded demo company: *Acme Ltd* with sample employees, leave, documents — set up manually on staging
- Demo accounts:

| Role | Email (example) | Purpose |
|------|-----------------|---------|
| Company admin | admin@acme-demo.com | Full walkthrough |
| HR manager | hr@acme-demo.com | Employee + document management |
| Manager | manager@acme-demo.com | Leave approval |
| Employee | employee@acme-demo.com | Self-service leave |

*(Passwords shared securely outside this document.)*

---

## 7. Success Criteria — Stage 1 Sign-off

The client approves moving to Stage 2 when all of the following are true:

1. Company can register and only see its own data
2. Admin can add employees and assign roles
3. Employee can request leave; manager can approve; balance updates correctly
4. HR can upload and download a document on an employee record
5. UI is clean and usable on desktop and tablet
6. No critical bugs in the demo walkthrough path (Section 1)
7. Client confirms Stage 1 scope matches what was agreed (Section 2 vs Section 3)

---

## 8. After Stage 1 — Stage Preview (for client conversation)

Brief teaser only; detailed plans will be separate documents.

| Stage | Focus | Indicative duration |
|-------|-------|---------------------|
| **Stage 2 — Operations** | Attendance, timesheets, expenses, notifications, billing | 6–8 weeks |
| **Stage 3 — Scheduling & Payroll** | Rotas, payroll export, integrations | 6–8 weeks |

Detailed plan: [10-stage-2-operations-plan.md](./10-stage-2-operations-plan.md) · Dev steps: [STAGE-2-IMPLEMENTATION-STEPS.md](./STAGE-2-IMPLEMENTATION-STEPS.md)

Full roadmap: [hr-saas-mern-project-plan.md](./hr-saas-mern-project-plan.md)

---

## 9. Assumptions & Client Dependencies

| Item | Owner | Needed by |
|------|-------|-----------|
| Brand name, logo (optional for Stage 1) | Client | Week 7 |
| Leave policy defaults (days per year, types) | Client | Week 5 |
| Sample document types / categories | Client | Week 6 |
| Staging domain or subdomain | Client / Dev | Week 8 |
| Email sender domain (SPF/DKIM) for notifications | Client | Week 5 |
| Feedback within 3 business days after demo | Client | Post-demo |

---

## 10. Risks & Mitigations (Stage 1)

| Risk | Mitigation |
|------|------------|
| Leave rules more complex than expected | Stage 1 uses fixed entitlement; document Stage 2 for accrual |
| Scope creep during demo prep | This document is the contract; changes go to a change log |
| Tenant data leak | Mandatory tenant middleware + code review on every query |
| Demo feels “empty” | Seed realistic Acme Ltd data; polish dashboard counts |
| Onboarding confusion | Two paths documented: self-register (pending) vs super admin add company (immediate) |

---

## 11. Implementation status (last updated: 2026-08-02)

| Area | Status | Notes |
|------|--------|-------|
| Foundation (Step 1) | ✅ Complete | |
| Auth & tenant (Step 2) | ✅ Complete | Includes approval workflow + super admin add company |
| App shell (Step 3) | ✅ Complete | UI kit, profile, companies page, user light/dark theme toggle (DB + localStorage) |
| Employees (Step 4) | ✅ Ready for review | Invite + one-click login (`User@123`) |
| Leave (Step 5) | ✅ Complete | Email via SendGrid; user→employee via email fallback |
| Documents (Step 6) | ✅ Ready for review | MinIO for local dev; AWS S3 or Cloudflare R2 in production |
| Settings (Step 7) | ✅ Ready for review | Company profile, departments CRUD, users/roles; branding was done earlier |
| Demo polish (Step 8) | ✅ Complete | Manual staging data only; automated seeds/tests removed |
| Module access control | ✅ Done | Super admin per-tenant module toggles — [18-module-access-control.md](./modules/18-module-access-control.md) |

**Next step:** Stage 3 — S3-8 sign-off. See [STAGE-3-IMPLEMENTATION-STEPS.md](./STAGE-3-IMPLEMENTATION-STEPS.md).
