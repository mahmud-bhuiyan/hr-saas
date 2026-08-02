# Module: Notifications

**Stage:** Stage 2 (S2-1)  
**Status:** Not started  
**Depends on:** Foundation (Demo 1), Redis in docker-compose

---

## 1. Purpose

Deliver timely in-app and email notifications without blocking API requests. Uses BullMQ + Redis for async job processing. Replaces direct SendGrid calls in hot paths with queued delivery where appropriate.

---

## 2. User Roles & Permissions

| Permission | company_admin | hr_manager | manager | employee |
|------------|:-------------:|:----------:|:-------:|:--------:|
| `notification:read:own` | ✅ | ✅ | ✅ | ✅ |
| `notification:manage` (system) | — | — | — | — |

All users receive notifications scoped to their `userId`. No cross-user notification read.

---

## 3. Data Model

### Collection: `Notification`

```js
{
  tenantId: ObjectId,
  userId: ObjectId,         // recipient
  type: String,             // e.g. 'leave.submitted', 'expense.approved'
  title: String,
  body: String,
  readAt: Date | null,
  metadata: Object,         // { entityType, entityId, link }
  createdAt, updatedAt
}
```

**Indexes:** `{ tenantId, userId, readAt, createdAt }`, `{ userId, createdAt }`

### Queue jobs (BullMQ)

| Queue | Job | Payload |
|-------|-----|---------|
| `notifications` | `send-email` | `{ to, subject, html, tenantId }` |
| `notifications` | `create-in-app` | `{ tenantId, userId, type, title, body, metadata }` |
| `notifications` | `document-expiry-cron` | `{ tenantId }` (S2-5) |

---

## 4. API Endpoints

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| GET | `/api/v1/notifications` | authenticated | List own notifications (paginated) |
| GET | `/api/v1/notifications/unread-count` | authenticated | Unread count for bell badge |
| PATCH | `/api/v1/notifications/:id/read` | owner | Mark one read |
| POST | `/api/v1/notifications/read-all` | authenticated | Mark all own notifications read |

---

## 5. Business Rules

1. In-app notifications always created for the target user before or with email dispatch.
2. Email jobs processed by `npm run worker` — API enqueues, worker sends via existing SendGrid service.
3. When `SENDGRID_API_KEY` unset, log email to console (same as Demo 1 leave emails).
4. Worker must connect to same Redis as configured in `REDIS_URL`.
5. Failed jobs retry 3 times with exponential backoff; dead-letter log on final failure.
6. Notification types are string constants duplicated in client for icon/label mapping.

---

## 6. UI Screens & Flows

### Component: Notification bell
- **Location:** [AppShell.tsx](../../../client/src/components/AppShell.tsx) header
- **Elements:** bell icon, unread badge, dropdown list, "Mark all read"
- **States:** loading, empty, list with read/unread styling

### User flow

```
Event occurs (e.g. leave submitted) → Service enqueues in-app + email jobs
→ Worker processes → User sees bell badge → clicks → marks read
```

---

## 7. Notifications (this module's own events)

| Event | Recipient | Channel |
|-------|-----------|---------|
| N/A | — | This module is the delivery infrastructure |

Existing leave emails migrate to queue gradually; new Stage 2 modules use queue from day one.

---

## 8. Audit & Compliance

- Notification records are not sensitive; no PII in `body` beyond names/links
- Email content must not include passwords or tokens
- User can mark read; no delete required for MVP (optional retention job later)

---

## 9. Demo 1 vs Stage 2

| Feature | Demo 1 | Stage 2 |
|---------|--------|---------|
| Email (SendGrid, sync) | ✅ Leave only | Queued via BullMQ |
| In-app notifications | — | ✅ |
| Notification bell UI | — | ✅ |
| SMS (Twilio) | — | Optional S2-8 |

---

## 10. Tasks Breakdown

### Backend
- [ ] Notification model + indexes
- [ ] BullMQ queue setup + worker entry (`server/src/worker.ts`)
- [ ] `npm run worker` script
- [ ] Notification service (create, list, mark read)
- [ ] Refactor leave email to enqueue (optional in S2-1, required before S2-4)
- [ ] Routes + RBAC

### Frontend
- [ ] Notification bell component
- [ ] Dropdown list with mark read
- [ ] Poll or refetch on focus for unread count

### Integration
- [ ] Redis documented in README for production
- [ ] OpenAPI + Postman

**Estimate:** 4 days

---

## 11. Open Questions

- [ ] WebSocket push (Socket.io) in Stage 2 or defer to Stage 3?
- [ ] User notification preferences (email on/off per type)?

---

## 12. Acceptance Criteria

- [ ] In-app notification created and listed for recipient
- [ ] Unread count updates in app shell bell
- [ ] Email jobs processed by worker when Redis running
- [ ] Mark read and mark all read work
- [ ] OpenAPI and Postman updated
