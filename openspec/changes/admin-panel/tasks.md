## 1. Dependencies & Configuration

- [x] 1.1 Install `daisyui` as a Tailwind CSS v4 plugin (`bun add daisyui`)
- [x] 1.2 Configure DaisyUI `emerald` theme in `src/styles/global.css` or Tailwind config — ensure it only applies to admin routes
- [x] 1.3 Install `@tiptap/extension-link` and `@tiptap/extension-color` if not already present

## 2. Database Schema Migration

- [x] 2.1 Add `views`, `likes`, `comments_count` (integer, default 0) and `sort_order` (integer) columns to the `articles` table in `src/db/schema.ts`
- [x] 2.2 Run `bunx drizzle-kit generate` to generate the migration SQL
- [x] 2.3 Review generated SQL and ensure `sort_order` defaults to `id` for existing rows
- [ ] 2.4 Apply migration to the Neon Postgres database via `bunx drizzle-kit migrate`

## 3. Admin Layout

- [x] 3.1 Create `src/layouts/AdminLayout.astro` — standalone HTML shell with NO import of `Navbar.tsx` or `Footer.astro`
- [x] 3.2 Add a fixed sidebar with DaisyUI `drawer` component containing nav links: Dashboard, Articles
- [x] 3.3 Add a top bar with the admin panel title and hamburger button (for mobile)
- [x] 3.4 Apply `data-theme="emerald"` to the admin layout root element
- [x] 3.5 Implement responsive mobile drawer toggle using DaisyUI `drawer` pattern
- [x] 3.6 Add React Icons to sidebar nav items (e.g., `RiDashboardLine`, `RiArticleLine`)

## 4. Admin API Endpoints

- [x] 4.1 Create `src/pages/api/admin/articles.ts` — handle `GET` (list with pagination, ordered by `sort_order`) and `POST` (create article)
- [x] 4.2 Create `src/pages/api/admin/articles/[id].ts` — handle `GET` (single), `PUT` (update), `DELETE` (delete)
- [x] 4.3 Create `src/pages/api/admin/articles/[id]/reorder.ts` — handle `POST` with `{ direction: "up" | "down" }`, swap `sort_order` with adjacent article
- [x] 4.4 Ensure all API responses return proper JSON with `Content-Type: application/json` and appropriate HTTP status codes
- [x] 4.5 Handle boundary cases in reorder (first/last article) — return success with informational message

## 5. Shared Admin Components

- [x] 5.1 Create `src/components/admin/AdminTable.tsx` — generic typed React component accepting `columns` (with `key`, `header`, `render` fields) and `data` props; include horizontal scroll wrapper for mobile
- [x] 5.2 Create `src/components/admin/Toast.tsx` — DaisyUI `alert`-based toast notification component with success/error variants; expose a `useToast` hook or context for triggering toasts from anywhere
- [x] 5.3 Create `src/components/admin/ConfirmModal.tsx` — DaisyUI `modal`-based confirmation dialog accepting `message`, `onConfirm`, `onCancel` props; replaces browser `confirm()`
- [x] 5.4 Create `src/components/admin/TipTapEditor.tsx` — controlled TipTap editor accepting `initialContent` (HTML string) and `onChange` (HTML string callback) props; toolbar with Bold, Italic, Heading (H1–H3), Bullet/Ordered list, Blockquote, Link, Image

## 6. Admin Dashboard Page

- [x] 6.1 Create `src/pages/admin/index.astro` using `AdminLayout.astro`
- [x] 6.2 Fetch aggregate stats server-side: total articles, sum of views, sum of likes, sum of comments_count
- [x] 6.3 Render four DaisyUI stat cards for Total Articles, Total Views, Total Likes, Total Comments
- [x] 6.4 Fetch the 5 most recently updated articles and render a recent activity list with title, category, published badge, and date

## 7. Articles List Page

- [x] 7.1 Create `src/pages/admin/articles/index.astro` using `AdminLayout.astro`
- [x] 7.2 Mount an `ArticlesTable` React component (`client:load`) that fetches from `GET /api/admin/articles?page=N`
- [x] 7.3 Wire `AdminTable` with columns: Title, Category, Views, Likes, Comments, Published (badge), Actions
- [x] 7.4 Implement pagination: show 15 rows per page, render numbered page buttons below the table
- [x] 7.5 Implement Delete action: show `ConfirmModal`, call `DELETE /api/admin/articles/[id]`, remove row from local state on success, show `Toast`
- [x] 7.6 Implement Move Up / Move Down actions: call `POST /api/admin/articles/[id]/reorder`, update row order in local state
- [x] 7.7 Add "Post Article" button (top-right, DaisyUI `btn-primary`) linking to `/admin/articles/new`
- [x] 7.8 Show success/error `Toast` after all mutations

## 8. Post Article Page

- [x] 8.1 Create `src/pages/admin/articles/new.astro` using `AdminLayout.astro`
- [x] 8.2 Mount `ArticleForm` React component (`client:load`) in create mode (no initial data)
- [x] 8.3 Implement `ArticleForm` (`src/components/admin/ArticleForm.tsx`) with fields: Title, Slug (auto-generated from title with manual override), Category (select), Cover Image (file input calling `/api/upload`), Published toggle, and `TipTapEditor` for content
- [x] 8.4 On submit, call `POST /api/admin/articles` with form data; show success `Toast` and redirect to `/admin/articles`
- [x] 8.5 Show error `Toast` on validation or API failure (no `alert()`)

## 9. Edit Article Page

- [x] 9.1 Create `src/pages/admin/articles/[id]/edit.astro` using `AdminLayout.astro` — fetch article server-side and pass as props
- [x] 9.2 Mount `ArticleForm` in edit mode with `initialData` prop pre-populating all fields and `TipTapEditor` with existing content HTML
- [x] 9.3 On submit, call `PUT /api/admin/articles/[id]`; show success `Toast` and redirect to `/admin/articles`

## 10. View Article Page (Admin Preview)

- [x] 10.1 Create `src/pages/admin/articles/[id]/index.astro` using `AdminLayout.astro` — fetch article server-side
- [x] 10.2 Render article content using the same Tailwind Typography `prose` classes as the public article page
- [x] 10.3 Display article metadata: title, cover image, category badge, date

## 11. Cleanup & Polish

- [x] 11.1 Delete or repurpose the old `src/pages/admin/editor.astro` (which used the public `Layout.astro`)
- [x] 11.2 Verify no public portal routes import any admin components or layout
- [x] 11.3 Test all pages on mobile viewport (≤768px): sidebar drawer, table horizontal scroll, form fields
- [x] 11.4 Test all CRUD operations end-to-end: create → list → edit → delete → reorder
- [x] 11.5 Confirm DaisyUI emerald theme does not bleed into public portal pages
