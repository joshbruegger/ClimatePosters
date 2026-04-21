## Task Completion Requirements

- All of `bun fmt`, `bun lint`, `bun run test`, `bun typecheck`, and `bun run build` must pass before considering tasks completed.
- Use `bun run test` for Vitest (do not invoke the `vitest` binary directly unless debugging).

## Project Snapshot

ClimatePosters is a minimal website for finding, downloading, and sharing climate activism posters.

This repository is a VERY EARLY WIP. Proposing sweeping changes that improve long-term maintainability is encouraged.

## Core Priorities

1. Correctness and safety (validation, auth, no secret leakage to the client).
2. Accessibility (keyboard, focus, screen readers).
3. Clear UX when PocketBase or Blob requests fail.

If a tradeoff is required, choose robust error handling over shortcuts.

## Maintainability

Long term maintainability is a core priority. If you add new functionality, first check if there is shared logic that can be extracted to a separate module. Duplicate logic across multiple files is a code smell and should be avoided. Don't be afraid to change existing code. Don't take shortcuts by just adding local logic to solve a problem.

## Repository Layout

| Area                  | Role                                                                                                          |
| --------------------- | ------------------------------------------------------------------------------------------------------------- |
| `src/routes/`         | SvelteKit pages and `+server.ts` API routes (`/api/posters`, `/api/admin/…`, etc.).                           |
| `src/lib/components/` | UI: upload zone, gallery grid, modal (`bits-ui`).                                                             |
| `src/lib/server/`     | Server-only: PocketBase admin client, Blob upload, admin session/auth helpers.                                |
| `src/lib/utils/`      | Shared validation and helpers usable from client or server as appropriate.                                    |
| `pb_schema/`          | Reference JSON for PocketBase `posters` collection (create matching collections in your PocketBase instance). |
| `static/`             | Static assets served as-is.                                                                                   |

This is a **single app** monolith (no separate frontend package).

## External Services (Important)

- **PocketBase** — Server uses the admin API (`ensureAdminAuth` in `src/lib/server/pocketbase.ts`) for listing, creating, updating, and deleting records. Public reads in the app go through SvelteKit endpoints, not direct browser access to PocketBase.
- **Vercel Blob** — Uploads use `@vercel/blob` with `BLOB_READ_WRITE_TOKEN` on the server only.
- **Sharp** — Used server-side for image metadata and thumbnails after upload.

When changing data shape, update PocketBase collections and any TypeScript types / validators in sync.

## Reference Documentation

- SvelteKit: [https://kit.svelte.dev/docs](https://kit.svelte.dev/docs)
- PocketBase JS SDK: [https://pocketbase.io/docs/js-client/](https://pocketbase.io/docs/js-client/)
- Vercel Blob: [https://vercel.com/docs/storage/vercel-blob](https://vercel.com/docs/storage/vercel-blob)
- Bits UI: [https://bits-ui.com](https://bits-ui.com)

Use these when adjusting routes, auth, or UI primitives.
