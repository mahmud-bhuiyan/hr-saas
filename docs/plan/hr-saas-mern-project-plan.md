# HR SaaS Platform — Full Project Plan (MERN, Monorepo)

Target: multi-tenant HR software for companies of 5–1,000 employees, similar in scope to BrightHR/Breathe/CharlieHR.
Stack: **MongoDB, Express, React, Node.js** in a single monorepo (client + server, shared code).

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client (React SPA)                    │
│  Vite + React + TypeScript + TanStack Query + Zustand     │
└───────────────────────────┬────────────────────────────-─┘
                             │ REST (JSON) + WebSocket (notifications)
┌───────────────────────────▼────────────────────────────-─┐
│                Server (Node.js + Express)                 │
│  Auth → Tenant middleware → RBAC → Controllers → Services  │
├─────────────────────────────────────────────────────────┤
│  Background jobs: BullMQ + Redis (payroll runs, reminders,│
│  report generation, email/notification dispatch)           │
└───────────────────────────┬────────────────────────────-─┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
          MongoDB          Redis        S3 (docs/files)
       (Atlas cluster)   (cache/queue)   + Stripe (billing)
```

**Multi-tenancy model:** shared database, `tenantId` field on every collection (compound indexes on `{tenantId, ...}`), enforced by a mandatory Express middleware that injects `tenantId` into every query — never trust it from the client. This is the cheapest model to start with; migrate specific large tenants to dedicated DBs later if needed (see Section 8).

**Auth model:** JWT access token (short-lived, 15 min) + refresh token (httpOnly cookie, 7–30 days) + RBAC roles: `super_admin` (you), `company_admin`, `hr_manager`, `manager`, `employee`.

---

## 2. Project Structure

Flat layout — **no `apps/` folder**. Client and server live at the repo root with their own `node_modules`:

```
hr-saas/
├── client/                     # React app (Vite)
│   ├── src/
│   │   ├── modules/            # one folder per business module
│   │   │   ├── auth/
│   │   │   ├── employees/
│   │   │   ├── leave/
│   │   │   └── ...
│   │   ├── components/         # shared UI components
│   │   ├── hooks/
│   │   ├── lib/                # api client, query client
│   │   └── routes/
│   ├── tests/
│   └── package.json
├── server/                     # Express API
│   ├── src/
│   │   ├── types/              # Server-only types
│   │   ├── utils/              # Server-only helpers
│   │   ├── modules/
│   │   ├── middleware/
│   │   ├── app.ts
│   │   └── index.ts
│   ├── tests/
│   ├── .env                    # Server env (never commit)
│   ├── .env.example
│   └── package.json
├── client/                     # React app (Vite)
│   ├── src/
│   │   ├── types/              # Client-only types (keep in sync with server)
│   │   ├── utils/
│   │   ├── modules/
│   │   └── ...
│   ├── tests/
│   ├── .env                    # Client env — VITE_API_URL only
│   ├── .env.example
│   └── package.json
├── docs/                       # API registry + project plans (docs/plan/)
└── docker-compose.yml          # mongo, redis (used by server)
```

Client and server deploy to **separate hosts**. No shared code folder.

Each **module = a vertical slice**: routes, controller, service, model, validation on the server; a matching folder on the client. This keeps modules genuinely decoupled so you can build/ship them incrementally, which matters a lot for a solo/small-team build.

---

## 3. Core Cross-Cutting Systems (build these before any business module)

These aren't "modules" a user sees, but everything depends on them — build first.

### 3.1 Auth & Tenant Management
- **Models:** `Tenant` (company), `User` (belongs to tenant, has role)
- **Endpoints:** `/auth/register` (creates tenant + first admin), `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/forgot-password`
- **Middleware chain (critical, applied to every protected route):**
  1. `authenticate` — verify JWT, attach `req.user`
  2. `resolveTenant` — attach `req.tenantId` from `req.user.tenantId`
  3. `authorize(roles)` — checks role permits this route
  4. All Mongoose queries in services must include `tenantId: req.tenantId` — enforce via a Mongoose plugin that auto-injects it, so no developer can forget it

### 3.2 RBAC (Role-Based Access Control)
- Define permissions as a matrix, not hardcoded per-route checks:
  ```js
  const PERMISSIONS = {
    employee: ['leave:create:own', 'leave:read:own', 'profile:update:own'],
    manager: ['leave:approve:team', 'rota:edit:team', 'timesheet:read:team'],
    hr_manager: ['employee:create', 'employee:delete', 'document:manage'],
    company_admin: ['*']
  };
  ```
- Store this as a shared package (`packages/shared-utils/permissions.js`) so client can hide UI elements the user can't use, and server enforces the real check.

### 3.3 Audit Logging (GDPR requirement, not optional)
- `AuditLog` collection: `{tenantId, userId, action, entityType, entityId, before, after, ip, timestamp}`
- Middleware-level hook that logs every create/update/delete on sensitive collections (Employee, Document, Payroll)
- This becomes your ROPA (Record of Processing Activities) evidence and SAR (Subject Access Request) response source

### 3.4 Notification System
- In-app notifications (Mongo collection + WebSocket push via Socket.io) + email (via SendGrid/Postmark) + optional SMS (Twilio) for shift reminders
- Queue via BullMQ so notification sending never blocks the request/response cycle

### 3.5 File Storage
- All documents/receipts/avatars go to S3 (or S3-compatible, e.g. Cloudflare R2 to save cost) — never store binary in MongoDB
- Store only `{key, url, mimeType, size, uploadedBy}` in Mongo

### 3.6 Billing/Subscription (needed even for MVP if you're charging per-seat)
- Stripe subscriptions, one subscription per tenant, metered by active employee count (webhook on employee create/deactivate to update Stripe quantity)

---

## 4. Business Modules — Detailed Breakdown

Each module below has: purpose, core schema, key endpoints, key screens, and recommended build phase.

### Module 1 — Employee Management (Core HR Record)
**Phase 1 (MVP foundation — build first, everything else references this)**

- **Schema (`Employee`):**
  ```js
  {
    tenantId, userId, employeeNumber,
    personalDetails: { firstName, lastName, dob, phone, address, emergencyContact },
    employment: { jobTitle, department, startDate, endDate, employmentType, salary, manager: ObjectId },
    status: 'active' | 'on_leave' | 'terminated',
    documents: [ObjectId ref Document],
    createdAt, updatedAt
  }
  ```
- **Endpoints:** CRUD `/employees`, `/employees/:id/org-chart`, `/employees/bulk-import` (CSV)
- **Screens:** Employee directory (list/search/filter), profile view/edit, org chart view, bulk CSV import wizard
- **Notes:** Design this schema carefully up front — leave, attendance, payroll, and documents all foreign-key into it. Getting this wrong is the most expensive mistake to fix later.

### Module 2 — Leave & Absence Management
**Phase 1** — this is the highest-engagement feature; prioritize it right after employee records.

- **Schema (`LeaveRequest`):**
  ```js
  { tenantId, employeeId, type: 'annual'|'sick'|'unpaid'|'other',
    startDate, endDate, halfDay, reason, status: 'pending'|'approved'|'declined',
    approverId, approvedAt, attachments: [ObjectId] }
  ```
- **Schema (`LeaveBalance`):** `{tenantId, employeeId, year, entitlement, taken, pending, carriedOver}`
- **Key logic to design carefully:**
  - **Accrual engine** — pro-rata entitlement calculation for mid-year starters, part-time workers (fraction of full-time equivalent)
  - **Clash detection** — query overlapping approved/pending leave in same team/department, flag before approval
  - **Approval workflow** — supports single approver or escalation (manager → HR) — model this as a state machine, not just a status enum, if you want multi-step approval later
- **Endpoints:** `/leave/requests` (CRUD), `/leave/requests/:id/approve`, `/leave/balances/:employeeId`, `/leave/calendar` (team view)
- **Screens:** Request form, manager approval queue, team calendar (visual clash view), balance summary

### Module 3 — Attendance / Clock-in-out
**Phase 1**

- **Schema (`AttendanceLog`):** `{tenantId, employeeId, clockIn, clockOut, location: {lat, lng}, method: 'app'|'web'|'kiosk', breaks: [{start, end}]}`
- **Endpoints:** `/attendance/clock-in`, `/attendance/clock-out`, `/attendance/:employeeId/history`
- **Screens:** Big clock-in/out button (mobile-first), live "who's in" dashboard for managers, history/edit for corrections
- **Notes:** GPS capture is a GDPR-sensitive field — get explicit consent/policy notice on first use, and make it configurable per tenant (some businesses won't want location tracking).

### Module 4 — Shifts & Rota Scheduling
**Phase 2** — most complex module; budget the most build time here.

- **Schema (`Shift`):** `{tenantId, employeeId (nullable for "open shift"), date, startTime, endTime, role, locationId, status: 'draft'|'published'|'open'}`
- **Schema (`RotaTemplate`):** for recurring weekly patterns
- **Key logic:**
  - Conflict detection (double-booking, or shift overlapping approved leave)
  - Open-shift claiming flow (employee self-selects an unassigned shift, manager approves)
  - Copy-week / recurring pattern generation
- **Endpoints:** `/rotas/:weekOf`, `/rotas/shifts`, `/rotas/shifts/:id/claim`, `/rotas/publish`
- **Screens:** Drag-and-drop weekly grid (this is a genuinely hard UI — budget extra time; consider a library like `react-big-calendar` or build custom with `dnd-kit`), employee shift view, open-shifts board

### Module 5 — Document Storage
**Phase 1**

- **Schema (`Document`):** `{tenantId, employeeId (nullable = company-wide), category, fileKey, fileName, uploadedBy, expiryDate (nullable), visibility}`
- **Endpoints:** `/documents` (upload via S3 presigned URL), `/documents/:id/download`, `/documents/expiring` (for right-to-work/certification expiry reminders)
- **Screens:** Folder/category browser, upload modal, expiry alert dashboard

### Module 6 — Timesheets & Overtime
**Phase 2**

- **Schema (`Timesheet`):** derived/aggregated from `AttendanceLog` + manual entries, `{tenantId, employeeId, weekOf, entries: [...], totalHours, overtimeHours, status: 'draft'|'submitted'|'approved'}`
- **Endpoints:** `/timesheets/:employeeId/:weekOf`, `/timesheets/:id/submit`, `/timesheets/:id/approve`
- **Screens:** Weekly timesheet grid, manager approval queue, overtime report

### Module 7 — Expense Tracking
**Phase 2**

- **Schema (`Expense`):** `{tenantId, employeeId, category, amount, currency, date, receiptFileKey, status: 'pending'|'approved'|'reimbursed'}`
- **Endpoints:** `/expenses` (CRUD), `/expenses/:id/approve`, `/expenses/export` (CSV for finance)
- **Screens:** Submit expense (receipt photo upload — consider OCR later as a nice-to-have), approval queue, export to accounting

### Module 8 — Payroll
**Phase 2/3 — integrate, don't build the compliance engine yourself**

- **Recommendation:** don't build UK tax/NI/pension calculation logic from scratch — it's a regulated sub-domain (HMRC RTI submissions, auto-enrolment rules) that changes every tax year. Instead:
  - Build a **payroll data export** module: aggregates hours (from Timesheets), approved expenses, and employee pay rates into a structured export
  - Integrate via API with **Xero, QuickBooks, or a payroll-specific API** (e.g. PayFit, Gusto if applicable to your market) rather than calculating net pay yourself
  - If you must build native payroll eventually, treat it as a separate, heavily-tested service with its own compliance officer/review — this is the single highest-liability module in the whole product
- **Schema (`PayrollExport`):** `{tenantId, periodStart, periodEnd, employeeSummaries: [...], status, exportedAt}`
- **Endpoints:** `/payroll/periods/:id/generate`, `/payroll/periods/:id/export`

### Module 9 — Performance Management
**Phase 3**

- **Schema (`Review`):** `{tenantId, employeeId, reviewerId, cycle, ratings: [...], goals: [...], status}`
- **Schema (`Goal`):** `{tenantId, employeeId, title, description, dueDate, status, progress}`
- **Endpoints:** `/reviews`, `/goals`
- **Screens:** Review cycle dashboard, 1:1 notes, goal tracker

### Module 10 — Recruitment / ATS
**Phase 3**

- **Schema (`JobPosting`):**, **Schema (`Candidate`):** `{tenantId, jobId, name, email, resumeFileKey, stage: 'applied'|'screening'|'interview'|'offer'|'hired'|'rejected'}`
- **Endpoints:** `/jobs`, `/candidates`, `/candidates/:id/stage`
- **Screens:** Kanban-style pipeline board, job posting form, candidate profile

### Module 11 — E-Learning / LMS
**Phase 3 (lower priority — often the first thing to cut from MVP)**

- **Schema (`Course`):**, **Schema (`Enrollment`):** `{tenantId, employeeId, courseId, progress, completedAt, certificateFileKey}`
- **Endpoints:** `/courses`, `/enrollments`
- **Screens:** Course library, progress tracker, admin course builder (or just link to external content initially)

### Module 12 — Employee Recognition
**Phase 3 — nice engagement feature, cheap to build**

- **Schema (`Recognition`):** `{tenantId, fromEmployeeId, toEmployeeId, message, badge, visibility, createdAt}`
- **Endpoints:** `/recognition` (CRUD), `/recognition/feed`
- **Screens:** Company feed, "give recognition" modal, leaderboard (optional, be careful this doesn't feel gamified/pressuring)

### Module 13 — Reporting & Analytics
**Phase 3 — build incrementally alongside each module rather than as one big deliverable**

- Aggregation-pipeline based reports on top of existing collections: headcount, turnover, absence rate (Bradford Factor calculation), overtime cost, leave liability
- **Endpoints:** `/reports/headcount`, `/reports/absence`, `/reports/bradford-factor`
- **Screens:** Dashboard with charts (use `recharts` on the client), CSV/PDF export
- **Notes:** Precompute expensive aggregations into a nightly job (BullMQ cron) rather than running heavy Mongo aggregations on every dashboard load

### Module 14 — Admin / Settings / Billing
**Phase 1 (thin version) → Phase 2 (full)**

- Company profile, departments/locations setup, role management, Stripe subscription management, branding (logo/colors for white-label feel)
- **Endpoints:** `/settings/company`, `/settings/departments`, `/billing/subscription`, `/billing/webhook` (Stripe)

---

## 5. Recommended Build Roadmap (small team, realistic pacing)

| Phase | Duration (est.) | Scope |
|---|---|---|
| **0. Foundation** | 2–4 weeks | Monorepo setup, auth, tenant middleware, RBAC, CI/CD, base UI shell/design system |
| **1. MVP Core** | 6–8 weeks | Employee Management, Leave & Absence, Attendance, Document Storage, thin Admin/Settings |
| **2. Operational depth** | 6–8 weeks | Shifts & Rotas, Timesheets, Expenses, Payroll export/integration, Notifications |
| **3. Retention features** | 6–8 weeks | Reporting dashboard, Performance Management, Recognition |
| **4. Growth features** | ongoing | Recruitment/ATS, LMS, integrations (Zapier, Slack), mobile app polish |

Total to a genuinely sellable MVP (Phases 0–2): roughly **4–5 months** for a small team (2–3 full-stack devs). Solo builder: expect 2–3x that.

---

## 6. Tech Stack Specifics

| Layer | Choice | Why |
|---|---|---|
| Client build | Vite + React + TypeScript | Fast dev loop, TS catches cross-module schema drift early |
| State/data | TanStack Query (server state) + Zustand (UI state) | Avoids over-using Redux for what's mostly server-cache data |
| UI | Tailwind + shadcn/ui or MUI | Faster to ship consistent design than hand-rolled CSS |
| API | Express + Zod (validation) | Lightweight, huge ecosystem, Zod schemas can be shared client/server |
| DB | MongoDB Atlas + Mongoose | Fits MERN; use compound indexes on `{tenantId, ...}` everywhere |
| Queue/cache | Redis + BullMQ | Background jobs: payroll runs, report precompute, notification dispatch |
| Auth | JWT (access+refresh) via `jsonwebtoken`, bcrypt for passwords | Standard, no need for a third-party auth service unless you want SSO later |
| File storage | S3 or Cloudflare R2 | Never store binaries in Mongo |
| Real-time | Socket.io | In-app notifications, live "who's clocked in" view |
| Payments | Stripe Billing | Per-seat metered subscriptions |
| Testing | Jest + Supertest (server), Vitest + React Testing Library (client), Playwright (E2E) | |
| CI/CD | GitHub Actions → Docker → Railway/Render/AWS ECS | Keep infra simple until you have real scale pressure |
| Monitoring | Sentry (errors) + basic uptime monitor | Non-negotiable before first paying customer |

---

## 7. Data Model Relationships (simplified ER overview)

```
Tenant ──┬── User ──── Employee ──┬── LeaveRequest
         │                        ├── LeaveBalance
         │                        ├── AttendanceLog
         │                        ├── Shift
         │                        ├── Timesheet
         │                        ├── Expense
         │                        ├── Document
         │                        ├── Review / Goal
         │                        └── Recognition (from/to)
         ├── Department
         ├── AuditLog
         └── Subscription (Stripe)
