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

### Xero accounting integration (optional — S3-6)

Set in `server/.env.local`:

- `XERO_CLIENT_ID` — from [Xero Developer Portal](https://developer.xero.com/app/manage)
- `XERO_CLIENT_SECRET` — OAuth 2.0 client secret
- `XERO_REDIRECT_URI` — must match the Xero app redirect URI exactly (e.g. `http://localhost:5000/api/v1/payroll/accounting/callback`)

Company admins connect Xero under **Settings → Payroll settings**. HR can then sync generated payroll periods to Xero as draft manual journals from **Payroll export**.

### Super admin bootstrap

After MongoDB is running and `server/.env.local` has `MONGODB_URI`, create the first platform super admin with **Admins → Create Admin (bootstrap super_admin)** in [docs/postman/hr-saas.postman_collection.json](./docs/postman/hr-saas.postman_collection.json) (`POST /api/v1/admins` when the database has no users).

Demo/staging company data is created manually via the app or super-admin registration flows.

Use **Auth → Login** in the Postman collection with an existing account. Employees created via **Create login** use password `User@123` until they change it.

## Environment files

| App | File | Key variables |
|-----|------|---------------|
| **Server** | `server/.env.local` | `MONGODB_URI`, `CLIENT_URL`, `ADMIN_JWT_SECRET`, `REDIS_URL` (optional; sync email fallback without Redis), `IMGBB_API_KEY` (logo/favicon upload), `SENDGRID_API_KEY`, `EMAIL_FROM` (leave notifications), `S3_*` (document storage), `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID` (billing; optional: `PORT`, defaults to 5000), `XERO_CLIENT_ID`, `XERO_CLIENT_SECRET`, `XERO_REDIRECT_URI` (payroll sync; optional) |
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

Config files: `client/vercel.json`, `server/vercel.json`, `server/render.yaml` (notification worker), `server/src/index.ts` (Vercel Express + local entry; must default-export the Express app).

### Staging / demo environment (Stage 2)

Use **three** services for a full Stage 2 staging stack:

| Service | Host | Notes |
|---------|------|-------|
| **API** | Vercel (`server/`) | Express app; set all server env vars |
| **Client** | Vercel (`client/`) | `VITE_API_URL` → API URL |
| **Worker** | Render or Railway (`server/`, `npm run worker`) | BullMQ + scheduled jobs; **not** supported on Vercel serverless |

**Managed Redis (recommended for staging):** [Upstash](https://upstash.com/) — set `REDIS_URL` on both API and worker.

**Stripe (test mode on staging):**

1. Set `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET` on the API project.
2. Stripe Dashboard → Webhooks → endpoint `https://<api>/api/v1/billing/webhook` — events: `checkout.session.completed`, `customer.subscription.*`, `invoice.*`.
3. Set `billingExempt: true` on demo/staging tenants in MongoDB to skip payment during walkthroughs.

**Verify before demo:**

```bash
cd server
npm run verify:staging   # checks required env + MongoDB/Redis connectivity
curl https://<api>/api/v1/health   # expect checks.mongodb ok, checks.redis ok
```

After deploy, create the first super admin with `POST /api/v1/admins` against the staging API if the database has no users.

## API documentation

- **OpenAPI spec:** [docs/openapi.yaml](./docs/openapi.yaml)
- **Postman collection:** [docs/postman/hr-saas.postman_collection.json](./docs/postman/hr-saas.postman_collection.json) (import into Postman for all requests)
- **Local env:** [docs/postman/hr-saas.local.postman_environment.json](./docs/postman/hr-saas.local.postman_environment.json)
- Agent rules: [AGENTS.md](./AGENTS.md)

**Keep this file current.** When setup, env, commands, or deployment change, update the README in the same PR. See [AGENTS.md](./AGENTS.md) for the full checklist.

## Implementation progress

- Stage 1: [docs/plan/STAGE-1-IMPLEMENTATION-STEPS.md](./docs/plan/STAGE-1-IMPLEMENTATION-STEPS.md) · [docs/plan/00-stage-1-core-hr-plan.md](./docs/plan/00-stage-1-core-hr-plan.md)
- Stage 2: [docs/plan/STAGE-2-IMPLEMENTATION-STEPS.md](./docs/plan/STAGE-2-IMPLEMENTATION-STEPS.md) · [docs/plan/10-stage-2-operations-plan.md](./docs/plan/10-stage-2-operations-plan.md)
