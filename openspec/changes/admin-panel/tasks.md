## 1. Relocate Payload's native admin to `/cms`

- [x] 1.1 Add `routes: { admin: '/cms' }` to `buildConfig` in `src/payload.config.ts`
- [x] 1.2 Move `src/app/(payload)/admin/` to `src/app/(payload)/cms/` (both `[[...segments]]/` and `importMap.js`) using `git mv` so history is preserved
- [x] 1.3 Update the import map path in `src/app/(payload)/layout.tsx` (`./admin/importMap` → `./cms/importMap`)
- [x] 1.4 Run `bun run generate:importmap` and verify which path it writes to — reconcile the import in `layout.tsx` with the actual emitted location rather than assuming
      - Verified: import map resolves to `src/app/(payload)/cms/importMap.js`, matching the `layout.tsx` import. No reconciliation needed.
- [x] 1.5 Start `bun run dev` and confirm `/cms` loads Payload's admin, login works, and `/admin` now 404s (it is claimed in section 4)
      - Verified: `/cms` → 200, `/admin` → 404, `/article/[slug]` → 200.
      - **Pre-existing bug found (not caused by this change):** on a cold `.next`, compiling the Payload admin route before the frontend poisons the shared `vendor-chunks/@payloadcms.js`, and `/` then 500s with `__webpack_modules__[moduleId] is not a function`. Reproduces identically at `HEAD` with `/admin`. Workaround: visit `/` first or touch a frontend file. Confirm against `bun run build` in task 12.1 — if production is affected it is a launch blocker and needs its own change.

## 2. Dependencies

- [x] 2.1 Add `@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`, and `@tiptap/html` with `bun add`
      - Installed at 3.29.2.
- [x] 2.2 ~~Scaffold TipTap's Simple Editor template using the Tiptap CLI~~ — **abandoned; see design decision 3.** The CLI is interactive-only (force-closes without a TTY, hangs with a pseudo-TTY); the template's closure is 93 registry entries / 115 files pulling in `@radix-ui/*`, `class-variance-authority`, `@base-ui/react`, and `sass`; and 13 of those files do not exist in the public upstream repo. Superseded by 2.2a.
- [x] 2.2a Add the extension packages the hand-built editor needs: `@tiptap/extension-link`, `@tiptap/extension-image`, `@tiptap/extension-highlight`, `@tiptap/extension-text-align`
      - Installed at 3.29.2.
- [x] 2.3 ~~Determine whether the scaffolded template ships SCSS~~ — moot. It does (`sass`, `sass-embedded`), which was one reason for abandoning it. No SCSS pipeline is added.
- [x] 2.4 ~~Commit the scaffolded template as project source~~ — moot; no template is vendored.
- [x] 2.5 Confirm no DaisyUI, Origin UI, shadcn, or Radix package is introduced at any point in this change
      - Verified against `package.json`: no `daisyui`, `@radix-ui/*`, `shadcn`, `origin`, `@base-ui/react`, or `class-variance-authority`. Re-check at task 12.1.

## 3. Harden the `Articles` collection

- [x] 3.1 Add `access` to `src/collections/Articles.ts`: `read` allows published documents for anyone and all documents for an authenticated `admin`/`editor`; `create` and `update` require `admin`/`editor`; `delete` requires `admin`
- [x] 3.2 Audit every Payload query in `src/app/(frontend)/` against the new `read` rule and fix any that relied on unauthenticated access to drafts
      - Two queries. `page.tsx` already filtered `_status: published`. **`article/[slug]/page.tsx` did not** — and because the Local API defaults to `overrideAccess: true`, the collection read rule does not constrain it, so an unpublished draft would have rendered publicly. Added an explicit `_status: { equals: 'published' }` filter.
- [x] 3.3 Add a `beforeValidate` hook deriving `slug` from `title` via `formatSlug()` from `src/fields/slug/formatSlug.ts` when `slug` is empty
- [x] 3.4 Add a `beforeChange` hook setting `publishedAt` to the current time when `_status` transitions to `published` and `publishedAt` is unset
- [x] 3.5 Add `index: true` to `sortOrder`
- [x] 3.6 Mark `views`, `likes`, and `commentsCount` as `admin.readOnly: true`
- [x] 3.7 Wire `SlugComponent` from `src/fields/slug/` as the `slug` field's admin component so `/cms` keeps auto-slug parity, then run `bun run generate:importmap`
- [x] 3.8 Change the `content` field from `richText` to `json` so it stores ProseMirror JSON
- [x] 3.9 Create `src/lib/tiptap-extensions.ts` exporting the single extension list, and import it from both the editor and the frontend renderer — never duplicate the list
      - Pure document helpers split into `src/lib/prosemirror-doc.ts` so `payload.config.ts` can build documents without pulling the editor's React extensions into the server bundle.
