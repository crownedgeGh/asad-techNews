## ADDED Requirements

### Requirement: Admin mutations go through a server-side action layer
All admin write operations SHALL be implemented as server-side actions that run in the application's Node process, rather than as a bespoke admin REST API or as client-side writes.

#### Scenario: The mutation surface covers the article lifecycle
- **WHEN** the admin needs to change article data
- **THEN** actions SHALL exist for creating an article, updating an article, deleting an article, changing publication status, and reordering an article

#### Scenario: No bespoke admin REST surface is introduced
- **WHEN** the admin performs any read or write
- **THEN** it SHALL use the server-side action layer or the CMS's own API, and SHALL NOT introduce a parallel `/api/admin/*` REST surface

### Requirement: Mutations enforce access control rather than bypassing it
Every action SHALL execute against the CMS with the calling user's identity and with access control enforced, so authorization is decided by the collection's rules rather than by what the UI chooses to render.

#### Scenario: Actions run as the calling user with access checks enabled
- **WHEN** any admin action performs a write
- **THEN** it SHALL pass the authenticated user to the CMS and SHALL NOT disable access-control evaluation

#### Scenario: An action a user is not permitted to perform is refused
- **WHEN** a user whose role does not permit an operation invokes the corresponding action
- **THEN** the write SHALL be refused by the CMS's access control, independently of whether the UI exposed the control

#### Scenario: An unauthenticated caller is rejected
- **WHEN** an admin action is invoked without a valid session
- **THEN** it SHALL be rejected before performing any read or write

### Requirement: Reordering swaps adjacent positions atomically
The reorder action SHALL move an article one position at a time by exchanging trend positions with its neighbour, and SHALL leave ordering consistent even if the operation fails partway.

#### Scenario: Adjacent articles exchange positions
- **WHEN** the reorder action is invoked for an article with a direction
- **THEN** that article and its adjacent neighbour in that direction SHALL exchange trend positions, and no other article's position SHALL change

#### Scenario: The swap is all-or-nothing
- **WHEN** a failure occurs after the first of the two position updates
- **THEN** neither update SHALL persist, so no two articles are left sharing the same trend position

#### Scenario: Boundaries succeed as a no-op
- **WHEN** the reorder action is invoked to move the first article up or the last article down
- **THEN** it SHALL return success without modifying any article, rather than returning an error

### Requirement: Actions return structured results instead of throwing
Actions SHALL report outcomes in a form the UI can render directly.

#### Scenario: Success returns the resulting data
- **WHEN** an action succeeds
- **THEN** it SHALL return a success result carrying whatever data the caller needs, such as the created article's identifier

#### Scenario: Failure returns an error the UI can display
- **WHEN** an action fails validation or is refused
- **THEN** it SHALL return a failure result with a message suitable for display and, where applicable, field-level errors — rather than propagating an unhandled exception

#### Scenario: Internal details are not leaked
- **WHEN** an action fails due to an internal error
- **THEN** the returned message SHALL NOT expose database internals, stack traces, or connection details

### Requirement: Mutations invalidate affected cached views
After a successful write, the action SHALL invalidate the cached server-rendered views affected by it.

#### Scenario: Article changes refresh the list and dashboard
- **WHEN** an article is created, updated, deleted, reordered, or has its status changed
- **THEN** the articles list and dashboard SHALL reflect the change on next render without requiring a manual refresh or a full application restart

### Requirement: Admin reads use the CMS's in-process API
Admin pages SHALL read data in-process rather than issuing HTTP requests to the application's own API.

#### Scenario: Server components read directly
- **WHEN** an admin page renders on the server
- **THEN** it SHALL obtain its data through the CMS's local in-process API rather than a network round-trip to its own REST endpoints
