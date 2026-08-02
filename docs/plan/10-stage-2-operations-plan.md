# HR SaaS — Stage 2 Operations Plan

**Purpose:** Extend the platform from Demo 1 core HR into day-to-day **operations** — attendance, timesheets, expenses, notifications, audit visibility, and per-seat billing — so SMEs can run payroll-adjacent workflows without leaving the product.

**Prerequisite:** Demo 1 sign-off per [00-client-demo-plan.md](./00-client-demo-plan.md) Section 7.

**Target companies:** Same as Demo 1 — SMEs with 5–100 employees.

**Stack:** React + Node.js + MongoDB + Redis (BullMQ) + Stripe — separate `client/` and `server/` apps.

**Implementation tracker:** [STAGE-2-IMPLEMENTATION-STEPS.md](./STAGE-2-IMPLEMENTATION-STEPS.md) · Module details in [modules/](./modules/)

---

## 1. What the Client Will See

A live web app where employees clock in/out, managers see who's working, timesheets roll up from attendance, expenses get approved with receipt uploads, HR can audit sensitive changes, and company admins manage a Stripe subscription tied to active seats.

### Stage 2 narrative (20-minute walkthrough)

| Step | Who | What happens |
|------|-----|--------------|
| 1 | Employee | Logs in → clocks in from attendance page → sees today's session |
| 2 | Manager | Opens live "Who's in" board → sees team clocked in |
| 3 | Employee | At week end → reviews auto-generated timesheet draft → submits |
| 4 | Manager | Approves team timesheet; overtime highlighted when over threshold |
| 5 | Employee | Submits expense claim with receipt photo → status pending |
| 6 | HR manager | Approves expense → exports CSV for finance |
| 7 | Employee | Submits leave → manager approves step 1 → HR approves step 2 (multi-step) |
| 8 | HR manager | Views audit log for recent employee edits and document uploads |
| 9 | HR manager | Receives in-app + email notification; checks notification bell |
| 10 | Company admin | Opens billing settings → views Stripe subscription → seat count matches active employees |
| 11 | HR manager | Bulk-imports new hires via CSV wizard |
| 12 | Company admin | Views headcount and absence summary reports on dashboard |

This flow covers **time → pay data → expenses → compliance → monetization**, building on Demo 1's people and leave foundation.

---

## 2. In Scope — Stage 2

### 2.1 Platform Foundations (S2-1)

- **Audit log:** Record create/update/delete on Employee, HrDocument, User, LeaveRequest; HR/admin viewer UI
- **Notifications:** BullMQ + Redis worker; in-app notification list + bell icon; queued email delivery (extends SendGrid)
- **Forgot password:** Email-based reset flow (`/forgot-password`, `/reset-password`)
- **Employee invite:** Link employee record to login user; invite email with set-password link

### 2.2 Attendance (S2-2)

- Web clock-in / clock-out (one open session per employee)
- Personal attendance history
- Manager live "Who's in" dashboard
- HR correction of missed punches
- Optional GPS capture — **tenant setting, off by default**; consent banner on first use

### 2.3 Timesheets (S2-3)

- Weekly timesheet (Mon–Sun) auto-generated from attendance logs
- Employee submit; manager/HR approval queue
- Overtime highlight when weekly hours exceed tenant threshold (default 40h)
- Manual entry adjustments before submit

### 2.4 Expenses (S2-4)

- Submit expense with category, amount, date, receipt upload (S3)
- Categories: travel, meals, equipment, other
- Manager/HR approval queue
- CSV export for finance

### 2.5 Leave Enhancements (S2-5)

- Pro-rata annual leave accrual from employee start date
- Carry-over rules (tenant-configurable max)
- Multi-step approval: manager → HR
- Document expiry reminder emails (30-day window)

### 2.6 Employee Ops & Reporting (S2-6)

- Bulk CSV employee import (validate → preview → commit)
- Basic reports: headcount, absence summary
- Dashboard charts for reports
- Optional: employee `department` string → `departmentId` FK migration

### 2.7 Stripe Billing (S2-7)

- Per-seat subscription per tenant (Stripe Checkout + Customer Portal)
- Webhook syncs seat count on employee activate/deactivate
- Billing settings UI for company admin
- Super admin sees subscription status on companies page
- Demo/staging tenants: `billingExempt` flag bypasses payment

