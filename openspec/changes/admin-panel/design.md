## Context

The Lumen Tech is an Astro 7 SSR news site (React + Tailwind CSS v4, deployed on Vercel, Neon Postgres via Drizzle ORM). Currently only a bare `/admin/editor.astro` exists — it reuses the public `Layout.astro` so the public Navbar and Footer bleed into the admin UI. There is no article listing, no CRUD UI, no dashboard, and no metrics display. Content is published purely through the editor page with no list management. The articles schema lacks `views`, `likes`, `comments_count`, and `sort_order` columns.

## Goals / Non-Goals

**Goals:**
- Deliver a fully independent admin panel with its own layout, theme, and routing isolated from the public portal
- Support full article CRUD (create, read, update, delete) through a polished TipTap-powered editor
- Display per-article engagement metrics (views, likes, comments) in the articles list table
- Allow editors to manually reorder articles up/down for trending control
- Paginate the article list at 15 rows per page with visible page navigation
- Implement optimistic/reactive UI updates so every mutation reflects immediately without manual refresh
- Replace all browser `alert()` / `confirm()` calls with a DaisyUI + Shadcn-style toast/modal component
- Make the entire admin panel fully responsive (mobile, tablet, desktop)

**Non-Goals:**
- Authentication / authorization for the admin panel (deferred to a future change)
- Analytics dashboards beyond basic article metrics (deferred)
- Multi-language / i18n support for admin UI (deferred)
- Real-time collaborative editing (deferred)
- Comment moderation UI (deferred)

## Decisions

### 1. Independent Admin Layout (not sharing `Layout.astro`)

**Decision**: Create `src/layouts/AdminLayout.astro` that imports no public components (no `Navbar`, no `Footer`).

**Rationale**: The public portal's `Layout.astro` hardcodes the public Navbar and Footer. Extending it would always bleed those into admin pages. An independent layout gives full control over the admin chrome (sidebar + top bar) without conditional gymnastics.

**Alternatives considered**:
- Conditional rendering inside `Layout.astro` via a prop — rejected because it entangles public and admin concerns in a single file.
- A slot-based override mechanism — more complex and still couples the two layouts.

---

### 2. DaisyUI `emerald` Theme via CDN-free Astro Integration

**Decision**: Install `daisyui` as a Tailwind CSS v4 plugin and set `emerald` as the active theme in `astro.config.mjs` / global CSS.

**Rationale**: The `adminPlane.md` spec explicitly calls for DaisyUI emerald. DaisyUI v5 supports Tailwind CSS v4 as a plugin. The emerald theme provides a warm yellow/honey palette that differentiates the admin from the public dark-mode portal.

**Alternatives considered**:
- Hand-rolling all UI components with raw Tailwind — too slow and inconsistent.
- Using another component library (Mantine, Chakra) — heavier bundle, not requested.

---

### 3. TipTap Editor Reuse + Extension

**Decision**: Extend the existing `src/components/Editor.tsx` rather than forking it. Create `src/components/admin/TipTapEditor.tsx` that accepts `initialContent` + `onChange` props.

**Rationale**: The project already has `@tiptap/react`, `@tiptap/starter-kit`, and `@tiptap/extension-image`. Wrapping them in a controlled component avoids duplicating extension wiring.

**Alternatives considered**:
- Using the existing `Editor.tsx` directly — it has no `onChange` prop or `initialContent` support (it's uncontrolled), so edit mode would not work.

---

### 4. Reusable `AdminTable` React Component

**Decision**: Create `src/components/admin/AdminTable.tsx` as a generic, typed React component accepting `columns` + `data` props.

**Rationale**: The spec requires a common table component usable across all future admin list pages. A generic columnar API keeps future pages from copy-pasting table markup.

**Alternatives considered**:
- Using a third-party table library (TanStack Table) — adds complexity; the feature set needed (sort, paginate, actions) is achievable without it.

---

### 5. API Design — REST under `/api/admin/`

**Decision**: Use Astro API routes (`.ts` files) for article CRUD:
- `GET/POST /api/admin/articles` — list + create
- `GET/PUT/DELETE /api/admin/articles/[id]` — single article operations
- `POST /api/admin/articles/[id]/reorder` — move up/down (body: `{ direction: "up" | "down" }`)

**Rationale**: Astro's file-based API routes are already used (`/api/upload.ts`). Staying in the same pattern avoids adding a separate API server. REST is simple enough for this use case.

**Alternatives considered**:
- GraphQL — too heavy for a single-feature admin panel.
- Server Actions (Astro form actions) — limited reusability from React components calling them dynamically.

---

### 6. Schema Extension — `sort_order`, `views`, `likes`, `comments_count`

**Decision**: Add four integer columns to the `articles` table. `sort_order` is initialized to the article's `id` on migration (preserves existing order). `views`, `likes`, `comments_count` default to `0`.

**Rationale**: Reordering and metrics are core admin requirements. Adding to the existing table is simpler than a separate join table for these scalar values.

**Migration**: A Drizzle `db:push` or generated migration script will ALTER the table. Existing rows get `sort_order = id` and metric columns default to `0`.

---

### 7. Reactive UI — React state + `fetch` mutations

**Decision**: Admin list pages are React islands (`client:load`). Mutations call the REST API endpoints, then update local React state (optimistic update) without triggering a full Astro page reload.

**Rationale**: Astro SSR pages reload on navigation by default. Making the list table a React island keeps state local and allows instant UI updates post-mutation.

**Alternatives considered**:
- Full Astro View Transitions — adds complexity and still requires a navigation cycle.
- SWR / React Query — valid choice but adds a dependency; simple `useState` + `fetch` suffices for this scale.

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| DaisyUI v5 + Tailwind CSS v4 compatibility | Verify `daisyui@5` works as a Tailwind v4 plugin before scaffolding components; fall back to `daisyui@4` with Tailwind CSS v4 compat mode if needed |
| DB migration on production Neon Postgres | Use `drizzle-kit generate` + manual review before pushing; ensure `sort_order` default doesn't break existing article ordering |
| Admin panel accidentally accessible publicly (no auth) | Add a warning note in the layout; auth is deferred but the panel is unprotected for now — acceptable for dev/staging |
| TipTap v3 API differences from v2 | The project uses `@tiptap/react@^3.29.2` — confirm `useEditor` and `EditorContent` API matches v3 docs before writing the component |
| Optimistic updates causing stale state on error | On API error, revert optimistic state and show a toast error message |

## Migration Plan

1. Run `bunx drizzle-kit generate` to generate migration SQL for the new columns
2. Review generated SQL for correctness (check `sort_order` default expression)
3. Apply migration to Neon Postgres via `bunx drizzle-kit migrate` or Neon console
4. Deploy the new admin routes and components to Vercel
5. **Rollback**: If migration causes issues, the new columns are all nullable/defaulted — dropping them restores the previous state without data loss on existing article content

## Open Questions

- Should the admin panel enforce basic HTTP Basic Auth or a session cookie as a stopgap until full auth is built? (Currently deferred, but worth deciding before production deploy)
- Should `views`/`likes`/`comments_count` be writable from the admin UI directly, or only via public-facing API increment endpoints?
