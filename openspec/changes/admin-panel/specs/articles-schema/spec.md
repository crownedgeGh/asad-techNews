## MODIFIED Requirements

### Requirement: The articles collection enforces role-based access control
The `articles` collection SHALL define explicit access rules for read, create, update, and delete, rather than relying on defaults. These rules SHALL be the single authorization source for the custom admin, the CMS's native admin, and the public API alike.

#### Scenario: Public reads are limited to published articles
- **WHEN** an unauthenticated caller reads articles through any interface
- **THEN** only articles with published status SHALL be returned, and drafts SHALL NOT be exposed

#### Scenario: Editorial roles can read drafts
- **WHEN** an authenticated user with role `admin` or `editor` reads articles
- **THEN** both drafts and published articles SHALL be returned

#### Scenario: Only editorial roles may create and update
- **WHEN** a caller who is not an authenticated `admin` or `editor` attempts to create or update an article
- **THEN** the operation SHALL be refused

#### Scenario: Only administrators may delete
- **WHEN** a user with role `editor` attempts to delete an article
- **THEN** the operation SHALL be refused
- **WHEN** a user with role `admin` attempts to delete an article
- **THEN** the operation SHALL be permitted

#### Scenario: The public portal continues to function under the tightened rules
- **WHEN** the public portal renders its listing and article pages
- **THEN** all published content SHALL render exactly as before the access rules were tightened

### Requirement: Article bodies are stored in the editor's native document format
`content` SHALL store the document format the custom admin's editor produces natively, so no conversion happens on read or write. This replaces the previous Payload rich-text (Lexical) storage.

#### Scenario: Content is stored without conversion
- **WHEN** an article body is saved from the custom admin
- **THEN** the stored value SHALL be the editor's own document representation, with no translation between document models at any point

#### Scenario: Seeded sample content uses the new format
- **WHEN** the development seeder creates its sample articles
- **THEN** their bodies SHALL be written in the new format and SHALL render correctly on the public portal

#### Scenario: Body editing is not offered in the CMS admin
- **WHEN** an article is opened in Payload's native admin at `/cms`
- **THEN** the body SHALL be displayed as raw structured data and SHALL NOT present a rich-text editing experience — article bodies are edited only in the custom admin

### Requirement: Article slugs are derived from the title on the server
Slug derivation SHALL be enforced server-side so it holds regardless of which admin interface performs the write.

#### Scenario: A missing slug is generated from the title
- **WHEN** an article is created or updated with no slug value
- **THEN** a URL-safe slug SHALL be derived from the title and stored

#### Scenario: An explicit slug is preserved
- **WHEN** an article is saved with an explicitly provided slug
- **THEN** that value SHALL be stored unchanged

#### Scenario: Slug uniqueness is enforced
- **WHEN** an article is saved with a slug already used by another article
- **THEN** the write SHALL be rejected with a validation error identifying the slug field

### Requirement: The published date is set automatically on first publication
Articles SHALL record when they went live without requiring the editor to enter it.

#### Scenario: Publishing sets the date
- **WHEN** an article transitions to published status and has no published date
- **THEN** the published date SHALL be set to the time of that transition

#### Scenario: An existing published date is preserved
- **WHEN** an article that already has a published date is republished or updated
- **THEN** its existing published date SHALL NOT be overwritten

#### Scenario: An explicit date wins
- **WHEN** an editor sets a published date explicitly
- **THEN** that value SHALL be stored rather than being replaced by the automatic value

### Requirement: Engagement counters are read-only in admin interfaces
`views`, `likes`, and `commentsCount` SHALL be presented as read-only in admin interfaces, since they are maintained by system activity rather than edited by hand.

#### Scenario: Counters are displayed but not editable
- **WHEN** an editor opens an article in either admin interface
- **THEN** the three engagement counters SHALL be visible and SHALL NOT be editable through the form

#### Scenario: Counters default to zero
- **WHEN** a new article is created
- **THEN** `views`, `likes`, and `commentsCount` SHALL each default to `0`

### Requirement: Trend ordering is efficiently queryable
`sortOrder` SHALL be indexed, because it is the default ordering for the admin article list and the basis for every reorder lookup.

#### Scenario: Sort order is indexed
- **WHEN** the collection schema is applied to the database
- **THEN** `sortOrder` SHALL carry a database index

#### Scenario: Sort order defaults for new articles
- **WHEN** a new article is created without an explicit sort order
- **THEN** `sortOrder` SHALL receive its default value and the article SHALL appear in the admin list without error

### Requirement: Generated types stay in sync with the collection
The generated Payload types SHALL reflect the collection configuration, so application code imports types rather than hand-rolling interfaces.

#### Scenario: Types are regenerated after schema changes
- **WHEN** the `articles` collection configuration changes
- **THEN** `src/payload-types.ts` SHALL be regenerated, and the build SHALL typecheck against it with no hand-written article interfaces anywhere in the codebase
