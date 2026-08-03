## ADDED Requirements

### Requirement: Post Article page provides TipTap rich-text editor
The post article page (`/admin/articles/new`) SHALL provide a TipTap Simple Editor for writing article body content.

#### Scenario: TipTap editor renders on post article page
- **WHEN** an admin visits `/admin/articles/new`
- **THEN** a TipTap editor SHALL be rendered with a toolbar supporting: Bold, Italic, Underline, Heading levels (H1–H3), Bullet list, Ordered list, Blockquote, Link, and Image insertion

#### Scenario: Article form includes metadata fields
- **WHEN** an admin visits `/admin/articles/new`
- **THEN** the form SHALL include fields for: Title, Slug (auto-generated from title, editable), Category (select/dropdown), Cover Image (file upload using existing `/api/upload`), and Published (toggle: Draft / Published)

#### Scenario: Slug auto-generates from title
- **WHEN** an admin types into the Title field
- **THEN** the Slug field SHALL automatically update to a kebab-case version of the title in real-time

#### Scenario: Successful article submission
- **WHEN** an admin fills in all required fields and clicks "Publish" or "Save Draft"
- **THEN** the article SHALL be submitted via `POST /api/admin/articles`, a success toast SHALL appear, and the admin SHALL be redirected to `/admin/articles`

#### Scenario: Failed submission shows error toast
- **WHEN** a submission fails (validation error or API error)
- **THEN** an error toast notification SHALL appear with the error message — no browser `alert()` SHALL be used

### Requirement: Edit Article page pre-populates TipTap editor with existing data
The edit article page (`/admin/articles/[id]/edit`) SHALL render a TipTap editor pre-filled with the article's existing content and metadata.

#### Scenario: Edit page pre-fills all form fields
- **WHEN** an admin visits `/admin/articles/[id]/edit`
- **THEN** all form fields (title, slug, category, published toggle) and the TipTap editor SHALL be pre-populated with the article's current data

#### Scenario: Successful edit submission
- **WHEN** an admin edits fields and clicks "Update"
- **THEN** the article SHALL be updated via `PUT /api/admin/articles/[id]`, a success toast SHALL appear, and the admin SHALL be redirected to `/admin/articles`
