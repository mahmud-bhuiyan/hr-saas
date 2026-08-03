# Module: Attendance

**Stage:** Stage 2 (S2-2)  
**Status:** Done  
**Depends on:** Platform foundations (S2-1 — audit log, notifications)

---

## 1. Purpose

Employees clock in and out via the web app. Managers see who is currently working; HR can correct missed punches. Attendance logs feed the timesheet module (S2-3).

---

## 2. User Roles & Permissions

| Permission | company_admin | hr_manager | manager | employee |
|------------|:-------------:|:----------:|:-------:|:--------:|
| `attendance:clock:own` | ✅ | ✅ | ✅ | ✅ |
| `attendance:read:own` | ✅ | ✅ | ✅ | ✅ |
| `attendance:read:team` | ✅ | ✅ | ✅ | — |
| `attendance:manage` | ✅ | ✅ | — | — |

---

## 3. Data Model

### Collection: `AttendanceLog`

```js
{
  tenantId: ObjectId,       // required, indexed
  employeeId: ObjectId,   // required
  clockIn: Date,            // required
  clockOut: Date | null,    // null = currently clocked in
  method: 'web' | 'app' | 'kiosk',  // 'web' for Stage 2
  location: {                 // optional, only when tenant GPS enabled
    lat: Number,
    lng: Number
  },
  notes: String,            // HR correction reason
  correctedBy: ObjectId,    // ref User, if HR edited
  createdAt, updatedAt
}
```

**Indexes:** `{ tenantId, employeeId, clockIn }`, `{ tenantId, clockOut: null }` (live board)

### Tenant setting (on `Tenant` or settings subdoc)

```js
{
  attendanceGpsEnabled: Boolean,  // default false
}
```

**Relationships:** Employee → AttendanceLog; AttendanceLog → Timesheet entries (S2-3)

---

## 4. API Endpoints

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| POST | `/api/v1/attendance/clock-in` | `attendance:clock:own` | Start session; optional location if GPS enabled |
| POST | `/api/v1/attendance/clock-out` | `attendance:clock:own` | End open session |
| GET | `/api/v1/attendance/me` | `attendance:read:own` | Own history (paginated) |
| GET | `/api/v1/attendance/me/status` | `attendance:read:own` | Current open session or null |
| GET | `/api/v1/attendance/me/calendar` | `attendance:read:own` | Month calendar with daily totals and summary stats |
| GET | `/api/v1/attendance/settings` | `attendance:clock:own` | Tenant GPS setting |
| PATCH | `/api/v1/attendance/settings` | `company_admin` | Update `attendanceGpsEnabled` |
| GET | `/api/v1/attendance/employee/{employeeId}` | `attendance:manage` / `attendance:read:team` | Employee history (paginated) |
| GET | `/api/v1/attendance/team/live` | `attendance:read:team` | Employees currently clocked in |
| PATCH | `/api/v1/attendance/:id` | `attendance:manage` | HR correction (clockIn/clockOut/notes) |

### Request / response examples

```json
// POST /api/v1/attendance/clock-in
{ "location": { "lat": 51.5074, "lng": -0.1278 } }

// Response
{
  "id": "...",
  "clockIn": "2026-08-02T09:00:00.000Z",
  "clockOut": null,
  "method": "web"
}
```

---

## 5. Business Rules

1. One open session per employee — reject clock-in if `clockOut` is null on any existing log.
2. Clock-out requires an open session — 404 if none.
3. GPS location only accepted when `tenant.attendanceGpsEnabled === true`; show consent banner on first clock-in with GPS.
4. HR corrections require `notes` and set `correctedBy`; write to audit log.
5. All queries scoped by `tenantId` from JWT.
6. Manager team live board shows direct reports only (same scoping as leave team views).

---

## 6. UI Screens & Flows

