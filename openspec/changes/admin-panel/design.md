## Context

"The Lumen Tech" (`blue-binary`) is a Next.js 15 App Router site with PayloadCMS 3.87 on Neon Postgres, media on Cloudflare R2, Tailwind CSS v4, deployed to Vercel. Two route groups share one app: `src/app/(frontend)` (public portal, reads via Payload's Local API) and `src/app/(payload)` (Payload's own admin UI at `/admin` plus REST/GraphQL handlers).

Collections are defined in `src/collections/`: `Users` (auth, `role: admin|editor`), `Media` (R2 uploads, `thumbnail`/`card`/`og` sizes), `Categories`, `Articles` (Lexical `content`, draft/publish versioning, `views`/`likes`/`commentsCount`/`sortOrder`), `Comments`.

Current state of the admin surface:

- `/admin` is Payload's stock admin. `src/app/(payload)/custom.css` is an empty placeholder.
- `src/components/admin/` exists but is empty.
- `src/fields/slug/` exists but is untracked and unwired — it contains `formatSlug()` and a `SlugComponent` built on `@payloadcms/ui`.
- `payload.config.ts` has a dev-only `autoLogin` that auto-authenticates as `dev@lumen.tech`, plus an `onInit` seeder for a dev user, three categories, and three sample articles.
- `Articles` has `access: { read: () => true }` and nothing else — create/update/delete currently fall back to "any authenticated user".

The project is pre-launch with no production data, so breaking changes are cheap.

## Goals / Non-Goals

**Goals:**

- A purpose-built editorial admin at `/admin`, built with the same Tailwind v4 system as the rest of the app, visually and structurally independent of both the public portal chrome and Payload's SCSS.
- Full article lifecycle from the custom admin: list, create, edit, preview, delete, publish/unpublish, reorder.
- Aggregate engagement visibility (views, likes, comments, draft/published split) on a dashboard.
- One-click trend reordering, so an editor never types a `sortOrder` number by hand.
- Real authentication and role gating on every admin route, sharing one session with Payload's native admin.
- Payload's native admin remains reachable at `/cms` for the collections the custom admin does not cover, and for version history. Article *body* editing is the exception — see decision 3.
- Mutations enforce Payload's collection access control rather than bypassing it.
- Fully responsive (mobile / tablet / desktop) with light and dark mode.
- No browser `alert()` / `confirm()`.

**Non-Goals:**