### 2.8 Roles (Stage 2 additions)

| Role | New capabilities in Stage 2 |
|------|----------------------------|
| **Super admin** | View tenant subscription status; platform unchanged otherwise |
| **Company admin** | Billing management, all HR ops, audit log, reports |
| **HR manager** | Attendance corrections, expense approval, audit log, CSV import, reports |
| **Manager** | Live team attendance, timesheet approval, team expense approval |
| **Employee** | Clock in/out, timesheet submit, expense submit, notifications |

### 2.9 Platform Quality

- Responsive layout (desktop + tablet) for all new screens
- Reuse UI kit in `client/src/components/ui/`
- Loading, empty, and error states on every new list/form
- Audit log for GDPR evidence trail
- Redis required in production for notification queue

---

## 3. Out of Scope — Stage 2 (Later Stages)

| Feature | Planned stage | Notes |
|---------|---------------|-------|
| Shift rota / scheduling | Stage 3 | Drag-and-drop weekly grid |
| Payroll calculation / RTI | Stage 3 | Export to Xero/QuickBooks instead |
| Payroll data export module | Stage 3 | Aggregates timesheets + expenses |
| Advanced reporting (Bradford Factor, turnover) | Stage 4 | Basic headcount/absence only in S2-6 |
| Performance reviews & goals | Stage 4 | |
| Recruitment / ATS | Stage 4 | |
| E-learning / LMS | Stage 4 | |
| Native mobile apps | Stage 4+ | Responsive web clock-in for Stage 2 |
| SSO / Microsoft Google login | Stage 3+ | |
| OCR for receipt scanning | Stage 3+ | Manual receipt upload in Stage 2 |
| SMS notifications | S2-8 optional | Twilio if client wants; otherwise defer |

---

## 4. Screens Checklist (Stage 2)

### Public
- [x] Forgot password (`/forgot-password`)
- [x] Reset password (`/reset-password?token=…`)

### App shell
- [x] Notification bell + dropdown (unread count, mark read)
- [x] Theme toggle (light/dark) — per-user `colorScheme` in DB; `ThemeContext` + localStorage on client

### Attendance
- [x] Clock in/out (`/dashboard/attendance`)
- [x] My attendance history (tab on attendance page)
- [x] Live team board (tab on attendance page) — manager/HR
- [x] HR attendance correction modal

### Timesheets
- [x] My timesheet — weekly grid (`/dashboard/timesheets`)
- [x] Timesheet approval queue — manager/HR (tab)

### Expenses
- [x] Submit expense (`/dashboard/expenses`)
- [x] Expense approval queue — manager/HR (tab)
- [x] Expense CSV export — HR/admin

### Leave (enhancements)
- [x] Multi-step approval indicators on approval queue
- [x] Tenant leave policy settings (accrual, carry-over) — company admin

### Employees
- [x] Employee invite action on profile
- [x] Bulk CSV import wizard on directory page

### Reports
- [x] Headcount report (`/dashboard/reports/headcount`)
- [x] Absence summary (`/dashboard/reports/absence`)

### Settings
- [x] Audit log viewer (`/dashboard/settings/audit-log`) — HR/admin
- [x] Billing & subscription (`/dashboard/settings/billing`) — company admin
- [x] Attendance settings (GPS toggle) — company admin

### Super admin
- [x] Subscription status column on companies list

---

## 5. Timeline Estimate

Assumes **1–2 full-stack developers** working focused hours.

| Week | Step | Focus | Deliverable |
|------|------|-------|-------------|
| **1** | S2-1 | Platform foundations | Audit log, notifications, forgot password, employee invite |
| **2** | S2-2 | Attendance | Clock in/out, history, live board, HR corrections |
| **3** | S2-3 | Timesheets | Weekly grid, auto-generate, submit/approve, overtime |
| **4** | S2-4 | Expenses | Submit with receipt, approval, CSV export |
| **5** | S2-5 | Leave+ | Accrual, carry-over, multi-step approval, doc expiry emails |
| **6** | S2-6 | Import & reports | CSV import, headcount + absence reports |
| **7** | S2-7 | Billing | Stripe checkout, portal, webhooks, billing UI |
| **8** | S2-8 | Polish | Extended seed, staging deploy, bug fixes, sign-off |

