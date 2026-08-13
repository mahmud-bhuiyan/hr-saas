# Module: Module Access Control

**Stage:** Stage 1 extension (platform)  
**Status:** Done  
**Depends on:** [01-auth-tenant.md](./01-auth-tenant.md)

---

## 1. Purpose

Let the **super admin** control which **business modules** each tenant (company) can access. This is an entitlement layer between tenant lifecycle (`approvalStatus` / `isActive`) and role-based RBAC. Super admin toggles modules manually; billing/subscription is independent.

---

## 2. User Roles & Permissions

| Capability | super_admin | company_admin | hr_manager | manager | employee |
|------------|:-----------:|:-------------:|:----------:|:-------:|:--------:|
| View tenant module flags | ✅ | — | — | — | — |
| Update tenant module flags | ✅ | — | — | — | — |
| See enabled modules in nav (tenant users) | — | ✅ | ✅ | ✅ | ✅ |
| Access disabled module API | — | — | — | — | — |

All ten business modules are toggleable, including Employees and Settings.

---

## 3. Data Model

### Collection: `Tenant` (extension)

```js
enabledModules: [String]   // enum: employees | leave | attendance | timesheets | rotas | expenses | payroll | reports | documents | settings
// default: all modules enabled
// missing or empty array treated as all enabled (backward compatible)
```

### Module catalogue

| Module ID | API mount(s) | Client route |
|-----------|--------------|--------------|
| `employees` | `/api/v1/employees` | `/dashboard/employees` |
| `leave` | `/api/v1/leave` | `/dashboard/leave` |
| `attendance` | `/api/v1/attendance` | `/dashboard/attendance` |
| `timesheets` | `/api/v1/timesheets` | `/dashboard/timesheets` |
| `rotas` | `/api/v1/rotas`, `/api/v1/locations` | `/dashboard/rotas` |
| `expenses` | `/api/v1/expenses` | `/dashboard/expenses` |
| `payroll` | `/api/v1/payroll` | `/dashboard/payroll` |
| `reports` | `/api/v1/reports` | `/dashboard/reports` |
| `documents` | `/api/v1/documents` | `/dashboard/documents` |
| `settings` | `/api/v1/settings`, `/api/v1/audit-logs`, `/api/v1/billing` | `/dashboard/settings/*` |

**Always available:** auth, profile, notifications, dashboard shell (Dashboard, Profile, Notifications — not toggled in Manage modules).

Sellable business modules (10) are toggled per tenant; sidebar and routes respect enabled modules only.

---

## 4. API Endpoints

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/api/v1/admin/registrations/:tenantId/modules` | super_admin | Current enabled modules for approved company |
| PATCH | `/api/v1/admin/registrations/:tenantId/modules` | super_admin | Replace enabled modules list |
| GET | `/api/v1/auth/me` | tenant user | Includes `enabledModules` |
| POST | `/api/v1/auth/login` | tenant user | Response user includes `enabledModules` |

### Request / response examples

```json
// PATCH /api/v1/admin/registrations/:tenantId/modules
{ "enabledModules": ["employees", "leave", "attendance"] }

// Response
{ "status": "ok", "data": { "tenantId": "...", "enabledModules": ["employees", "leave", "attendance"] } }
```

Module routers return `403` when the module is disabled for the tenant.

---

## 5. Business Rules

1. Only `super_admin` may read or update tenant module flags.
2. Only **approved** companies can have modules managed via the modules endpoint.
3. Unknown module IDs in PATCH body → `400`.
4. Duplicate module IDs in PATCH body → deduplicated before save.
5. Empty `enabledModules` array is allowed (blocks all gated modules for that tenant).
6. Missing `enabledModules` on existing tenants → treat as all modules enabled.
7. New companies default to all modules enabled; optional subset on create.
8. Module changes are audit-logged on the tenant (`entityType: Tenant`).
9. Tenant users may need profile refresh or re-login to pick up module changes after super admin edit.
10. Independent of Stripe billing — no auto-provisioning from subscription tier in v1.

---

## 6. UI Screens & Flows

### Screen: Manage company modules (super admin)
- **Route:** Modal from `/dashboard/registrations` (Registered tab)
- **Access:** `super_admin`
- **Elements:** Checkbox grid for all 10 modules with labels and descriptions; save disabled until changes
- **States:** loading, saving, error toast

### Screen: Company details (read-only modules)
- **Route:** Details modal on companies page
- **Access:** `super_admin`
- **Elements:** Always available platform features (Dashboard, Profile, Notifications); enabled sellable modules with count (e.g. `1 of 10`)

### Tenant user experience
- Sidebar nav, global search, dashboard links, and direct URLs hide or redirect when module disabled
- `ModuleRoute` wrapper redirects to `/dashboard` with toast on disabled module access

---

## 7. Notifications

None in v1.

---

## 8. Audit & Compliance

- PATCH modules writes audit log: `action: update`, `entityType: Tenant`, `entityId: tenantId`, before/after `enabledModules`

---

## 9. Stage 1 vs Later

| Feature | v1 | Later |
|---------|----|-------|
| Super admin manual toggles | ✅ | |
| Server `requireModule` middleware | ✅ | |
| Client nav/route guards | ✅ | |
| Plan-tier auto-provisioning | — | Future |
| Per-role module overrides | — | Future |
| Granular settings sub-modules | — | Future |

---

## 10. Tasks Breakdown

- [x] `TenantModuleId` types (server + client duplicate)
- [x] `enabledModules` on Tenant model
- [x] GET/PATCH super admin modules API + OpenAPI + Postman
- [x] `requireModule` middleware on all module routers
- [x] `enabledModules` on login and GET `/auth/me`
- [x] Client nav, search, dashboard, `ModuleRoute`
- [x] Manage modules modal + company details read-only list

---

## 11. Open Questions

| # | Question | Decision |
|---|----------|----------|
| 1 | Lock core modules (Employees + Settings)? | All toggleable |
| 2 | Tie to billing tiers? | Independent for v1 |

---

## 12. Acceptance Criteria

- [x] Super admin can view and update enabled modules per approved company
- [x] Disabled module returns 403 on API and is hidden from tenant nav/search
- [x] Direct URL to disabled module redirects tenant user to dashboard
- [x] Existing tenants without `enabledModules` retain full access
- [x] OpenAPI and Postman document new endpoints
- [x] Audit log records module changes
