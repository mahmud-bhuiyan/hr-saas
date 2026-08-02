# HR SaaS Platform

Multi-tenant HR software. Client and server are **fully separate apps** — own code, env, and deployment.

See [docs/plan/](./docs/plan/) for product docs.

## Folder structure

```
hr-saas/
├── client/          # React frontend (deploy to its own server)
├── server/          # Express API (deploy to its own server)
├── docs/            # OpenAPI spec, Postman collection, project plans
├── .gitignore
└── README.md
```

No root `node_modules`. No shared code folder. Install dependencies inside `client/` and `server/`.

## Prerequisites

- **Node.js 22+** (see `.nvmrc`)
- **npm 10+**

## Local development

```bash
# Terminal 1 — API
cd server
cp .env.example .env.local
npm install
npm run dev

# Terminal 2 — frontend
cd client
cp .env.example .env
npm install
npm run dev

# Terminal 3 — email/notification worker (optional; emails send synchronously without Redis)
cd server
npm run worker
```

| App | URL |
|-----|-----|
| Client | http://localhost:5173 |
| Server | http://localhost:5000 |
| Health | http://localhost:5000/api/v1/health |

### Docker (MongoDB, Redis, MinIO)

```bash
docker compose up -d
```

| Service | URL | Notes |
|---------|-----|-------|
| MongoDB | `mongodb://localhost:27017/hr-saas` | Default in `server/.env.example` |
| Redis | `redis://localhost:6379` | BullMQ email queue for `npm run worker` |
| MinIO (S3) | http://localhost:9000 | API endpoint for `S3_ENDPOINT` |
| MinIO console | http://localhost:9001 | Login `minioadmin` / `minioadmin`; bucket `hr-saas-documents` is created by `minio-init` |

Copy `S3_*` values from `server/.env.example` into `server/.env.local` for document upload/download.

### Stripe billing (optional — S2-7)

Set in `server/.env.local`:

- `STRIPE_SECRET_KEY` — Stripe secret key (test mode for local/staging)
- `STRIPE_PRICE_ID` — recurring price ID for per-seat billing
- `STRIPE_WEBHOOK_SECRET` — from Stripe Dashboard or CLI

Local webhook forwarding:

```bash
stripe listen --forward-to localhost:5000/api/v1/billing/webhook
```

Set demo/staging tenants `billingExempt: true` on the Tenant document to skip payment gates.

## Environment files

| App | File | Key variables |
|-----|------|---------------|
| **Server** | `server/.env.local` | `MONGODB_URI`, `CLIENT_URL`, `ADMIN_JWT_SECRET`, `REDIS_URL` (optional; sync email fallback without Redis), `IMGBB_API_KEY` (logo/favicon upload), `SENDGRID_API_KEY`, `EMAIL_FROM` (leave notifications), `S3_*` (document storage), `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID` (billing; optional: `PORT`, defaults to 5000) |
| **Client** | `client/.env` | `VITE_API_URL` (backend URL) |

## Separate deployment

Deploy each folder to its own host:

**Server** (`server/`):
- Set `CLIENT_URL` to your frontend URL (for CORS), e.g. `https://app.yourdomain.com`
- Set `MONGODB_URI`, `ADMIN_JWT_SECRET`, etc.

**Client** (`client/`):
- Set `VITE_API_URL` to your API URL, e.g. `https://api.yourdomain.com`
- Run `npm run build` → deploy `client/dist/` to static hosting

### Deploy to Vercel (two projects)

Create **two** Vercel projects from the same repo, each with a different root directory:

| Project | Root directory | Build command | Output |
|---------|----------------|---------------|--------|
| **Client** | `client` | `npm run build` (auto-detected) | `dist` |
| **Server** | `server` | (none — Vercel Express) | — |

**Deploy server first**, then client (client needs the server URL for `VITE_API_URL`).

1. **Server project** — Root: `server`
   - Env vars: `MONGODB_URI`, `CLIENT_URL` (set after client deploys), `ADMIN_JWT_SECRET`, `REDIS_URL`
   - Health check: `https://<server-project>.vercel.app/api/v1/health`

2. **Client project** — Root: `client`
   - Env var: `VITE_API_URL` = server URL (e.g. `https://<server-project>.vercel.app`)
   - Rebuild after changing env vars (Vite bakes them in at build time)

3. **Update server** — Set `CLIENT_URL` to the client URL, then redeploy server (CORS).

Config files: `client/vercel.json`, `server/vercel.json`, `server/src/index.ts` (Vercel Express + local entry; must default-export the Express app).

## API documentation

- **OpenAPI spec:** [docs/openapi.yaml](./docs/openapi.yaml)
- **Postman collection:** [docs/postman/hr-saas.postman_collection.json](./docs/postman/hr-saas.postman_collection.json) (import into Postman for all requests)
- **Local env:** [docs/postman/hr-saas.local.postman_environment.json](./docs/postman/hr-saas.local.postman_environment.json)
- Agent rules: [AGENTS.md](./AGENTS.md)

**Keep this file current.** When setup, env, commands, or deployment change, update the README in the same PR. See [AGENTS.md](./AGENTS.md) for the full checklist.

## Implementation progress

- Demo 1: [docs/plan/IMPLEMENTATION-STEPS.md](./docs/plan/IMPLEMENTATION-STEPS.md)
- Stage 2: [docs/plan/STAGE-2-IMPLEMENTATION-STEPS.md](./docs/plan/STAGE-2-IMPLEMENTATION-STEPS.md) · [docs/plan/10-stage-2-operations-plan.md](./docs/plan/10-stage-2-operations-plan.md)
