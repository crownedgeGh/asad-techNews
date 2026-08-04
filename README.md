# The Lumen Tech

A tech news/blog site built on **Next.js (App Router)** + **PayloadCMS** + **Neon Postgres**, with media stored on **Cloudflare R2**.

## Project structure

```text
/
├── src/
│   ├── app/
│   │   ├── (frontend)/       # Public site — Home, /article/[slug]
│   │   └── (payload)/        # Payload admin UI + REST/GraphQL API routes
│   ├── collections/          # Payload collection configs (Users, Media, Categories, Articles, Comments)
│   └── payload.config.ts     # Payload core config (db, storage, editor, collections)
└── package.json
```

## Commands

This project uses **Bun** as its package manager — installs with `npm`/`yarn`/`pnpm` are blocked by a `preinstall` guard.

| Command                    | Action                                              |
| :-------------------------- | :--------------------------------------------------- |
| `bun install`                | Install dependencies                                 |
| `bun run dev`                | Start local dev server at `localhost:3000`            |
| `bun run build`              | Production build                                      |
| `bun run start`              | Run the production build                              |
| `bun run generate:types`     | Regenerate `src/payload-types.ts` from collections    |
| `bun run generate:importmap` | Regenerate the Payload admin import map               |
| `bun run payload`            | Run any Payload CLI command                            |

## Environment

Copy `.env.example` to `.env` and fill in `DATABASE_URL`, `PAYLOAD_SECRET`, and the `CLOUDFLARE_R2_*` values.

## Admin panel

Visit `/admin` — Payload's built-in admin UI (first run prompts you to create the first user).