- [x] 3.10 Rewrite the `onInit` seeder in `src/payload.config.ts` to emit ProseMirror JSON for the three sample articles
- [x] 3.11 Swap the public article page body renderer from `<RichText>` to `generateHTML()` from `@tiptap/html` using the shared extension list, keeping the existing `prose` typography
      - Extracted into a shared `src/components/ArticleBody.tsx` so the admin preview (task 11.2) renders through the identical path.
- [ ] 3.12 Reset the dev database and reseed; confirm the seeded articles render correctly on the public portal
      - **BLOCKED — needs your approval.** The 3 seeded articles hold Lexical JSON (`{"root": …}`) in `articles` and `_articles_v`; they must be deleted so `onInit` reseeds them in ProseMirror format. The `DELETE` was refused by the permission classifier as a destructive database operation. Nothing else is in those tables — categories, users, media, and comments are untouched by the operation. Until this runs, the 3 sample articles render an empty body (`ArticleBody` returns `null` for a non-ProseMirror document rather than crashing).
- [x] 3.13 Run `bun run generate:types` and confirm `src/payload-types.ts` is current
      - `content` regenerated as the JSON field type.
- [ ] 3.14 Commit `src/fields/` — it is currently untracked

## 4. Admin route group and shell

- [x] 4.1 Create `src/app/(admin)/styles.css` importing Tailwind v4 and declaring the admin's `@theme` tokens and the `dark` custom variant, matching the `.dark` class convention used by `(frontend)/styles.css`
- [x] 4.2 Create `src/app/(admin)/layout.tsx` as a root layout (`<html>`/`<body>`, Inter via `next/font`) with the same `theme` localStorage init script the public portal uses, so dark mode carries across surfaces
- [x] 4.3 Create `src/components/admin/AdminShell.tsx` — sidebar + top bar + content region, with the sidebar collapsing to an off-canvas drawer below `768px`
- [x] 4.4 Create `src/components/admin/Sidebar.tsx` with `lucide-react` icons: Dashboard (`/admin`), Articles (`/admin/articles`), and an external-marked link to `/cms` for Media, Users, Categories, and Comments
- [x] 4.5 Highlight the active nav item from the current pathname
- [x] 4.6 Create `src/components/admin/TopBar.tsx` with the mobile drawer toggle, a light/dark theme toggle, the signed-in user's name/email, and a sign-out control
      - Deviation: the top bar lives inside `AdminShell.tsx` rather than a separate `TopBar.tsx`, because the drawer toggle and the drawer share one piece of state and splitting them would mean lifting it only to pass it straight back down. The theme toggle is its own component (`ThemeToggle.tsx`) since it is self-contained.
- [x] 4.7 Verify no `(frontend)` component (`Navbar`, `Footer`) is imported anywhere under `(admin)`, and no admin component is imported by `(frontend)`

## 5. Authentication and route guarding

