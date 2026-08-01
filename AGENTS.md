# Agent Instructions — HR SaaS

Read this file at the start of any session.

---

## Architecture

**Client and server are independent apps.** They deploy to separate servers. There is **no shared code folder**.

```
hr-saas/
├── client/       # React — own src/, .env, node_modules, deployment
├── server/       # Express — own src/, .env.local, node_modules, deployment
└── docs/         # API registry + project plans (docs/plan/)
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

## Testing (mandatory)

### Every function → unit test

| Code location | Test location |
|---------------|---------------|
| `server/src/` | `server/tests/unit/` |
| `client/src/` | `client/tests/unit/` |

Run `npm test` in that folder before finishing work.

### Every API → registry + API test

1. Add row to [`docs/API-REGISTRY.md`](./docs/API-REGISTRY.md)
2. Add Supertest test in `server/tests/api/<module>.test.ts` using `createApp()` from `server/src/app.ts`
3. Run `cd server && npm test`

### README (keep current)

Update [`README.md`](./README.md) whenever a change affects how someone sets up, runs, tests, or deploys the project. Examples:

- Prerequisites, folder structure, or architecture
- Env vars, commands, URLs, or deployment steps
- Notable new capabilities a developer needs to know on day one

Do not duplicate detailed API or plan docs — link to `docs/API-REGISTRY.md` and `docs/plan/` instead.

---

## Server conventions

- `server/src/app.ts` — Express app factory
- `server/src/index.ts` — Starts HTTP server

## Client conventions

- `client/src/lib/api.ts` — API client (uses `VITE_API_URL`)
- Build output: `client/dist/` → static hosting

---

## Commands

```bash
cd server && npm install && npm run dev
cd client && npm install && npm run dev
cd server && npm test
cd client && npm test
```

---

## Do not

- Create `apps/` or `shared/` folders
- Add root `node_modules`
- Share code via a common package (duplicate in client/server instead)
- Add endpoints without `docs/API-REGISTRY.md` entry
- Add functions without unit tests
- Change setup, env, commands, or deployment without updating `README.md`
- Trust `tenantId` from the client
