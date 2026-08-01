# Module: Admin & Settings

**Stage:** Demo 1 (Step 7) — partial (branding complete; profile/departments/users pending)  
**Status:** In progress  
**Depends on:** Auth & Tenant (Step 2), Employee Management (Step 4)

---

## 1. Purpose

**Tenant-level** administration for company admins: company profile, departments, and user/role management. Distinct from **platform-wide** site branding, which is owned by the super admin in [15-platform-site-settings.md](./15-platform-site-settings.md).

---

## 2. Scope split: platform vs tenant

| Scope | Who | Module | Demo 1 |
|-------|-----|--------|--------|
| Platform branding (site name, theme, logo, favicon) | `super_admin` | [15-platform-site-settings.md](./15-platform-site-settings.md) | ✅ Step 7 |
| Company profile (name, address, logo) | `company_admin` | This module | ✅ Step 7 |
| Departments CRUD | `company_admin`, `hr_manager` | This module | ✅ Step 7 |
| User list & role assignment | `company_admin` | This module | ✅ Step 7 |
| Per-tenant white-label overrides | `company_admin` | This module | ✅ Demo 1 (early) |

---

## 3. User Roles & Permissions

| Capability | super_admin | company_admin | hr_manager | manager | employee |
|------------|:-----------:|:-------------:|:----------:|:-------:|:--------:|
| Company profile read/update | — | ✅ | — | — | — |
| Departments CRUD | — | ✅ | ✅ | — | — |
| User list & role assignment | — | ✅ | — | — | — |
| Tenant branding overrides | — | ✅ | — | — | — |

*(Tenant branding: company admin sets optional logo + primary color overrides that merge with platform defaults from module 15.)*

---

## 4. Data Model

### Collection: `Tenant` (extend existing)

```js
{
  // existing fields: name, isActive, approvalStatus, ...
  address: String,           // optional
  logoUrl: String | null,    // company logo (tenant-scoped) — future company profile
  branding: {
    logoUrl: String | null,
    primaryColor: String | null   // overrides platform primaryColor when set
  }
}
```

### Collection: `Department` (new)

```js
{
  tenantId: ObjectId,
  name: String,
  isArchived: Boolean,
  createdAt, updatedAt
}
```

Replaces free-text `department` on employees with a reference or normalized name from this collection.

---

## 5. API Endpoints (planned)

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/api/v1/settings/branding` | Authenticated tenant user | Merged effective branding |
| GET | `/api/v1/settings/branding/overrides` | `company_admin` | Raw tenant overrides for edit form |
| PATCH | `/api/v1/settings/branding` | `company_admin` | Partial update tenant overrides |
| GET | `/api/v1/settings/company` | `company_admin` | Company profile |
| PATCH | `/api/v1/settings/company` | `company_admin` | Partial update (name, address, logo) |
| GET | `/api/v1/settings/departments` | `hr_manager+` | List departments |
| POST | `/api/v1/settings/departments` | `company_admin`, `hr_manager` | Create department |
| PATCH | `/api/v1/settings/departments/:id` | `company_admin`, `hr_manager` | Rename / archive |
| GET | `/api/v1/settings/users` | `company_admin` | User list with roles |
| PATCH | `/api/v1/settings/users/:id` | `company_admin` | Update role / active status |

Platform site settings endpoints live in [15-platform-site-settings.md](./15-platform-site-settings.md).

---

## 6. UI Screens & Flows

| Screen | Route | Access | Status |
|--------|-------|--------|--------|
| Company branding | `/dashboard/settings/branding` | `company_admin` | ✅ |
| Settings hub | `/dashboard/settings` | `company_admin` | ⬜ |
| Company profile | `/dashboard/settings/company` | `company_admin` | ⬜ |
| Departments | `/dashboard/settings/departments` | `company_admin`, `hr_manager` | ⬜ |
| Users & roles | `/dashboard/settings/users` | `company_admin` | ⬜ |
| Platform site settings | `/dashboard/platform/site-settings` | `super_admin` | ✅ (module 15) |

---

## 7. Demo 1 vs Later

| Feature | Demo 1 | Later |
|---------|--------|-------|
| Company profile (name, address, logo) | ✅ | |
| Departments CRUD | ✅ | |
| User list with role assignment | ✅ | |
| Per-tenant branding overrides | ✅ | |
| Locations / sites | — | Stage 2+ |
| Stripe billing / subscription | — | Stage 2 |

---

## 12. Acceptance Criteria

- [x] Company admin can override primary color and logo URL; clearing reverts to platform default
- [ ] Company admin can update company name, address, and logo (tenant-scoped profile)
- [ ] Departments can be added, renamed, and archived; employees use department list
- [ ] Company admin can view users and assign roles within tenant
- [x] Platform site customization remains super-admin-only (module 15)
