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

## API documentation (mandatory)

Every new or changed endpoint must update **both** files in the same change:

1. [`docs/openapi.yaml`](./docs/openapi.yaml) — OpenAPI 3.0 spec (source of truth): path, method, request/response schemas, auth, roles, examples
2. [`docs/postman/hr-saas.postman_collection.json`](./docs/postman/hr-saas.postman_collection.json) — matching Postman request with sample body and auth; add test script to save `accessToken` when the response includes one

Do **not** use markdown for API docs. Do **not** create separate per-endpoint curl files — the Postman collection is the single runnable request catalog.

Optional: update [`docs/postman/hr-saas.local.postman_environment.json`](./docs/postman/hr-saas.local.postman_environment.json) only when new collection variables are needed.

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
| `Table` | `Table.tsx` | Data tables with loading/empty states |
| `Dropdown` | `Dropdown.tsx` | Menus (user menu, action menus) |

Feature-specific composites (e.g. `ChangePasswordModal`) live in `client/src/components/` and compose the UI kit.

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