### Screen: Attendance — My attendance tab (Keka-inspired)
- **Route:** `/dashboard/attendance` (tab: My attendance)
- **Access:** all tenant roles with linked employee record
- **Elements:**
  - **Summary cards:** hours today, hours this week, days present this month, clock status
  - **Timings card:** week strip (M–S), active session / today duration, progress bar
  - **Actions card:** live clock, clock in/out (with GPS consent when enabled), quick links (timesheet, settings)
  - **Logs section:** sub-tabs **Calendar** (default) and **Attendance log**
  - **Calendar:** month grid with daily hour badges; day detail panel (sessions, gross/effective hours, HR correct)
  - **Attendance log:** paginated history table (unchanged behaviour)
  - **24-hour format toggle** (local preference, display only)
- **States:** loading, not clocked in, clocked in, missing employee link

### Screen: Attendance — Team live board tab
- **Route:** `/dashboard/attendance` (tab: Team live board)
- **Access:** manager, hr_manager, company_admin
- **Elements:** table of clocked-in employees with clock-in time

### Screen: Attendance — HR corrections tab
- **Route:** `/dashboard/attendance` (tab: HR corrections)
- **Access:** hr_manager, company_admin
- **Elements:** employee picker + history table + correction modal

### Screen: HR correction modal
- **Route:** modal on attendance history or calendar day detail (HR view)
- **Access:** hr_manager, company_admin
- **Elements:** edit clockIn/clockOut, notes field

### Screen: Attendance settings
- **Route:** `/dashboard/settings/attendance`
- **Access:** company_admin
- **Elements:** GPS toggle

### User flow

```
Employee opens attendance → Clock in → works → Clock out
Manager opens team board → sees who is in
HR opens employee history → corrects missed punch → audit log entry
```

---

## 7. Notifications

| Event | Recipient | Channel |
|-------|-----------|---------|
| Missed clock-out (optional cron) | Employee | in-app + email |

---

## 8. Audit & Compliance

- HR corrections write to `AuditLog` with before/after on `clockIn`/`clockOut`
- GPS data is GDPR-sensitive — tenant opt-in only; document lawful basis
- Retention: align with tenant data retention policy (default 2 years)

---

## 9. Stage 1 vs Stage 2

| Feature | Stage 1 | Stage 2 |
|---------|--------|---------|
| Clock in/out | — | ✅ |
| Live team board | — | ✅ |
| HR corrections | — | ✅ |
| GPS capture | — | Optional tenant setting |
| Mobile/kiosk method | — | Stage 3+ |

---

## 10. Tasks Breakdown

### Backend
- [x] Model + indexes
- [x] Validation (Zod)
- [x] Service layer (clock-in/out, live board, corrections)
- [x] Routes + RBAC
- [x] Audit log hooks
- [x] `GET /me/calendar` — month grouping + summary stats

### Frontend
- [x] Attendance page with clock button
- [x] History table with pagination
- [x] Team live board
- [x] HR correction modal
- [x] GPS consent banner (conditional)
- [x] Keka-style My attendance tab — summary cards, timings card, actions card
- [x] Month calendar with day detail panel
- [x] Logs sub-tabs (Calendar + Attendance log)
- [x] 24-hour format toggle

### Integration
- [x] Sample attendance sessions on staging (manual setup)
- [x] OpenAPI + Postman

**Estimate:** 5 days

---

## 11. Open Questions

- [ ] Auto clock-out at midnight for forgotten sessions?
- [ ] Break tracking in Stage 2 or defer to Stage 3?
- [ ] On-time arrival % and break minutes (Keka-style stats — needs shift/schedule data)
- [ ] Overtime / attendance request tabs (Keka reference — future scope)

---

## 12. Acceptance Criteria

- [x] Employee can clock in and out; cannot double clock-in
- [x] Manager sees live team attendance for direct reports
- [x] HR can correct a missed punch with audit trail
- [x] GPS off by default; works when tenant enables it
- [x] OpenAPI and Postman updated
- [x] Employee sees month calendar with daily hour indicators
- [x] Summary cards reflect today/week/month totals
- [x] Calendar day detail shows sessions and hours
- [x] Team live board and HR corrections tabs unchanged
