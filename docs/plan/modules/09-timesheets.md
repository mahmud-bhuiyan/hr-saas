# Module: Timesheets

**Stage:** Stage 2 (S2-3)  
**Status:** Not started  
**Depends on:** Attendance (S2-2), Notifications (S2-1)

---

## 1. Purpose

Weekly timesheets aggregate attendance into billable/payroll-ready hours. Employees review drafts, adjust if needed, submit for approval; managers approve or decline. Overtime is flagged when hours exceed the tenant threshold.

---

## 2. User Roles & Permissions

| Permission | company_admin | hr_manager | manager | employee |
|------------|:-------------:|:----------:|:-------:|:--------:|
| `timesheet:read:own` | ✅ | ✅ | ✅ | ✅ |
| `timesheet:submit:own` | ✅ | ✅ | ✅ | ✅ |
| `timesheet:approve:team` | — | — | ✅ | — |
| `timesheet:approve` | ✅ | ✅ | — | — |

---

## 3. Data Model

### Collection: `Timesheet`

```js
{
  tenantId: ObjectId,
  employeeId: ObjectId,
  weekOf: Date,             // Monday 00:00 UTC of the week
  entries: [{
    date: Date,             // calendar day
    hours: Number,          // decimal, e.g. 7.5
    source: 'attendance' | 'manual',
    attendanceLogId: ObjectId | null,
    notes: String
  }],
  totalHours: Number,
  overtimeHours: Number,    // max(0, totalHours - threshold)
  status: 'draft' | 'submitted' | 'approved' | 'declined',
  submittedAt: Date,
  approverId: ObjectId,
  approvedAt: Date,
  declineReason: String,
  createdAt, updatedAt
}
```

**Indexes:** `{ tenantId, employeeId, weekOf }` unique, `{ tenantId, status }`

### Tenant setting

```js
{
  overtimeThresholdHours: Number  // default 40 per week
}
```

**Relationships:** AttendanceLog → Timesheet entries; Timesheet → Payroll export (Stage 3)

---

## 4. API Endpoints

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| POST | `/api/v1/timesheets/generate` | `timesheet:read:own` | Generate/update draft for week from attendance |
| GET | `/api/v1/timesheets/me` | `timesheet:read:own` | List own timesheets |
| GET | `/api/v1/timesheets/me/:weekOf` | `timesheet:read:own` | Get one week |
| GET | `/api/v1/timesheets` | approve permissions | Approval queue |
| PATCH | `/api/v1/timesheets/:id` | `timesheet:submit:own` | Edit draft entries only |
| POST | `/api/v1/timesheets/:id/submit` | `timesheet:submit:own` | Submit for approval |
| POST | `/api/v1/timesheets/:id/approve` | approve permissions | Approve submitted |
| POST | `/api/v1/timesheets/:id/decline` | approve permissions | Decline with reason |

### Request example

```json
// POST /api/v1/timesheets/generate
{ "weekOf": "2026-08-04" }

// PATCH /api/v1/timesheets/:id (draft only)
{
  "entries": [
    { "date": "2026-08-04", "hours": 8, "source": "manual", "notes": "Forgot to clock out" }
  ]
}
```

---

## 5. Business Rules

1. Week boundary: Monday–Sunday (UTC); `weekOf` is Monday date.
2. Generate sums hours from `AttendanceLog` clockIn/clockOut per day; open sessions excluded or capped at now.
3. Only `draft` timesheets can be edited.
4. Submit requires at least one entry with hours > 0.
5. Overtime = `max(0, totalHours - tenant.overtimeThresholdHours)`.
6. Manager approves direct reports only; HR/admin approves all.
7. Re-submit allowed after decline (back to draft).
8. Notification on submit, approve, decline.

---

## 6. UI Screens & Flows

### Screen: My timesheet
- **Route:** `/dashboard/timesheets`
- **Access:** all tenant roles
- **Elements:** week picker, 7-day grid (Mon–Sun), total/overtime summary, Generate button, Submit button
- **States:** no data, draft, submitted, approved, declined

### Screen: Approval queue
- **Route:** `/dashboard/timesheets` tab
- **Access:** manager, hr_manager, company_admin
- **Elements:** table of submitted timesheets, approve/decline actions

### User flow

```
Week ends → Employee clicks Generate → reviews draft → submits
→ Manager approves → totalHours available for payroll export (Stage 3)
```

---

## 7. Notifications

| Event | Recipient | Channel |
|-------|-----------|---------|
| Timesheet submitted | Manager / HR | in-app + email |
| Approved | Employee | in-app + email |
| Declined | Employee | in-app + email |

---

## 8. Audit & Compliance

- Approve/decline and manual entry edits write to audit log
- Timesheet data may be used in payroll — retain per HR policy

---

## 9. Demo 1 vs Stage 2

| Feature | Demo 1 | Stage 2 |
|---------|--------|---------|
| Timesheets | — | ✅ |
| Overtime tracking | — | ✅ |
| Payroll export | — | Stage 3 |

---

## 10. Tasks Breakdown

### Backend
- [ ] Model + indexes
- [ ] Generate from attendance logic
- [ ] CRUD + submit/approve/decline
- [ ] Overtime calculation
- [ ] Routes + RBAC

### Frontend
- [ ] Weekly grid component
- [ ] Generate + submit flow
- [ ] Approval queue tab
- [ ] Overtime highlight styling

### Integration
- [ ] Seed sample timesheets in S2-8
- [ ] OpenAPI + Postman

**Estimate:** 5 days

---

## 11. Open Questions

- [ ] Allow future-week draft editing or current/past only?
- [ ] Break deductions in Stage 2 or Stage 3?

---

## 12. Acceptance Criteria

- [ ] Draft auto-generates from attendance logs for the selected week
- [ ] Employee can submit; manager can approve
- [ ] Overtime hours calculated and displayed when over threshold
- [ ] OpenAPI and Postman updated
