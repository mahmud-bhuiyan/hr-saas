# Module: Auth & Tenant

**Stage:** Demo 1 (done) · Stage 2 extensions (S2-1 done)  
**Status:** Done  
**Depends on:** Step 1 (Foundation)

---

## 1. Purpose

Authentication, multi-tenant isolation, and company onboarding. Every business route is scoped by tenant; platform operators use the super admin role.

---

## 2. User Roles & Permissions

| Capability | super_admin | company_admin | hr_manager | manager | employee |
|------------|:-----------:|:-------------:|:----------:|:-------:|:--------:|
| Platform admin | ✅ | — | — | — | — |
| Self-register company | — | ✅ (public) | — | — | — |
| Approve / reject registration | ✅ | — | — | — | — |
| Create company directly | ✅ | — | — | — | — |
| Edit platform site settings | ✅ | — | — | — | — |
| Login / logout / refresh | ✅ | ✅ | ✅ | ✅ | ✅ |
| View / edit own profile | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 3. Data Model

### Collection: `Tenant`

- `name`, `isActive`, `approvalStatus` (`pending` | `approved` | `rejected`)
- `rejectedReason`, `approvedAt`, `approvedBy`, `createdBy`, `updatedBy`

### Collection: `User`

- `email`, `passwordHash`, `role`, `tenantId`, `firstName`, `lastName`, `isActive`

### Collection: `PasswordResetToken` (Stage 2 — S2-1)

```js
{
  userId: ObjectId,
  tokenHash: String,        // hashed token sent in email link
  expiresAt: Date,
  usedAt: Date | null,
  createdAt
}
```

**Index:** `{ tokenHash }` unique, TTL on `expiresAt`

---

## 4. API Endpoints (implemented)

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/api/v1/auth/register` | Public | Self-register company (pending) |
| POST | `/api/v1/auth/login` | Public | Login; blocks pending/rejected tenants |
| POST | `/api/v1/auth/refresh` | Cookie | New access token |
| POST | `/api/v1/auth/logout` | Public | Clear refresh cookie |
| GET | `/api/v1/auth/me` | Authenticated | Current user profile |
| PATCH | `/api/v1/auth/me` | Authenticated | Update profile / password |
| POST | `/api/v1/admins` | Bootstrap or super_admin | Create admin user |
| GET | `/api/v1/admin/registrations` | super_admin | List registrations |
| POST | `/api/v1/admin/registrations` | super_admin | Create approved company + admin |
| POST | `/api/v1/admin/registrations/:tenantId/approve` | super_admin | Approve pending registration |
| POST | `/api/v1/admin/registrations/:tenantId/reject` | super_admin | Reject pending registration |
| PATCH | `/api/v1/admin/registrations/:tenantId` | super_admin | Update approved company |
| POST | `/api/v1/admin/registrations/:tenantId/deactivate` | super_admin | Deactivate company |
| POST | `/api/v1/admin/registrations/:tenantId/activate` | super_admin | Reactivate company |

### Stage 2 endpoints (S2-1 — planned)

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/api/v1/auth/forgot-password` | Public | Send reset email if user exists |
| POST | `/api/v1/auth/reset-password` | Public | Validate token + set new password |

---

## 5. Business Rules

1. Self-registration creates tenant + company admin with `approvalStatus: pending`; login blocked until approved.
2. Super admin can create a company in one step — tenant and admin are active immediately.
3. On company approval or direct company creation, a linked employee record is created for the company admin so they can use leave, attendance, and other self-service features while keeping admin role permissions.
4. `tenantId` comes from JWT only; never trust client-supplied tenant id.
5. Super admin bootstrap: `npm run seed:superadmin` or first `POST /api/v1/admins` when DB has zero users.

---

## 6. UI Screens & Flows

| Screen | Route | Status |
|--------|-------|--------|
| Login | `/login` | ✅ |
| Register company | `/register` | ✅ |
| My profile | `/dashboard/profile` | ✅ |
| Companies (super admin) | `/dashboard/registrations` | ✅ |
| Platform site settings (super admin) | `/dashboard/platform/site-settings` | ✅ Complete |
| Forgot password | `/forgot-password` | ✅ |
| Reset password | `/reset-password` | ✅ |

---

## 7. Demo 1 vs Later

| Feature | Demo 1 | Stage 2 |
|---------|--------|---------|
| Register / login / refresh | ✅ | |
| Registration approval | ✅ | |
| Super admin add company | ✅ | |
| Profile + change password | ✅ | |
| Forgot password (email) | — | ✅ S2-1 |

---

## 13. Stage 2 — Forgot Password (S2-1)

### Business rules

1. `POST /auth/forgot-password` always returns 200 (no email enumeration).
2. Token expires in 1 hour; single use.
3. Reset link: `{CLIENT_URL}/reset-password?token=…`
4. Invalidate all refresh tokens on successful reset (optional — force re-login).
5. Email via notification queue (BullMQ) when Redis available.

### Tasks

- [ ] PasswordResetToken model
- [ ] Forgot + reset endpoints + Zod validation
- [ ] ForgotPasswordPage + ResetPasswordPage (reuse UI kit, icons on all fields)
- [ ] Link from LoginPage
- [ ] OpenAPI + Postman

**Estimate:** 2 days (part of S2-1)

---

## 12. Acceptance Criteria

- [x] Company can self-register; data isolated by tenant
- [x] Pending companies cannot log in until super admin approves
- [x] Super admin can add company directly without approval step
- [x] JWT + refresh cookie session works; 401 triggers client refresh
- [x] Forgot password flow (Stage 2 S2-1)
