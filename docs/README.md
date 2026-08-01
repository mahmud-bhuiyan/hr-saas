# Documentation

| File | Purpose |
|------|---------|
| [openapi.yaml](./openapi.yaml) | **API spec (source of truth)** — OpenAPI 3.0, all endpoints |
| [postman/hr-saas.postman_collection.json](./postman/hr-saas.postman_collection.json) | **Postman collection** — runnable requests for every endpoint |
| [postman/hr-saas.local.postman_environment.json](./postman/hr-saas.local.postman_environment.json) | Local Postman environment (`baseUrl`, `accessToken`) |
| [plan/](./plan/) | Product roadmap and implementation steps — start at [plan/IMPLEMENTATION-STEPS.md](./plan/IMPLEMENTATION-STEPS.md) |

## Using the API docs

**OpenAPI (YAML):** Open `openapi.yaml` in Swagger Editor, Stoplight, or VS Code (OpenAPI extension). Import into Postman via *Import → Link or File*.

**Postman:**
1. Import `postman/hr-saas.postman_collection.json`
2. Import `postman/hr-saas.local.postman_environment.json`
3. Select the **HR SaaS — Local** environment
4. Run **Auth → Login** or **Register Company** — `accessToken` is saved automatically
5. Run **Get Current User (me)** or other protected requests

**curl:** Each Postman request has a *Code snippet* (curl) in the Postman UI, or copy from the request body examples in `openapi.yaml`.

## When adding or changing an endpoint

Update **both** files in the same PR:

1. `docs/openapi.yaml` — path, method, schemas, auth, examples
2. `docs/postman/hr-saas.postman_collection.json` — matching request with sample body

See [AGENTS.md](../AGENTS.md) for the full agent checklist.

## When adding or changing product scope

Update plan docs in the same change (keep in sync with code):

1. [plan/IMPLEMENTATION-STEPS.md](./plan/IMPLEMENTATION-STEPS.md) — step checklist; log out-of-plan additions in the table at the top
2. Relevant [plan/modules/](./plan/modules/) file — endpoints, screens, acceptance criteria
3. [plan/00-client-demo-plan.md](./plan/00-client-demo-plan.md) — screens checklist and Section 11 status table