**Total: ~8–9 weeks** for Stage 2.

Solo developer: plan **12–14 weeks**.

Steps S2-4, S2-5, S2-6, and S2-7 can overlap after S2-1 completes (S2-3 requires S2-2).

---

## 6. Demo Environment

- Reuse Demo 1 staging URLs (client + server on Vercel or equivalent)
- Extend Acme Ltd demo data manually on staging (attendance, timesheets, expenses, notifications)
- Redis required for notification worker in staging
- Stripe test mode keys for billing walkthrough
- Demo accounts unchanged from Demo 1 (`admin@acme-demo.com`, etc.) — password `User@123`

---

## 7. Success Criteria — Stage 2 Sign-off

The client approves moving to Stage 3 when all of the following are true:

1. Employee can clock in and out; manager sees live team attendance
2. Weekly timesheet auto-generates from attendance; manager can approve
3. Employee can submit an expense with receipt; HR can approve and export CSV
4. Multi-step leave approval works (manager → HR); accrual reflects start date
5. HR can view audit log entries for sensitive changes
6. In-app and email notifications deliver for key events
7. Company admin can subscribe via Stripe; seat count syncs with active employees
8. Bulk CSV import adds employees with validation preview
9. Headcount and absence reports display correctly
10. No critical bugs in the Stage 2 walkthrough path (Section 1)
11. Client confirms Stage 2 scope matches Section 2 vs Section 3

---

## 8. After Stage 2 — Stage Preview

| Stage | Focus | Indicative duration |
|-------|-------|---------------------|
| **Stage 3 — Scheduling & Payroll** | Rotas, payroll export, Xero/QuickBooks integration | 6–8 weeks |
| **Stage 4 — Growth** | Advanced reporting, performance, recruitment, LMS | Ongoing |

Full roadmap: [hr-saas-mern-project-plan.md](./hr-saas-mern-project-plan.md)

---

## 9. Assumptions & Client Dependencies

| Item | Owner | Needed by |
|------|-------|-----------|
| Stripe account (test + live) | Client / Dev | Week 7 (S2-7) |
| Stripe price ID for per-seat plan | Client | Week 7 |
| Redis in production/staging | Dev | Week 1 (S2-1) |
| Email sender domain (SPF/DKIM) | Client | Week 1 |
| Leave accrual policy defaults | Client | Week 5 |
| Overtime threshold (hours/week) | Client | Week 3 |
| GPS tracking preference (on/off) | Client | Week 2 |
| Twilio account (if SMS wanted) | Client | Week 8 (optional) |
| Feedback within 5 business days after Stage 2 demo | Client | Post-demo |

---

## 10. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| GPS consent / GDPR | Off by default; explicit consent UI; document in privacy policy |
| Stripe webhook failures | Idempotent handlers; retry queue; manual reconcile in admin |
| Timesheet disputes | HR correction on attendance; audit log on edits |
| BullMQ worker downtime | Health check; fallback synchronous email for critical events |
| Scope creep into rotas/payroll | This document is the contract; changes go to out-of-plan log |
| CSV import bad data | Two-step validate + preview before commit |

---

## 11. Implementation status (last updated: 2026-08-02)

| Step | Scope | Status |
|------|-------|--------|
| S2-1 | Platform foundations | ✅ Done |
| S2-2 | Attendance | ✅ Done |
| S2-3 | Timesheets | ✅ Done |
| S2-4 | Expenses | ✅ Done |
| S2-5 | Leave enhancements | ✅ Done |
| S2-6 | Import & reporting | ✅ Done |
| S2-7 | Stripe billing | ✅ Done |
| S2-8 | Polish & sign-off | ✅ Done |

**Cross-cutting (Stage 2):** User light/dark theme preference — `colorScheme` on User; `PATCH /auth/me`; header toggle; `ThemeContext` + localStorage cache.

**Next step:** Stage 3 — see [11-stage-3-scheduling-payroll-plan.md](./11-stage-3-scheduling-payroll-plan.md) and [STAGE-3-IMPLEMENTATION-STEPS.md](./STAGE-3-IMPLEMENTATION-STEPS.md).
