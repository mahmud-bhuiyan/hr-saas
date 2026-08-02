# Stage 2 — Implementation Steps

Check off each step with the client/dev team before moving to the next.

**Prerequisite:** Demo 1 complete — see [IMPLEMENTATION-STEPS.md](./IMPLEMENTATION-STEPS.md) Steps 1–8.

**Client plan:** [10-stage-2-operations-plan.md](./10-stage-2-operations-plan.md)

| Step | Scope | Status |
|------|-------|--------|
| **S2-1** | Platform foundations — audit log, notifications, forgot password, employee invite | ✅ Done |
| **S2-2** | Attendance — clock in/out, history, live board, HR corrections | ✅ Done |
| **S2-3** | Timesheets — weekly grid, auto-generate, submit/approve, overtime | ✅ Done |
| **S2-4** | Expenses — submit with receipt, approval, CSV export | ⬜ Not started |
| **S2-5** | Leave enhancements — accrual, carry-over, multi-step approval, doc expiry emails | ⬜ Not started |
| **S2-6** | Employee ops & reporting — CSV import, headcount + absence reports | ⬜ Not started |
| **S2-7** | Stripe billing — checkout, portal, webhooks, seat metering | ⬜ Not started |
| **S2-8** | Stage 2 polish — extended seed, deploy, bug fixes, sign-off | ⬜ Not started |

---

## Out-of-plan additions (log)

Features added during Stage 2 implementation that extend the original step list. Keep this section updated when scope grows mid-sprint.

| Added | Step | Description |
|-------|------|-------------|
| *(none yet)* | | |

---

## S2-1 — Done when

- [x] `AuditLog` model with `{ tenantId, userId, action, entityType, entityId, before, after, ip, timestamp }`
- [x] Audit writes on Employee, HrDocument, User, and LeaveRequest create/update/delete
- [x] `GET /api/v1/audit-logs` with filters (entityType, date range) — HR/admin only
- [x] Audit log UI at `/dashboard/settings/audit-log`
- [x] `Notification` model with `{ tenantId, userId, type, title, body, readAt, metadata }`
- [x] BullMQ + Redis worker (`npm run worker`); email jobs queued via worker
- [x] `GET /api/v1/notifications`, `PATCH /api/v1/notifications/:id/read`, `POST /api/v1/notifications/read-all`
- [x] Notification bell in app shell with unread count
- [x] `POST /api/v1/auth/forgot-password` sends reset email with expiring token
- [x] `POST /api/v1/auth/reset-password` validates token and sets new password
- [x] Forgot password page (`/forgot-password`) and reset page (`/reset-password`)
- [x] Employee invite: `POST /api/v1/employees/:id/invite` creates/links User and sends invite email
- [x] Invite UI on employee profile page
- [x] New permissions in server + client: `audit:read`, `notification:read:own`
- [x] `docs/openapi.yaml` and Postman collection updated

**Review:** Test audit trail, notification delivery, password reset, and invite flow before S2-2.

**Module plans:** [16-audit-log.md](./modules/16-audit-log.md), [07-notifications.md](./modules/07-notifications.md), [01-auth-tenant.md](./modules/01-auth-tenant.md) (Stage 2 section)

---

## S2-2 — Done when

- [x] `AttendanceLog` model (`clockIn`, `clockOut`, `method`, optional `location`, `employeeId`)
- [x] `POST /api/v1/attendance/clock-in`, `POST /api/v1/attendance/clock-out`
- [x] `GET /api/v1/attendance/me` (history with pagination)
- [x] `GET /api/v1/attendance/team/live` — currently clocked-in employees (manager/HR)
- [x] `PATCH /api/v1/attendance/:id` — HR correction of missed punches
- [x] One open session per employee enforced (409 if already clocked in)
- [x] Tenant setting `attendanceGpsEnabled` (default false); consent banner when enabled
- [x] Attendance page `/dashboard/attendance` with clock button + history
- [x] Live team board tab on attendance page for manager/HR
- [x] HR correction modal
- [x] Attendance mutations write to audit log
- [x] Permissions: `attendance:clock:own`, `attendance:read:team`, `attendance:manage`
- [x] `docs/openapi.yaml` and Postman collection updated

**Review:** Test clock-in/out cycle and manager live board before S2-3.

**Module plan:** [06-attendance.md](./modules/06-attendance.md)

---

## S2-3 — Done when

- [x] `Timesheet` model (weekly `weekOf`, `entries[]`, `totalHours`, `overtimeHours`, `status`)
- [x] `POST /api/v1/timesheets/generate` — build draft from `AttendanceLog` for Mon–Sun week
- [x] `GET /api/v1/timesheets/me`, `GET /api/v1/timesheets` (approval queue)
- [x] `PATCH /api/v1/timesheets/:id` — manual entry adjustments (draft only)
- [x] `POST /api/v1/timesheets/:id/submit`, `POST /api/v1/timesheets/:id/approve`, `POST /api/v1/timesheets/:id/decline`
- [x] Overtime calculated when `totalHours > tenant.overtimeThreshold` (default 40)
- [x] Timesheet page `/dashboard/timesheets` with weekly grid
- [x] Approval queue tab for manager/HR
- [x] Notification on submit and approve/decline
- [x] Permissions: `timesheet:read:own`, `timesheet:submit:own`, `timesheet:approve:team`, `timesheet:approve`
- [x] `docs/openapi.yaml` and Postman collection updated

