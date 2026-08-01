# Module: [Module Name]

> Copy this file to create a new module plan, e.g. `02-employees.md`.
> Remove this instruction block when done.

**Stage:** Demo 1 | Stage 2 | Stage 3 | Stage 4  
**Status:** Not started | In planning | In development | Done  
**Depends on:** [list modules that must exist first]

---

## 1. Purpose

One paragraph: what this module does for the user and why it matters in the product.

---

## 2. User Roles & Permissions

| Permission | company_admin | hr_manager | manager | employee |
|------------|:-------------:|:----------:|:-------:|:--------:|
| example:read:own | ✅ | ✅ | ✅ | ✅ |
| example:create | ✅ | ✅ | — | — |

---

## 3. Data Model

### Collection: `Example`

```js
{
  tenantId: ObjectId,      // required, indexed
  employeeId: ObjectId,    // if applicable
  // ... fields
  createdAt, updatedAt
}
```

**Indexes:** `{ tenantId: 1, employeeId: 1 }`, ...

**Relationships:** Employee → ..., Document → ...

---

## 4. API Endpoints

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/examples` | hr_manager+ | List with filters |
| POST | `/examples` | hr_manager+ | Create |
| GET | `/examples/:id` | scoped | Get one |
| PATCH | `/examples/:id` | scoped | Update |
| DELETE | `/examples/:id` | company_admin | Soft delete |

### Request / response examples

```json
// POST /examples
{ "field": "value" }
```

---

## 5. Business Rules

1. Rule one (validation, state transitions, edge cases)
2. Rule two
3. ...

---

## 6. UI Screens & Flows

### Screen: [Name]
- **Route:** `/path`
- **Access:** roles
- **Elements:** list, filters, actions
- **States:** loading, empty, error

### User flow
```
User action → System response → Next screen
```

---

## 7. Notifications (if any)

| Event | Recipient | Channel | Template |
|-------|-----------|---------|----------|
| example.created | manager | email | `example-submitted` |

---

## 8. Audit & Compliance

- Which actions write to `AuditLog`
- GDPR notes (retention, SAR fields, consent)

---

## 9. Demo 1 vs Later

| Feature | Demo 1 | Later |
|---------|--------|-------|
| Basic CRUD | ✅ | |
| Advanced feature X | — | Stage 2 |

---

## 10. Tasks Breakdown

### Backend
- [ ] Model + indexes
- [ ] Validation (Zod)
- [ ] Service layer
- [ ] Routes + RBAC
- [ ] Tests

### Frontend
- [ ] API hooks (TanStack Query)
- [ ] List screen
- [ ] Detail / form screens
- [ ] Tests

### Integration
- [ ] Seed data for demo
- [ ] E2E happy path

**Estimate:** X days

---

## 11. Open Questions

- [ ] Question for client or team

---

## 12. Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2
