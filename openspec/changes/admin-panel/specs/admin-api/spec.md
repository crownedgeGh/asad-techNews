## ADDED Requirements

### Requirement: Admin API supports full article CRUD
The admin API SHALL expose RESTful endpoints for creating, reading, updating, and deleting articles.

#### Scenario: List articles
- **WHEN** a `GET` request is made to `/api/admin/articles` with optional `?page=N` query param
- **THEN** the API SHALL return a JSON response with `{ articles: Article[], total: number, page: number, pageSize: 15 }` ordered by `sort_order` ascending

#### Scenario: Create article
- **WHEN** a `POST` request is made to `/api/admin/articles` with a valid article body (title, slug, content, category, coverImage?, published)
- **THEN** the API SHALL insert the article into the database, assign `sort_order` to the next available value, and return `{ success: true, article: Article }` with HTTP 201

#### Scenario: Get single article
- **WHEN** a `GET` request is made to `/api/admin/articles/[id]`
- **THEN** the API SHALL return the article's full data as JSON or HTTP 404 if not found

#### Scenario: Update article
- **WHEN** a `PUT` request is made to `/api/admin/articles/[id]` with updated fields
- **THEN** the API SHALL update the article in the database and return `{ success: true, article: Article }`

#### Scenario: Delete article
- **WHEN** a `DELETE` request is made to `/api/admin/articles/[id]`
- **THEN** the API SHALL delete the article from the database and return `{ success: true }` or HTTP 404 if not found

### Requirement: Admin API supports article reordering
The admin API SHALL expose an endpoint to move an article up or down in sort order.

#### Scenario: Reorder article up
- **WHEN** a `POST` request is made to `/api/admin/articles/[id]/reorder` with body `{ direction: "up" }`
- **THEN** the API SHALL swap the `sort_order` of the target article with the article immediately above it and return `{ success: true }`

#### Scenario: Reorder article down
- **WHEN** a `POST` request is made to `/api/admin/articles/[id]/reorder` with body `{ direction: "down" }`
- **THEN** the API SHALL swap the `sort_order` of the target article with the article immediately below it and return `{ success: true }`

#### Scenario: Reorder at boundary has no effect
- **WHEN** a reorder "up" is requested on the first article or "down" on the last
- **THEN** the API SHALL return `{ success: true, message: "Already at boundary" }` without changing any sort orders
