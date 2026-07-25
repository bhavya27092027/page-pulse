# AI Usage Disclosure

This document transparently describes how AI tooling was used in the
construction of **Page Pulse**.

## How AI was used

- **Initial scaffolding:** Generating the base project structure, file
  layout, and boilerplate configuration (Vite, TypeScript, Tailwind,
  tsconfig, Jest config).
- **Architecture brainstorming:** Discussing the overall system design —
  caching strategy, concurrency queue shape, rate-limit placement, the
  centralized error envelope, and the client/server fallback contract.
- **Documentation:** Drafting the README, the system-design documents in
  `docs/`, inline explanatory comments, and this disclosure file.
- **Boilerplate generation:** Producing repetitive but mechanical code such
  as the shared type definitions mirrored across the client and server.

## What the developer reviewed and customized

- **Implementation:** All production logic was reviewed, refined, and
  adjusted to fit the application's real behavior — including the audit
  pipeline, cache + history interaction, and the graceful-degradation
  fallback engine.
- **Refinement:** Naming, type signatures, error semantics (e.g. treating
  DNS failures as `reachable: false` rather than `502`), and the API
  envelope were iterated on for correctness and clarity.
- **Testing:** The Jest + Supertest suite was written, debugged, and tuned
  to cover the required cases (valid/invalid URL, timeout, cache, rate
  limiting, success, failure). Test ordering and mock-fetch isolation
  issues were diagnosed and fixed.
- **Debugging:** Resolving TypeScript module-resolution mismatches between
  the ESM source and the CommonJS test runner, rate-limiter state
  contamination across test cases, and fetch-mock isolation.
- **Design decisions:** Color system, typography, component composition,
  the dark-first aesthetic, keyboard shortcuts, and the dashboard charts
  were chosen and tuned by the developer.
- **Final improvements:** Bundle code-splitting, accessibility passes
  (reduced-motion, focus management, ARIA labels), SEO meta tags, and
  responsive breakpoints.

## Statement

AI accelerated the mechanical and editorial work; the architectural
choices, correctness fixes, integration behaviour, and final polish are
the developer's own. The codebase was reviewed end-to-end before
submission.
