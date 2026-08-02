# Stage 3 — Implementation Steps

Check off each step with the client/dev team before moving to the next.

**Prerequisite:** Stage 2 complete — see [STAGE-2-IMPLEMENTATION-STEPS.md](./STAGE-2-IMPLEMENTATION-STEPS.md) Steps S2-1–S2-8.

**Client plan:** [11-stage-3-scheduling-payroll-plan.md](./11-stage-3-scheduling-payroll-plan.md)

| Step | Scope | Status |
|------|-------|--------|
| **S3-1** | Foundations — work locations, employee pay fields, tenant payroll settings, permissions | ✅ Done |
| **S3-2** | Rotas backend — `Shift`, `RotaTemplate`, week CRUD, leave conflict detection | ✅ Done |
| **S3-3** | Rotas UI — weekly grid, publish, employee shift view, open-shift claim | ✅ Done |
| **S3-4** | Payroll export backend — `PayrollPeriod`, aggregate timesheets + expenses + pay rates | ✅ Done |
| **S3-5** | Payroll export UI — generate, preview, CSV download | ✅ Done |
| **S3-6** | Accounting integration — Xero **or** QuickBooks OAuth push (client picks one) | Not started |
| **S3-7** | Cross-module polish — rota/leave clash warnings, optional break deductions | Not started |
| **S3-8** | Stage 3 polish, staging walkthrough, client sign-off | Not started |

---

## Out-of-plan additions (log)

Features added during Stage 3 implementation that extend the original step list. Keep this section updated when scope grows mid-sprint.

| Added | Step | Description |
|-------|------|-------------|
| Open-shift auto-assign on claim | S3-3 | Claim assigns shift immediately (no manager approval queue) |

---

## S3-1 — Done when

- [x] `WorkLocation` model with `{ tenantId, name, address?, timezone?, isArchived }`
- [x] `GET/POST /api/v1/locations`, `PATCH /api/v1/locations/:id` — HR/admin only
- [x] Work locations settings UI at `/dashboard/settings/locations`
- [x] Employee pay fields: `payRate`, `payRateType` (`hourly`|`salary`), `payCurrency`, `fteFactor`, `defaultLocationId`
- [x] Pay fields on employee profile/edit (HR/admin scoped); audit log on pay changes
- [x] Tenant payroll settings: `payPeriodType`, `defaultPayCurrency`, `payrollWeekStartDay`
- [x] `GET/PATCH /api/v1/settings/payroll` — company_admin
- [x] Payroll settings UI at `/dashboard/settings/payroll`
- [x] Permissions scaffold: `location:*`, `rota:*`, `payroll:*` in server + client
- [x] Audit log writes on location create/update/archive
- [x] `docs/openapi.yaml` and Postman collection updated

**Review:** Test location CRUD, employee pay PATCH, and payroll settings before S3-2.

**Module plans:** [08-rotas.md](./modules/08-rotas.md) (WorkLocation section), [11-payroll.md](./modules/11-payroll.md) (settings section), [02-employees.md](./modules/02-employees.md) (Stage 3 pay fields)

---

## S3-2 — Done when

- [x] `Shift` model with `{ tenantId, employeeId?, date, startTime, endTime, role?, locationId, status, publishedAt?, claimedBy? }`
- [x] `RotaTemplate` model for recurring weekly patterns
- [x] `GET /api/v1/rotas/:weekOf` — shifts for week
- [x] `POST /api/v1/rotas/shifts`, `PATCH /api/v1/rotas/shifts/:id`, `DELETE /api/v1/rotas/shifts/:id`
- [x] `POST /api/v1/rotas/publish` — publish draft shifts for a week
- [x] Leave conflict detection — block shift overlapping approved leave
- [x] Double-booking prevention for same employee
- [x] Audit log on shift create/update/delete/publish
- [x] `docs/openapi.yaml` and Postman collection updated

**Review:** Test shift CRUD and conflict rules via API before S3-3.

**Module plan:** [08-rotas.md](./modules/08-rotas.md)

---

## S3-3 — Done when

