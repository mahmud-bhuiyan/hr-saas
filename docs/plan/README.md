# HR SaaS — Project Plans

Planning documents for the HR SaaS platform. Use these to align with the client, scope demos, and guide development phase by phase.

**Keep plans current:** When adding features mid-sprint, update [IMPLEMENTATION-STEPS.md](./IMPLEMENTATION-STEPS.md) (including the out-of-plan log), the relevant module file in [modules/](./modules/), and the screens checklist in [00-client-demo-plan.md](./00-client-demo-plan.md).

---

## Documents

| File | Purpose | Audience |
|------|---------|----------|
| [IMPLEMENTATION-STEPS.md](./IMPLEMENTATION-STEPS.md) | **Dev checklist** — step-by-step build order and status | Dev team |
| [00-client-demo-plan.md](./00-client-demo-plan.md) | **Demo 1** — first client presentation | Client + dev team |
| [hr-saas-mern-project-plan.md](./hr-saas-mern-project-plan.md) | Full product vision, architecture, all 14 modules | Internal / long-term reference |
| [modules/](./modules/) | Per-module detailed plans (one file per module) | Dev team |

---

## Current progress (2026-08-02)

| Step | Scope | Status |
|------|-------|--------|
| 1 | Foundation | ✅ Complete |
| 2 | Auth & tenant (+ super admin, approval, add company) | ✅ Complete |
| 3 | App shell (+ UI kit, profile, companies page) | ✅ Complete |
| 4 | Employee management | ✅ Ready for review |
| 5–6 | Leave, documents | ⬜ Pending |
| 7 | Settings (branding complete; profile/depts/users pending) | 🟡 Partial |
| 8 | Demo polish | ⬜ Pending |

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

## Module Plans

Detailed plans live in `modules/`. Each file follows [modules/_template.md](./modules/_template.md).

| Module | Plan file | Demo 1 | Status |
|--------|-----------|--------|--------|
| Auth & Tenant | [modules/01-auth-tenant.md](./modules/01-auth-tenant.md) | ✅ | Done |
| Employee Management | [modules/02-employees.md](./modules/02-employees.md) | ✅ | Ready for review |
| Leave & Absence | [modules/03-leave.md](./modules/03-leave.md) | ✅ | Not started |
| Document Storage | [modules/04-documents.md](./modules/04-documents.md) | ✅ | Not started |
| Admin & Settings | [modules/05-admin-settings.md](./modules/05-admin-settings.md) | ✅ (partial) | In progress |
| Platform Site Settings | [modules/15-platform-site-settings.md](./modules/15-platform-site-settings.md) | ✅ (Step 7) | Complete |
| Attendance | [modules/06-attendance.md](./modules/06-attendance.md) | — | Stage 2 |
| Notifications | [modules/07-notifications.md](./modules/07-notifications.md) | — | Stage 2 |
| Shifts & Rotas | [modules/08-rotas.md](./modules/08-rotas.md) | — | Stage 3 |
| Timesheets | [modules/09-timesheets.md](./modules/09-timesheets.md) | — | Stage 2 |
| Expenses | [modules/10-expenses.md](./modules/10-expenses.md) | — | Stage 2 |
| Payroll Export | [modules/11-payroll.md](./modules/11-payroll.md) | — | Stage 3 |
| Reporting | [modules/12-reporting.md](./modules/12-reporting.md) | — | Stage 4 |
| Performance | [modules/13-performance.md](./modules/13-performance.md) | — | Stage 4 |
| Recruitment (ATS) | [modules/14-recruitment.md](./modules/14-recruitment.md) | — | Stage 4 |

---

## How to Use

1. **Client meeting (Demo 1):** Walk through `00-client-demo-plan.md` — scope, screens, timeline, out-of-scope list.
2. **Development:** Follow [IMPLEMENTATION-STEPS.md](./IMPLEMENTATION-STEPS.md); create or update module plans in `modules/` before coding each module.
3. **Scope changes:** Update the module plan first, log additions in IMPLEMENTATION-STEPS out-of-plan table, then sync `00-client-demo-plan.md` screens checklist.
