## ADDED Requirements

### Requirement: The article form covers all editorial fields
`/admin/articles/new` and `/admin/articles/[id]/edit` SHALL present a single form covering every field an editor needs to publish an article.

#### Scenario: Form exposes the full field set
- **WHEN** the article form renders
- **THEN** it SHALL provide inputs for Title, Slug, Excerpt, Cover Image, Category, Author, Published date, and the rich-text body

#### Scenario: Edit mode is populated from the stored article
- **WHEN** an editor opens `/admin/articles/[id]/edit` for an existing article
- **THEN** every field SHALL be pre-populated with that article's current values, including drafts, and the body editor SHALL load its existing content

#### Scenario: Unknown article id is not found
- **WHEN** an editor opens the edit route for an id that does not exist
- **THEN** a not-found response SHALL be returned rather than an empty or partially rendered form

### Requirement: The slug is derived from the title with manual override
Slug entry SHALL be automatic by default and overridable when an editor needs a specific value.

#### Scenario: Slug follows the title while locked
- **WHEN** an editor types a title and the slug field has not been manually overridden
- **THEN** the slug SHALL update to the URL-safe form of that title

#### Scenario: Manual override stops derivation
- **WHEN** an editor unlocks the slug field and edits it
- **THEN** the entered value SHALL be preserved and SHALL NOT be overwritten by subsequent title changes

#### Scenario: Duplicate slug is rejected with a usable message
- **WHEN** an editor submits a slug already used by another article
- **THEN** submission SHALL fail with an inline error on the slug field explaining the conflict, and no data SHALL be lost from the rest of the form

### Requirement: The body is edited as rich text in the format the collection stores
The body editor SHALL read and write the same document format the `articles` collection stores, with no conversion layer between the editor and storage.

#### Scenario: Formatting controls are available
- **WHEN** the body editor renders
- **THEN** it SHALL offer at least bold, italic, underline, strikethrough, inline code, heading levels, bullet and ordered lists, blockquote, link, and image insertion

#### Scenario: Toolbar reflects the current selection
- **WHEN** the caret is inside text carrying a given format or block type
- **THEN** the corresponding toolbar control SHALL render in an active state

#### Scenario: Saved content round-trips without alteration
- **WHEN** an article is opened in the editor and saved without edits
- **THEN** the stored body SHALL be unchanged, with no node dropped, reordered, or rewritten

#### Scenario: The editor follows the admin theme
- **WHEN** the admin is in light or dark mode
- **THEN** the body editor SHALL render in the matching scheme, and its styles SHALL NOT affect any part of the admin outside the editor

### Requirement: The editor and the public renderer agree on the document format
The set of supported content types SHALL be defined once and shared by the editor and the public article renderer, so an article renders as it was authored.

#### Scenario: Authored content renders identically on the public portal
- **WHEN** an article using any supported content type is published
- **THEN** the public article page SHALL render every element as the editor displayed it

#### Scenario: Support is not defined twice
- **WHEN** a content type is added to or removed from the editor's supported set
- **THEN** the public renderer SHALL reflect the same change without a separate edit, because both derive from one shared definition

### Requirement: Body images are stored as managed media
Images inserted into an article body SHALL become documents in the `media` collection rather than inline data or external references.

#### Scenario: Inserting an image uploads it to the media collection
- **WHEN** an editor inserts an image into the body
- **THEN** it SHALL be uploaded to the `media` collection and referenced by the body, and SHALL NOT be embedded as base64 data or linked to an external host

#### Scenario: A failed body image upload is reported
- **WHEN** a body image upload fails
- **THEN** an error SHALL be shown, no broken image reference SHALL be inserted, and the rest of the body SHALL be unaffected

### Requirement: Cover images are uploaded from the form
Editors SHALL be able to attach a cover image without leaving the form.

#### Scenario: Uploading attaches an image to the article
- **WHEN** an editor selects an image file for the cover image field
- **THEN** it SHALL be uploaded to the media collection and associated with the article, and a preview SHALL be shown

#### Scenario: Alt text is required
- **WHEN** an editor uploads a cover image
- **THEN** alt text SHALL be required before the upload is accepted, matching the media collection's requirement

#### Scenario: A cover image can be replaced or removed
- **WHEN** an article already has a cover image
- **THEN** the form SHALL offer controls to replace it or remove it, and removal SHALL leave the article with no cover image

#### Scenario: A failed upload is reported
- **WHEN** an upload fails
- **THEN** an error SHALL be shown, the previous cover image selection SHALL be retained, and the rest of the form SHALL remain intact

### Requirement: Editors control publication state from the form
The form SHALL allow saving without publishing, publishing, and unpublishing.

#### Scenario: Save Draft keeps the article unpublished
- **WHEN** an editor saves a new article as a draft
- **THEN** the article SHALL be stored with draft status and SHALL NOT appear on the public portal

#### Scenario: Publish makes the article live
- **WHEN** an editor publishes an article
- **THEN** its status SHALL become published and it SHALL be available on the public portal

#### Scenario: Unpublish is available when editing a published article
- **WHEN** an editor is editing a published article
- **THEN** an Unpublish action SHALL be available, returning the article to draft status

#### Scenario: Published date is set on first publish
- **WHEN** an article is published for the first time without an explicit published date
- **THEN** the published date SHALL be set automatically to the time of publication

### Requirement: Submission outcomes are reported without browser dialogs
The form SHALL report success and failure in-app.

#### Scenario: Successful creation redirects with confirmation
- **WHEN** an article is created successfully
- **THEN** a success notification SHALL be shown and the editor SHALL be redirected to `/admin/articles`

#### Scenario: Validation errors appear beside the offending fields
- **WHEN** submission fails validation
- **THEN** each error SHALL be shown inline next to its field, a summary notification SHALL be shown, the editor SHALL remain on the form, and all entered values SHALL be preserved

#### Scenario: No browser dialogs are used
- **WHEN** any success, error, or confirmation is communicated by the editor
- **THEN** it SHALL use in-app notification or dialog components, never `alert()`, `confirm()`, or `prompt()`

### Requirement: Editors are warned about unsaved changes
The form SHALL protect against accidental loss of work.

#### Scenario: Navigating away with unsaved edits prompts
- **WHEN** an editor has unsaved changes and attempts to navigate away
- **THEN** they SHALL be warned and given the opportunity to stay on the form

### Requirement: Version history is reachable from the editor
Because the custom editor does not implement version comparison, it SHALL link to the surface that does.

#### Scenario: Editor links to the document in Payload's admin
- **WHEN** an editor is editing an existing article
- **THEN** a link to the same document at `/cms` SHALL be available for version history

#### Scenario: The link sets expectations about what is editable there
- **WHEN** that link is presented
- **THEN** it SHALL indicate that the article body is not editable at `/cms`, so an editor does not go there expecting to fix content
