## Why

This change was originally written for the Astro + Drizzle + DaisyUI stack. That stack no longer exists — the project migrated to Next.js (App Router) + PayloadCMS + Neon Postgres + Cloudflare R2. Every artifact it described (`AdminLayout.astro`, `src/pages/api/admin/*`, `drizzle-kit` migrations, DaisyUI `emerald`) names files and dependencies that are not in the repository. The change had to be rewritten against the current stack rather than patched. TipTap carries over from the original design as the body editor, but everything around it is new.

Beyond the stack change, the editorial need is unchanged and still unmet. Payload's stock admin is a competent generic CMS UI, but it is not an editorial console for The Lumen Tech:

- No at-a-glance view of aggregate engagement (total views, likes, comments) or recent editorial activity.
- No one-click trend reordering — `sortOrder` is a bare number field an editor must type into, per article, guessing at neighbouring values.
- Its chrome, typography, and theme are Payload's, not the product's, and it is styled with Payload's own SCSS rather than the Tailwind v4 system the rest of the app uses.

## What Changes

**Routing**

- Payload's native admin moves from `/admin` to `/cms` (`routes.admin` in the Payload config, plus the matching move of `src/app/(payload)/admin/` → `src/app/(payload)/cms/`). It is retained as a power-user escape hatch for anything the custom admin does not cover (versions, users, media library, comments).
- A new `(admin)` route group owns `/admin` — a third root layout alongside `(frontend)` and `(payload)`, with its own Tailwind entry stylesheet.
- **BREAKING**: `/admin` now serves the custom admin. Existing bookmarks to Payload's native admin must change to `/cms`.

**Authentication**

- `/admin/login` authenticates against the existing `users` collection using Payload's auth. Session is the standard Payload `payload-token` cookie, so the custom admin and `/cms` share one login.
- Every `/admin/*` route is gated server-side on an authenticated user with role `admin` or `editor`.
- The dev-only `autoLogin` shortcut applies to Payload's admin UI only; the custom admin gets an explicit dev-credentials affordance on the login screen instead of a silent bypass.

**Screens**

- `/admin` — dashboard: aggregate stat cards (articles, views, likes, comments), draft/published split, and a recent-activity list.
- `/admin/articles` — paginated list, 15 rows per page, with title/category/status/metrics columns, search, category + status filters, row actions (view, edit, delete), and move-up/move-down trend reordering.
- `/admin/articles/new` and `/admin/articles/[id]/edit` — article form: title, auto-derived slug with manual override, excerpt, cover image, category, author, publish state, and rich-text body.
- `/admin/articles/[id]` — read-only preview rendering the article the way the public portal does.

**Components** (plain Tailwind v4 + `lucide-react`, both already dependencies)

- A generic, typed `DataTable` reusable across future admin list pages.
- `Toast` and `ConfirmDialog` primitives — no browser `alert()` / `confirm()` anywhere in the admin.
- TipTap's Simple Editor (the official Tiptap UI Components template) scaffolded into the project and owned as source, with body images uploading into Payload's `media` collection.

**Data layer**

- Reads go through Payload's Local API from server components. Mutations go through Next.js Server Actions that call the Local API with `overrideAccess: false`, so collection access control is enforced rather than bypassed.
- No bespoke `/api/admin/*` REST surface — Payload already exposes REST and GraphQL, and Server Actions cover the admin's own mutations.

**Schema and content format**

- The `articles` collection gains real access control, an auto-slug hook, auto-populated `publishedAt` on first publish, read-only engagement counters, and an indexed `sortOrder`. No new columns — `views`, `likes`, `commentsCount`, and `sortOrder` already exist.
- **BREAKING**: `content` changes from a Payload `richText` (Lexical) field to a `json` field holding ProseMirror JSON, because TipTap is ProseMirror and Payload's rich-text field is Lexical. Consequences: article *bodies* can no longer be edited at `/cms`, and the public article page renders through TipTap's `generateHTML()` instead of `@payloadcms/richtext-lexical/react`. The three seeded sample articles are reauthored in the new format; this is only cheap because the project is pre-launch.

