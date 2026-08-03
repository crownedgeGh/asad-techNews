## ADDED Requirements

### Requirement: Articles list shows paginated tabular data
The articles list page (`/admin/articles`) SHALL display articles in a paginated table with 15 rows per page and page navigation controls.

#### Scenario: Table displays article columns
- **WHEN** an admin visits `/admin/articles`
- **THEN** the table SHALL show columns: Title, Category, Views, Likes, Comments, Published (boolean badge), and Actions (View, Edit, Delete, Move Up, Move Down)

#### Scenario: Pagination shows 15 articles per page
- **WHEN** there are more than 15 articles
- **THEN** only 15 SHALL be visible at once and numbered page navigation buttons SHALL appear below the table

#### Scenario: Post Article button is visible
- **WHEN** the articles list page is rendered
- **THEN** a "Post Article" button SHALL be visible in the top-right area of the page and SHALL navigate to `/admin/articles/new` when clicked

### Requirement: Articles list supports CRUD actions without page refresh
All article mutations (delete, reorder) triggered from the list table SHALL update the UI immediately without a full page reload.

#### Scenario: Delete article from list
- **WHEN** an admin clicks the Delete button on a row
- **THEN** a confirmation modal (NOT a browser alert) SHALL appear; upon confirmation the article SHALL be deleted via API and the row SHALL be removed from the table immediately

#### Scenario: Reorder article up or down
- **WHEN** an admin clicks the Move Up or Move Down button on a row
- **THEN** the article SHALL be reordered via API and the table row order SHALL update immediately to reflect the new position

#### Scenario: Actions navigate to correct pages
- **WHEN** an admin clicks Edit on a row
- **THEN** they SHALL be navigated to `/admin/articles/[id]/edit`
- **WHEN** an admin clicks View on a row
- **THEN** they SHALL be navigated to `/admin/articles/[id]`

### Requirement: Articles table shows engagement metrics per article
Each article row in the list table SHALL display that article's current views, likes, and comments count.

#### Scenario: Metrics are visible in table row
- **WHEN** the articles list renders
- **THEN** each row SHALL show numeric values for Views, Likes, and Comments for that specific article
