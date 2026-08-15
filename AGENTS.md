# Agent Instructions — HR SaaS

Read this file at the start of any session.

---

## Architecture

**Client and server are independent apps.** They deploy to separate servers. There is **no shared code folder**.

```
hr-saas/
├── client/       # React — own src/, .env, node_modules, deployment
├── server/       # Express — own src/, .env.local, node_modules, deployment
└── docs/         # OpenAPI spec, Postman collection, project plans (docs/plan/)
```

- **Do not create** `apps/` or `shared/` folders
- **No root `node_modules`** — install only in `client/` and `server/`

When types or logic exist in both apps (e.g. permissions), **duplicate** in each:
- `server/src/types/`, `server/src/utils/`
- `client/src/types/`, `client/src/utils/`

Keep them in sync manually when changed.

---

## Environment

| App | Env file | Example vars |
|-----|----------|--------------|
| Server | `server/.env.local` | `MONGODB_URI`, `CLIENT_URL`, `ADMIN_JWT_SECRET` (optional: `PORT`) |
| Client | `client/.env` | `VITE_API_URL` |

Never put server secrets in `client/.env`. Never put `VITE_*` vars in `server/.env.local`.

For production:
- Server `CLIENT_URL` = deployed frontend origin (CORS)
- Client `VITE_API_URL` = deployed API base URL

---

## Runtime

- **Node.js ≥ 22**
- **npm ≥ 10**

---

## Code style

Use **arrow functions** for all functions in `client/src/` and `server/src/`:

- **Named exports:** `export const myHelper = (arg: string): string => { … }`
- **React components:** `export const MyPage = () => { … }`
- **Default exports:** define with `const App = () => { … }`, then `export default App`
- **Async:** `export const fetchData = async (): Promise<Data> => { … }`
- **Generics in `.tsx`:** use a trailing comma to avoid JSX ambiguity — `export const Table = <T,>(props: TableProps<T>) => { … }`
- **Middleware / factories:** `export const authenticate = (env: ServerEnv) => (req, res, next) => { … }`

Do **not** use `function` declarations (`function foo() {}`, `export function Foo() {}`). Inner helpers in the same file also use arrow functions (`const handleSubmit = () => { … }`).

---

## API documentation (mandatory)

Every new or changed endpoint must update **both** files in the same change:

1. [`docs/openapi.yaml`](./docs/openapi.yaml) — OpenAPI 3.0 spec (source of truth): path, method, request/response schemas, auth, roles, examples
2. [`docs/postman/hr-saas.postman_collection.json`](./docs/postman/hr-saas.postman_collection.json) — matching Postman request with sample body and auth; add test script to save `accessToken` when the response includes one

Do **not** use markdown for API docs. Do **not** create separate per-endpoint curl files — the Postman collection is the single runnable request catalog.

Optional: update [`docs/postman/hr-saas.local.postman_environment.json`](./docs/postman/hr-saas.local.postman_environment.json) only when new collection variables are needed.

### Plan docs (keep current)

When shipping features or adding scope mid-sprint, update **all** of these in the same change:

1. [`docs/plan/STAGE-1-IMPLEMENTATION-STEPS.md`](./docs/plan/STAGE-1-IMPLEMENTATION-STEPS.md) — step checklist; log out-of-plan additions in the table at the top
2. Relevant file in [`docs/plan/modules/`](./docs/plan/modules/) — endpoints, screens, acceptance criteria
3. [`docs/plan/00-stage-1-core-hr-plan.md`](./docs/plan/00-stage-1-core-hr-plan.md) — screens checklist and Section 11 status table

See [`docs/plan/README.md`](./docs/plan/README.md) for the full plan index.

### README (keep current)

Update [`README.md`](./README.md) whenever a change affects how someone sets up, runs, or deploys the project. Examples:

- Prerequisites, folder structure, or architecture
- Env vars, commands, URLs, or deployment steps
- Notable new capabilities a developer needs to know on day one

Do not duplicate detailed API or plan docs — link to `docs/openapi.yaml`, `docs/postman/`, and `docs/plan/` instead.

---

## Server conventions

- `server/src/create-app.ts` — Express app factory (`createApp`)
- `server/src/index.ts` — Vercel Express entry + local dev (`npm run dev`); default-exports Express app, connects MongoDB
- `server/vercel.json` — `framework: "express"` (entrypoint is `src/index.ts`)

## Client conventions