**Explicitly removed from the design**

- DaisyUI, Origin UI, shadcn/ui, and Radix. Outside the TipTap editor, the admin is built with plain Tailwind v4 utilities and `lucide-react` icons only.

## Capabilities

### New Capabilities

- `payload-cms-route`: Payload's native admin relocated to `/cms` so the custom admin can own `/admin`, kept available as an escape hatch
- `admin-auth`: Login, server-side session resolution, and role gating for every `/admin/*` route, sharing Payload's auth cookie
- `admin-layout`: The custom admin shell — sidebar, top bar, responsive drawer, light/dark theming, isolated from the public portal chrome
- `admin-dashboard`: Aggregate engagement stats, draft/published split, and recent editorial activity
- `admin-articles-list`: Paginated, searchable, filterable article table with row actions and trend reordering
- `admin-article-editor`: Create/edit form built around TipTap's Simple Editor, with cover image upload, body image upload into `media`, and publish controls
- `admin-article-viewer`: In-admin article preview matching public portal rendering
- `admin-table-component`: Reusable generic `DataTable` component for tabular admin data
- `admin-api`: Server Action mutation layer over Payload's Local API, with access control enforcement, atomic reorder, and cache revalidation

### Modified Capabilities

- `articles-schema`: The `articles` collection gains access control, auto-slug, auto `publishedAt`, read-only counters, and an indexed `sortOrder`

## Impact

**New files**

- `src/app/(admin)/layout.tsx`, `src/app/(admin)/styles.css`
- `src/app/(admin)/login/page.tsx`
- `src/app/(admin)/admin/page.tsx` (dashboard)
- `src/app/(admin)/admin/articles/page.tsx`
- `src/app/(admin)/admin/articles/new/page.tsx`
- `src/app/(admin)/admin/articles/[id]/page.tsx`
- `src/app/(admin)/admin/articles/[id]/edit/page.tsx`
- `src/components/admin/` — `AdminShell.tsx`, `Sidebar.tsx`, `TopBar.tsx`, `DataTable.tsx`, `Toast.tsx`, `ConfirmDialog.tsx`, `StatCard.tsx`, `ArticleForm.tsx`, `ArticlesTable.tsx`, `tiptap/` (scaffolded Simple Editor template)
- `src/lib/admin/auth.ts` (session + role guard), `src/lib/admin/actions.ts` (Server Actions)
- `src/lib/tiptap-extensions.ts` — the single extension list shared by the editor and the frontend renderer

**Moved files**

- `src/app/(payload)/admin/**` → `src/app/(payload)/cms/**` (including `importMap.js`)

**Modified files**

- `src/payload.config.ts` — `routes.admin: '/cms'`, and the `onInit` seeder reauthored to emit ProseMirror JSON
- `src/app/(payload)/layout.tsx` — import map path
- `src/collections/Articles.ts` — access control, hooks, field admin config, `content` field type
- `src/app/(frontend)/article/[slug]/page.tsx` — body renderer swapped to TipTap's `generateHTML()`
- `CLAUDE.md` — the "do not hand-build admin CRUD UI" guidance is superseded for `/admin`; the rich-text note ("render with `<RichText>` from `@payloadcms/richtext-lexical/react`") no longer describes articles

**New dependencies**

- `@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`, `@tiptap/html`, plus the extensions the Simple Editor template requires
- Possibly `sass` as a devDependency, if the scaffolded template ships SCSS — to be confirmed when scaffolding

**No column is added or dropped** — the four counter/order columns already exist. Two schema-affecting changes land: an index on `sortOrder`, and `content` becoming a `json` column. Payload's dev push mode applies both.

**Public portal** — the article body renderer changes as described above. No route, navigation, or layout changes.
