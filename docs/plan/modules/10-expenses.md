# Module: Expenses

**Stage:** Stage 2 (S2-4)  
**Status:** Not started  
**Depends on:** Document storage (S3 pattern), Notifications (S2-1)

---

## 1. Purpose

Employees submit expense claims with receipt uploads. Managers and HR approve or decline. Finance exports approved expenses to CSV for accounting systems.

---

## 2. User Roles & Permissions

| Permission | company_admin | hr_manager | manager | employee |
|------------|:-------------:|:----------:|:-------:|:--------:|
| `expense:create:own` | ✅ | ✅ | ✅ | ✅ |
| `expense:read:own` | ✅ | ✅ | ✅ | ✅ |
| `expense:approve:team` | — | — | ✅ | — |
| `expense:approve` | ✅ | ✅ | — | — |
| `expense:export` | ✅ | ✅ | — | — |

---

## 3. Data Model

### Collection: `Expense`

```js
{
  tenantId: ObjectId,
  employeeId: ObjectId,
  category: 'travel' | 'meals' | 'equipment' | 'other',
  amount: Number,           // positive decimal
  currency: String,           // default 'GBP', ISO 4217
  date: Date,                 // expense date
  description: String,
  receiptFileKey: String,     // S3 key
  receiptFileName: String,
  mimeType: String,
  fileSize: Number,
  status: 'pending' | 'approved' | 'declined' | 'reimbursed',
  approverId: ObjectId,
  approvedAt: Date,
  declineReason: String,
  createdAt, updatedAt
}
```

**Indexes:** `{ tenantId, employeeId, status }`, `{ tenantId, status, date }`

**Relationships:** Employee → Expense; receipt in S3 (same bucket as documents)

---

## 4. API Endpoints

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| POST | `/api/v1/expenses/presign` | `expense:create:own` | Presigned receipt upload URL |
| GET | `/api/v1/expenses` | scoped | List (own or approval queue) |
| POST | `/api/v1/expenses` | `expense:create:own` | Create after receipt uploaded |
| GET | `/api/v1/expenses/:id` | scoped | Get one |
| PATCH | `/api/v1/expenses/:id` | `expense:create:own` | Edit pending own only |
| POST | `/api/v1/expenses/:id/approve` | approve permissions | Approve |
| POST | `/api/v1/expenses/:id/decline` | approve permissions | Decline with reason |
| GET | `/api/v1/expenses/export` | `expense:export` | CSV download (filtered by date/status) |

### Request example

```json
// POST /api/v1/expenses
{
  "category": "travel",
  "amount": 45.50,
  "currency": "GBP",
  "date": "2026-08-01",
  "description": "Client meeting taxi",
  "receiptFileKey": "tenant-id/expenses/uuid/receipt.jpg",
  "receiptFileName": "taxi-receipt.jpg",
  "mimeType": "image/jpeg",
  "fileSize": 102400
}
```

---

## 5. Business Rules

1. Receipt required for amounts over tenant threshold (default £0 — always required in Stage 2).
2. Only `pending` expenses can be edited or deleted by submitter.
3. Verify receipt exists in S3 before creating expense (same as documents module).
4. Manager approves direct reports; HR/admin approves all.
5. `reimbursed` status set manually by HR (optional in S2-4) or via export flag.
6. CSV export columns: date, employee, category, amount, currency, description, status, approvedAt.
7. Notification on submit, approve, decline.

---

## 6. UI Screens & Flows

### Screen: Expenses
- **Route:** `/dashboard/expenses`
- **Access:** all tenant roles
- **Elements:** submit form (category, amount, date, description, receipt upload), my expenses table
- **States:** loading, empty, list with status badges

### Screen: Approval queue
- **Route:** `/dashboard/expenses` tab
- **Access:** manager, hr_manager, company_admin
- **Elements:** pending table, approve/decline, receipt preview link

### Screen: Export
- **Route:** button on expenses page (HR/admin)
- **Elements:** date range filter, download CSV

### User flow

```
Employee uploads receipt → fills form → submits → Manager approves
→ HR exports CSV for finance
```

---

## 7. Notifications

| Event | Recipient | Channel |
|-------|-----------|---------|
| Expense submitted | Manager / HR | in-app + email |
| Approved | Employee | in-app + email |
| Declined | Employee | in-app + email |

---

## 8. Audit & Compliance

- Create/approve/decline write to audit log
- Receipts are financial records — retain per accounting policy
- VAT/receipt OCR deferred to Stage 3+

---

## 9. Demo 1 vs Stage 2

| Feature | Demo 1 | Stage 2 |
|---------|--------|---------|
| Expense claims | — | ✅ |
| Receipt OCR | — | Stage 3+ |
| Xero sync | — | Stage 3 |

---

## 10. Tasks Breakdown

### Backend
- [ ] Model + indexes
- [ ] Presign + create (reuse S3 service)
- [ ] List with role scoping
- [ ] Approve/decline + CSV export
- [ ] Routes + RBAC

### Frontend
- [ ] Expense submit form with receipt upload
- [ ] My expenses table
- [ ] Approval queue tab
- [ ] Export button + date filter

### Integration
- [ ] Seed sample expenses in S2-8
- [ ] OpenAPI + Postman

**Estimate:** 5 days

---

## 11. Open Questions

- [ ] Multi-currency conversion or store as submitted?
- [ ] Per-category spending limits?

---

## 12. Acceptance Criteria

- [ ] Employee can submit expense with receipt upload
- [ ] Manager/HR can approve or decline
- [ ] HR can export approved expenses to CSV
- [ ] OpenAPI and Postman updated
