# Rollback Strategy

## Deployment model

- **Frontend:** Vercel — immutable builds, instant atomic deploys, every
  deploy gets a unique preview URL + automatic rollback to any prior
  production deployment from the dashboard.
- **Backend:** Render — `git push` triggers build + deploy; Render keeps
  prior deploys and supports one-click rollback in the dashboard.

## Safe deploy checklist

1. CI is green on the commit (lint · test · build for both apps).
2. Backend deploys first (the frontend's fallback engine absorbs a brief
   backend gap, but ordering avoids the frontend calling a not-yet-up API).
3. Set `CORS_ORIGIN` on the backend to the Vercel URL before exposing.
4. Smoke test: `curl https://<api>/api/health` → `status:ok`.
5. Smoke test the frontend: submit one audit, confirm a 200 envelope.

## Rollback — frontend (Vercel)

- Dashboard → the project → **Instant Rollback** → select the previous
  production deployment. Live in seconds, no rebuild.
- Because the frontend is a static SPA, a rollback cannot corrupt state.
  Client localStorage history is untouched.

## Rollback — backend (Render)

- Dashboard → the service → **Deploys** → **Roll back to this deploy**.
- Render re-runs the previous build's `startCommand`.
- In-memory cache/history are lost on restart — acceptable (cache warms
  up; history is a recent-activity view, not a store of record).

## Database migrations

There is no database in the current design, so **no migration rollback**
is required. If persistence is added per the
[Scalability](./SCALABILITY.md) plan, adopt **expand-then-contract**
migrations: additive changes ship first; destructive changes ship only
after the rollback window closes.

## Config rollback

Environment variables are the most common rollback cause. Keep a known-good
set in a secret manager or the Render/Vercel dashboard's history; restore
the previous values, then redeploy.

## Feature-flag posture

No feature flags are currently used. If a risky change is planned, prefer
shipping it behind a `VITE_*` / env flag so it can be disabled without a
rollback.
