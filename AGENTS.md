# AGENTS.md

## Task Completion Requirements

- `bun run typecheck` must pass before considering tasks completed (Svelte + TypeScript via `svelte-check`).
- `bun run build` must pass for any change that touches application code, routes, server logic, or build config.
- **Formatting and ESLint are not configured in this repository yet.** Match the style of surrounding files; do not introduce a separate formatter config unless asked.
- Do not run bare `bun test`. This project has no test runner wired up; if Vitest (or similar) is added later, use `bun run test` only when that script exists.

## Project Snapshot

**ClimatePosters** is a SvelteKit web app: a public poster gallery with drag-and-drop uploads, search/tags/sort, modal detail views, download tracking, user reporting, and an admin UI to remove posters. Server-side integration uses **PocketBase** (data) and **Vercel Blob** (images). New uploads are **approved by default** and appear in the gallery immediately; moderators **delete** content that should not remain.

Environment variables are documented in `.env.example`. Collection shapes are referenced under `pb_schema/`.

## Core Priorities

1. **Correctness and safety** — validate uploads and inputs; protect admin routes; never leak secrets client-side.
2. **Accessibility** — keyboard navigation, focus management, screen-reader-friendly patterns (Bits UI primitives where used).
3. **Predictable behavior** — clear loading and error states when PocketBase or Blob calls fail.

If a tradeoff is required, prefer robust error handling and clear UX over shortcuts.

## Maintainability

Long-term maintainability matters. Before adding behavior, see whether logic belongs in a **shared server module** under `src/lib/server/` (e.g. PocketBase client, env, auth helpers) or **shared utilities** under `src/lib/utils/`. Avoid duplicating filter/query or validation logic across API routes. Prefer small, focused route handlers that call shared functions.

## Repository Layout

| Area | Role |
|------|------|
| `src/routes/` | SvelteKit pages and `+server.ts` API routes (`/api/posters`, `/api/admin/…`, etc.). |
| `src/lib/components/` | UI: upload zone, gallery grid, modal (`bits-ui`). |
| `src/lib/server/` | Server-only: PocketBase admin client, Blob upload, admin session/auth helpers. |
| `src/lib/utils/` | Shared validation and helpers usable from client or server as appropriate. |
| `pb_schema/` | Reference JSON for PocketBase `posters` collection (create matching collections in your PocketBase instance). |
| `static/` | Static assets served as-is. |

This is a **single app** monolith (no separate frontend package). Keep API contracts stable for any future clients.

## External Services (Important)

- **PocketBase** — Server uses the admin API (`ensureAdminAuth` in `src/lib/server/pocketbase.ts`) for listing, creating, updating, and deleting records. Public reads in the app go through SvelteKit endpoints, not direct browser access to PocketBase, unless you intentionally change that.
- **Vercel Blob** — Uploads use `@vercel/blob` with `BLOB_READ_WRITE_TOKEN` on the server only.
- **Sharp** — Used server-side for image metadata and thumbnails after upload.

When changing data shape, update PocketBase collections and any TypeScript types / validators in sync.

## Reference Documentation

- SvelteKit: https://kit.svelte.dev/docs
- PocketBase JS SDK: https://pocketbase.io/docs/js-client/
- Vercel Blob: https://vercel.com/docs/storage/vercel-blob
- Bits UI: https://bits-ui.com

Use these when adjusting routes, auth, or UI primitives.
