# Module: Platform Site Settings

**Stage:** Demo 1 (Step 7)  
**Status:** Complete (URL-only assets; tenant overrides shipped early)  
**Depends on:** Auth & Tenant (Step 2); optional asset upload from Document Storage (Step 6)

---

## 1. Purpose

Let the **super admin** customize the **platform-wide** site identity visible to all users — login, register, app shell, and browser tab. Replaces hardcoded values in `client/src/constants/app.ts`, `client/tailwind.config.js`, and `client/index.html`.

Per-tenant white-label overrides (logo + primary color) are implemented in Demo 1 — see [05-admin-settings.md](./05-admin-settings.md). Full company profile, departments, and users remain Step 7 follow-ups.

---

## 2. User Roles & Permissions

| Capability | super_admin | company_admin | hr_manager | manager | employee | guest |
|------------|:-----------:|:-------------:|:----------:|:-------:|:--------:|:-----:|
| Read public site config | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View platform site settings (admin) | ✅ | — | — | — | — | — |
| Edit platform site settings | ✅ | — | — | — | — | — |
| Upload platform logo / favicon | ✅ | — | — | — | — | — |

---

## 3. Data Model

### Collection: `PlatformSettings` (singleton)

One document for the entire platform. Use a fixed `_id` or upsert by a constant key (e.g. `{ key: 'default' }`).

```js
{
  key: 'default',              // singleton key, unique index
  siteName: String,            // required, 2–64 chars
  logoUrl: String | null,      // optional; text siteName fallback in UI
  faviconUrl: String | null,   // optional; default favicon when null
  primaryColor: String,        // hex, e.g. "#2563eb"
  logoDisplay: {
    heightPx: Number,          // 24–80, default 32
    maxWidthPx: Number,        // 80–320, default 160
    objectFit: String,         // 'contain' | 'cover'
    showSiteName: Boolean      // show name beside logo
  },
  faviconDisplay: {
    mimeType: String           // 'auto' | image/png | image/x-icon | image/svg+xml | image/webp
  },
  updatedAt: Date,
  updatedBy: ObjectId          // ref User (super_admin)
}
```

**Defaults when no document exists** (server and client must agree):

| Field | Default |
|-------|---------|
| `siteName` | `Daily HR` |
| `logoUrl` | `null` |
| `faviconUrl` | `null` (client uses bundled default) |
| `primaryColor` | `#2563eb` |

**Asset storage:** ImgBB via server-side `IMGBB_API_KEY` for super-admin upload; URL fields remain supported. Tenant admins use URL-only overrides.

---

## 4. API Endpoints

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/api/v1/platform/site-config` | **Public** | Read-only branding for client bootstrap (cacheable) |
| GET | `/api/v1/admin/platform/site-settings` | `super_admin` | Full settings for edit form |
| PATCH | `/api/v1/admin/platform/site-settings` | `super_admin` | Partial update (only changed fields) |
| POST | `/api/v1/admin/platform/site-settings/upload` | `super_admin` | Upload logo or favicon to ImgBB (returns URL; does not auto-save) |

### Request / response examples

```json
// GET /api/v1/platform/site-config (public)
{
  "siteName": "Daily HR",
  "logoUrl": null,
  "faviconUrl": null,
  "primaryColor": "#2563eb"
}

// PATCH /api/v1/admin/platform/site-settings
{
  "siteName": "Acme HR Platform",
  "primaryColor": "#059669"
}
```

Update `docs/openapi.yaml` and Postman collection when implemented.

---

## 5. Business Rules

1. Only `super_admin` may read admin endpoints or PATCH settings.
2. Public `site-config` exposes branding fields only — no internal metadata (`updatedBy`, etc.).
3. PATCH applies only fields present in request body (partial update).
4. `siteName` required on create; cannot be empty string.
5. `primaryColor` must be valid 6-digit hex (`#RRGGBB`).
6. Logo/favicon uploads: PNG, SVG, WebP, or ICO; size limits enforced server-side.
7. When settings document is missing, API returns hardcoded defaults (current app behavior).

---

## 6. UI Screens & Flows