- [x] Rota page `/dashboard/rotas` — weekly grid (table-based v1)
- [x] HR/manager: create, edit, delete shifts; assign employees; select location
- [x] Publish week action with confirmation
- [x] Employee tab: my shifts for selected week
- [x] Open shifts board — employees claim unassigned shifts; manager approval optional
- [x] Copy previous week action
- [x] Leave conflict warnings shown in UI
- [x] Notifications: shift published, open shift available, shift claimed
- [x] Nav link in app shell for authorized roles
- [x] `docs/openapi.yaml` and Postman collection updated (claim + copy-week endpoints)

**Review:** Test full rota walkthrough before S3-4.

**Module plan:** [08-rotas.md](./modules/08-rotas.md)

---

## S3-4 — Done when

- [x] `PayrollPeriod` model with `{ tenantId, periodStart, periodEnd, status, employeeSummaries[], generatedAt, exportedAt, exportedBy }`
- [x] `GET/POST /api/v1/payroll/periods` — list and create period
- [x] `GET /api/v1/payroll/periods/:id` — period detail with summaries
- [x] `POST /api/v1/payroll/periods/:id/generate` — aggregate approved timesheets + expenses + pay rates
- [x] Aggregation rules: only `approved` timesheets; only `approved`|`reimbursed` expenses
- [x] Hourly gross = `(regularHours + overtimeHours) × payRate`; salary = pro-rata period amount (no tax)
- [x] Audit log on create and generate (export audit in S3-5)
- [x] `docs/openapi.yaml` and Postman collection updated

**Review:** Verify aggregation math with sample data before S3-5.

**Module plan:** [11-payroll.md](./modules/11-payroll.md)

---

## S3-5 — Done when

- [x] Payroll page `/dashboard/payroll` — list periods
- [x] Create period form (date range aligned to tenant pay period type)
- [x] Generate action with preview of employee summaries
- [x] CSV export download (`GET /api/v1/payroll/periods/:id/export`)
- [x] Period status indicators: draft → generated → exported
- [x] HR/admin only access
- [x] `docs/openapi.yaml` and Postman collection updated

**Review:** Test CSV export with finance-friendly column layout before S3-6.

**Module plan:** [11-payroll.md](./modules/11-payroll.md)

---

## S3-6 — Done when

- [ ] Client selects **Xero** or **QuickBooks** (document choice in out-of-plan log)
- [ ] OAuth connect flow for chosen provider
- [ ] `POST /api/v1/payroll/periods/:id/sync` — push export to accounting system
- [ ] Connection status in payroll settings
- [ ] Env vars documented in README and `.env.example`
- [ ] `docs/openapi.yaml` and Postman collection updated

**Review:** Test OAuth + sync in provider sandbox before S3-7.

**Module plan:** [11-payroll.md](./modules/11-payroll.md) (integration section)

---

## S3-7 — Done when

- [ ] Rota/leave clash warnings on shift create and leave approval
- [ ] Optional break deductions on timesheets (if client wants — else defer)
- [ ] Employee `fteFactor` used in leave accrual (if not already)
- [ ] Bug fixes from internal walkthrough

**Review:** Cross-module regression before S3-8.

---

## S3-8 — Done when

- [ ] Staging walkthrough path verified (Section 1 of client plan)
- [ ] Bug fixes on Stage 3 demo path
- [ ] Plan docs and README status tables updated
- [ ] Client sign-off per [11-stage-3-scheduling-payroll-plan.md](./11-stage-3-scheduling-payroll-plan.md) Section 7

**Review:** Stage 3 client demo sign-off.

---

## Dependency order

```
S3-1 (foundations)
  ├── S3-2 (rotas backend) → S3-3 (rotas UI)
  └── S3-4 (payroll backend) → S3-5 (payroll UI) → S3-6 (accounting integration)
        └── S3-7 (cross-module polish) → S3-8 (sign-off)
```

S3-2 and S3-4 can run in parallel after S3-1. S3-3 requires S3-2. S3-5 requires S3-4. S3-6 requires S3-5.
