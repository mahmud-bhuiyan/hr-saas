# HR SaaS — Project Plans

Planning documents for the HR SaaS platform. Use these to align with the client, scope demos, and guide development phase by phase.

---

## Documents

| File | Purpose | Audience |
|------|---------|----------|
| [00-client-demo-plan.md](./00-client-demo-plan.md) | **Demo 1** — first client presentation | Client + dev team |
| [hr-saas-mern-project-plan.md](./hr-saas-mern-project-plan.md) | Full product vision, architecture, all 14 modules | Internal / long-term reference |
| [modules/](./modules/) | Per-module detailed plans (one file per module) | Dev team |

---

## Roadmap at a Glance

```
Demo 1 (client presentation)
  └── Auth, Employees, Leave, Documents, Admin shell
        │
        ▼
Stage 2 — Operations
  └── Attendance, Notifications, Timesheets, Expenses
        │
        ▼
Stage 3 — Scheduling & Payroll
  └── Rotas, Payroll export / integrations
        │
        ▼
Stage 4 — Growth
  └── Reporting, Performance, Recruitment, LMS, Recognition
```

---

## Module Plans (coming next)

Detailed plans live in `modules/`. Each file follows [modules/_template.md](./modules/_template.md).

| Module | Plan file | Demo 1 | Stage |
|--------|-----------|--------|-------|
| Auth & Tenant | `modules/01-auth-tenant.md` | ✅ | Demo 1 |
| Employee Management | `modules/02-employees.md` | ✅ | Demo 1 |
| Leave & Absence | `modules/03-leave.md` | ✅ | Demo 1 |
| Document Storage | `modules/04-documents.md` | ✅ | Demo 1 |
| Admin & Settings | `modules/05-admin-settings.md` | ✅ (thin) | Demo 1 |
| Attendance | `modules/06-attendance.md` | — | Stage 2 |
| Notifications | `modules/07-notifications.md` | — | Stage 2 |
| Shifts & Rotas | `modules/08-rotas.md` | — | Stage 3 |
| Timesheets | `modules/09-timesheets.md` | — | Stage 2 |
| Expenses | `modules/10-expenses.md` | — | Stage 2 |
| Payroll Export | `modules/11-payroll.md` | — | Stage 3 |
| Reporting | `modules/12-reporting.md` | — | Stage 4 |
| Performance | `modules/13-performance.md` | — | Stage 4 |
| Recruitment (ATS) | `modules/14-recruitment.md` | — | Stage 4 |

---

## How to Use

1. **Client meeting (Demo 1):** Walk through `00-client-demo-plan.md` — scope, screens, timeline, out-of-scope list.
2. **Development:** Break Demo 1 into sprints using the module plans in `modules/` (create those before coding each module).
3. **Scope changes:** Update the relevant module plan first, then sync `00-client-demo-plan.md` or the master plan if the roadmap shifts.