- Replacing Payload's admin for `users`, `media`, `categories`, or `comments` — those stay at `/cms` for this change.
- A version history / draft-diff UI in the custom admin (Payload's `/cms` covers it).
- Comment moderation UI.
- Real-time collaborative editing or presence.
- i18n of the admin UI.
- A Payload rich-text adapter backed by TipTap, which would restore body editing at `/cms` (see decision 3).
- Any change to the public portal beyond swapping the article body renderer, which decision 3 forces.
- Automatic view/like increment endpoints for the public site — the counters are read-only in the admin, but wiring the public increments is a separate change.

## Decisions

### 1. Custom admin at `/admin`, Payload's native admin relocated to `/cms`

**Decision**: Set `routes.admin: '/cms'` in `payload.config.ts` and move `src/app/(payload)/admin/` to `src/app/(payload)/cms/`. A new `(admin)` route group takes over `/admin` via `src/app/(admin)/admin/...`.

**Rationale**: Both surfaces cannot serve `/admin`. Putting the custom admin at the memorable path and demoting Payload's to `/cms` matches how the two will actually be used — editors live in `/admin`, `/cms` is the escape hatch. Route groups don't contribute to the URL, so `(admin)/admin/page.tsx` resolves to `/admin` while giving the group its own root layout.

**Narrowed by decision 3**: once article bodies are stored as ProseMirror JSON, `/cms` can no longer edit them usefully. It remains the escape hatch for media, users, categories, comments, and version history — but for article content, `/admin` is the only editor.

**Consequence**: `routes.admin` and the App Router directory name must stay in lockstep — Payload derives the import-map location and its own internal links from `routes.admin`, but Next.js routes purely from the filesystem. Changing one without the other yields a 404 that looks like a Payload bug. The `(payload)/layout.tsx` import of `./admin/importMap` must be updated too.

**Alternatives considered**:

- Custom admin at `/dashboard`, Payload untouched at `/admin` — less disruptive, but leaves the primary path pointing at the UI editors are meant to stop using.
- Removing Payload's admin entirely — loses versions, media library, and user management for no benefit, since it costs nothing to keep.

### 2. No component library — plain Tailwind v4 + `lucide-react`

**Decision**: Build every admin component from raw Tailwind utilities. Icons come from `lucide-react`. No DaisyUI, Origin UI, shadcn/ui, or Radix.

**Rationale**: Explicit product direction. Both dependencies are already in `package.json`, so the admin adds no UI dependency at all. It also sidesteps the real friction that a Tailwind-based component library would hit next to Payload's SCSS in the same app.

**Cost, stated plainly**: the accessibility work that Radix would have provided for free — focus trapping in the confirm dialog, `aria-modal` semantics, Escape-to-close, focus restoration, roving focus in the sidebar — is now ours to write. The `ConfirmDialog` is specified on the native `<dialog>` element specifically to recover most of that from the platform.

### 3. Rich text: a hand-built TipTap editor, with ProseMirror JSON as the stored format

This is the highest-risk decision in the change and deserves the most detail.

**Decision**: Build a compact TipTap editor from the TipTap packages directly — `@tiptap/react` + `StarterKit` plus link, image, highlight, and text-align — with a toolbar written in plain Tailwind using `lucide-react` icons. TipTap emits ProseMirror JSON, so **ProseMirror JSON becomes the canonical storage format for `Articles.content`**: the field changes from Payload `richText` (Lexical) to a Payload `json` field.

**Why not the official Simple Editor template** (the original form of this decision, revised during implementation): scaffolding it was attempted and abandoned on three findings. First, the Tiptap CLI is interactive-only — it force-closes without a TTY and hangs even with a pseudo-terminal, so it cannot run in an automated or CI context. Second, resolving its registry graph by hand showed a closure of **93 registry entries across 115 files**, whose dependency list includes `@radix-ui/react-dropdown-menu`, `@radix-ui/react-popover`, `class-variance-authority`, `@base-ui/react`, and `sass`/`sass-embedded` — squarely against decision 2's no-component-library direction. Third, **13 of those 115 files do not exist in the public `ueberdosis/tiptap-ui-components` repository at all** (`search-and-replace`, `input-group`, `switch`, `textarea`, `use-is-breakpoint`, …); the published registry index is ahead of the public source, so a faithful scaffold is not reproducible without the CLI.

Hand-building trades the template's out-of-the-box polish for roughly three owned files instead of 115, no Radix, no SCSS pipeline, and an editor that looks like the rest of the admin because it is built from the same utilities.

**Why the storage format has to change**: TipTap is ProseMirror; Payload's `richText` field is Lexical. These are different document models with different node vocabularies — there is no configuration that makes one produce the other. Something has to give, and the options are to convert on every read and write, or to change what is stored. Converting is a lossy bidirectional translation layer that has to be maintained forever and silently degrades content at the edges of what the two models share. Changing the stored format is a one-time cost paid now, while the project is pre-launch with no production data and only three seeded sample articles. The one-time cost is clearly the better trade.

**What this buys**: the editor speaks the storage format natively. There is no round-trip hazard, no unknown-node problem, and no translation layer — the class of data-loss bug that dominated the previous design is designed out rather than mitigated.

**What this costs, stated plainly**:

1. **`/cms` loses meaningful body editing.** A Payload `json` field renders as a JSON textarea in Payload's admin. `/cms` remains the escape hatch for media, users, categories, comments, and version history, but article *body* editing now happens only in the custom admin. Decision 1's "escape hatch" framing is narrowed accordingly — for article bodies, `/admin` is not a preferred path, it is the only path.
2. **The frontend renderer changes.** `<RichText data={article.content} />` from `@payloadcms/richtext-lexical/react` no longer applies. The public article page renders the stored JSON with `generateHTML()` from `@tiptap/html`, using the same extension list the editor is configured with, in a server component. The extension list must therefore be a single shared module imported by both the editor and the renderer — if they drift, content renders differently than it was authored.
3. **Existing content must be converted.** The three articles the `onInit` seeder creates hold Lexical JSON. The seeder is rewritten to emit ProseMirror JSON, and the dev database is reset rather than migrated. This is only acceptable because the project is pre-launch; it would be a real migration otherwise.
4. **Toolbar affordances are ours to write.** Heading and list pickers and the link entry popover are hand-built, the same way `ConfirmDialog` is. This is the accessibility cost decision 2 already accepted, extended to the editor.

**Feature set**: headings (H2/H3), bold, italic, underline, strike, inline code, code block, bullet and ordered lists, blockquote, horizontal rule, link, highlight, text alignment, image, and undo/redo. This is what the publication actually needs; anything beyond it is a later addition to one shared extension list.

**Image uploads** post to Payload's `media` collection, so images in article bodies land in R2 as `media` documents like every other asset, rather than as base64 blobs or external URLs.

**Alternatives considered**:

- **Keeping Lexical storage and converting TipTap ↔ Lexical on load/save.** Rejected for the reasons above: a permanent lossy translation layer, and precisely the silent-data-loss failure mode this decision exists to eliminate.
- **Storing HTML** via `editor.getHTML()` instead of JSON. Simpler to render (`dangerouslySetInnerHTML`), but gives up structured content, makes programmatic transforms hard, and puts sanitization on the critical path for every read. JSON is strictly better here.
- **Writing a Payload rich-text adapter backed by TipTap**, so `/cms` and `/admin` share one editor. This is the only option that fully restores `/cms` parity, and it is the natural follow-up if body editing at `/cms` turns out to matter. Out of scope here: a Payload editor adapter must supply field, cell, and diff components plus schema generation, and mounting TipTap inside Payload's admin reintroduces exactly the SCSS/Tailwind collision decision 2 avoids.
- **A bare Lexical editor emitting Payload-native JSON** (an earlier form of this design). Kept the storage format intact and needed no frontend renderer change, but meant hand-building the editor UI anyway, and carried a genuine data-loss risk around `upload` and `relationship` nodes that had to be mitigated with passthrough node implementations and a round-trip test. Superseded by product direction to use TipTap.
- **The Simple Editor template as-is, accepting Radix.** Rejected on the three findings above; the deciding factor was that it contradicts the explicit no-component-library direction while also not being reproducible headlessly.

### 4. Server Components for reads, Server Actions for writes, `overrideAccess: false`

**Decision**: Page components call `getPayload({ config })` and read directly. Mutations live in `src/lib/admin/actions.ts` as `'use server'` functions, each resolving the caller's user via `payload.auth({ headers })` and passing `{ user, overrideAccess: false }` to the Local API call.

**Rationale**: Both run in the same Node process, so a REST round-trip buys nothing. `overrideAccess` defaults to `true` in the Local API — leaving it there would mean the admin's access control is whatever the UI happens to render, with no server-side enforcement. Passing `false` makes the collection `access` config the single source of truth, which is the whole reason for hardening it in decision 7.

**Alternatives considered**:

- A bespoke `/api/admin/*` REST layer, as the original Astro design had. Redundant now — Payload already exposes REST and GraphQL, and Server Actions handle the admin's own mutations with less ceremony.
- Client-side `fetch` against Payload's REST API. Workable, but gives up server-side auth resolution and makes cache revalidation manual.

### 5. Reordering by adjacent swap, inside a transaction

**Decision**: A `reorderArticle(id, direction)` Server Action finds the adjacent article by `sortOrder` in the requested direction, swaps the two values inside a single `payload.db` transaction, then revalidates the list path.

**Rationale**: An adjacent swap is O(1) writes and keeps `sortOrder` values stable for every other row. Without a transaction, a failure between the two updates leaves both articles sharing one `sortOrder`, which makes list ordering non-deterministic and the next swap ambiguous.

**Boundary behaviour**: moving the first article up or the last article down is a no-op that returns success — not an error. The buttons are also disabled at the boundaries, so this is defence in depth, not the primary UX.

**Alternatives considered**:

- Drag-and-drop reordering. Better UX, but needs a dependency or a hand-rolled pointer implementation, and rewrites `sortOrder` for a whole range. Deferred.
- Fractional indexing (insert between neighbours). Avoids the transaction entirely, but `sortOrder` is an existing integer column and changing its type is a migration this change doesn't otherwise need.

### 6. Auth: Payload's session cookie, resolved server-side

**Decision**: The login form posts to a Server Action calling `payload.login({ collection: 'users' })`, and the returned token is set as the standard `payload-token` cookie. A `requireAdminUser()` helper in `src/lib/admin/auth.ts` calls `payload.auth({ headers })` and redirects to `/admin/login` when there is no user or the role is not `admin` or `editor`.

**Rationale**: Reusing Payload's cookie means one login serves both `/admin` and `/cms`. Resolving in each route's server component (or a shared layout) keeps the check on the server, where it can't be bypassed.

**Why not middleware**: Next.js middleware runs on the Edge runtime, and Payload's Postgres adapter is not Edge-compatible, so `payload.auth()` cannot run there. Middleware could only check for the *presence* of a cookie, not its validity — worse than useless as a security boundary, since it reads like one. The guard therefore lives in the `(admin)` layout and is re-asserted in every Server Action, because a layout guard does not protect a Server Action invoked directly.

**Dev ergonomics — corrected during implementation**: this decision originally asserted that `autoLogin` in `payload.config.ts` is a Payload-admin feature that "will not log a user into the custom admin." **That was wrong.** `autoLogin` is applied inside `payload.auth()` itself, so it returns an authenticated user even when the request carries no session cookie — which silently bypassed sign-in for the custom admin in development.

The fix: `getAdminUser()` requires a real session-token cookie to be present *before* it accepts `payload.auth()`'s result. This narrows the check only — Payload still validates the token, and the cookie's mere presence is never treated as authentication (that would be the middleware anti-pattern described above). `/cms` keeps its autoLogin convenience; `/admin` requires an explicit sign-in, and the login page prefills the seeded dev credentials in development only.

### 7. Harden the `Articles` collection instead of guarding in the UI

**Decision**: Give `Articles` explicit `access` (public reads restricted to published documents; create/update/delete limited to `admin` and `editor`; delete limited to `admin`), a `beforeValidate` hook that derives `slug` from `title` via the existing `formatSlug()`, a `beforeChange` hook that sets `publishedAt` on first publish, `index: true` on `sortOrder`, and `admin.readOnly` on the three counter fields.

**Rationale**: With `overrideAccess: false`, collection access *is* the authorization model — for the custom admin, for `/cms`, and for the REST API alike. Putting the rules in one place means a gap can't open between what the UI hides and what the server allows.

**Scope note**: the `content` field's change from `richText` to `json` also lands on this collection, but it belongs to decision 3 and is driven by the editor choice, not by authorization.

**Note on the current `read: () => true`**: it exposes drafts to the public REST API today. Restricting reads to published documents for unauthenticated callers is a fix this change carries, and the public portal must be verified against it (it queries published articles already, but `_status` handling should be confirmed rather than assumed).

### 8. Three root layouts, three stylesheets

**Decision**: `(admin)/layout.tsx` is a third root layout with its own `<html>`/`<body>` and its own `styles.css` importing Tailwind. It reuses the public portal's `theme` localStorage key and `.dark` class convention.

**Rationale**: `(frontend)` and `(payload)` are already root layouts, so a third is idiomatic. A separate stylesheet keeps the admin's tokens independent of the portal's serif/prose defaults, while sharing the theme key means toggling dark mode in one surface carries to the other.

## Risks / Trade-offs

| Risk | Severity | Mitigation |
|---|---|---|
| The editor's extension list and the frontend renderer's extension list drift, so published articles render differently than they were authored | **High** | A single shared extensions module imported by both the TipTap editor and the `generateHTML()` call; a render-parity check on an article exercising every supported node before sign-off |
| Changing `content` from `richText` to `json` makes article bodies uneditable at `/cms` | **High** | Accepted and explicit in decision 3; `/admin` becomes the sole body editor, and the follow-up path (a TipTap Payload adapter) is recorded as a non-goal rather than forgotten |
| Existing Lexical-format article bodies are unreadable by the new renderer | Medium | Only the three `onInit` sample articles exist; the seeder is rewritten to emit ProseMirror JSON and the dev database is reset. **This mitigation depends on there being no real content — it must be re-evaluated if any article is authored before this lands** |
| Hand-built toolbar affordances (heading/list pickers, link popover) ship accessibility gaps | Medium | Same mitigation as decision 2: explicit keyboard and focus scenarios in the specs, and a keyboard pass over the editor before sign-off |
| `routes.admin` and the `(payload)` directory name drift apart | Medium | Move both in the same task; re-run `bun run generate:importmap` and verify the emitted path before assuming it landed where `layout.tsx` imports from |
| Body images bypass the `media` collection and land as base64 or external URLs | Medium | Wire the template's upload handler to Payload's `media` endpoint; verify an inserted image produces a `media` document in R2 with alt text |
| Hand-rolled dialog/menu components ship accessibility gaps | Medium | Native `<dialog>` for `ConfirmDialog`; explicit keyboard-navigation and focus scenarios in the specs; keyboard pass over every screen before sign-off |
| Restricting `Articles.read` to published docs breaks a public portal query | Medium | Audit `(frontend)` Payload queries in the same task; the portal renders published content only, but this must be verified, not assumed |
| A Server Action is invoked directly, bypassing the layout's auth guard | Medium | Every action independently calls `requireAdminUser()`; `overrideAccess: false` means collection access is a second, independent gate |
| Two admin UIs on one dataset diverge in behaviour (e.g. `/cms` writes bypass a rule the custom form enforces) | Low | All rules live in collection hooks and access control, not in form components |
| Scope creep — the custom admin growing to cover users, media, comments | Low | Explicit non-goal; sidebar links those to `/cms` |

## Migration Plan

No column is added or dropped — `views`, `likes`, `commentsCount`, and `sortOrder` already exist. Two schema-affecting changes do land: `index: true` on `sortOrder`, and `content` changing from `richText` to `json`. Payload's dev push mode applies both automatically.

The `content` change is a **format** change, not just a type change: existing rows hold Lexical JSON that the new renderer cannot read. Because the only articles in existence are the three created by `onInit`, the plan is to rewrite the seeder and reset the dev database rather than write a Lexical → ProseMirror converter. **This is only valid while no real content exists.** If any article is authored before this change lands, a conversion step becomes mandatory and must be added here.

1. Move the Payload admin route to `/cms` and confirm it loads before building anything at `/admin`.
2. Land the collection hardening, change `content` to `json`, rewrite the `onInit` seeder to emit ProseMirror JSON, reset the dev database, and run `bun run generate:types`.
3. Swap the public article page renderer to `generateHTML()` and confirm the seeded articles still render.
4. Build the shell, auth, and shared components.
5. Scaffold the Simple Editor, scope its styles, and wire image upload to the `media` collection.
6. Build the screens, dashboard through editor.
7. Verify editor/renderer parity on an article exercising every supported node type.

**Rollback**: revert `routes.admin` to `/admin`, move the `(payload)` directory back, and delete the `(admin)` group. The access and hook changes are additive and safe to keep; the `read` restriction is a one-line revert. The `content` format change is the one piece that is **not** cleanly reversible — reverting it requires restoring Lexical-format content, which in practice means reseeding again.

## Open Questions

- Should `/cms` be restricted to `role: admin` only, leaving editors solely in the custom admin? Leaving both open to editors for now.
- Should the dashboard's aggregate stats be computed with SQL aggregates via `payload.db.drizzle` rather than summing a `payload.find()` page? Fine at current volume; revisit past a few thousand articles.
- Should deleting an article cascade to its comments, or leave them orphaned? Out of scope here, but it needs an answer before launch.
- Is losing article body editing at `/cms` acceptable long-term, or should a TipTap-backed Payload rich-text adapter follow soon after? Acceptable for launch on the assumption that all editorial work happens in `/admin`; revisit if anyone reaches for `/cms` to fix a body.
- Should `@payloadcms/richtext-lexical` stay installed once nothing uses it? It remains a transitive requirement of the Payload admin's default editor config, so it stays for now — but the `editor: lexicalEditor()` line in `payload.config.ts` becomes vestigial for `articles` and should be reviewed if other collections never gain rich-text fields.
