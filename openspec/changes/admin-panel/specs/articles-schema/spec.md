## MODIFIED Requirements

### Requirement: Articles table schema includes engagement metrics and sort order
The `articles` database table SHALL include four new integer columns: `views` (default 0), `likes` (default 0), `comments_count` (default 0), and `sort_order` (default to article id on migration).

#### Scenario: New article has default metric values
- **WHEN** a new article is inserted without specifying views, likes, comments_count, or sort_order
- **THEN** those columns SHALL default to 0 for metrics and the next available sort_order value for ordering

#### Scenario: Existing articles preserve their content after migration
- **WHEN** the migration adding the new columns is applied to an existing database
- **THEN** all existing articles SHALL retain their title, slug, content, coverImage, authorId, category, published, createdAt, and updatedAt values unchanged; new columns SHALL be populated with their defaults
