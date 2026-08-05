# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

"The Lumen Tech" (package name `blue-binary`) — a tech news/blog website with a public portal and an independent admin panel, built on Astro + React + Neon Postgres (Drizzle) + Cloudflare R2.

## Commands

This project uses **Bun** as its package manager — `bun.lock` is the lockfile, `package.json` pins `packageManager` and blocks `npm`/`yarn`/`pnpm` installs via a `preinstall` guard. Always use `bun`, not `npm`/`npx`/`yarn`.

- `bun install` — install dependencies
- `bun run dev` — start local dev server (localhost:4321). Per AGENTS.md, prefer `astro dev --background` so the server doesn't block the terminal; manage it with `astro dev stop`, `astro dev status`, `astro dev logs`.
- `bun run build` — production build to `./dist/`
- `bun run preview` — preview a production build locally
- `bun run astro ...` — run Astro CLI commands (e.g. `astro check`, `astro add`)
- `bunx drizzle-kit generate` — generate a new SQL migration from `src/db/schema.ts` changes (writes to `./drizzle`)
- `bunx drizzle-kit push` / `bunx drizzle-kit migrate` — apply schema changes to the Neon database (uses `DATABASE_URL`)

No test runner or lint script is configured in `package.json`.

## Environment

Copy `.env.example` to `.env` and fill in:
- `DATABASE_URL` — Neon Postgres connection string
- `CLOUDFLARE_R2_ENDPOINT`, `CLOUDFLARE_R2_ACCESS_KEY_ID`, `CLOUDFLARE_R2_SECRET_ACCESS_KEY`, `CLOUDFLARE_R2_BUCKET_NAME` — R2 object storage for images

Deployment target is Vercel (`@astrojs/vercel` adapter, `output: 'server'`).

## Architecture

**Two independent front-ends share one Astro app**, per `adminPlane.md`:
- **Public portal** (`src/pages/index.astro`, `src/pages/article/[slug].astro`) uses `src/layouts/Layout.astro`, `Navbar.tsx`, `Footer.astro`, and `src/styles/global.css`. Supports light/dark mode via a `dark` class toggled on `<html>` (persisted in `localStorage.theme`, no FOUC by way of an inline `<script>` in the `<head>`).
- **Admin panel** (`src/pages/admin/**`) uses `src/layouts/AdminLayout.astro` and `src/styles/admin.css` — its own header/sidebar/theming built on Origin UI/shadcn-style components (Radix primitives + `class-variance-authority` + `src/lib/utils.ts`'s `cn()`) living under `src/components/admin/ui/`, with an orange/amber-based CSS-variable theme (tweakcn "Academic" — Poppins body, Playfair Display headings, `oklch()` color tokens; light/dark via a `dark` class, persisted separately in `localStorage['admin-theme']`) and `lucide-react` icons (admin-only — the public portal keeps `react-icons`). It must never leak the public portal's header/footer or vice versa; when adding shared components, be deliberate about which layout consumes them.

**Data layer**: Drizzle ORM over Neon serverless Postgres. `src/db/schema.ts` defines `users` and `articles` tables (articles carry `views`, `likes`, `commentsCount`, and a `sortOrder` used for manual trend-ranking). `src/db/index.ts` exports the singleton `db` client. Schema changes go through drizzle-kit (see Commands) — migrations live in `./drizzle`.

**Admin CRUD flow**: Astro API routes under `src/pages/api/admin/articles*.ts` (list/create at `articles.ts`, single-article get/update/delete at `articles/[id].ts`, drag-reorder at `articles/[id]/reorder.ts`) are called by React admin components (`src/components/admin/ArticlesTable.tsx`, `ArticleForm.tsx`, `AdminTable.tsx`) client-side so the UI updates without full page reloads. `AdminTable.tsx` is the shared generic table component intended for reuse across admin pages (collapses to a card layout on mobile/tablet per `adminPlane.md`). Article authoring uses TipTap (`src/components/admin/TipTapEditor.tsx`; a separate `Editor.tsx` exists for the public-facing/simple editor path).

**Image uploads**: `src/pages/api/upload.ts` accepts a multipart file, compresses/converts it to WebP via `sharp`, and uploads it to Cloudflare R2 via the AWS S3 SDK (`@aws-sdk/client-s3`), returning a public URL.

**Comments/social**: `Comments.tsx` and `SocialShare.tsx` are React islands hydrated on public article pages.

## Product/design constraints (from plan.md, adminPlane.md, agent.md)

These are living product decisions, not just style notes — apply them when touching related UI:

- Fully responsive everywhere (mobile/tablet/desktop); admin tables become cards on mobile/tablet.
- Both light and dark mode must be supported throughout.
- Typography: body/article text uses Merriweather/Georgia/Source Serif 4/Lora; headings use Inter/Roboto/Helvetica Neue/Source Sans 3.
- Admin panel uses Origin UI/shadcn-style components (Radix + Tailwind) with `lucide-react` icons (no emojis) and non-native modals/toasts — see `ConfirmModal.tsx` (Radix `Dialog`) and `AdminToaster.tsx` (`sonner`). Public portal continues to use `react-icons`.
- Admin list/CRUD actions should reflect in the UI immediately (optimistic/refetch), not require a manual page refresh.
- Articles are paginated 15 per page; the admin articles table supports manual up/down trend reordering (`sortOrder`) in addition to showing views/likes/comment counts.
- Public site nav sections: Home, Trending, Tech News, AI Tools, Reviews, General News.
