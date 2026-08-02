# HR SaaS — Project Plans

Planning documents for the HR SaaS platform. Use these to align with the client, scope demos, and guide development phase by phase.

**Keep plans current:** When adding features mid-sprint, update [IMPLEMENTATION-STEPS.md](./IMPLEMENTATION-STEPS.md) or [STAGE-2-IMPLEMENTATION-STEPS.md](./STAGE-2-IMPLEMENTATION-STEPS.md) (including the out-of-plan log), the relevant module file in [modules/](./modules/), and the screens checklist in [00-client-demo-plan.md](./00-client-demo-plan.md) or [10-stage-2-operations-plan.md](./10-stage-2-operations-plan.md).

---

## Documents

| File | Purpose | Audience |
|------|---------|----------|
| [IMPLEMENTATION-STEPS.md](./IMPLEMENTATION-STEPS.md) | **Demo 1 dev checklist** — Steps 1–8 | Dev team |
| [00-client-demo-plan.md](./00-client-demo-plan.md) | **Demo 1** — first client presentation | Client + dev team |
| [STAGE-2-IMPLEMENTATION-STEPS.md](./STAGE-2-IMPLEMENTATION-STEPS.md) | **Stage 2 dev checklist** — Steps S2-1–S2-8 | Dev team |
| [10-stage-2-operations-plan.md](./10-stage-2-operations-plan.md) | **Stage 2** — operations scope and sign-off | Client + dev team |
| [hr-saas-mern-project-plan.md](./hr-saas-mern-project-plan.md) | Full product vision, architecture, all 14 modules | Internal / long-term reference |
| [modules/](./modules/) | Per-module detailed plans (one file per module) | Dev team |

---

## Current progress — Demo 1 (2026-08-02)

| Step | Scope | Status |
|------|-------|--------|
| 1 | Foundation | ✅ Complete |
| 2 | Auth & tenant (+ super admin, approval, add company) | ✅ Complete |
| 3 | App shell (+ UI kit, profile, companies page) | ✅ Complete |
| 4 | Employee management | ✅ Ready for review |
| 5 | Leave & absence | ✅ Complete |
| 6 | Documents | ✅ Ready for review |
| 7 | Settings (company, departments, users, branding) | ✅ Ready for review |
| 8 | Demo polish | 🔄 In progress (deploy done) |

---

## Current progress — Stage 2 (2026-08-02)

| Step | Scope | Status |
|------|-------|--------|
| S2-1 | Platform foundations | ⬜ Not started |
| S2-2 | Attendance | ⬜ Not started |
| S2-3 | Timesheets | ⬜ Not started |
| S2-4 | Expenses | ⬜ Not started |
| S2-5 | Leave enhancements | ⬜ Not started |
| S2-6 | Import & reporting | ⬜ Not started |
| S2-7 | Stripe billing | ⬜ Not started |
| S2-8 | Polish & sign-off | ⬜ Not started |

**Start Stage 2 after Demo 1 client sign-off.** See [10-stage-2-operations-plan.md](./10-stage-2-operations-plan.md).

---

## Roadmap at a Glance

```
Demo 1 (client presentation) — Steps 1–8
  └── Auth, Employees, Leave, Documents, Admin shell
        │
        ▼
Stage 2 — Operations — Steps S2-1–S2-8
  └── Audit log, Notifications, Attendance, Timesheets, Expenses, Billing
        │
        ▼
Stage 3 — Scheduling & Payroll
  └── Rotas, Payroll export / integrations
        │
        ▼
Stage 4 — Growth
  └── Advanced reporting, Performance, Recruitment, LMS, Recognition
```

---

## Module Plans

Detailed plans live in `modules/`. Each file follows [modules/_template.md](./modules/_template.md).

| Module | Plan file | Stage | Status |
|--------|-----------|-------|--------|
| Auth & Tenant | [modules/01-auth-tenant.md](./modules/01-auth-tenant.md) | Demo 1 + S2-1 | Done / S2 planned |
| Employee Management | [modules/02-employees.md](./modules/02-employees.md) | Demo 1 + S2 | Ready for review |
| Leave & Absence | [modules/03-leave.md](./modules/03-leave.md) | Demo 1 + S2-5 | Complete / S2 planned |
| Document Storage | [modules/04-documents.md](./modules/04-documents.md) | Demo 1 | Ready for review |
| Admin & Settings | [modules/05-admin-settings.md](./modules/05-admin-settings.md) | Demo 1 | Ready for review |
| Attendance | [modules/06-attendance.md](./modules/06-attendance.md) | Stage 2 | Not started |
| Notifications | [modules/07-notifications.md](./modules/07-notifications.md) | Stage 2 | Not started |
| Shifts & Rotas | [modules/08-rotas.md](./modules/08-rotas.md) | Stage 3 | Not started |
| Timesheets | [modules/09-timesheets.md](./modules/09-timesheets.md) | Stage 2 | Not started |
| Expenses | [modules/10-expenses.md](./modules/10-expenses.md) | Stage 2 | Not started |
| Payroll Export | [modules/11-payroll.md](./modules/11-payroll.md) | Stage 3 | Not started |
| Reporting | [modules/12-reporting.md](./modules/12-reporting.md) | S2 slice / Stage 4 | Not started |
| Performance | [modules/13-performance.md](./modules/13-performance.md) | Stage 4 | Not started |
| Recruitment (ATS) | [modules/14-recruitment.md](./modules/14-recruitment.md) | Stage 4 | Not started |
| Platform Site Settings | [modules/15-platform-site-settings.md](./modules/15-platform-site-settings.md) | Demo 1 | Complete |
| Audit Log | [modules/16-audit-log.md](./modules/16-audit-log.md) | Stage 2 | Not started |
| Billing (Stripe) | [modules/17-billing-stripe.md](./modules/17-billing-stripe.md) | Stage 2 | Not started |

---

## How to Use

1. **Client meeting (Demo 1):** Walk through `00-client-demo-plan.md` — scope, screens, timeline, out-of-scope list.
2. **Client meeting (Stage 2):** Walk through `10-stage-2-operations-plan.md` after Demo 1 sign-off.
3. **Development:** Follow `IMPLEMENTATION-STEPS.md` (Demo 1) then `STAGE-2-IMPLEMENTATION-STEPS.md`; create or update module plans in `modules/` before coding each module.
4. **Scope changes:** Update the module plan first, log additions in the relevant IMPLEMENTATION-STEPS out-of-plan table, then sync the client plan screens checklist.
