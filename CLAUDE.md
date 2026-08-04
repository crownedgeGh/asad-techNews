# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

"The Lumen Tech" (package name `blue-binary`) — a tech news/blog website built on Next.js (App Router) + PayloadCMS + Neon Postgres + Cloudflare R2.

The project was migrated from an Astro + Drizzle custom-admin stack to Next.js + PayloadCMS. It is pre-launch — no production data, free to make breaking changes.

## Commands

This project uses **Bun** as its package manager — `bun.lock` is the lockfile, `package.json` pins `packageManager` and blocks `npm`/`yarn`/`pnpm` installs via a `preinstall` guard. Always use `bun`, not `npm`/`npx`/`yarn`.

- `bun install` — install dependencies
- `bun run dev` — start local dev server (localhost:3000)
- `bun run build` — production build
- `bun run start` — run the production build
- `bun run generate:types` — regenerate `src/payload-types.ts` from the collection configs after schema changes
- `bun run generate:importmap` — regenerate the Payload admin import map after adding custom admin components
- `bun run payload ...` — run any Payload CLI command

Payload manages its own Postgres schema/migrations automatically in dev (push mode). For production, use Payload's migration commands (`bun run payload migrate:create`, `bun run payload migrate`) once the schema stabilizes.

## Environment

Copy `.env.example` to `.env` and fill in:
- `DATABASE_URL` — Neon Postgres connection string
- `PAYLOAD_SECRET` — long random string used to sign Payload's JWTs/tokens
- `CLOUDFLARE_R2_ENDPOINT`, `CLOUDFLARE_R2_ACCESS_KEY_ID`, `CLOUDFLARE_R2_SECRET_ACCESS_KEY`, `CLOUDFLARE_R2_BUCKET_NAME` — R2 object storage for the `media` collection (via `@payloadcms/storage-s3`)

Deployment target is Vercel.

## Architecture

**Two route groups share one Next.js app**:
- **`src/app/(frontend)`** — the public portal. Server components fetch content via Payload's Local API (`getPayload({ config })` then `payload.find(...)`) directly in page components — no separate REST round-trip needed since both run in the same Node process.
- **`src/app/(payload)`** — Payload's own admin UI and REST/GraphQL API routes, wired up per Payload's standard Next.js integration (`RootLayout`, `RootPage`, `REST_*`/`GRAPHQL_*` route handlers from `@payloadcms/next`). Do not hand-build admin CRUD UI here — extend Payload's admin via collection `admin` config, custom fields, or admin components registered through the import map instead of bespoke React tables.

**Data layer**: `src/payload.config.ts` is the single source of truth for schema — collections live in `src/collections/*.ts`:
- `Users` — auth-enabled, `role` (admin/editor)
- `Media` — uploads, proxied to Cloudflare R2 via `@payloadcms/storage-s3`, with `thumbnail`/`card`/`og` image sizes
- `Categories` — simple title/slug taxonomy
- `Articles` — title, slug, excerpt, coverImage, lexical richText `content`, category/author relationships, `views`/`likes`/`commentsCount`/`sortOrder` counters (same manual-trend-ranking concept as before), draft/publish versioning enabled
- `Comments` — belongs to an `article`, simple authorName/body (no nested threading yet)

Run `bun run generate:types` after editing any collection so `src/payload-types.ts` stays in sync — import types from there rather than hand-rolling interfaces.

**Rich text**: Articles use Payload's Lexical editor (`@payloadcms/richtext-lexical`); render on the frontend with `<RichText data={article.content} />` from `@payloadcms/richtext-lexical/react`.

## Product/design constraints (from plan.md, adminPlane.md, agent.md)

These predate the Payload migration and describe the previous Astro admin panel's UX bar — they still apply to the public portal. The admin panel is now Payload's own admin UI, so the Origin UI/shadcn/Radix-specific notes below no longer apply to `/admin`, only to any custom fields/components built on top of it:

- Fully responsive everywhere (mobile/tablet/desktop).
- Both light and dark mode must be supported throughout the public portal (Payload's admin theme is handled by Payload itself).
- Typography: body/article text uses Merriweather/Georgia/Source Serif 4/Lora; headings use Inter/Roboto/Helvetica Neue/Source Sans 3.
- Public site nav sections: Home, Trending, Tech News, AI Tools, Reviews, General News.
- Articles are paginated 15 per page on the public portal.