- [x] 5.1 Create `src/lib/admin/auth.ts` with `getAdminUser()` (resolves the current user via `payload.auth({ headers })`, returns `null` when absent) and `requireAdminUser()` (redirects to `/admin/login` unless the user's role is `admin` or `editor`)
      - **Design decision 6 was wrong and has been corrected in code.** It claimed Payload's dev `autoLogin` "will not log a user into the custom admin". It does: `payload.auth()` returns the auto-login user with no cookie present, so with an empty cookie jar `/admin/login` redirected to `/admin` — the sign-in requirement was silently bypassed in development, contradicting the `admin-auth` spec ("dev credentials are offered, not applied"). Fixed by requiring a real session token cookie before accepting `payload.auth()`'s result. This narrows only — Payload still validates the token, and cookie presence alone is never treated as authentication. `/cms` keeps its autoLogin convenience. **design.md decision 6 still needs updating to match.**
- [x] 5.2 Call `requireAdminUser()` in the `(admin)` layout so every admin route is gated server-side
- [x] 5.3 Create `src/app/(admin)/login/page.tsx` — email/password form, rendered outside `AdminShell`
      - Placed at `src/app/(admin)/admin/login/page.tsx` so the URL is `/admin/login` as the spec requires. The guard lives in a nested `(protected)` group, so the login route sits outside it and cannot redirect-loop.
- [x] 5.4 Add a `login` Server Action calling `payload.login({ collection: 'users' })`, setting the returned token as the `payload-token` cookie with `httpOnly`, `sameSite: 'lax'`, and `secure` in production
- [x] 5.5 Render an inline error on invalid credentials without leaking whether the email exists
- [x] 5.6 Reject users whose role is neither `admin` nor `editor` at login with the same generic error
- [x] 5.7 Add a `logout` Server Action clearing the cookie and redirecting to `/admin/login`
- [x] 5.8 In development only, prefill the login form with the seeded `dev@lumen.tech` credentials and label it as a dev affordance
- [x] 5.9 Confirm a logged-in `/admin` session is also authenticated at `/cms`, and vice versa

## 6. Shared admin components

- [x] 6.1 Create `src/components/admin/DataTable.tsx` — generic typed component over `columns` (`key`, `header`, `align?`, `width?`, `render?`) and `rows`, with an `empty` state, an optional `loading` skeleton, and a horizontally scrollable wrapper
- [x] 6.2 Give `DataTable` sticky headers and per-column alignment; keep the component free of any article-specific logic
- [x] 6.3 Create `src/components/admin/Toast.tsx` — provider plus `useToast()` hook, success/error variants, auto-dismiss with a manual dismiss control, and `role="status"` / `aria-live="polite"`
- [x] 6.4 Create `src/components/admin/ConfirmDialog.tsx` on the native `<dialog>` element (`showModal()`), with `title`, `description`, `confirmLabel`, `destructive`, `onConfirm`, `onCancel`; verify Escape closes it, focus is trapped, and focus returns to the trigger on close
- [x] 6.5 Create `src/components/admin/StatCard.tsx` — label, value, optional icon and sub-label
- [x] 6.6 Grep the finished admin for `alert(`, `confirm(`, and `prompt(` and confirm there are no hits

## 7. Server Action mutation layer

- [x] 7.1 Create `src/lib/admin/actions.ts` with `'use server'`; every action starts by calling `requireAdminUser()` and passes `{ user, overrideAccess: false }` to the Local API
- [x] 7.2 Implement `createArticle(input)` — returns the new document's id, or field-level validation errors
- [x] 7.3 Implement `updateArticle(id, input)`
- [x] 7.4 Implement `deleteArticle(id)`
- [x] 7.5 Implement `setArticleStatus(id, status)` for publish/unpublish from the list
- [x] 7.6 Implement `reorderArticle(id, direction)` — find the adjacent article by `sortOrder`, swap the two values inside a single `payload.db` transaction, and return success as a no-op at the first/last boundary
- [x] 7.7 Have every mutating action call `revalidatePath` for the affected admin routes
- [x] 7.8 Return a discriminated `{ ok: true, data }` / `{ ok: false, error }` result rather than throwing, so the UI can render a toast
- [ ] 7.9 Verify an action invoked while signed out is rejected, not just redirected — the layout guard does not cover direct Server Action invocation

## 8. Dashboard

- [x] 8.1 Create `src/app/(admin)/admin/page.tsx` as a server component
- [x] 8.2 Compute totals: article count, and sums of `views`, `likes`, and `commentsCount`
- [x] 8.3 Compute the published vs draft split from `_status`
- [x] 8.4 Render five `StatCard`s: Articles, Views, Likes, Comments, and Drafts
- [x] 8.5 Render a recent-activity list of the 5 most recently updated articles — title, category, status badge, relative updated time — each linking to its edit page
- [x] 8.6 Render a zero state when no articles exist, linking to `/admin/articles/new`
- [x] 8.7 Format large numbers with thousands separators

## 9. Articles list

- [ ] 9.1 Create `src/app/(admin)/admin/articles/page.tsx` — server component reading `page`, `q`, `category`, and `status` from `searchParams` and fetching via the Local API with `limit: 15`
- [ ] 9.2 Render `src/components/admin/ArticlesTable.tsx` on `DataTable` with columns: Title, Category, Status, Views, Likes, Comments, Updated, Actions
- [ ] 9.3 Add pagination controls reflecting Payload's `totalPages` / `hasNextPage` / `hasPrevPage`, driven by the `page` search param so pages are linkable and back/forward works
- [ ] 9.4 Add a search input filtering on title, a category select, and a status select — each writing to a search param
- [ ] 9.5 Order rows by `sortOrder` ascending
- [ ] 9.6 Add a "New Article" button in the page header linking to `/admin/articles/new`
- [ ] 9.7 Wire the Delete action to `ConfirmDialog` → `deleteArticle` → toast, naming the article in the confirmation copy
- [ ] 9.8 Wire Move Up / Move Down to `reorderArticle`, disabling each at the first/last row of the full result set — not merely the current page
- [ ] 9.9 Wire a publish/unpublish toggle to `setArticleStatus` with a toast
- [ ] 9.10 Apply mutation results optimistically and roll back with an error toast on failure
- [ ] 9.11 Render a zero state for both "no articles yet" and "no results for these filters", with a clear-filters control for the latter

## 10. Article editor

- [ ] 10.1 Create `src/components/admin/TiptapEditor.tsx` — a controlled editor over ProseMirror JSON (`value`, `onChange`), configured from `src/lib/tiptap-extensions.ts`, styled with the admin's Tailwind utilities
- [ ] 10.2 Create `src/components/admin/EditorToolbar.tsx` with `lucide-react` icons, styled to match the rest of the admin — no separate stylesheet, no CSS-variable theming layer
- [ ] 10.3 Verify the editor in both light and dark mode using the admin's existing theme tokens
- [ ] 10.4 Keep the toolbar and the shared extension list in agreement — any extension removed from one is removed from the other, so editor and renderer stay identical
- [ ] 10.5 Implement body image insertion posting to Payload's `media` endpoint so body images become `media` documents in R2 with alt text — not base64 or external URLs
- [ ] 10.6 **Gate**: author an article using every supported node type, save it, and confirm the public page rendered by `generateHTML()` matches what the editor displayed. Any divergence means the extension lists have drifted
- [ ] 10.7 Create `src/components/admin/ArticleForm.tsx` with fields: Title, Slug (auto-derived from Title with a manual-override toggle), Excerpt, Cover Image, Category, Author, Published date, and the TipTap body
- [ ] 10.8 Implement cover image upload against Payload's `media` REST endpoint, requiring `alt` text (the collection requires it), and show a thumbnail preview with a remove control
- [ ] 10.9 Add Save Draft and Publish actions mapping to `_status`, plus Unpublish when editing a published article
- [ ] 10.10 Surface field-level validation errors inline next to the offending field, and a summary toast on failure
- [ ] 10.11 Warn on navigating away with unsaved changes
- [ ] 10.12 Create `src/app/(admin)/admin/articles/new/page.tsx` mounting the form empty; on success, toast and redirect to `/admin/articles`
- [ ] 10.13 Create `src/app/(admin)/admin/articles/[id]/edit/page.tsx` fetching the document server-side (including drafts) and mounting the form populated; return `notFound()` for an unknown id
- [ ] 10.14 Add a link from the edit page to the same document at `/cms` for version history, noting in the UI that the body is not editable there

## 11. Article viewer

- [ ] 11.1 Create `src/app/(admin)/admin/articles/[id]/page.tsx` fetching the document server-side, drafts included
- [ ] 11.2 Render the body with `generateHTML()` and the shared extension list, under the same `prose` classes the public article page uses, so the preview matches the portal exactly
- [ ] 11.3 Render the header: cover image, title, category badge, author, published date, and status badge
- [ ] 11.4 Add Edit, Delete, and "View on site" (to `/article/[slug]`, for published articles) actions
- [ ] 11.5 Return `notFound()` for an unknown id

## 12. Verification

- [ ] 12.1 Run `bun run lint` and `bun run build` clean
- [ ] 12.2 Walk the full lifecycle: create draft → appears in list → edit → publish → reorder → preview → view on site → delete
- [ ] 12.3 Confirm every `/admin/*` route redirects to `/admin/login` when signed out, including deep links
- [ ] 12.4 Confirm an `editor`-role user can create and update but not delete, and that the UI reflects this rather than failing at the server
- [ ] 12.5 Test every screen at 375px, 768px, and 1440px — drawer, table scroll, form layout, dialog
- [ ] 12.6 Test light and dark mode on every screen, and confirm the theme choice carries between `/admin` and the public portal
- [ ] 12.7 Keyboard pass: tab order, focus-visible rings, dialog focus trap and restoration, Escape to close, and toast announcements
- [ ] 12.8 Confirm no admin styles leak into the public portal, no Payload SCSS leaks into `/admin`, and the TipTap template's stylesheet stays scoped to the editor
- [ ] 12.9 Re-run the editor/renderer parity check from 10.6 after the editor is feature-complete
- [ ] 12.10 Confirm body images inserted in the editor exist as `media` documents in R2 and render on the public page
- [ ] 12.11 Confirm the public portal renders correctly under the tightened `Articles.read` access rule
- [ ] 12.12 Update `CLAUDE.md`: document the `/admin` (custom) vs `/cms` (Payload) split, supersede the "do not hand-build admin CRUD UI" guidance so it applies only to `/cms`, and correct the rich-text note — article bodies are ProseMirror JSON rendered with `generateHTML()`, not Lexical rendered with `<RichText>`
