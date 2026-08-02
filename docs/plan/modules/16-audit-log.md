# Module: Audit Log

**Stage:** Stage 2 (S2-1)  
**Status:** Done  
**Depends on:** Auth & Tenant (Demo 1)

---

## 1. Purpose

Immutable-style audit trail for sensitive HR data changes. Supports GDPR accountability (who changed what, when) and gives HR/admins a viewer UI. Referenced in Demo 1 as backend-only; Stage 2 ships the full module.

---

## 2. User Roles & Permissions

| Permission | company_admin | hr_manager | manager | employee |
|------------|:-------------:|:----------:|:-------:|:--------:|
| `audit:read` | ✅ | ✅ | — | — |

Super admin platform actions (registration approve/reject) may be logged separately with `tenantId: null` — optional for S2-1.

---

## 3. Data Model

### Collection: `AuditLog`

```js
{
  tenantId: ObjectId,       // required for tenant-scoped actions
  userId: ObjectId,         // actor
  action: 'create' | 'update' | 'delete',
  entityType: String,       // 'Employee' | 'HrDocument' | 'User' | 'LeaveRequest' | ...
  entityId: ObjectId,
  before: Object | null,    // snapshot before change (update/delete)
  after: Object | null,     // snapshot after change (create/update)
  ip: String,
  userAgent: String,
  createdAt                  // no updatedAt — append-only
}
```

**Indexes:** `{ tenantId, createdAt }`, `{ tenantId, entityType, entityId }`, `{ tenantId, userId }`

**Relationships:** Written by service hooks; read-only from API

---

## 4. API Endpoints

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| GET | `/api/v1/audit-logs` | `audit:read` | List with filters |

### Query parameters

| Param | Type | Description |
|-------|------|-------------|
| `entityType` | string | Filter by entity |
| `entityId` | string | Filter by specific record |
| `userId` | string | Filter by actor |
| `from` | date | Start date (ISO) |
| `to` | date | End date (ISO) |
| `page` | number | Pagination |
| `limit` | number | Page size (max 100) |

---

## 5. Business Rules

1. Append-only — no update or delete on audit records.
2. Log on create/update/delete for: `Employee`, `HrDocument`, `User` (role/status changes), `LeaveRequest` (status changes).
3. `before`/`after` store whitelisted fields only — no password hashes, no tokens.
4. IP captured from `req.ip` / `X-Forwarded-For` on Vercel.
5. All list queries scoped by `tenantId` from JWT.
6. Attendance corrections (S2-2) and expense approvals (S2-4) also write audit entries.

---

## 6. UI Screens & Flows

### Screen: Audit log
- **Route:** `/dashboard/settings/audit-log`
- **Access:** company_admin, hr_manager
- **Elements:** filterable table (date, entity type, actor, action), detail expand for before/after diff
- **States:** loading, empty, paginated list

### User flow

```
HR edits employee → Service saves + writes AuditLog → HR opens audit log → filters by Employee → sees change
```

---

## 7. Notifications

None for audit log itself.

---

## 8. Audit & Compliance

- Primary GDPR artifact for accountability
- Supports Subject Access Request — include audit entries where user is actor or subject
- Retention: configurable per tenant (default 7 years for HR); cron purge in Stage 4 if needed
- Do not log read/access events in S2-1 (volume); consider Stage 4

---

## 9. Demo 1 vs Stage 2

| Feature | Demo 1 | Stage 2 |
|---------|--------|---------|
| createdBy/updatedBy on records | ✅ | ✅ |
| Central AuditLog collection | — | ✅ |
| Audit log UI | — | ✅ |
| SAR export | — | Stage 4 |

---

## 10. Tasks Breakdown

### Backend
- [ ] AuditLog model + indexes
- [ ] `writeAuditLog()` helper
- [ ] Hooks in employee, document, user, leave services
- [ ] List endpoint with filters
- [ ] Routes + RBAC

### Frontend
- [ ] Audit log page under Settings
- [ ] Filters + paginated table
- [ ] Before/after diff display (JSON or field-level)

### Integration
- [ ] Seed does not need audit entries
- [ ] OpenAPI + Postman

**Estimate:** 3 days

---

## 11. Open Questions

- [ ] Log authentication events (login, password reset)?
- [ ] Export audit log to CSV for compliance?

---

## 12. Acceptance Criteria

- [ ] Employee update creates audit entry with before/after
- [ ] HR can list and filter audit logs for their tenant
- [ ] Password hashes never appear in audit payloads
- [ ] OpenAPI and Postman updated