```

Every collection carries `tenantId`; nearly every business collection carries `employeeId`. Index both together.

---

## 8. Scaling & Compliance Notes (revisit as you grow)

- **Start:** single shared MongoDB cluster, `tenantId` scoping, enforced via Mongoose plugin — don't over-engineer this on day one.
- **When to reconsider isolation:** if you land an enterprise client (500+ employees) with contractual data-isolation requirements, migrate *that tenant* to a dedicated database/cluster rather than re-architecting everything.
- **GDPR must-haves before launch, not after:** audit logging (Section 3.3), a working data-export endpoint per employee (Subject Access Request), a data retention/deletion job, and a documented lawful basis per data type you collect.
- **Backups:** MongoDB Atlas automated backups + point-in-time recovery from day one — HR data loss is not an acceptable outage story.

---

## 9. What to build yourself vs. what to buy/integrate

| Build yourself | Integrate/buy |
|---|---|
| Employee records, leave, attendance, rotas, documents, timesheets, expenses, recognition, reporting | Payroll tax calculation, e-signature (use DocuSign/PandaDoc API), SMS (Twilio), email (SendGrid), payments (Stripe), OCR for receipts (Google Vision/AWS Textract) |

This keeps your engineering effort on the modules that actually differentiate you, and avoids you becoming liable for tax-compliance bugs in a domain you're not specialized in.

---

**Next step suggestion:** start with Section 3 (Auth/Tenant/RBAC) and Module 1 (Employee Management) — everything else in the roadmap depends on these being solid before you build anything else on top.
