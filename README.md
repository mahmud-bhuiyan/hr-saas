# HR SaaS Platform

Multi-tenant HR software. Client and server are **fully separate apps** — own code, env, and deployment.

See [docs/plan/](./docs/plan/) for product docs.

## Folder structure

```
hr-saas/
├── client/          # React frontend (deploy to its own server)
├── server/          # Express API (deploy to its own server)
├── docs/            # API registry + project plans
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
```

| App | URL |
|-----|-----|
| Client | http://localhost:5173 |
| Server | http://localhost:5000 |
| Health | http://localhost:5000/api/v1/health |

## Environment files

| App | File | Key variables |
|-----|------|---------------|
| **Server** | `server/.env.local` | `MONGODB_URI`, `CLIENT_URL`, `ADMIN_JWT_SECRET` (optional: `PORT`, defaults to 5000) |
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

## Testing

```bash
cd server && npm test
```

- API list: [docs/API-REGISTRY.md](./docs/API-REGISTRY.md)
- Agent rules: [AGENTS.md](./AGENTS.md)

**Keep this file current.** When setup, env, commands, or deployment change, update the README in the same PR. See [AGENTS.md](./AGENTS.md) for the full checklist.

## Implementation progress

[docs/plan/IMPLEMENTATION-STEPS.md](./docs/plan/IMPLEMENTATION-STEPS.md)
