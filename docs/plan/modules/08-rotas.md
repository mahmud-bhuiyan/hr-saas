# Module: Shifts & Rotas

**Stage:** Stage 3 (S3-1 foundations → S3-2 backend → S3-3 UI ✅)  
**Status:** Complete — S3-1 through S3-3 done  
**Depends on:** Stage 2 complete (attendance, timesheets, leave); S3-1 WorkLocation

---

## 1. Purpose

HR and managers schedule employee shifts on a weekly rota grid. Shifts can be draft, published to staff, or left open for employees to claim. Conflict detection prevents double-booking and overlapping approved leave.

---

## 2. User Roles & Permissions

| Permission | company_admin | hr_manager | manager | employee |
|------------|:-------------:|:----------:|:-------:|:--------:|
| `location:read` | ✅ | ✅ | — | — |
| `location:manage` | ✅ | ✅ | — | — |
| `rota:read` | ✅ | ✅ | ✅ | — |
| `rota:manage` | ✅ | ✅ | ✅ | — |
| `rota:read:own` | ✅ | ✅ | ✅ | ✅ |
| `rota:claim:own` | ✅ | ✅ | ✅ | ✅ |

Managers edit team rotas only (direct reports + unassigned open shifts).

---

## 3. Data Model

### Collection: `WorkLocation` (S3-1)

```js
{
  tenantId: ObjectId,
  name: String,           // required, unique per tenant
  address: String,
  timezone: String,       // IANA e.g. Europe/London
  isArchived: Boolean,
  createdBy, updatedBy,
  createdAt, updatedAt
}
```

**Indexes:** `{ tenantId: 1, name: 1 }` unique

### Collection: `Shift` (S3-2)

```js
{
  tenantId: ObjectId,
  employeeId: ObjectId | null,  // null = open shift
  date: String,                 // YYYY-MM-DD local
  startTime: String,            // HH:mm
  endTime: String,              // HH:mm
  role: String,                 // optional label e.g. "Floor"
  locationId: ObjectId,         // ref WorkLocation
  status: 'draft' | 'published' | 'open',
  publishedAt: Date,
  claimedBy: ObjectId,          // ref Employee when open shift claimed
  createdBy, updatedBy,
  createdAt, updatedAt
}
```

**Indexes:** `{ tenantId: 1, date: 1 }`, `{ tenantId: 1, employeeId: 1, date: 1 }`

### Collection: `RotaTemplate` (S3-2)

```js
{
  tenantId: ObjectId,
  name: String,
  weekPattern: [{
    dayOfWeek: Number,    // 0–6
    shifts: [{ startTime, endTime, role?, locationId, employeeId? }]
  }],
  createdBy,
  createdAt, updatedAt
}
```

**Relationships:** Employee → Shift; WorkLocation → Shift; LeaveRequest → conflict check

---

## 4. API Endpoints

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| GET | `/api/v1/locations` | `location:read` | List work locations |
| POST | `/api/v1/locations` | `location:manage` | Create location |
| PATCH | `/api/v1/locations/:id` | `location:manage` | Update or archive |
| GET | `/api/v1/rotas/:weekOf` | `rota:read` / `rota:read:own` | Shifts for ISO week start date |
| POST | `/api/v1/rotas/shifts` | `rota:manage` | Create shift |
| PATCH | `/api/v1/rotas/shifts/:id` | `rota:manage` | Update shift |
| DELETE | `/api/v1/rotas/shifts/:id` | `rota:manage` | Delete draft shift |
| POST | `/api/v1/rotas/publish` | `rota:manage` | Publish week shifts |
| POST | `/api/v1/rotas/shifts/:id/claim` | `rota:claim:own` | Claim open shift |
| POST | `/api/v1/rotas/copy-week` | `rota:manage` | Copy previous week pattern |

### Request / response examples

```json
// POST /api/v1/rotas/shifts
{
  "employeeId": "...",
  "date": "2026-08-04",
  "startTime": "09:00",
  "endTime": "17:00",
  "locationId": "...",
  "status": "draft"
}
```

---

## 5. Business Rules

1. Shifts must reference a valid, non-archived `WorkLocation`.
2. No overlapping shifts for the same employee on the same date.
3. Block or warn when shift overlaps **approved** leave for that employee.
4. Only `draft` shifts can be deleted; published shifts are edited via PATCH.
5. Open shifts (`employeeId` null, `status: open`) can be claimed once by an employee.
6. Publish sets `status: published` and `publishedAt` on all draft shifts in the week.
7. All queries scoped by `tenantId` from JWT.

---

## 6. UI Screens & Flows

### Screen: Work locations (S3-1)
- **Route:** `/dashboard/settings/locations`
- **Access:** hr_manager, company_admin

### Screen: Weekly rota grid (S3-3)
- **Route:** `/dashboard/rotas`
- **Access:** hr_manager, company_admin, manager (team scope)
- **Elements:** week picker, grid by day × employee or day × slot, add shift modal, publish button, copy week

### Screen: My shifts (S3-3)
- **Route:** `/dashboard/rotas` (My shifts tab)
- **Access:** all employees

### Screen: Open shifts (S3-3)
- **Route:** tab on rota page
- **Access:** employees claim; managers view claims

### User flow

```
HR creates locations → builds draft rota → publishes → employees view shifts
Employee claims open shift → notification to manager
```

---

## 7. Notifications

| Event | Recipient | Channel |
|-------|-----------|---------|
| Rota published | Assigned employees | in-app + email |
| Open shift available | All employees (or location group) | in-app |
| Shift claimed | Manager / HR | in-app |

---

## 8. Audit & Compliance

- Shift create/update/delete and publish write to `AuditLog`
- WorkLocation create/update/archive write to `AuditLog` (S3-1)
- Scheduling data retained per HR policy

---

## 9. Stage 2 vs Stage 3

| Feature | Stage 2 | Stage 3 |
|---------|---------|---------|
| Clock in/out | ✅ | |
| Weekly rota | — | ✅ |
| Work locations | — | ✅ S3-1 |
| Open shift claim | — | ✅ S3-3 |
| Drag-and-drop grid | — | Optional future enhancement |

---

## 10. Tasks Breakdown

### Backend (S3-1 partial)
- [x] WorkLocation model + CRUD (S3-1)
- [x] Shift + RotaTemplate models (S3-2)
- [x] Conflict detection service (S3-2)
- [x] Rota routes + RBAC (S3-2)
- [x] Claim shift + copy-week endpoints (S3-3)
- [x] Publish/claim notifications (S3-3)

### Frontend (S3-1 partial)
- [x] Locations settings page (S3-1)
- [x] Rota weekly grid (S3-3)
- [x] My shifts + open shifts (S3-3)

**Estimate:** 12 days total (3 + 4 + 5)

---

## 11. Open Questions

- [ ] Manager approval required on open-shift claim, or auto-assign?
- [x] Table grid vs `@dnd-kit` drag-drop for v1? — **Table grid chosen for v1**

---

## 12. Acceptance Criteria

- [x] HR can CRUD work locations
- [x] HR can create, publish, and copy weekly rotas
- [x] Employees see assigned shifts and can claim open shifts
- [x] Leave conflicts detected on overlapping shifts
- [x] Leave approval queue shows rota clashes (`conflictingShifts`) with confirm modal
- [x] OpenAPI and Postman updated
