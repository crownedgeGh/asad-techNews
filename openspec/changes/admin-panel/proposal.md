## Why

The Lumen Tech news site currently has no administration interface — content can't be managed without direct database access. An independent admin panel is needed now so editors can create, edit, delete, and reorder articles without touching code or the database, and so engagement metrics (views, likes, comments) are visible at a glance.

## What Changes

- Add a fully independent admin panel at `/admin/*` that does **not** use the public portal's `Layout.astro` (no public Navbar or Footer)
- Add an admin-specific layout (`AdminLayout.astro`) with its own sidebar navigation and DaisyUI `emerald` theme
- Add a **Dashboard** page (`/admin`) showing summary stats (total articles, views, likes, comments, recent activity)
- Add an **Articles list** page (`/admin/articles`) with a paginated, sortable data table (15 rows/page) showing title, category, views, likes, comments, published status, and action buttons (view, edit, delete, reorder up/down)
- Add a **Post Article** page (`/admin/articles/new`) with a TipTap rich-text editor, cover image upload, category selector, slug auto-generation, and publish/draft toggle
- Add an **Edit Article** page (`/admin/articles/[id]/edit`) with TipTap pre-populated with existing article data
- Add a **View Article** page (`/admin/articles/[id]`) rendering the article exactly as the public portal does
- Add a reusable `AdminTable` React component usable across all admin list pages
- Add API endpoints for full article CRUD (`/api/admin/articles`) and reordering
- Extend the `articles` DB schema to include `views`, `likes`, `commentsCount`, and `sortOrder` columns
- All UI uses DaisyUI `emerald` theme + React Icons; Shadcn-style toast/modal components replace browser alerts
- All mutations (post, edit, delete, reorder) reflect live without page refresh (optimistic / reactive updates)
- **BREAKING**: Extends `articles` table schema — requires a DB migration

## Capabilities

### New Capabilities
- `admin-layout`: Independent admin shell layout with sidebar, top bar, and DaisyUI emerald theme — isolated from the public portal
- `admin-dashboard`: Overview page showing aggregate stats (articles, views, likes, comments) and recent activity feed
- `admin-articles-list`: Paginated, sortable article table with CRUD action buttons and trend reordering (up/down)
- `admin-article-editor`: TipTap-powered article create/edit form with cover image upload, metadata fields, and publish controls
- `admin-article-viewer`: Article preview inside the admin panel, matching public portal rendering
- `admin-table-component`: Reusable, generic `AdminTable` React component for tabular data across all admin pages
- `admin-api`: REST API endpoints for article CRUD and reorder operations under `/api/admin/`

### Modified Capabilities
- `articles-schema`: Add `views`, `likes`, `comments_count`, and `sort_order` columns to the existing `articles` table

## Impact

- **New files**: `src/layouts/AdminLayout.astro`, `src/pages/admin/index.astro`, `src/pages/admin/articles/index.astro`, `src/pages/admin/articles/new.astro`, `src/pages/admin/articles/[id]/edit.astro`, `src/pages/admin/articles/[id]/index.astro`, `src/components/admin/AdminTable.tsx`, `src/components/admin/ArticleForm.tsx`, `src/components/admin/TipTapEditor.tsx`, `src/components/admin/Toast.tsx`, `src/components/admin/ConfirmModal.tsx`, `src/pages/api/admin/articles.ts`, `src/pages/api/admin/articles/[id].ts`, `src/pages/api/admin/articles/[id]/reorder.ts`
- **Modified files**: `src/db/schema.ts` (new columns), `astro.config.mjs` (DaisyUI integration)
- **New dependencies**: `daisyui`, `@shadcn/ui`-inspired toast/modal (hand-rolled with Tailwind + DaisyUI), `@tiptap/extension-color`, `@tiptap/extension-link`
- **DB migration required**: Adds columns to `articles` table
- No changes to public portal routes or existing components
