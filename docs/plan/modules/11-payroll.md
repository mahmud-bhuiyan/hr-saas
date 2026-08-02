# Module: Payroll Export

**Stage:** Stage 3 (S3-1 settings → S3-4 backend → S3-5 UI → S3-6 integration)  
**Status:** Done (S3-1–S3-6 complete)  
**Depends on:** Stage 2 timesheets + expenses; S3-1 employee pay fields

---

## 1. Purpose

Aggregate approved timesheets and expenses with employee pay rates into payroll periods for finance handoff. Export CSV or sync to Xero/QuickBooks — **no in-app tax, NI, pension, or RTI calculation**.

---

## 2. User Roles & Permissions

| Permission | company_admin | hr_manager | manager | employee |
|------------|:-------------:|:----------:|:-------:|:--------:|
| `payroll:read` | ✅ | ✅ | — | — |
| `payroll:generate` | ✅ | ✅ | — | — |
| `payroll:export` | ✅ | ✅ | — | — |

Pay fields on employees (`payRate`, etc.) editable by hr_manager and company_admin only.

---

## 3. Data Model

### Tenant payroll settings (on `Tenant`, S3-1)

```js
{
  payPeriodType: 'weekly' | 'biweekly' | 'monthly',  // default weekly
  defaultPayCurrency: String,                         // default GBP
  payrollWeekStartDay: Number                         // 0–6, default 1 (Monday)
}
```

### Employee pay fields (on `Employee`, S3-1)

```js
{
  payRate: Number,
  payRateType: 'hourly' | 'salary',
  payCurrency: String,
  fteFactor: Number,              // default 1.0
  defaultLocationId: ObjectId     // ref WorkLocation
}
```

### Collection: `PayrollPeriod` (S3-4)

```js
{
  tenantId: ObjectId,
  periodStart: Date,
  periodEnd: Date,
  status: 'draft' | 'generated' | 'exported',
  employeeSummaries: [{
    employeeId: ObjectId,
    employeeName: String,
    payRate: Number,
    payRateType: 'hourly' | 'salary',
    payCurrency: String,
    regularHours: Number,
    overtimeHours: Number,
    expenseTotal: Number,
    grossEstimate: Number
  }],
  generatedAt: Date,
  generatedBy: ObjectId,
  exportedAt: Date,
  exportedBy: ObjectId,
  createdAt, updatedAt
}
```

**Indexes:** `{ tenantId: 1, periodStart: 1 }`

**Relationships:** Timesheet (approved) → aggregation; Expense (approved/reimbursed) → aggregation; Employee.payRate → gross calculation

---

## 4. API Endpoints

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| GET | `/api/v1/settings/payroll` | company_admin | Tenant payroll settings |
| PATCH | `/api/v1/settings/payroll` | company_admin | Update payroll settings |
| GET | `/api/v1/payroll/periods` | `payroll:read` | List periods |
| POST | `/api/v1/payroll/periods` | `payroll:generate` | Create period (draft) |
| POST | `/api/v1/payroll/periods/:id/generate` | `payroll:generate` | Run aggregation |
| GET | `/api/v1/payroll/periods/:id` | `payroll:read` | Period detail + summaries |
| GET | `/api/v1/payroll/periods/:id/export` | `payroll:export` | CSV download |
| POST | `/api/v1/payroll/periods/:id/sync` | `payroll:export` | Push to Xero (S3-6) |
| GET | `/api/v1/payroll/accounting/status` | `payroll:export` | Xero connection status |
| GET | `/api/v1/payroll/accounting/connect` | company_admin | OAuth connect URL |
| DELETE | `/api/v1/payroll/accounting/disconnect` | company_admin | Disconnect Xero |

### Request / response examples

```json
// POST /api/v1/payroll/periods
{ "periodStart": "2026-08-01", "periodEnd": "2026-08-07" }

// GET /api/v1/payroll/periods/:id/export
// Content-Type: text/csv
// employeeId,employeeName,regularHours,overtimeHours,expenseTotal,grossEstimate,currency
```

---

## 5. Business Rules

1. **Generate** only includes timesheets with `status: approved` whose `weekOf` falls in `[periodStart, periodEnd]`.
2. **Generate** only includes expenses with `status: approved` or `reimbursed` and `date` in range.
3. **Hourly:** `grossEstimate = (regularHours + overtimeHours) × payRate + expenseTotal`.
4. **Salary:** `grossEstimate = (payRate / periodsPerYear) + expenseTotal` — pro-rata stub; no tax deductions.
5. Employees without `payRate` included with `grossEstimate: 0` and flagged in preview.
6. Regenerate allowed only when status is `draft` or `generated` (not after `exported` without HR confirm).
7. CSV export sets status to `exported` and writes audit log.

---

## 6. UI Screens & Flows

### Screen: Payroll settings (S3-1)
- **Route:** `/dashboard/settings/payroll`
- **Access:** company_admin
- **Elements:** pay period type, currency, week start day

### Screen: Employee pay section (S3-1)
- **Route:** employee profile edit
- **Access:** hr_manager, company_admin

### Screen: Payroll periods (S3-5)
- **Route:** `/dashboard/payroll`
- **Access:** hr_manager, company_admin
- **Elements:** period list, create modal, generate button, preview table, CSV download

### Screen: Accounting connection (S3-6)
- **Route:** section on payroll settings
- **Access:** company_admin

### User flow

```
Admin sets payroll settings → HR sets employee pay rates →
HR creates period → generates → previews → exports CSV → (optional) syncs to Xero
```

---

## 7. Notifications

| Event | Recipient | Channel |
|-------|-----------|---------|
| Payroll period generated | HR / company admin | in-app |

---

## 8. Audit & Compliance

- Pay field changes on Employee → `AuditLog`
- Payroll generate and export → `AuditLog`
- Payroll data is sensitive — HR/admin access only; include in SAR export when implemented
- **Explicit non-goals:** NI, tax, pension, RTI — client uses accounting software

---

## 9. Stage 2 vs Stage 3

| Feature | Stage 2 | Stage 3 |
|---------|---------|---------|
| Approved timesheets | ✅ | Input to payroll |
| Expense CSV export | ✅ per claim batch | Rolled into payroll period |
| Pay rates on employee | — | ✅ S3-1 |
| Payroll period generate | — | ✅ S3-4 |
| Xero/QB sync | — | ✅ S3-6 |

---

## 10. Tasks Breakdown

### Backend (S3-1 partial)
- [x] Tenant payroll settings GET/PATCH (S3-1)
- [x] Employee pay fields on model + PATCH (S3-1)
- [x] PayrollPeriod model + aggregation (S3-4)
- [x] CSV export endpoint (S3-5)
- [x] Xero OAuth + sync (S3-6)

### Frontend (S3-1 partial)
- [x] Payroll settings page (S3-1)
- [x] Employee pay section on profile (S3-1)
- [x] Payroll periods list + generate + export (S3-5)
- [x] Xero connect on payroll settings + sync on payroll page (S3-6)

**Estimate:** 10 days total (2 + 3 + 3 + 2 integration)

---

## 11. Open Questions

- [x] Xero for S3-6 (QuickBooks deferred)
- [ ] Include unapproved timesheets in preview with warning?

---

## 12. Acceptance Criteria

- [x] Tenant payroll settings configurable
- [x] HR can set employee pay rates with audit trail
- [x] HR can generate payroll period from approved data
- [x] CSV export matches preview totals
- [x] Xero OAuth connect and payroll sync to manual journals
- [x] OpenAPI and Postman updated
