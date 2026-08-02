# Module: Leave & Absence

**Stage:** Stage 1 (done) · Stage 2 enhancements (S2-5)  
**Status:** Complete (Stage 1) · Stage 2 complete (S2-5)  
**Depends on:** Auth & Tenant (Step 2), Employee Management (Step 4)

---

## 1. Purpose

Employees submit leave requests; managers and HR approve or decline them. Tracks annual leave balance with a fixed entitlement for Stage 1. Unblocks the core demo narrative: request → approval → balance update.

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
  type: 'annual' | 'sick' | 'unpaid' | 'planned',
  startDate: Date,
  endDate: Date,
  halfDay: Boolean,
  reason: String,
  status: 'pending' | 'approved' | 'declined' | 'cancelled',
  approverId: ObjectId,
  approvedAt: Date,
  declineReason: String,
  approvalStep: Number,     // Stage 2: 1 = manager, 2 = HR (when multi-step enabled)
  createdAt, updatedAt
}
```

### Tenant leave settings (Stage 2 — on Tenant or settings subdoc)

```js
{
  annualEntitlement: Number,       // default 25
  maxCarryOverDays: Number,        // default 5
  multiStepApprovalEnabled: Boolean // default false
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
  carriedOver: Number    // 0 for Stage 1
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
3. Leave types: `annual`, `sick`, `unpaid`, `planned` (fixed list).
4. Day count: `(endDate - startDate) + 1`; half-day = 0.5 (single-day only).
5. Only **annual** leave affects `LeaveBalance`; sick, unpaid, and planned are tracked but don't deduct.
6. Submit creates `pending`; annual increments `pending` on balance.
7. Approve moves annual days `pending → taken`; decline/cancel reverses `pending`.
8. Reject overlapping pending/approved requests for same employee.
9. Reject annual submit if insufficient balance.
10. Default entitlement: 25 days/year (hardcoded for Stage 1).

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

## 9. Stage 1 vs Later

| Feature | Stage 1 | Later |
|---------|--------|-------|
| Fixed entitlement | ✅ | Accrual engine (S2-5) |
| Single approver | ✅ | Multi-step chains (S2-5) |
| Annual balance only | ✅ | Sick/unpaid balances (Stage 3) |
| Email notifications | ✅ | Queued via BullMQ (S2-1) |
| Team clash detection | — | ✅ S3-7 (approver queue shows `conflictingShifts`) |
| Document expiry reminders | — | S2-5 (email HR) |

---

## 13. Stage 2 — Leave Enhancements (S2-5)

### Pro-rata accrual

- Entitlement for calendar year = `annualEntitlement × (days employed in year / days in year)`.
- Mid-year starters get prorated entitlement on first balance access or via cron.
- Part-time FTE factor (default 1.0) — ✅ scales entitlement in `calculateProRataEntitlement` (S3-7).

### Carry-over

- On year boundary (or manual HR trigger): `carriedOver = min(remaining, maxCarryOverDays)`.
- New year balance: `entitlement = annualEntitlement`, `carriedOver` set, `taken/pending` reset.

### Multi-step approval

When `multiStepApprovalEnabled`:

1. Submit → `approvalStep: 1`, status `pending` — waiting for manager.
2. Manager approves step 1 → `approvalStep: 2` — waiting for HR.
3. HR approves step 2 → status `approved`, balance updated.

Decline at any step → status `declined`, reverse pending balance.

### API changes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/settings/leave` | Get tenant leave policy |
| PATCH | `/api/v1/settings/leave` | Update policy (company_admin) |

### Tasks

- [x] Tenant leave settings model + endpoints
- [x] Accrual calculation in balance service
- [x] Carry-over job (BullMQ cron on Jan 1 or manual)
- [x] Multi-step approve handler updates
- [x] Policy settings UI
- [x] Approval queue step indicators
- [x] OpenAPI + Postman

**Estimate:** 5 days (part of S2-5)

---

## 12. Acceptance Criteria

- [x] Employee can submit annual/sick/unpaid leave when employee record matches login email
- [x] Manager sees and approves team pending requests
- [x] HR/admin sees all pending requests
- [x] Annual balance updates on approve/decline/cancel
- [x] Team calendar shows approved + pending leave for the month
- [x] Email sent on submit, approve, decline (SendGrid)
- [x] OpenAPI and Postman updated
- [x] Pro-rata accrual reflects employee start date (Stage 2 S2-5)
- [x] Multi-step approval manager → HR when enabled (Stage 2 S2-5)
- [x] Carry-over applied per tenant policy (Stage 2 S2-5)
