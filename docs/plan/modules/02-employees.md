# Module: Employee Management

**Stage:** Demo 1  
**Status:** Ready for review  
**Depends on:** Auth & Tenant (Step 2)

---

## 1. Purpose

HR records for each person in a company: directory, profile, manager hierarchy, and employment status. Foundation for leave, documents, and payroll later.

---

## 2. User Roles & Permissions

| Permission | company_admin | hr_manager | manager | employee |
|------------|:-------------:|:----------:|:-------:|:--------:|
| `employee:create` | ✅ | ✅ | — | — |
| `employee:read` (all) | ✅ | ✅ | — | — |
| `employee:read:team` | — | — | ✅ | — |
| `employee:update` | ✅ | ✅ | — | — |

---

## 3. Data Model

### Collection: `Employee`

```js
{
  tenantId: ObjectId,       // required, indexed
  userId: ObjectId,         // optional link to login User (not wired in UI yet)
  employeeNumber: String,   // unique per tenant, auto-generated EMP-0001
  firstName, lastName,
  email, phone,
  jobTitle, department,     // department is free text until Step 7
  startDate: Date,
  managerId: ObjectId,      // ref Employee
  status: 'active' | 'on_leave' | 'terminated',
  createdAt, updatedAt
}
```

**Indexes:** `{ tenantId, employeeNumber }` unique; `{ tenantId, status }`, `{ tenantId, department }`, `{ tenantId, managerId }`

---

## 4. API Endpoints (implemented)

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| GET | `/api/v1/employees` | read / read:team | List with search, department, status filters |
| GET | `/api/v1/employees/departments` | read / read:team | Distinct departments for filters |
| POST | `/api/v1/employees` | create | Create employee |
| GET | `/api/v1/employees/:id` | read / read:team | Get one |
| PATCH | `/api/v1/employees/:id` | update | Partial update; deactivate via `status: terminated` |
| GET | `/api/v1/employees/:id/reports` | read / read:team | Direct reports (org view) |

---

## 5. Business Rules

1. All queries scoped by `tenantId` from JWT.
2. Managers with only `employee:read:team` see direct reports (requires linked employee record — deferred).
3. PATCH applies only fields present in request body (client sends changed fields only).
4. Deactivate = set `status` to `terminated` (no hard delete).
5. Employee number auto-generated if omitted.

---

## 6. UI Screens & Flows

| Screen | Route | Status |
|--------|-------|--------|
| Employee directory | `/dashboard/employees` | ✅ |
| Add employee | Modal on directory | ✅ |
| Employee profile | `/dashboard/employees/:id` | ✅ |
| Edit details + deactivate | Profile page | ✅ |
| Direct reports | Profile page section | ✅ |
| Link to login user | — | ⬜ Deferred |

---

## 9. Demo 1 vs Later

| Feature | Demo 1 | Status |
|---------|--------|--------|
| Directory, CRUD, deactivate | ✅ | Done |
| Search / filter | ✅ | Done |
| Manager → direct reports | ✅ | Done |
| Department as managed entity | Step 7 | Free text for now |
| Employee ↔ User link / invite | Later | Not started |
| Bulk CSV import | Stage 2 | Out of scope |

---

## 12. Acceptance Criteria

- [x] Admin/HR can add and edit employees
- [x] Directory supports search and filter by department/status
- [x] Profile shows manager and direct reports
- [x] Deactivate sets status to terminated
- [ ] Link employee record to login user (deferred)
