## ADDED Requirements

### Requirement: Payload's native admin is served at `/cms`
Payload's built-in admin UI SHALL be served at `/cms` instead of `/admin`, freeing `/admin` for the custom editorial admin. The Payload config's `routes.admin` value and the App Router directory under `src/app/(payload)/` SHALL name the same path.

#### Scenario: Payload admin loads at its new path
- **WHEN** an authenticated user navigates to `/cms`
- **THEN** Payload's native admin dashboard SHALL render with all five collections (users, media, categories, articles, comments) listed

#### Scenario: Payload's internal navigation stays within `/cms`
- **WHEN** a user navigates within Payload's admin — to a collection list, a document, or the account view
- **THEN** every generated URL SHALL be rooted at `/cms` and SHALL NOT link back to `/admin`

#### Scenario: The old Payload admin path no longer serves Payload
- **WHEN** a user navigates to `/admin`
- **THEN** the custom editorial admin SHALL be served, not Payload's native admin

### Requirement: Payload's REST and GraphQL endpoints are unaffected by the relocation
Moving the admin UI SHALL NOT change the API routes. `/api/*` and `/api/graphql` SHALL continue to behave exactly as before.

#### Scenario: REST endpoints keep working after relocation
- **WHEN** a request is made to `/api/articles` or `/api/graphql`
- **THEN** it SHALL be handled as it was prior to the relocation, with no change in path, authentication, or response shape

### Requirement: The import map resolves after relocation
The Payload import map SHALL be generated into, and imported from, a single location consistent with the relocated route, so custom admin components continue to resolve.

#### Scenario: Import map regenerates to the relocated directory
- **WHEN** `bun run generate:importmap` is run after the relocation
- **THEN** the emitted import map SHALL be the module that `src/app/(payload)/layout.tsx` and the `[[...segments]]` page import, and `/cms` SHALL render custom field components without a module resolution error

### Requirement: Payload's native admin remains the escape hatch for uncovered collections
The custom admin SHALL provide navigation into `/cms` for every collection it does not itself manage.

#### Scenario: Sidebar links to Payload for unmanaged collections
- **WHEN** an editor views the custom admin sidebar
- **THEN** links to `/cms` for Media, Users, Categories, and Comments SHALL be present and visually marked as leaving the custom admin

#### Scenario: Version history is reachable from the custom editor
- **WHEN** an editor is editing an existing article in the custom admin
- **THEN** a link to that same document at `/cms` SHALL be available for access to version history and drafts comparison

#### Scenario: The escape hatch does not extend to article bodies
- **WHEN** an editor opens an article at `/cms`
- **THEN** metadata and version history SHALL be available, but the body SHALL NOT be rich-text editable there — the custom admin is the only place article content is authored
