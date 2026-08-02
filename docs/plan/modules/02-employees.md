# Module: Employee Management

**Stage:** Demo 1 (done) · Stage 2 extensions (S2-1, S2-6)  
**Status:** Ready for review (Demo 1) · Stage 2 not started  
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
  jobTitle, department,     // department string; optional departmentId FK in S2-6
  departmentId: ObjectId,  // Stage 2 optional FK to Department
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

### Stage 2 endpoints (planned)

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| POST | `/api/v1/employees/:id/invite` | create | Send invite email; create/link User |
| POST | `/api/v1/employees/import/validate` | create | Parse CSV; return preview + errors |
| POST | `/api/v1/employees/import/commit` | create | Create employees from validated CSV |

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
| Link to login user | Profile invite action | ⬜ Stage 2 (S2-1) |
| Bulk CSV import | Directory page wizard | ⬜ Stage 2 (S2-6) |

---

## 9. Demo 1 vs Later

| Feature | Demo 1 | Status |
|---------|--------|--------|
| Directory, CRUD, deactivate | ✅ | Done |
| Search / filter | ✅ | Done |
| Manager → direct reports | ✅ | Done |
| Department as managed entity | Step 7 | Free text for now |
| Employee ↔ User link / invite | Stage 2 S2-1 | Not started |
| Bulk CSV import | Stage 2 S2-6 | Not started |
| departmentId FK migration | Stage 2 S2-6 | Optional |

---

## 13. Stage 2 — Employee Invite (S2-1)

### Business rules

1. Invite requires employee `email`; 409 if User with that email already exists in another tenant.
2. Creates User with random password + invite token, or links existing User in same tenant.
3. Sets `Employee.userId` on success.
4. Invite email contains set-password link (reuse PasswordResetToken pattern or separate InviteToken).
5. Manager team-scoped reads require linked employee record for managers.

### Tasks

- [ ] `POST /employees/:id/invite` endpoint
- [ ] Invite button on employee profile (HR/admin)
- [ ] Email template via notification queue
- [ ] OpenAPI + Postman

**Estimate:** 2 days (part of S2-1)

---

## 14. Stage 2 — Bulk CSV Import (S2-6)

### CSV columns (minimum)

`firstName`, `lastName`, `email`, `jobTitle`, `department`, `startDate`, `managerEmail` (optional)

### Business rules

1. Two-step: validate returns `{ valid: [], errors: [{ row, field, message }] }` — no DB writes.
2. Commit only processes previously validated batch (session id or re-upload with confirm).
3. Duplicate email within tenant → error on that row.
4. Max 500 rows per import.
5. Writes audit log entry per batch.

### Tasks

- [ ] CSV parser + validation service
- [ ] Validate + commit endpoints
- [ ] Import wizard UI on EmployeesPage
- [ ] OpenAPI + Postman

**Estimate:** 4 days (part of S2-6)

---

## 12. Acceptance Criteria

- [x] Admin/HR can add and edit employees
- [x] Directory supports search and filter by department/status
- [x] Profile shows manager and direct reports
- [x] Deactivate sets status to terminated
- [ ] Link employee record to login user via invite (Stage 2 S2-1)
- [ ] Bulk CSV import with validation preview (Stage 2 S2-6)
