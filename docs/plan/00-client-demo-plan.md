# HR SaaS — Demo 1 Plan (Client Presentation)

**Purpose:** Deliver a working first demo that proves the platform direction, core UX, and multi-tenant foundation — enough for the client to validate the product before committing to later stages.

**Target companies:** SMEs with 5–100 employees (expand to 1,000 later).

**Stack:** React + Node.js + MongoDB (MERN monorepo).

---

## 1. What the Client Will See

A live web app where a company admin can sign up, add staff, manage leave, and store HR documents — with role-based access so managers and employees see only what they should.

### Demo narrative (15–20 minute walkthrough)

| Step | Who | What happens |
|------|-----|--------------|
| 1 | Company admin | Registers company → lands on dashboard |
| 2 | Company admin | Adds departments, invites or creates employee records |
| 3 | Company admin / HR | Opens employee directory → views profile → edits details |
| 4 | Employee | Logs in → views own profile → submits leave request |
| 5 | Manager | Sees approval queue → approves or declines leave |
| 6 | Employee | Sees updated leave balance and request status |
| 7 | HR | Uploads contract PDF to employee folder → sets optional expiry |
| 8 | Company admin | Updates company name/logo in settings |

This flow covers **signup → people → leave workflow → documents → settings**, which is the heart of a small-business HR tool.

---

## 2. In Scope — Demo 1

### 2.1 Authentication & Company Setup

- Company registration (creates tenant + first admin user)
- Login / logout
- Forgot password (email-based reset)
- Secure sessions (short-lived access token + refresh cookie)
- Each company’s data fully isolated from other companies

### 2.2 Roles (Demo 1 subset)

| Role | Can do in Demo 1 |
|------|------------------|
| **Company admin** | Everything in Demo 1 |
| **HR manager** | Manage employees, documents, approve leave |
| **Manager** | View team, approve team leave |
| **Employee** | View own profile, request leave, view own documents |

### 2.3 Employee Management

- Employee directory (list, search, filter by department/status)
- Add / edit / deactivate employee
- Employee profile: personal details, job title, department, start date, manager, employment status
- Simple org view (manager → direct reports list; full interactive org chart deferred)
- Link employee record to login user (invite flow or admin-created account)

### 2.4 Leave & Absence

- Leave types: annual, sick, unpaid (fixed list for Demo 1)
- Submit leave request (date range, optional half-day, reason)
- Single-step approval (manager or HR approves/declines)
- Leave balance per employee (fixed annual entitlement for Demo 1 — no complex accrual engine yet)
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
- Dashboard shell: placeholder cards for headcount, pending leave count, recent activity

### 2.7 Platform Quality (required for demo credibility)

- Responsive layout (desktop + tablet; mobile-friendly, not native app)
- Consistent UI (design system — e.g. Tailwind + component library)
- Loading states, error messages, empty states
- Audit log for sensitive changes (employee edits, document uploads) — backend only for Demo 1; UI in Stage 2

---

## 3. Out of Scope — Demo 1 (Later Stages)

Be explicit with the client so expectations stay aligned.

| Feature | Planned stage | Notes |
|---------|---------------|-------|
| Clock-in / attendance | Stage 2 | Web + mobile clock |
| Shift rota / scheduling | Stage 3 | Drag-and-drop rota grid |
| Timesheets & overtime | Stage 2 | Built on attendance |
| Expense claims | Stage 2 | Receipt upload + approval |
| Payroll calculation | Stage 3 | Export to Xero/QuickBooks instead of building tax engine |
| Stripe billing / per-seat pricing | Stage 2 | Free demo tenants for Demo 1 |
| Bulk CSV employee import | Stage 2 | Manual add only in Demo 1 |
| Advanced leave rules (accrual, carry-over, Bradford Factor) | Stage 2–3 | Fixed entitlement in Demo 1 |
| Multi-step approval chains | Stage 2 | Single approver in Demo 1 |
| Performance reviews & goals | Stage 4 | |
| Recruitment / ATS | Stage 4 | |
| E-learning / LMS | Stage 4 | |
| Reporting dashboards & exports | Stage 2–4 | Basic counts on dashboard only |
| SMS notifications | Stage 2 | Email only in Demo 1 |
| GPS on clock-in | Stage 2 | |
| SSO / Microsoft Google login | Stage 3+ | |
| Mobile native apps | Stage 4+ | Responsive web first |
| White-label / custom branding beyond logo | Stage 3 | |

