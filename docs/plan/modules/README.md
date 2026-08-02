# Module Plans

One detailed plan file per business module. Use these for sprint planning and as the source of truth for scope before coding.

**When shipping features:** Update the module file and [STAGE-1-IMPLEMENTATION-STEPS.md](../STAGE-1-IMPLEMENTATION-STEPS.md), [STAGE-2-IMPLEMENTATION-STEPS.md](../STAGE-2-IMPLEMENTATION-STEPS.md), or [STAGE-3-IMPLEMENTATION-STEPS.md](../STAGE-3-IMPLEMENTATION-STEPS.md) so plans stay aligned with the codebase.

---

## Stage 1 modules

| # | Module | File | Status |
|---|--------|------|--------|
| 01 | Auth & Tenant | [01-auth-tenant.md](./01-auth-tenant.md) | Done (S2-1 forgot password; user theme preference) |
| 02 | Employee Management | [02-employees.md](./02-employees.md) | Ready for review (S2-6 CSV import done) |
| 03 | Leave & Absence | [03-leave.md](./03-leave.md) | Complete (S2-5 enhancements) |
| 04 | Document Storage | [04-documents.md](./04-documents.md) | Ready for review |
| 05 | Admin & Settings | [05-admin-settings.md](./05-admin-settings.md) | Ready for review |
| 15 | Platform Site Settings | [15-platform-site-settings.md](./15-platform-site-settings.md) | Complete |

**Stage 1 tracker:** [STAGE-1-IMPLEMENTATION-STEPS.md](../STAGE-1-IMPLEMENTATION-STEPS.md) · **Client plan:** [00-stage-1-core-hr-plan.md](../00-stage-1-core-hr-plan.md)

---

## Stage 2 modules

| # | Module | File | Step | Status |
|---|--------|------|------|--------|
| 16 | Audit Log | [16-audit-log.md](./16-audit-log.md) | S2-1 | Done |
| 07 | Notifications | [07-notifications.md](./07-notifications.md) | S2-1 | Done |
| 06 | Attendance | [06-attendance.md](./06-attendance.md) | S2-2 | Done |
| 09 | Timesheets | [09-timesheets.md](./09-timesheets.md) | S2-3 | Done |
| 10 | Expenses | [10-expenses.md](./10-expenses.md) | S2-4 | Done |
| 12 | Reporting (thin slice) | [12-reporting.md](./12-reporting.md) | S2-6 | Done |
| 17 | Billing (Stripe) | [17-billing-stripe.md](./17-billing-stripe.md) | S2-7 | Done |

Stage 2 also extends **01-auth-tenant** (forgot password), **02-employees** (invite, CSV import), and **03-leave** (accrual, multi-step approval) — see Stage 2 sections in those files.

**Stage 2 tracker:** [STAGE-2-IMPLEMENTATION-STEPS.md](../STAGE-2-IMPLEMENTATION-STEPS.md) · **Client plan:** [10-stage-2-operations-plan.md](../10-stage-2-operations-plan.md)

---

## Stage 3 modules

| # | Module | File | Step | Status |
|---|--------|------|------|--------|
| 08 | Shifts & Rotas | [08-rotas.md](./08-rotas.md) | S3-1–S3-2 | S3-1–S3-2 done |
| 11 | Payroll Export | [11-payroll.md](./11-payroll.md) | S3-1, S3-4–S3-6 | ✅ Done |

Stage 3 also extends **02-employees** (pay fields) — see [11-payroll.md](./11-payroll.md).

**Stage 3 tracker:** [STAGE-3-IMPLEMENTATION-STEPS.md](../STAGE-3-IMPLEMENTATION-STEPS.md) · **Client plan:** [11-stage-3-scheduling-payroll-plan.md](../11-stage-3-scheduling-payroll-plan.md)

---

## How to write a module plan

1. Copy [_template.md](./_template.md) to the numbered filename above.
2. Fill every section; leave `Open Questions` for client decisions.
3. Link acceptance criteria to [00-stage-1-core-hr-plan.md](../00-stage-1-core-hr-plan.md), [10-stage-2-operations-plan.md](../10-stage-2-operations-plan.md), or [11-stage-3-scheduling-payroll-plan.md](../11-stage-3-scheduling-payroll-plan.md) where applicable.
4. Update the Status column in this README when a plan is ready for development or done.

---

## Out-of-plan additions (log)

Features not in the original Stage 1 write-up but implemented — also tracked in [STAGE-1-IMPLEMENTATION-STEPS.md](../STAGE-1-IMPLEMENTATION-STEPS.md).

| Feature | Module | Added |
|---------|--------|-------|
| Registration approval workflow | 01 Auth | Step 2 |
| Super admin add company directly | 01 Auth | Step 2 |
| User profile + change password | 01 Auth | Step 2–3 |
| UI component kit | 03 App shell | Step 3 |
| Manager team-scoped employee read | 02 Employees | Step 4 |
| Direct reports on profile | 02 Employees | Step 4 |
| Platform site customization | 15 Platform Site Settings | Step 7 |
