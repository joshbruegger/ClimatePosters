# ClimatePosters

SvelteKit gallery for climate awareness posters: public uploads go live immediately, Vercel Blob storage, PocketBase (SQLite) records, and moderators can delete posters when needed.

## Setup

1. Copy `.env.example` to `.env` and fill in PocketBase admin credentials, `BLOB_READ_WRITE_TOKEN`, and `ADMIN_MODERATION_PASSWORD`.

2. In PocketBase, create collections `posters` and `poster_reports` to match the fields in `pb_schema/posters.collection.json` (see the spec in your project plan for full field list). Set API rules so only the server (admin token) can read/write as needed for your deployment.

3. Install [Bun](https://bun.sh), then install and run:

```sh
bun install
bun run dev
```

## Scripts

- `bun run dev` — development server
- `bun run build` — production build (Vercel adapter)
- `bun fmt` — format with Prettier (`bun run fmt:check` to verify without writing)
- `bun lint` — ESLint (Svelte + TypeScript)
- `bun run test` — Vitest unit tests
- `bun run check` / `bun run typecheck` — TypeScript and Svelte check

## Admin

Open `/admin/moderation`, sign in with `ADMIN_MODERATION_PASSWORD`, then delete posters that should not stay in the gallery. Optional `ADMIN_API_BEARER_TOKEN` enables `Authorization: Bearer` for admin APIs (`GET` / `DELETE` `/api/admin/posters`).
