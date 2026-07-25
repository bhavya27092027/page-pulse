# Technology Decision Record

| Decision | Choice | Alternatives considered | Rationale |
| --- | --- | --- | --- |
| Frontend framework | React 18 (Vite) | Next.js, SvelteKit | Assessment spec + Vite's instant HMR; SPA is sufficient — no SSR/SEO-critical content. |
| Language | TypeScript (strict) | JavaScript | Type safety across the API contract; client + server share types. |
| Styling | Tailwind + shadcn/ui | MUI, Chakra | Utility-first + accessible primitives; matches the template. |
| Animation | Framer Motion | CSS-only, GSAP | Declarative layout animations + `AnimatePresence` for result states. |
| Forms/validation | React Hook Form + Zod | Formik, Yup | Small bundle; Zod schema is reused conceptually on the server. |
| HTTP client | Axios | fetch | Interceptors, timeout, cancelation; clean error shape. |
| Backend runtime | Node.js 20 | Bun, Deno | Stable, widely deployable to Render; native `fetch` + `AbortController`. |
| Backend framework | Express | Fastify, Nest | Minimal, well-understood; matches assessment expectations. |
| Logger | Winston | Pino, console | Transports (console/file), structured JSON in prod. |
| Cache | node-cache | Redis, lru-cache | In-memory TTL is enough for a single instance; zero-ops. See [Scalability](./SCALABILITY.md) for the Redis upgrade path. |
| Rate limiting | express-rate-limit | custom middleware | Battle-tested, standard headers, per-route scoping. |
| Security | Helmet + CORS | manual headers | Sensible secure defaults; explicit origin allowlist. |
| Testing | Jest + Supertest | Vitest, Mocha | Assessment spec; supertest drives the real Express app. |
| Lint/format | ESLint + Prettier | Biome | Mature TS support; consistent style. |
| CI | GitHub Actions | GitLab CI | Native to GitHub; matrix-free split backend/frontend jobs. |
| Frontend deploy | Vercel | Netlify | First-class Vite support; SPA rewrites. |
| Backend deploy | Render | Railway, Fly.io | Simple Node web service + health check. |

## Non-decisions (deliberate)

- **No database.** Audit history is intentionally a recent-activity view
  (in-memory ring buffer + client localStorage), not a store of record.
  Adding persistence is a [scalability](./SCALABILITY.md) concern, not a
  correctness one.
- **No auth.** The API is a public audit tool; rate limiting is the
  abuse boundary.
- **No SSR.** The dashboard is a client app; SEO needs are met with meta
  tags in `index.html`.