- `client/src/lib/api.ts` — API client (uses `VITE_API_URL`)
- Build output: `client/dist/` → static hosting
- **Form helpers:** `client/src/utils/form.ts` — change detection and required-field checks
- **Icons:** [`react-icons`](https://react-icons.github.io/react-icons/) — use colorful icons where they aid UX

### Component organization (new files)

Do **not** move existing files. Reuse what already exists. New components follow this layout (see `.cursor/rules/react-component-organization.mdc`):

| Category | New files go in |
|----------|-----------------|
| Primitive UI (`Button`, `Input`, `Modal`, …) | `client/src/components/ui/primitives/` |
| Form composites (`FormField`, `FormModal`, …) | `client/src/components/ui/forms/` |
| Navigation (`NavCard`, `Breadcrumbs`, …) | `client/src/components/ui/navigation/` |
| Layout (`AppShell`, `PageContainer`, `Navbar`, …) | `client/src/components/layout/` |
| Feature-specific | `client/src/features/<feature>/components/` |
| Route guards (`ProtectedRoute`, `GuestRoute`) | `client/src/routes/` |

Existing kit still lives in `client/src/components/ui/` and existing screens in `client/src/pages/`. Reuse those files. Do not duplicate them into the new folders. When adding to a feature that still lives under `pages/`, colocate there until that feature is migrated.

### Reusable UI components (required)

Before building custom markup, search `client/src/components/ui/` (current kit) and the folders above. **Reuse existing components; create a new one only if none fits.**

| Component | File | Use for |
|-----------|------|---------|
| `Button` | `Button.tsx` | All actions; supports `loading`, `icon`, `disabled` |
| `Spinner` | `Spinner.tsx` | Inline loading indicator (used by `Button`, `Table`) |
| `Input` | `Input.tsx` | Text, email, date, etc. |
| `PasswordInput` | `PasswordInput.tsx` | Password fields with show/hide toggle |
| `Select` | `Select.tsx` | Dropdown selects with optional left icon |
| `Textarea` | `Textarea.tsx` | Multi-line text with optional left icon |
| `FormField` | `FormField.tsx` | Label + control wrapper |
| `FormActions` | `FormActions.tsx` | Form footer with submit/cancel |
| `Modal` | `Modal.tsx` | Generic dialog shell |
| `FormModal` | `FormModal.tsx` | Modal + form + footer actions |
| `Table` | `Table.tsx` | Data tables with loading/empty states; configurable column alignment |
| `Tabs` | `Tabs.tsx` | Tab bar for switching related list views |
| `Dropdown` | `Dropdown.tsx` | Menus (user menu, action menus) |
| `PageContainer` | `PageContainer.tsx` | Page wrapper with consistent spacing |
| `PageHeader` | `layout/PageHeader.tsx` | Label, title, description, optional action |

Feature-specific composites compose the UI kit and live in the feature folder (new: `features/<feature>/components/`; existing: `pages/<feature>/components/` or `client/src/components/` until migrated).

### Page file organization (required)

Keep page entry files thin. **Existing** screens live under `client/src/pages/` — do not move them unless asked. **New** features use `client/src/features/<feature>/`.

#### Folder naming (`pages/`)

| Kind | Convention | Examples |
|------|------------|----------|
| **Folders** | lowercase; **kebab-case** for multiple words | `employees`, `super-admin`, `country-codes`, `audit-log` |
| **Page / component files** | **PascalCase** | `EmployeesPage.tsx`, `SiteSettingsPage.tsx` |

Do **not** use camelCase, PascalCase, or snake_case for page folders.

#### Super admin vs tenant pages

**Super admin** screens (`super_admin` role only) live under `pages/super-admin/` with one subfolder per feature. **Tenant** company settings stay under `pages/settings/`. Do not add super-admin pages under `pages/settings/` or tenant pages under `pages/super-admin/`.

```
client/src/pages/
├── super-admin/                   # super_admin only
│   ├── dashboard/
│   │   ├── SuperAdminDashboardPage.tsx
│   │   ├── hooks/
│   │   └── utils.ts
│   ├── companies/                 # /companies/* (registrations)
│   │   ├── RegistrationsPage.tsx
│   │   ├── components/
│   │   └── utils.ts
│   ├── site/                      # /settings/site/* (global branding)
│   │   ├── SiteSettingsPage.tsx
│   │   ├── components/            # SiteSettingsTabs uses NavTabBar + routes
│   │   └── utils.ts
│   └── country-codes/             # /settings/country-codes/*
│       ├── CountryCodesPage.tsx
│       ├── components/
│       └── utils.ts
├── settings/                      # tenant company_admin / hr_manager (module: settings)
│   ├── company/
│   ├── departments/
│   └── users/
├── employees/
│   ├── EmployeesPage.tsx          # route entry — data fetching, state, composition
│   ├── utils.ts                   # page-local helpers (optional)
│   └── components/
├── dashboard/                     # tenant home; DashboardPage delegates super_admin to super-admin/dashboard
│   ├── DashboardPage.tsx
│   ├── TenantDashboardPage.tsx
│   └── components/
└── login/
    ├── LoginPage.tsx
    └── components/
        └── LoginForm.tsx
```

**Route-based tabs:** multi-section screens that are separate URLs (not query tabs) use `NavTabBar` from `components/ui/navigation/NavTabBar.tsx` with `to` links — see `super-admin/site/components/SiteSettingsTabs.tsx`, `super-admin/country-codes/components/CountryCodesTabs.tsx`, and `super-admin/companies/components/CompaniesTabs.tsx`.

**Page entry file** (`*Page.tsx`): routing guard, queries/mutations, local state, and composing child components. Target ~150 lines or less when possible.

**Page components** (`pages/<feature>/components/` or `features/<feature>/components/`): tables, filters, forms, modals, and sections used by that page only. Pass data and callbacks via props — do not duplicate fetch logic in child components unless shared across multiple pages.

**Page utils** (`utils.ts` next to the feature): small pure helpers shared within that feature (formatters, mappers, route path constants). Do not put these in `components/ui/`.

When adding a new screen, create the feature folder and `components/` subfolder from the start — do not grow monolithic page files.

### Page layout (required for new screens)

Follow existing dashboard pages (`employees/EmployeesPage`, `super-admin/companies/RegistrationsPage`) as the template:

1. Wrap content in `PageContainer`
2. Use `PageHeader` with `label`, `title`, `description`, and optional primary `action` (`Button` with icon)
3. List data with `Table` (loading, empty states via props; **center-aligned by default** — override per table or column)
4. Create/edit records in `FormModal` + `FormField` + `Input` / `PasswordInput` / `Select` / `Textarea` (all with icons)
5. Separate related data views (e.g. pending vs registered) with `Tabs` — each tab gets its own `Table`
6. Success/error alerts: `rounded-lg border px-4 py-3 text-sm` with green/red/amber variants

Do not invent new page shells, table markup, or modal patterns when the UI kit covers the need.

### Table alignment

`Table` defaults to **center** alignment for headers and cells. Override per table or per column — do not hand-roll alignment with `className` on columns unless adding extra styling beyond alignment.

```tsx
// Entire table left-aligned
<Table align="left" columns={...} ... />

// Default center; one column right-aligned (e.g. actions)
<Table
  columns={[
    { key: 'name', header: 'Name', render: ... },
    { key: 'actions', header: 'Actions', align: 'right', render: ... },
  ]}
  ...
/>
```

- **`align` on `Table`:** default for all columns (`'center'` if omitted)
- **`align` on `TableColumn`:** overrides the table default for that column only
- Values: `'left'` | `'center'` | `'right'`
- Flex row content inside a cell (buttons, icon + text): match the column align with `justify-start` / `justify-center` / `justify-end` on the inner flex container

### Form and save-button rules

1. **Create forms:** Submit/save button stays **disabled** until all mandatory fields are filled (`areRequiredFieldsFilled` from `client/src/utils/form.ts`).
2. **Edit forms:** Submit/save button stays **disabled** until at least one field differs from the loaded original (`hasFormChanges`).
3. **All submit buttons** use `Button` with `loading` / `loadingText` while the mutation runs.
4. **Patch/update APIs:** Send **only changed fields** to the server (`pickChangedFields`). Do not POST the full record on every save.
5. **Server:** Update handlers should apply only fields present in the request body (partial update).

### Password fields

Always use `PasswordInput` (not `Input type="password"`). It includes a show/hide toggle with `react-icons`.

### Icons

Use `react-icons` (e.g. `react-icons/hi2`) with Tailwind color classes (`text-brand-600`, `text-red-500`, `text-amber-500`) for visual cues on buttons, dropdown items, and actions.

### Form field icons (required)

**Every form control must have an icon** — applies to all existing and new forms. Pass `icon` on every `Input`, `PasswordInput`, `Select`, and `Textarea`. Do not use raw `<input>`, `<select>`, or `<textarea>` in forms; use the UI kit components with icons.

Pattern (same as `login/LoginPage` and `register/RegisterPage`):

```tsx
icon={<HiEnvelope className="h-4 w-4 text-brand-600" />}
```

Standard mappings (`react-icons/hi2`, `h-4 w-4 text-brand-600`):

| Field type | Icon |
|------------|------|
| Company / building | `HiBuildingOffice2` |
| Person / name | `HiUser` |
| Email | `HiEnvelope` |
| Password | `HiLockClosed` |
| Search | `HiMagnifyingGlass` |
| Phone | `HiPhone` |
| Job title | `HiBriefcase` |
| Department | `HiRectangleGroup` |
| Date | `HiCalendarDays` |
| Manager / team | `HiUserGroup` |
| Status | `HiSignal` |
| Notes / reason / comment | `HiChatBubbleLeftEllipsis` |

When adding or editing any form, audit all fields and add missing icons. Reference forms: `login/LoginForm`, `register/RegisterForm`, `employees/CreateEmployeeModal`, `employees/EmployeeEditForm`.

Page-header and action buttons: white icon on primary buttons (`text-white`), brand-colored elsewhere.

---

## Commands

```bash
cd server && npm install && npm run dev
cd client && npm install && npm run dev
```

---

## Do not

- Create `apps/` or `shared/` folders
- Add root `node_modules`
- Share code via a common package (duplicate in client/server instead)
- Add endpoints without updating `docs/openapi.yaml` and `docs/postman/hr-saas.postman_collection.json`
- Document APIs in markdown (use OpenAPI YAML + Postman collection only)
- Change setup, env, commands, or deployment without updating `README.md`
- Trust `tenantId` from the client
- Use `function` declarations — use arrow functions instead (see **Code style** above)