---

## 4. Screens Checklist (Demo 1)

### Public
- [ ] Login
- [ ] Register company
- [ ] Forgot password / reset password

### Dashboard
- [ ] Home dashboard (summary cards + quick links)

### Employees
- [ ] Employee directory
- [ ] Add employee
- [ ] Employee profile (view / edit tabs: details, leave, documents)
- [ ] Team / org list view

### Leave
- [ ] Request leave (employee)
- [ ] My leave history & balance
- [ ] Approval queue (manager / HR)
- [ ] Team calendar

### Documents
- [ ] Document list (by employee or company)
- [ ] Upload document
- [ ] Download document

### Settings
- [ ] Company profile
- [ ] Departments
- [ ] Users & roles

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

**Total: ~8 weeks** to client-ready Demo 1.

Solo developer: plan **12–14 weeks**.

---

## 6. Demo Environment

- **Staging URL** for client (e.g. `demo.hr-platform.com`)
- Pre-seeded demo company: *Acme Ltd* with 8–10 fake employees, 2–3 pending leave requests, sample documents
- Demo accounts:

| Role | Email (example) | Purpose |
|------|-----------------|---------|
| Company admin | admin@acme-demo.com | Full walkthrough |
| HR manager | hr@acme-demo.com | Employee + document management |
| Manager | manager@acme-demo.com | Leave approval |
| Employee | employee@acme-demo.com | Self-service leave |

*(Passwords shared securely outside this document.)*

---

## 7. Success Criteria — Demo 1 Sign-off

The client approves moving to Stage 2 when all of the following are true:

1. Company can register and only see its own data
2. Admin can add employees and assign roles
3. Employee can request leave; manager can approve; balance updates correctly
4. HR can upload and download a document on an employee record
5. UI is clean and usable on desktop and tablet
6. No critical bugs in the demo walkthrough path (Section 1)
7. Client confirms Demo 1 scope matches what was agreed (Section 2 vs Section 3)

---

## 8. After Demo 1 — Stage Preview (for client conversation)

Brief teaser only; detailed plans will be separate documents.

| Stage | Focus | Indicative duration |
|-------|-------|---------------------|
| **Stage 2 — Operations** | Attendance, timesheets, expenses, notifications, billing | 6–8 weeks |
| **Stage 3 — Scheduling & Payroll** | Rotas, payroll export, integrations | 6–8 weeks |
| **Stage 4 — Growth** | Reporting, performance, recruitment, LMS | Ongoing |

Full roadmap: [hr-saas-mern-project-plan.md](./hr-saas-mern-project-plan.md)

---

## 9. Assumptions & Client Dependencies

| Item | Owner | Needed by |
|------|-------|-----------|
| Brand name, logo (optional for Demo 1) | Client | Week 7 |
| Leave policy defaults (days per year, types) | Client | Week 5 |
| Sample document types / categories | Client | Week 6 |
| Staging domain or subdomain | Client / Dev | Week 8 |
| Email sender domain (SPF/DKIM) for notifications | Client | Week 5 |
| Feedback within 3 business days after demo | Client | Post-demo |

---

## 10. Risks & Mitigations (Demo 1)

| Risk | Mitigation |
|------|------------|
| Leave rules more complex than expected | Demo 1 uses fixed entitlement; document Stage 2 for accrual |
| Scope creep during demo prep | This document is the contract; changes go to a change log |
| Tenant data leak | Mandatory tenant middleware + code review on every query |
| Demo feels “empty” | Seed realistic Acme Ltd data; polish dashboard counts |

---

**Next step:** Create detailed module plans in [modules/](./modules/) for each Demo 1 module before development starts.
