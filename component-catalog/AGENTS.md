# AGENTS.md — TBA3 Component Catalog

Agent guidance for working in this repository.

---

## Project overview

Vue 3 + Vite component catalog (`npm run dev` → port 5174, `npm run build` → `dist/`).  
Showcases reusable SVG visualization components for VERA assessment data, wired directly to the TBA3 API.

---

## TBA3 API

### Specification

The API is defined by the OpenAPI spec at:

- **Raw YAML:** `https://raw.githubusercontent.com/indibit-eu/tba3/refs/heads/main/tba3-spec.yml`
- **Swagger UI:** `https://petstore.swagger.io/?url=https%3A%2F%2Fraw.githubusercontent.com%2Findibit-eu%2Ftba3%2Frefs%2Fheads%2Fmain%2Ftba3-spec.yml`

The three main endpoint groups are:

| Prefix | Description |
|---|---|
| `/groups/{id}/…` | Lerngruppe-level data (items, competence-levels, …) |
| `/schools/{id}/…` | School-level aggregates |
| `/states/{id}/…` | State/Bundesland-level aggregates |

### Live backend

`https://apps.indibit.eu/tba3-api` — the production mock/reference server.  
In production (Vercel), requests to `/groups/**`, `/schools/**`, `/states/**` are reverse-proxied there via `vercel.json`.

### Mock server (local development)

Source: `https://github.com/indibit-eu/tba3/tree/main/mock-server`  
Also vendored locally in `../tba3-repo/mock-server/`.

Python FastAPI app, run with:

```bash
cd ../tba3-repo/mock-server
uv venv && uv sync
uv run uvicorn server:app --reload --port 8000
```

Interactive docs at `http://localhost:8000/docs`.

In local dev (`npm run dev`), Vite proxies `/groups/**`, `/schools/**`, `/states/**` to `http://localhost:8000` via `vite.config.js`.

---

## Deployment

**Vercel** — manual CLI deploy (no GitHub integration for this repo).

```bash
# Preview deploy
vercel

# Production deploy
vercel --prod
```

### Routing (`vercel.json`)

```json
{
  "rewrites": [
    { "source": "/groups/:path*",  "destination": "https://apps.indibit.eu/tba3-api/groups/:path*" },
    { "source": "/schools/:path*", "destination": "https://apps.indibit.eu/tba3-api/schools/:path*" },
    { "source": "/states/:path*",  "destination": "https://apps.indibit.eu/tba3-api/states/:path*" },
    { "source": "/(.*)",           "destination": "/index.html" }
  ]
}
```

---

## Local dev vs. production

| Concern | Local (`npm run dev`) | Production (Vercel) |
|---|---|---|
| API proxy | Vite dev server (`vite.config.js`) | `vercel.json` rewrites |
| SPA routing | Vite handles all routes | `/(.*) → /index.html` rewrite |
| Backend | `localhost:8000` (mock server) | `apps.indibit.eu/tba3-api` |

---

## Pre-deploy checklist

- [ ] `npm run build` completes without errors
- [ ] New API endpoints are proxied in both `vite.config.js` and `vercel.json`
- [ ] New routes are registered in `src/router/index.js` and linked from `IndexView.vue`
