# Module: Leave & Absence

**Stage:** Demo 1  
**Status:** Complete  
**Depends on:** Auth & Tenant (Step 2), Employee Management (Step 4)

---

## 1. Purpose

Employees submit leave requests; managers and HR approve or decline them. Tracks annual leave balance with a fixed entitlement for Demo 1. Unblocks the core demo narrative: request → approval → balance update.

---

## 2. User Roles & Permissions

| Permission | company_admin | hr_manager | manager | employee |
|------------|:-------------:|:----------:|:-------:|:--------:|
| `leave:create:own` | ✅ | ✅ | ✅ | ✅ |
| `leave:read:own` | ✅ | ✅ | ✅ | ✅ |
| `leave:approve` (all) | ✅ | ✅ | — | — |
| `leave:approve:team` | — | — | ✅ | — |

---

## 3. Data Model

### Collection: `LeaveRequest`

```js
{
  tenantId: ObjectId,
  employeeId: ObjectId,
  type: 'annual' | 'sick' | 'unpaid',
  startDate: Date,
  endDate: Date,
  halfDay: Boolean,
  reason: String,
  status: 'pending' | 'approved' | 'declined' | 'cancelled',
  approverId: ObjectId,
  approvedAt: Date,
  declineReason: String,
  createdAt, updatedAt
}
```

**Indexes:** `{ tenantId, employeeId, status }`, `{ tenantId, status, startDate }`

### Collection: `LeaveBalance`

```js
{
  tenantId: ObjectId,
  employeeId: ObjectId,
  year: Number,
  entitlement: Number,   // default 25
  taken: Number,
  pending: Number,
  carriedOver: Number    // 0 for Demo 1
}
```

**Index:** `{ tenantId, employeeId, year }` unique

---

## 4. API Endpoints

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| GET | `/api/v1/leave/requests` | scoped | List leave requests |
| POST | `/api/v1/leave/requests` | `leave:create:own` | Submit leave request |
| GET | `/api/v1/leave/requests/:id` | scoped | Get one request |
| POST | `/api/v1/leave/requests/:id/cancel` | `leave:create:own` | Cancel own pending request |
| POST | `/api/v1/leave/requests/:id/approve` | `leave:approve` / `leave:approve:team` | Approve pending |
| POST | `/api/v1/leave/requests/:id/decline` | `leave:approve` / `leave:approve:team` | Decline pending |
| GET | `/api/v1/leave/balances/me` | `leave:read:own` | Own annual balance |
| GET | `/api/v1/leave/balances/:employeeId` | `leave:approve` | Employee balance (HR/admin) |
| GET | `/api/v1/leave/calendar` | `leave:approve` / `leave:approve:team` | Team calendar view |

---

## 5. Business Rules

1. All queries scoped by `tenantId` from JWT.
2. User → employee resolution: `Employee.userId` first, then email fallback (`User.email` = `Employee.email`).
3. Leave types: `annual`, `sick`, `unpaid` (fixed list).
4. Day count: `(endDate - startDate) + 1`; half-day = 0.5 (single-day only).
5. Only **annual** leave affects `LeaveBalance`; sick/unpaid are tracked but don't deduct.
6. Submit creates `pending`; annual increments `pending` on balance.
7. Approve moves annual days `pending → taken`; decline/cancel reverses `pending`.
8. Reject overlapping pending/approved requests for same employee.
9. Reject annual submit if insufficient balance.
10. Default entitlement: 25 days/year (hardcoded for Demo 1).

---

## 6. UI Screens & Flows

| Screen | Route | Access |
|--------|-------|--------|
| My Leave (balance + history + request) | `/dashboard/leave` tab | All tenant roles |
| Approval queue | `/dashboard/leave` tab | manager, hr_manager, company_admin |
| Team calendar | `/dashboard/leave` tab | manager, hr_manager, company_admin |

---

## 7. Notifications

| Event | Recipient | Channel |
|-------|-----------|---------|
| Request submitted | Manager (or HR fallback) | SendGrid email |
| Approved | Employee | SendGrid email |
| Declined | Employee | SendGrid email |

---

## 9. Demo 1 vs Later

| Feature | Demo 1 | Later |
|---------|--------|-------|
| Fixed entitlement | ✅ | Accrual engine (Stage 2) |
| Single approver | ✅ | Multi-step chains (Stage 2) |
| Annual balance only | ✅ | Sick/unpaid balances |
| Email notifications | ✅ | SMS (Stage 2) |
| Team clash detection | — | Stage 2 |

---

## 12. Acceptance Criteria

- [x] Employee can submit annual/sick/unpaid leave when employee record matches login email
- [x] Manager sees and approves team pending requests
- [x] HR/admin sees all pending requests
- [x] Annual balance updates on approve/decline/cancel
- [x] Team calendar shows approved + pending leave for the month
- [x] Email sent on submit, approve, decline (SendGrid)
- [x] OpenAPI and Postman updated