### Screen: Platform site settings

- **Route:** `/dashboard/platform/site-settings`
- **Access:** `super_admin` only
- **Layout:** `PageContainer` → `PageHeader` → form + live preview panel
- **Fields:**
  - Site name (`Input` with icon)
  - Primary color (color picker + hex input)
  - Logo: upload (ImgBB) or URL; height, max width, object-fit, show site name toggle
  - Favicon: upload (ImgBB) or URL; MIME type select; browser-tab preview
- **Save:** `FormModal` or inline form with `FormActions`; edit mode — save disabled until `hasFormChanges`
- **Nav:** Sidebar item for `super_admin` only (alongside Companies)

### Client bootstrap (all users)

1. Fetch `GET /api/v1/platform/site-config` at app mount (public, no auth).
2. Apply CSS variables for `--brand-*` shades computed from `primaryColor`.
3. Replace static `APP_NAME` in `AppShell`, `AuthLayout` via `useSiteConfig` hook / `SiteConfigProvider`.
4. Set `document.title` and update `<link rel="icon">` dynamically.

### User flow

```
Super admin opens Site settings → edits name/color/logo/favicon → saves
→ Public config updated → all users see new branding on next page load
```

---

## 7. Notifications

None for Demo 1.

---

## 8. Audit & Compliance

- Log platform settings changes to `AuditLog` (actor, timestamp, changed fields) when audit module exists.
- Platform assets (logo/favicon) are not tenant-scoped; store under `platform/` prefix in object storage.

---

## 9. Demo 1 vs Later

| Feature | Demo 1 | Later |
|---------|--------|-------|
| Platform site name | ✅ | |
| Platform primary color | ✅ | |
| Platform logo | ✅ | |
| Platform favicon | ✅ | |
| Per-tenant branding overrides | — | Stage 3 ([05-admin-settings.md](./05-admin-settings.md)) |
| Full multi-color theme editor | — | Stage 3+ |
| Custom fonts | — | Stage 3+ |
| Live preview without save | — | Optional polish |

### Per-tenant overrides (Stage 3)

- Extend `Tenant` model with optional `branding` block (`logoUrl`, `primaryColor`, etc.).
- Company admin manages tenant branding in Settings (module 05).
- **Merge rule:** tenant override wins when set; otherwise fall back to platform defaults from this module.

---

## 10. Tasks Breakdown

### Backend

- [x] `PlatformSettings` model + singleton upsert
- [x] Validation (Zod): siteName, primaryColor, logoUrl, faviconUrl
- [x] Service: get defaults, get public config, patch settings
- [x] Routes: public GET + super_admin GET/PATCH + POST upload (ImgBB)
- [x] Logo/favicon display settings in model + public config
- [ ] Tests

### Frontend

- [x] `SiteConfigProvider` + `useSiteConfig` hook
- [x] CSS variable theme injection from `primaryColor`
- [x] Dynamic `document.title` and favicon
- [x] Super admin page: `/dashboard/platform/site-settings`
- [x] Sidebar nav item for super admin
- [x] Replace hardcoded `APP_NAME` in shell and auth layout

### Integration

- [x] ImgBB upload via `IMGBB_API_KEY` (server-side) + URL fallback
- [x] Logo/favicon display customization in settings form + app shell
- [x] Update OpenAPI + Postman

**Estimate:** 2–3 days

---

## 11. Open Questions

- [x] Asset upload in Step 7 before S3? **ImgBB upload + URL fields (Demo 1)**
- [ ] Cache headers on public `site-config` (e.g. `Cache-Control: public, max-age=300`)?

---

## 12. Acceptance Criteria

- [x] Super admin can upload or paste URL for logo and favicon
- [x] Logo display settings (size, fit, show name) apply in app shell and auth pages
- [x] Favicon MIME type and URL apply in browser tab
- [x] All authenticated and guest users see platform branding after refresh
- [x] Login and register pages reflect platform branding without auth
- [x] Non–super-admin roles cannot read or edit platform admin settings
- [x] Defaults match current app when no settings document exists
- [x] Per-tenant branding overrides implemented (module 05)
