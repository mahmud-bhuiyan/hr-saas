# Module: Auth & Tenant

**Stage:** Demo 1  
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
| Login / logout / refresh | ✅ | ✅ | ✅ | ✅ | ✅ |
| View / edit own profile | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 3. Data Model

### Collection: `Tenant`

- `name`, `isActive`, `approvalStatus` (`pending` | `approved` | `rejected`)
- `rejectedReason`, `approvedAt`, `approvedBy`, `createdBy`, `updatedBy`

### Collection: `User`

- `email`, `passwordHash`, `role`, `tenantId`, `firstName`, `lastName`, `isActive`

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

---

## 5. Business Rules

1. Self-registration creates tenant + company admin with `approvalStatus: pending`; login blocked until approved.
2. Super admin can create a company in one step — tenant and admin are active immediately.
3. `tenantId` comes from JWT only; never trust client-supplied tenant id.
4. Super admin bootstrap: `npm run seed:superadmin` or first `POST /api/v1/admins` when DB has zero users.

---

## 6. UI Screens & Flows

| Screen | Route | Status |
|--------|-------|--------|
| Login | `/login` | ✅ |
| Register company | `/register` | ✅ |
| My profile | `/dashboard/profile` | ✅ |
| Companies (super admin) | `/dashboard/registrations` | ✅ |
| Forgot password | `/forgot-password` | ⬜ Not started |

---

## 7. Demo 1 vs Later

| Feature | Demo 1 | Status |
|---------|--------|--------|
| Register / login / refresh | ✅ | Done |
| Registration approval | ✅ | Done (added during build) |
| Super admin add company | ✅ | Done (added during build) |
| Profile + change password | ✅ | Done |
| Forgot password (email) | Planned | Not started |

---

## 12. Acceptance Criteria

- [x] Company can self-register; data isolated by tenant
- [x] Pending companies cannot log in until super admin approves
- [x] Super admin can add company directly without approval step
- [x] JWT + refresh cookie session works; 401 triggers client refresh
- [ ] Forgot password flow (defer to Step 8 unless client requires earlier)