**Review:** Test generate → edit → submit → approve flow before S2-4.

**Module plan:** [09-timesheets.md](./modules/09-timesheets.md)

---

## S2-4 — Done when

- [ ] `Expense` model (`category`, `amount`, `currency`, `date`, `receiptFileKey`, `status`, `employeeId`)
- [ ] Categories: `travel`, `meals`, `equipment`, `other`
- [ ] Presigned receipt upload (reuse S3 pattern from documents module)
- [ ] `GET /api/v1/expenses`, `POST /api/v1/expenses`, `GET /api/v1/expenses/:id`, `PATCH /api/v1/expenses/:id`
- [ ] `POST /api/v1/expenses/:id/approve`, `POST /api/v1/expenses/:id/decline`
- [ ] `GET /api/v1/expenses/export` — CSV for finance (HR/admin)
- [ ] Expenses page `/dashboard/expenses` with submit form + receipt upload
- [ ] Approval queue tab for manager/HR
- [ ] Notification on submit and approve/decline
- [ ] Permissions: `expense:create:own`, `expense:read:own`, `expense:approve:team`, `expense:approve`, `expense:export`
- [ ] `docs/openapi.yaml` and Postman collection updated

**Review:** Test expense submit with receipt and CSV export before S2-5.

**Module plan:** [10-expenses.md](./modules/10-expenses.md)

---

## S2-5 — Done when

- [ ] Tenant leave settings: `annualEntitlement`, `maxCarryOverDays`, `multiStepApprovalEnabled`
- [ ] Pro-rata accrual: entitlement prorated from employee `startDate` within calendar year
- [ ] Carry-over: apply unused annual leave up to `maxCarryOverDays` on year boundary (job or on-demand)
- [ ] Multi-step approval: `approvalStep` on `LeaveRequest` (manager → HR when enabled)
- [ ] Updated approve/decline handlers respect approval step and role
- [ ] BullMQ cron job: document expiry reminders (30 days ahead) → email HR
- [ ] Leave policy settings UI for company admin
- [ ] Multi-step status indicators on approval queue
- [ ] `docs/openapi.yaml` and Postman collection updated

**Review:** Test accrual for mid-year starter and two-step leave approval before S2-6.

**Module plan:** [03-leave.md](./modules/03-leave.md) (Stage 2 section)

---

## S2-6 — Done when

- [ ] `POST /api/v1/employees/import/validate` — parse CSV, return preview + errors
- [ ] `POST /api/v1/employees/import/commit` — create valid rows
- [ ] CSV import wizard on Employees page (upload → preview → confirm)
- [ ] `GET /api/v1/reports/headcount` — by department, status
- [ ] `GET /api/v1/reports/absence-summary` — leave days taken by type/period
- [ ] Reports pages `/dashboard/reports/headcount`, `/dashboard/reports/absence`
- [ ] Dashboard charts (recharts) for headcount trend and absence summary
- [ ] Optional migration: employee `department` string → `departmentId` ref
- [ ] `docs/openapi.yaml` and Postman collection updated

**Review:** Test CSV import with invalid rows and report accuracy before S2-7.

**Module plans:** [02-employees.md](./modules/02-employees.md) (Stage 2 section), [12-reporting.md](./modules/12-reporting.md)

---

## S2-7 — Done when

- [ ] `Subscription` model per tenant (`stripeCustomerId`, `stripeSubscriptionId`, `status`, `seatCount`)
- [ ] `tenant.billingExempt` flag for demo/staging tenants
- [ ] `POST /api/v1/billing/checkout-session` — Stripe Checkout for company admin
- [ ] `POST /api/v1/billing/portal-session` — Stripe Customer Portal
- [ ] `POST /api/v1/billing/webhook` — handle subscription lifecycle + seat sync
- [ ] Seat count updates on employee activate/deactivate (webhook or service hook)
- [ ] Billing page `/dashboard/settings/billing` — plan status, upgrade, manage subscription
- [ ] Super admin: subscription status on companies/registrations list
- [ ] Env vars documented: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID`
- [ ] `docs/openapi.yaml` and Postman collection updated

**Review:** Test Checkout flow in Stripe test mode and webhook seat sync before S2-8.

**Module plan:** [17-billing-stripe.md](./modules/17-billing-stripe.md)

---

## S2-8 — Done when

- [ ] Extended demo seed — attendance sessions, timesheets, expenses, sample notifications
- [ ] Staging deploy updated with Redis worker and Stripe test keys
- [ ] Bug fixes on Stage 2 walkthrough path ([10-stage-2-operations-plan.md](./10-stage-2-operations-plan.md) Section 1)
- [ ] SMS via Twilio (optional — log in out-of-plan table if deferred)
- [ ] Demo 1 carry-over items closed: forgot password verified, walkthrough bugs fixed
- [ ] Client sign-off per [10-stage-2-operations-plan.md](./10-stage-2-operations-plan.md) Section 7

**Review:** Stage 2 client demo sign-off.

---

## Dependency order

```
S2-1 (foundations)
  ├── S2-2 (attendance) → S2-3 (timesheets)
  ├── S2-4 (expenses)
  ├── S2-5 (leave+)
  ├── S2-6 (import + reports)
  └── S2-7 (billing)
        └── S2-8 (polish)
```

S2-4, S2-5, S2-6, and S2-7 can run in parallel after S2-1. S2-3 requires S2-2.
