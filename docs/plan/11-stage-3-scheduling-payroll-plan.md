# HR SaaS — Stage 3 Scheduling & Payroll Plan

**Purpose:** Add shift scheduling (rotas) and payroll data export so SMEs can plan work, publish shifts to staff, and hand off pay-ready data to finance or accounting software — without building tax/RTI calculation in-house.

**Prerequisite:** Stage 2 sign-off per [10-stage-2-operations-plan.md](./10-stage-2-operations-plan.md) Section 7.

**Target companies:** Same as Demo 1 / Stage 2 — SMEs with 5–100 employees.

**Stack:** React + Node.js + MongoDB + Redis (BullMQ) — separate `client/` and `server/` apps.

**Implementation tracker:** [STAGE-3-IMPLEMENTATION-STEPS.md](./STAGE-3-IMPLEMENTATION-STEPS.md) · Module details in [modules/](./modules/)

---

## 1. What the Client Will See

HR sets up work locations and employee pay rates, builds a weekly rota, publishes shifts to staff, and generates a payroll period that aggregates approved timesheets and expenses into a CSV (or syncs to Xero/QuickBooks).

### Stage 3 narrative (20-minute walkthrough)

| Step | Who | What happens |
|------|-----|--------------|
| 1 | HR manager | Creates work locations (Main Office, Warehouse) in settings |
| 2 | HR manager | Sets employee pay rate and type on profile (hourly or salary) |
| 3 | HR manager | Configures payroll settings — pay period type, currency, week start |
| 4 | HR manager | Opens rota grid → assigns shifts for the week → publishes |
| 5 | Employee | Views my shifts for the week on rota page |
| 6 | Employee | Claims an open shift; manager sees claim |
| 7 | HR manager | Creates payroll period → generates from approved timesheets + expenses |
| 8 | HR manager | Previews employee summaries → downloads CSV for finance |
| 9 | Company admin | (Optional) Connects Xero → syncs payroll period |

This flow covers **scheduling → staff visibility → payroll handoff**, building on Stage 2 time and expense data.

---

## 2. In Scope — Stage 3

### 2.1 Foundations (S3-1)

- Work locations CRUD (tenant-scoped sites for shifts)
- Employee pay metadata: rate, type (hourly/salary), currency, FTE factor, default location
- Tenant payroll settings: pay period type, default currency, payroll week start day
- Permissions scaffold for locations, rotas, payroll

### 2.2 Shifts & Rotas (S3-2, S3-3)

- Weekly shift grid — create, edit, delete, assign employees
- Shift statuses: draft, published, open (unassigned, claimable)
- Publish week; copy previous week
- Leave conflict detection when scheduling
- Employee shift view; open-shift claim flow
- Notifications on publish and claim

### 2.3 Payroll Export (S3-4, S3-5)

- Payroll periods with date range
- Generate from approved timesheets + approved/reimbursed expenses + employee pay rates
- Employee summary lines: regular hours, overtime, expenses, gross estimate
- CSV export for finance — **no tax, NI, pension, or RTI calculation**
- Salary employees: pro-rata period amount stub

### 2.4 Accounting Integration (S3-6)

- **One** of Xero or QuickBooks (client choice) — OAuth connect + push payroll export
- Connection status in payroll settings

### 2.5 Cross-Module Polish (S3-7)

- Rota/leave clash warnings
- Optional break deductions on timesheets (client decision)

### 2.6 Roles (Stage 3 additions)

| Role | New capabilities in Stage 3 |
|------|------------------------------|
| **Company admin** | Payroll settings, payroll export, rota management, locations |
| **HR manager** | Locations, rota, pay fields on employees, payroll generate/export |
| **Manager** | Team rota edit, approve shift claims (if enabled) |
| **Employee** | View own shifts, claim open shifts |

---

## 3. Out of Scope — Stage 3 (Later Stages)

| Feature | Planned stage | Notes |
|---------|---------------|-------|
| Native payroll / tax / RTI calculation | Never (integrate) | Export only — liability too high |
| Advanced reporting (Bradford, turnover) | Stage 4 | S2-6 thin slice exists |
| Performance reviews & goals | Stage 4 | |
| Recruitment / ATS | Stage 4 | |
| E-learning / LMS | Stage 4 | |
| SSO / Microsoft Google login | Stage 3+ | |
| Receipt OCR | Stage 3+ deferred | Manual upload in Stage 2 |
| Native mobile apps | Stage 4+ | Responsive web |
| Full drag-and-drop rota (v1 = table grid) | S3-3 v1 | Enhance in Stage 4 if needed |

---

## 4. Screens Checklist (Stage 3)

