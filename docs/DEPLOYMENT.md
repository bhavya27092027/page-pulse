# Production Deployment Guide

End-to-end guide to run Page Pulse in production on **Render** (backend) +
**Vercel** (frontend).

## Prerequisites

- A GitHub repo containing this project.
- Accounts on [Render](https://render.com) and [Vercel](https://vercel.com).
- Node 20+ locally for verification.

## 1. Deploy the backend (Render)

### Option A — Blueprint (recommended)

1. Push the repo to GitHub.
2. In Render, **New → Blueprint**, select the repo.
3. Render reads `render.yaml` and provisions `page-pulse-api`.
4. Set `CORS_ORIGIN` (initially your Vercel URL or `*` for testing).
5. Deploy. Smoke test:
   ```bash
   curl https://<your-api>.onrender.com/api/health
   # → {"success":true,"data":{"status":"ok",...}}
   ```

### Option B — manual web service

1. **New → Web Service**, connect the repo.
2. **Root Directory:** `server`
3. **Build:** `npm install && npm run build`
4. **Start:** `npm start`
5. **Health Check Path:** `/api/health`
6. Add the env vars from `server/.env.example`.

## 2. Deploy the frontend (Vercel)

1. In Vercel, **New Project**, import the repo.
2. Framework preset: **Vite**. Root directory: the repo root (not `server`).
3. Build command + output are auto-detected from `vercel.json` (`npm run build` → `dist`).
4. Add the environment variable:
   - `VITE_API_URL` = `https://<your-api>.onrender.com` (no trailing slash)
5. Deploy. Open the preview URL and run one audit to confirm end-to-end.

## 3. Lock down CORS

Back on Render, set `CORS_ORIGIN` to your exact Vercel URL(s):
```
CORS_ORIGIN=https://page-pulse.vercel.app,https://page-pulse-git-main-<user>.vercel.app
```
Redeploy the backend. Verify a request from the deployed frontend still
succeeds (no CORS error in the browser console).

## 4. CI

`.github/workflows/ci.yml` runs on every push/PR:
- Backend job: `npm ci` → `lint` → `test` → `build` (uploads coverage).
- Frontend job: `npm ci` → `lint` → `typecheck` → `build` (uploads `dist`).

Both jobs must be green before merging to your deploy branch.

## 5. Local verification

```bash
# Backend
cd server
cp .env.example .env
npm install && npm run dev      # http://localhost:4000

# Frontend (repo root, new terminal)
npm install
VITE_API_URL=http://localhost:4000 npm run dev   # http://localhost:5173
```

## 6. Post-deploy checks

- [ ] `GET /api/health` returns 200.
- [ ] `POST /api/audit { "url":"https://openai.com" }` returns a 200 envelope.
- [ ] A second identical POST returns `cached:true`.
- [ ] The frontend's footer links to `https://digitalheroesco.com`.
- [ ] Dark mode toggle persists across reload.
- [ ] A 404 path renders the NotFound page.

## Environment variable reference

| Var | Where | Default | Purpose |
| --- | --- | --- | --- |
| `PORT` | server | 4000 | Listen port |
| `NODE_ENV` | server | development | Runtime mode |
| `CORS_ORIGIN` | server | `*` | Allowed frontend origins |
| `AUDIT_TIMEOUT_MS` | server | 5000 | Per-probe abort timeout |
| `MAX_CONCURRENT_AUDITS` | server | 10 | Concurrency cap |
| `CACHE_TTL_SECONDS` | server | 600 | Result cache TTL |
| `HISTORY_LIMIT` | server | 20 | In-memory history size |
| `RATE_LIMIT_WINDOW_MS` | server | 3600000 | Rate-limit window |
| `RATE_LIMIT_MAX` | server | 100 | Max requests per window per IP |
| `VITE_API_URL` | client | (empty) | Backend base URL; empty = fallback engine |
