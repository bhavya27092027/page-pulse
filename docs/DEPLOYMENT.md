# Production Deployment Guide

End-to-end guide to deploy **Page Pulse** in production using **Railway** (backend) and **Netlify** (frontend).

## Prerequisites

- GitHub repository containing this project
- Railway account
- Netlify account
- Node.js 20+ (optional, for local verification)

---

## 1. Deploy the Backend (Railway)

1. Create a new project in Railway.
2. Connect your GitHub repository.
3. Set the **Root Directory** to:

   ```text
   server
   ```

4. Railway will automatically detect the project and deploy it.
5. Add the following environment variables:

   ```text
   NODE_ENV=production
   CORS_ORIGIN=https://page-pulse-analyzer.netlify.app
   ```

6. Verify the deployment:

   ```bash
   curl https://page-pulse-api-production.up.railway.app/api/health
   ```

---

## 2. Deploy the Frontend (Netlify)

1. Create a new site in Netlify.
2. Import your GitHub repository.
3. Configure:

   ```text
   Build Command: npm run build
   Publish Directory: dist
   ```

4. Add the environment variable:

   ```text
   VITE_API_URL=https://page-pulse-api-production.up.railway.app
   ```

5. Deploy the project.

---

## 3. Verify Deployment

- Backend Health API returns **200**
- Frontend successfully communicates with the backend
- No CORS errors in the browser console

---

## 4. GitHub Actions

`.github/workflows/ci.yml` runs on every push and pull request:

- Backend: lint → test → build
- Frontend: lint → typecheck → build

---

## 5. Local Verification

```bash
# Backend
cd server
cp .env.example .env
npm install
npm run dev

# Frontend
npm install
VITE_API_URL=http://localhost:4000 npm run dev
```

---

## 6. Post Deployment Checklist

- [ ] `/api/health` returns HTTP 200
- [ ] Website audit works correctly
- [ ] Repeated requests return cached results
- [ ] Dark mode persists
- [ ] React Router routes work after refresh
- [ ] No browser console errors

---

## Environment Variables

| Variable | Location | Purpose |
|-----------|----------|---------|
| PORT | Server | Server port |
| NODE_ENV | Server | Runtime environment |
| CORS_ORIGIN | Server | Allowed frontend origin |
| AUDIT_TIMEOUT_MS | Server | Request timeout |
| MAX_CONCURRENT_AUDITS | Server | Maximum concurrent audits |
| CACHE_TTL_SECONDS | Server | Cache duration |
| HISTORY_LIMIT | Server | History limit |
| RATE_LIMIT_WINDOW_MS | Server | Rate-limit window |
| RATE_LIMIT_MAX | Server | Maximum requests |
| VITE_API_URL | Client | Railway backend URL |