## ADDED Requirements

### Requirement: The admin renders a faithful article preview
`/admin/articles/[id]` SHALL render an article as the public portal renders it, so an editor can check appearance before publishing.

#### Scenario: Body renders with public portal typography
- **WHEN** an editor opens an article preview
- **THEN** the body SHALL be rendered through the same renderer and the same prose typography styles the public article page uses, so the preview is not an approximation

#### Scenario: Article metadata is displayed
- **WHEN** the preview renders
- **THEN** it SHALL display the cover image, title, category, author, and published date

#### Scenario: Unknown article id is not found
- **WHEN** an editor opens the preview route for an id that does not exist
- **THEN** a not-found response SHALL be returned

### Requirement: Drafts are previewable before publication
The preview SHALL work for unpublished articles, which is its primary purpose.

#### Scenario: Draft content is visible in the admin preview
- **WHEN** an editor opens the preview for an article with draft status
- **THEN** the draft content SHALL render in full

#### Scenario: Draft status is clearly marked
- **WHEN** the previewed article is a draft
- **THEN** a status indicator SHALL make clear that this content is not live on the public portal

### Requirement: The preview offers the next editorial actions
The preview SHALL be a working stop in the editorial flow, not a dead end.

#### Scenario: Edit and Delete are available
- **WHEN** the preview renders
- **THEN** an Edit action linking to `/admin/articles/[id]/edit` and a Delete action SHALL be available

#### Scenario: Delete requires confirmation
- **WHEN** an editor activates Delete from the preview
- **THEN** an in-app confirmation dialog SHALL appear, and on confirmation the article SHALL be deleted and the editor redirected to `/admin/articles`

#### Scenario: Published articles link to the live page
- **WHEN** the previewed article is published
- **THEN** a "View on site" link to `/article/[slug]` SHALL be available

#### Scenario: Live link is absent for drafts
- **WHEN** the previewed article is a draft
- **THEN** no "View on site" link SHALL be offered, since no public page exists for it

### Requirement: The preview is responsive
The preview SHALL be readable across viewport sizes.

#### Scenario: Preview reflows on narrow viewports
- **WHEN** the preview is viewed below 768px
- **THEN** the cover image, heading, metadata, and body SHALL reflow without horizontal overflow
