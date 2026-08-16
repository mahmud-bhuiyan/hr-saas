# Reference HR — Platform Reference (Competitive Benchmark)

**Purpose:** Canonical snapshot of [Reference HR](#)’s product scope, modules, and screens. Use this file to compare against our own plans (`00-stage-1-core-hr-plan.md`, `10-stage-2-operations-plan.md`, `11-stage-3-scheduling-payroll-plan.md`, `hr-saas-mern-project-plan.md`, and `modules/`) when scoping future work.

**Our scope note:** This project targets **web only** (responsive). The reference platform’s native mobile apps are documented here for completeness but are **not** a target for our product.

**Last reviewed:** 2026-08-03  
**Primary sources:** [example.com](#), [Reference LLM info page](#), product marketing pages, help centre

---

## 1. Company overview

| Attribute | Details |
|-----------|---------|
| **Product name** | Reference HR |
| **Legal entity** | Reference HR Technologies |
| **Type** | Cloud HRMS / HCM / PeopleOS (People Operating System) |
| **Founded** | 2014 (product launched 2015) |
| **Founder & CEO** | Vijay Yalamanchili |
| **Headquarters** | Hyderabad, Telangana, India |
| **US offices** | Portland OR, New York NY, San Francisco CA |
| **Other offices** | Bengaluru, Chennai, Singapore, UAE |
| **Infrastructure** | Microsoft Azure, cloud-native SaaS |
| **Scale (claimed)** | 12,500+ companies · 2.5M+ employees · 150+ countries |
| **Target size** | Mid-market: ~50–2,000+ employees |
| **Primary markets** | India (strongest), United States, APAC, Middle East |
| **Funding** | ~$59M total; $57M Series A (WestBridge Capital, 2022) |

### Positioning

Reference HR markets itself as a **unified PeopleOS** — one subscription covering HR, payroll, recruitment, performance, engagement, and (for services firms) PSA. Core pitch:

- Single employee data layer across all modules (no siloed exports)
- HR-team-first: configure payroll, policies, workflows without IT
- Deep **India statutory payroll** (TDS, PF, ESIC, PT, LWF) built into core
- Growing **US payroll** coverage (50 states, benefits admin)
- Fast go-live (days to weeks vs enterprise HRMS)

---

## 2. Product pillars

Reference HR is organised into three main clouds, sold as one platform:

| Pillar | Name | Focus |
|--------|------|-------|
| **A** | **Reference HR Cloud** | Core HR, leave, attendance, recruitment, performance, engagement, analytics |
| **B** | **Reference Payroll Cloud** | Salary calculation, statutory compliance, payslips, reimbursements, F&F settlement |
| **C** | **Reference PSA Cloud** | Professional services: projects, resources, billing, revenue analytics |

All pillars share CoreHR as the central employee data hub.

---

## 3. Module catalogue

### 3.1 Core HR

**Purpose:** Single source of truth for employee and organisation data from hire to exit.

| Capability | Details |
|------------|---------|
| Employee records | Personal, job, compensation, custom fields |
| Org structure | Departments, locations, reporting hierarchy, org chart |
| Document management | Contracts, IDs, certifications; storage + categorisation |
| Hire-to-exit lifecycle | Onboarding checklists, preboarding, offboarding workflows |
| Employee self-service | Web portal + native iOS/Android apps |
| Role-based access | HR, manager, employee views; sensitive data controls |
| E-signatures | Offer letters, onboarding documents |
| Custom workflows | Configurable approval chains across modules |

**Typical screens:** Employee directory · Employee profile · Org chart · Document library · Onboarding checklist · Offboarding workflow · Company settings

---

### 3.2 Payroll

**Purpose:** Automated payroll with embedded statutory compliance — the reference platform’s primary differentiator in India.

| Capability | Details |
|------------|---------|
| Salary calculation | Automated monthly runs; variable pay, incentives, bonuses |
| **India compliance** | TDS, PF, ESIC, PT, LWF; Form 16, Form 24Q; statutory rate updates |
| **US compliance** | All 50 states; minimum wage, overtime, garnishments, tax filings |
| Payslips | Auto-generated; employee self-service download |
| Benefits administration | US benefits (health, etc.) |
| Reimbursements | Expense-linked pay runs |
| Full & final settlement | Exit settlement processing |
| Performance-linked pay | Salary revisions and bonuses tied to review cycles |
| Multi-currency / geo | Hybrid and distributed teams |

**Typical screens:** Payroll run dashboard · Pay structure setup · Statutory config · Payslip viewer · Reimbursement queue · F&F settlement · Compliance reports

---

### 3.3 Time, attendance & leave

**Purpose:** Track working time, manage shifts, and connect hours to payroll.

| Capability | Details |
|------------|---------|
| Clock in/out | Web, mobile, biometric device integration (ZKTeco, Essl) |
| Geo / location | Mobile attendance with location capture |
| Leave management | Configurable leave types, policies, accrual, carry-over |
| Shift scheduling | Roster / rota management |
| Timesheets | Weekly submission; billable vs non-billable (PSA overlap) |
| Overtime | Tracking and payroll integration |
| Approvals | Manager/HR approval workflows |
| Live visibility | Who’s in, team attendance boards |

**Typical screens:** Clock in/out · My attendance · Team live board · Leave request · Leave balance · Leave calendar · Shift rota grid · Timesheet grid · Attendance reports

---

### 3.4 Recruitment (ATS)

**Purpose:** End-to-end hiring from job post to offer — integrated with Core HR (no manual handoff).

| Capability | Details |
|------------|---------|
| Job posting | Career portal; syndication to LinkedIn, Indeed, Naukri, 15+ boards |
| Pipeline management | Kanban stages; role-based visibility |
| Candidate profiles | Resume parsing (AI), smart filters, skill tests |
| Interview workflow | Scheduling, scorecards, collaboration |
| Offer management | Offer letters, e-signature |
| Onboarding handoff | Preboarding checklists; auto-sync hire to Core HR |
| AI assist | AI-generated job descriptions, predictive insights |
| Compliance | Pay transparency in job postings (US) |

**Typical screens:** Job list · Job posting form · Career portal (public) · Candidate pipeline board · Candidate profile · Interview schedule · Offer letter · Preboarding checklist

---

### 3.5 Performance management

**Purpose:** Continuous performance — goals, feedback, reviews — linked to compensation.

| Capability | Details |
|------------|---------|
| OKRs / KPIs | Company → team → individual goal alignment |
| Review cycles | Scheduled appraisals; continuous feedback |
| 360-degree reviews | Multi-rater feedback |
| 1:1 meetings | Scheduling and notes |
| Manager scorecards | Performance dashboards per manager |
| PIPs & disciplinary | Documented workflows; audit trail |
| Pay linkage | Salary revisions and bonuses from review outcomes |
| Skill gaps | Career development tracking |

**Typical screens:** Goal tracker · Review cycle dashboard · 1:1 notes · 360 feedback form · Manager scorecard · PIP workflow · Performance analytics

---

### 3.6 Employee engagement

**Purpose:** Culture, recognition, and feedback beyond transactional HR.

| Capability | Details |
|------------|---------|
| Recognition / Kudos | Peer-to-peer appreciation; badges |
| Pulse surveys | Engagement tracking over time |
| Announcements | Company-wide communication |
| Employee experience | Cross-module “people intelligence” dashboards |

**Typical screens:** Recognition feed · Give kudos modal · Survey builder · Announcement board · Engagement dashboard

---

### 3.7 Expenses & reimbursements

**Purpose:** Employee expense claims tied to approval and payroll reimbursement.

| Capability | Details |
|------------|---------|
| Expense submission | Categories, amounts, receipt upload |
| Approval workflow | Manager/HR approval queues |
| Reimbursement | Pay run integration |
| Export | Finance / accounting handoff |

**Typical screens:** Submit expense · My expenses · Approval queue · Reimbursement report · Export

---

### 3.8 HR analytics & reporting

**Purpose:** Workforce intelligence for HR leaders and executives.

| Capability | Details |
|------------|---------|
| Pre-built dashboards | Headcount, attrition, absence, overtime |
| Attrition analysis | Trends, retention drivers |
| DEI metrics | Diversity reporting |
| Custom report builder | Ad-hoc queries |
| Cross-module analytics | Link performance, timesheets, compensation |
| Role-tailored views | CHRO, manager, employee perspectives |
| PSA analytics (separate) | 50+ reports for project/revenue KPIs |

**Typical screens:** HR dashboard · Headcount report · Attrition report · Absence summary · Custom report builder · Export (CSV/PDF)

---

### 3.9 PSA — Professional Services Automation

**Purpose:** Run service businesses (consulting, IT services, agencies) on the same platform as HR.

| Capability | Details |
|------------|---------|
| Project management | Time & material, milestone, retainer projects; tasks/sub-tasks |
| Resource management | Availability, workload, capacity forecasting, shadow resources |
| Project timesheets | Billable vs non-billable; approval; payroll sync |
| Billing & invoicing | Multi-currency rates; T&M, milestone, recurring billing |
| Opportunity / deal management | Pipeline before project start |
| Revenue intelligence | Margins, forecasting, revenue recognition |
| PSA analytics | Utilization, project health, CSAT, 50+ reports |
| AI insights | Project and resource recommendations |
| Talent integration | Hire → skill → project assignment → payroll in one flow |

**Typical screens:** Project list · Project detail · Resource planner · Project timesheet · Billing dashboard · Invoice list · Deal pipeline · PSA analytics dashboard · Revenue forecast

---

### 3.10 Platform, admin & billing

| Capability | Details |
|------------|---------|
| Company setup | Profile, locations, departments, policies |
| User & role management | RBAC across all modules |
| Workflow automation | Configurable approval chains |
| Integrations | ERP, accounting (Gusto, ADP, etc.), biometric devices, REST API, webhooks |
| Security | Enterprise access controls; Azure hosting |
| Subscription | Per-employee-per-month pricing; tiered plans |
| Support | In-product help, customer success |

**Typical screens:** Company settings · Roles & permissions · Integration marketplace · API keys · Subscription / billing · Audit log

---

## 4. Screens checklist (Reference HR — full product)

Use this checklist when comparing screen coverage against our app.

### Public / auth
- [ ] Login
- [ ] Employee self-registration (if enabled)
- [ ] Forgot password / reset password
- [ ] Career portal (public job listings)

### Dashboard
- [ ] HR / admin home dashboard
- [ ] Manager dashboard
- [ ] Employee home / self-service hub

### Core HR
- [ ] Employee directory
- [ ] Add / edit employee
- [ ] Employee profile (multi-tab)
- [ ] Org chart
- [ ] Onboarding checklist
- [ ] Offboarding workflow
- [ ] Document list & upload

### Leave
- [ ] Request leave
- [ ] My leave balance & history
- [ ] Leave approval queue
- [ ] Team leave calendar
- [ ] Leave policy settings

### Attendance & time
- [ ] Clock in / clock out (web + mobile)
- [ ] My attendance history
- [ ] Team live board
- [ ] Shift rota / roster grid
- [ ] Timesheet (weekly grid)
- [ ] Timesheet approval queue
- [ ] Attendance correction (HR)
- [ ] Biometric device settings

### Payroll
- [ ] Payroll run / process
- [ ] Pay structure & components
- [ ] Statutory compliance config (India / US)
- [ ] Payslip viewer (employee)
- [ ] Reimbursement in pay run
- [ ] Full & final settlement
- [ ] Payroll reports & filings

### Expenses
- [ ] Submit expense
- [ ] Expense approval queue
- [ ] Reimbursement status
- [ ] Expense export

### Recruitment (ATS)
- [ ] Job postings list
- [ ] Create / edit job
- [ ] Candidate pipeline (Kanban)
- [ ] Candidate profile
- [ ] Interview scheduling
- [ ] Offer letter & e-sign
- [ ] Preboarding / hire handoff

### Performance
- [ ] Goal / OKR tracker
- [ ] Review cycle setup
- [ ] Self-assessment & manager review
- [ ] 360 feedback
- [ ] 1:1 meeting notes
- [ ] Manager scorecard
- [ ] PIP / disciplinary workflow

### Engagement
- [ ] Recognition / kudos feed
- [ ] Pulse survey
- [ ] Company announcements

### Reporting & analytics
- [ ] Headcount report
- [ ] Attrition / turnover report
- [ ] Absence summary
- [ ] Overtime / cost report
- [ ] Custom report builder
- [ ] DEI dashboard

### PSA (services firms)
- [ ] Project list & detail
- [ ] Resource planner
- [ ] Project timesheets
- [ ] Billing & invoicing
- [ ] Deal / opportunity pipeline
- [ ] PSA analytics (50+ reports)
- [ ] Revenue forecast

### Settings & platform
- [ ] Company profile
- [ ] Departments & locations
- [ ] Users & roles
- [ ] Leave / attendance / payroll policies
- [ ] Workflow & approval config
- [ ] Integrations
- [ ] Subscription / billing
- [ ] Audit log

### Mobile (reference platform only — not our target)
- [ ] iOS app — clock, leave, payslips, approvals
- [ ] Android app — same as iOS

---

## 5. Roles (typical Reference HR deployment)

| Role | Typical access |
|------|----------------|
| **Super admin / platform operator** | Platform-level (platform internal — not tenant-scoped) |
| **Company admin / HR admin** | Full tenant config, all modules |
| **HR manager** | Employees, documents, leave, attendance, payroll runs, recruitment |
| **Payroll admin** | Payroll processing, statutory filings, pay structures |
| **Manager** | Team view, leave/timesheet/expense approval, performance reviews |
| **Recruiter / TA** | ATS pipeline, interviews, offers |
| **Project manager** | PSA projects, resources, timesheets, billing (services firms) |
| **Employee** | Self-service: profile, leave, attendance, payslips, expenses, goals |

---

## 6. Integrations (known)

| Category | Examples |
|----------|----------|
| Job boards | LinkedIn, Indeed, Naukri, 15+ boards |
| Biometric | ZKTeco, Essl |
| US payroll / benefits | Gusto, ADP (positioned as alternatives Reference HR replaces) |
| Accounting / ERP | Various ERP and accounting tools; REST API + webhooks |
| Communication | Slack and others (marketing mentions) |

---

## 7. Pricing model (high level)

- **Model:** Per-employee-per-month (PEPM) subscription
- **Tiers:** Foundation / Strength / Growth (names from marketing; exact feature gates vary by region)
- **Packaging:** All modules marketed as one platform — not à la carte silos
- **Setup:** One-time implementation fee may apply (region-dependent)
- **Scale:** Base band for first ~100 employees, then per-employee add-on (typical mid-market SaaS pattern)

*Exact pricing is sales-led; treat as directional only.*

---

## 8. Reference HR vs common HR SaaS patterns

| Pattern | Reference approach |
|---------|---------------|
| Payroll | **Native engine** with statutory compliance (India + US) |
| ATS | **Built-in** — not a separate tool |
| Performance | **Built-in** OKRs, 360, PIPs |
| PSA | **Separate cloud** but same platform (services vertical) |
| Mobile | **Native apps** central to employee experience |
| Multi-tenant platform | Single Reference product — customers are tenants, not operators |
| Accounting handoff | Payroll is the system of record; exports secondary |

---

## 9. Industries Reference HR targets

- IT & SaaS
- Manufacturing (shifts, biometric, blue-collar payroll)
- Retail & e-commerce (multi-location, seasonal hiring)
- BFSI (audit-ready payroll, role-based access)
- Education (academic leave calendars)
- Professional services (PSA + HR combined)

---

## 10. How to use this file

When planning our next stage:

1. Pick a reference module from **Section 3**
2. Check **Section 4** screens against our stage plans and `client/src/pages/`
3. Log gaps in our module plan or a future stage doc — do **not** edit this file unless refreshing the industry HR benchmark
4. For side-by-side status, add a comparison column to our module files or create a short `hr-platform-vs-hr-saas-matrix.md` when needed

**Intentional non-goals for our product (do not add to Reference HR doc):** native payroll/tax engine, native mobile apps, PSA, India statutory payroll — see our `11-payroll.md` and stage plans.

---

## 11. Source links

| Resource | URL |
|----------|-----|
| Homepage | # |
| HR Cloud | # |
| Payroll | # (Payroll Cloud) |
| PSA | # |
| Recruitment | # |
| LLM / canonical info | # |
| Help centre (PSA) | # |

---

*This document describes a third-party product for internal planning. Feature names and availability may change; verify on example.com before client-facing comparisons.*