### Settings
- [x] Work locations (`/dashboard/settings/locations`) — HR/admin
- [x] Payroll settings (`/dashboard/settings/payroll`) — company admin

### Employees
- [x] Pay rate section on employee profile (HR/admin)

### Rotas
- [ ] Weekly rota grid (`/dashboard/rotas`) — HR/manager
- [ ] My shifts tab — employee
- [ ] Open shifts / claim flow

### Payroll
- [ ] Payroll periods list (`/dashboard/payroll`)
- [ ] Create period + generate preview
- [ ] CSV export download
- [ ] Accounting connection (Xero or QuickBooks) — company admin

---

## 5. Timeline Estimate

Assumes **1–2 full-stack developers** working focused hours.

| Week | Step | Focus | Deliverable |
|------|------|-------|-------------|
| **1** | S3-1 | Foundations | Locations, pay fields, payroll settings |
| **2** | S3-2 | Rotas backend | Shift model, week API, conflict detection |
| **3** | S3-3 | Rotas UI | Weekly grid, publish, employee view, open shifts |
| **4** | S3-4 | Payroll backend | PayrollPeriod, aggregation |
| **5** | S3-5 | Payroll UI | Generate, preview, CSV export |
| **6** | S3-6 | Accounting integration | Xero or QuickBooks OAuth + sync |
| **7** | S3-7 | Polish | Clash warnings, bug fixes |
| **8** | S3-8 | Sign-off | Staging walkthrough, client approval |

**Total: ~6–8 weeks** for Stage 3.

Solo developer: plan **10–12 weeks**.

S3-2 and S3-4 can overlap after S3-1. S3-3 requires S3-2. S3-6 requires S3-5.

---

## 6. Demo Environment

- Reuse Stage 2 staging URLs
- Manual demo data: locations, pay rates on employees, sample shifts, one payroll period
- Xero/QuickBooks sandbox credentials for integration walkthrough
- Demo accounts unchanged from Stage 2

---

## 7. Success Criteria — Stage 3 Sign-off

The client approves moving to Stage 4 when all of the following are true:

1. HR can create work locations and set employee pay rates
2. HR can build and publish a weekly rota; employees see their shifts
3. Employee can claim an open shift (if published as open)
4. Leave conflicts are detected when scheduling overlapping shifts
5. HR can generate a payroll period from approved timesheets and expenses
6. CSV export contains correct hours, expenses, and gross estimates
7. (If in scope) Accounting sync pushes data to Xero or QuickBooks sandbox
8. No critical bugs in the Stage 3 walkthrough path (Section 1)
9. Client confirms Stage 3 scope matches Section 2 vs Section 3

---

## 8. After Stage 3 — Stage Preview

| Stage | Focus | Indicative duration |
|-------|-------|---------------------|
| **Stage 4 — Growth** | Advanced reporting, performance, recruitment, LMS | Ongoing |

Full roadmap: [hr-saas-mern-project-plan.md](./hr-saas-mern-project-plan.md)

---

## 9. Assumptions & Client Dependencies

| Item | Owner | Needed by |
|------|-------|-----------|
| Default pay currency (e.g. GBP) | Client | S3-1 |
| Pay period type (weekly/biweekly/monthly) | Client | S3-1 |
| Payroll week start day | Client | S3-1 |
| Xero **or** QuickBooks choice for S3-6 | Client | S3-6 |
| Sandbox OAuth app credentials | Client / Dev | S3-6 |
| Sample pay rates for demo employees | Dev | S3-8 |
| Feedback within 5 business days after Stage 3 demo | Client | Post-demo |

---

## 10. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Scope creep into tax calculation | Export-only contract; integrate with Xero/QB |
| Rota UI complexity | Table-based v1; defer full drag-drop |
| Wrong payroll totals | Preview before export; audit log on generate |
| OAuth integration delays | CSV export ships in S3-5; sync is additive in S3-6 |
| Leave/rota conflicts missed | Server-side validation + UI warnings |

---

## 11. Implementation status (last updated: 2026-08-02)

| Step | Scope | Status |
|------|-------|--------|
| S3-1 | Foundations | ✅ Done |
| S3-2 | Rotas backend | ✅ Done |
| S3-3 | Rotas UI | Not started |
| S3-4 | Payroll export backend | Not started |
| S3-5 | Payroll export UI | Not started |
| S3-6 | Accounting integration | Not started |
| S3-7 | Cross-module polish | Not started |
| S3-8 | Sign-off | Not started |

**Next step:** S3-3 — rotas UI. See [STAGE-3-IMPLEMENTATION-STEPS.md](./STAGE-3-IMPLEMENTATION-STEPS.md).
