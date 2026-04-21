# ClimatePosters

SvelteKit gallery for climate awareness posters: public uploads (pending review), Vercel Blob storage, PocketBase (SQLite) records, and admin moderation.

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
- `bun run check` — TypeScript and Svelte check

## Admin

Open `/admin/moderation`, sign in with `ADMIN_MODERATION_PASSWORD`, then approve pending posters or remove approved ones. Optional `ADMIN_API_BEARER_TOKEN` enables `Authorization: Bearer` for the same admin APIs.
