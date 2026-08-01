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

1. [`docs/plan/IMPLEMENTATION-STEPS.md`](./docs/plan/IMPLEMENTATION-STEPS.md) — step checklist; log out-of-plan additions in the table at the top
2. Relevant file in [`docs/plan/modules/`](./docs/plan/modules/) — endpoints, screens, acceptance criteria
3. [`docs/plan/00-client-demo-plan.md`](./docs/plan/00-client-demo-plan.md) — screens checklist and Section 11 status table

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
- **UI kit:** `client/src/components/ui/` — reusable primitives (see below)
- **Page components:** `client/src/pages/<feature>/components/` — feature-specific UI extracted from page files (see below)
- **Form helpers:** `client/src/utils/form.ts` — change detection and required-field checks
- **Icons:** [`react-icons`](https://react-icons.github.io/react-icons/) — use colorful icons where they aid UX

### Reusable UI components (required)

Before building custom markup, check `client/src/components/ui/`. **Reuse existing components; create a new one in that folder only if none fits.**

| Component | File | Use for |
|-----------|------|---------|
| `Button` | `Button.tsx` | All actions; supports `loading`, `icon`, `disabled` |
| `Spinner` | `Spinner.tsx` | Inline loading indicator (used by `Button`, `Table`) |
| `Input` | `Input.tsx` | Text, email, etc. |
| `PasswordInput` | `PasswordInput.tsx` | Password fields with show/hide toggle |
| `FormField` | `FormField.tsx` | Label + control wrapper |
| `FormActions` | `FormActions.tsx` | Form footer with submit/cancel |
| `Modal` | `Modal.tsx` | Generic dialog shell |
| `FormModal` | `FormModal.tsx` | Modal + form + footer actions |
| `Table` | `Table.tsx` | Data tables with loading/empty states; configurable column alignment |
| `Tabs` | `Tabs.tsx` | Tab bar for switching related list views |
| `Dropdown` | `Dropdown.tsx` | Menus (user menu, action menus) |
| `PageContainer` | `PageContainer.tsx` | Page wrapper with consistent spacing |
| `PageHeader` | `PageHeader.tsx` | Label, title, description, optional action |

Feature-specific composites (e.g. `ChangePasswordModal`) live in `client/src/components/` and compose the UI kit.

### Page file organization (required)

Keep page entry files thin. Each screen lives in its own folder under `client/src/pages/`:

```
client/src/pages/
├── employees/
│   ├── EmployeesPage.tsx          # route entry — data fetching, state, composition
│   ├── EmployeeProfilePage.tsx
│   ├── utils.ts                   # page-local helpers (optional)
│   └── components/                # feature UI extracted from the page
│       ├── EmployeesTable.tsx
│       └── CreateEmployeeModal.tsx
├── registrations/
│   ├── RegistrationsPage.tsx
│   └── components/
└── login/
    ├── LoginPage.tsx
    └── components/
        └── LoginForm.tsx
```

**Page entry file** (`*Page.tsx`): routing guard, queries/mutations, local state, and composing child components. Target ~150 lines or less when possible.

**Page components** (`pages/<feature>/components/`): tables, filters, forms, modals, and sections used by that page only. Pass data and callbacks via props — do not duplicate fetch logic in child components unless shared across multiple pages.

**Page utils** (`pages/<feature>/utils.ts`): small pure helpers shared within that feature (formatters, mappers). Do not put these in `components/ui/`.

**Shared across features:** if a component is reused by multiple page folders, move it to `client/src/components/` (e.g. `ChangePasswordModal`).

When adding a new screen, create the folder and `components/` subfolder from the start — do not grow monolithic page files.

### Page layout (required for new screens)

Follow existing dashboard pages (`employees/EmployeesPage`, `registrations/RegistrationsPage`) as the template:

1. Wrap content in `PageContainer`
2. Use `PageHeader` with `label`, `title`, `description`, and optional primary `action` (`Button` with icon)
3. List data with `Table` (loading, empty states via props; **center-aligned by default** — override per table or column)
4. Create/edit records in `FormModal` + `FormField` + `Input` / `PasswordInput`
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

Every `Input` and `PasswordInput` in a form should pass an `icon` prop — same pattern as `login/LoginPage` and `register/RegisterPage`:

```tsx
icon={<HiEnvelope className="h-5 w-5 text-brand-600" />}
```

Standard mappings (`react-icons/hi2`, `h-5 w-5 text-brand-600`):

| Field type | Icon |
|------------|------|
| Company / building | `HiBuildingOffice2` |
| Person / name | `HiUser` |
| Email | `HiEnvelope` |
| Password | `HiLockClosed` |
| Search | `HiMagnifyingGlass` |

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
