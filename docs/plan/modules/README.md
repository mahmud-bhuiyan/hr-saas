# Module Plans

One detailed plan file per business module. Use these for sprint planning and as the source of truth for scope before coding.

**When shipping features:** Update the module file and [IMPLEMENTATION-STEPS.md](../IMPLEMENTATION-STEPS.md) so plans stay aligned with the codebase.

---

## Demo 1 modules

| # | Module | File | Status |
|---|--------|------|--------|
| 01 | Auth & Tenant | [01-auth-tenant.md](./01-auth-tenant.md) | Done |
| 02 | Employee Management | [02-employees.md](./02-employees.md) | Ready for review |
| 03 | Leave & Absence | [03-leave.md](./03-leave.md) | Not started |
| 04 | Document Storage | [04-documents.md](./04-documents.md) | Not started |
| 05 | Admin & Settings | [05-admin-settings.md](./05-admin-settings.md) | Not started |

---

## Later stages

| # | Module | File | Stage |
|---|--------|------|-------|
| 06 | Attendance | [06-attendance.md](./06-attendance.md) | Stage 2 |
| 07 | Notifications | [07-notifications.md](./07-notifications.md) | Stage 2 |
| 08 | Shifts & Rotas | [08-rotas.md](./08-rotas.md) | Stage 3 |
| 09 | Timesheets | [09-timesheets.md](./09-timesheets.md) | Stage 2 |
| 10 | Expenses | [10-expenses.md](./10-expenses.md) | Stage 2 |
| 11 | Payroll Export | [11-payroll.md](./11-payroll.md) | Stage 3 |
| 12 | Reporting | [12-reporting.md](./12-reporting.md) | Stage 4 |
| 13 | Performance | [13-performance.md](./13-performance.md) | Stage 4 |
| 14 | Recruitment (ATS) | [14-recruitment.md](./14-recruitment.md) | Stage 4 |

---

## How to write a module plan

1. Copy [_template.md](./_template.md) to the numbered filename above.
2. Fill every section; leave `Open Questions` for client decisions.
3. Link acceptance criteria to [00-client-demo-plan.md](../00-client-demo-plan.md) where applicable.
4. Update the Status column in this README when a plan is ready for development or done.

---

## Out-of-plan additions (log)

Features not in the original Demo 1 write-up but implemented — also tracked in [IMPLEMENTATION-STEPS.md](../IMPLEMENTATION-STEPS.md).

| Feature | Module | Added |
|---------|--------|-------|
| Registration approval workflow | 01 Auth | Step 2 |
| Super admin add company directly | 01 Auth | Step 2 |
| User profile + change password | 01 Auth | Step 2–3 |
| UI component kit | 03 App shell | Step 3 |
| Manager team-scoped employee read | 02 Employees | Step 4 |
| Direct reports on profile | 02 Employees | Step 4 |
