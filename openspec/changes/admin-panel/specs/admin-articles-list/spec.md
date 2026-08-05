## ADDED Requirements

### Requirement: The articles list shows paginated tabular data
`/admin/articles` SHALL display articles in a table of 15 rows per page with navigation between pages.

#### Scenario: Table displays the article columns
- **WHEN** an editor visits `/admin/articles`
- **THEN** the table SHALL show columns for Title, Category, Status, Views, Likes, Comments, Updated, and Actions

#### Scenario: Pagination limits each page to 15 rows
- **WHEN** more than 15 articles match the current filters
- **THEN** at most 15 SHALL be shown at once, and pagination controls SHALL reflect the total number of matching articles and pages

#### Scenario: Pagination state is addressable
- **WHEN** an editor navigates to page 3 and copies the URL, or uses the browser back button
- **THEN** the page number SHALL be carried in the URL so the link reopens page 3 and back/forward navigation moves between pages

#### Scenario: Rows are ordered by manual trend rank
- **WHEN** the list renders without an explicit sort selection
- **THEN** rows SHALL be ordered by `sortOrder` ascending, so the list matches the manual trend ranking

### Requirement: The articles list supports search and filtering
Editors SHALL be able to narrow the list by title text, category, and publication status.

#### Scenario: Search narrows by title
- **WHEN** an editor enters text in the search input
- **THEN** the list SHALL show only articles whose title matches, and pagination SHALL recompute against the filtered result set

#### Scenario: Category and status filters narrow the list
- **WHEN** an editor selects a category or a publication status
- **THEN** only matching articles SHALL be listed, and the selected filters SHALL be reflected in the URL

#### Scenario: Filters combine
- **WHEN** a search term, a category, and a status are all applied
- **THEN** the list SHALL show only articles satisfying all three conditions

### Requirement: The articles list distinguishes drafts from published articles
Publication status SHALL be visible for every row.

#### Scenario: Status is shown as a badge
- **WHEN** the list renders
- **THEN** each row SHALL show a status badge reading Published or Draft, distinguishable by more than colour alone

### Requirement: The articles list shows per-article engagement metrics
Each row SHALL display that article's own engagement counters.

#### Scenario: Metrics appear per row
- **WHEN** the list renders
- **THEN** each row SHALL show numeric Views, Likes, and Comments values for that specific article

### Requirement: Row actions cover the article lifecycle
Each row SHALL expose actions to view, edit, delete, publish or unpublish, and reorder the article.

#### Scenario: View and Edit navigate to the correct routes
- **WHEN** an editor selects View on a row
- **THEN** they SHALL be navigated to `/admin/articles/[id]`
- **WHEN** an editor selects Edit on a row
- **THEN** they SHALL be navigated to `/admin/articles/[id]/edit`

#### Scenario: Delete requires confirmation in-app
- **WHEN** an editor selects Delete on a row
- **THEN** an in-app confirmation dialog naming that article SHALL appear — never a browser `confirm()` — and the article SHALL be deleted only on confirmation

#### Scenario: Deletion updates the list and reports the outcome
- **WHEN** a deletion is confirmed and succeeds
- **THEN** the row SHALL be removed from the table without a full page reload and a success notification SHALL be shown

#### Scenario: Publication status can be toggled from the list
- **WHEN** an editor toggles publish or unpublish on a row
- **THEN** the article's status SHALL change, the row's status badge SHALL update without a full page reload, and a notification SHALL confirm the result

### Requirement: Articles can be reordered from the list
Editors SHALL be able to adjust an article's manual trend rank by moving it one position at a time, without typing a numeric value.

#### Scenario: Moving an article changes its position
- **WHEN** an editor activates Move Up or Move Down on a row
- **THEN** that article SHALL swap trend position with its adjacent neighbour and the table order SHALL update without a full page reload

#### Scenario: Boundary controls are disabled
- **WHEN** an article is first in the overall order
- **THEN** its Move Up control SHALL be disabled
- **WHEN** an article is last in the overall order
- **THEN** its Move Down control SHALL be disabled

#### Scenario: Boundaries are evaluated across the whole collection
- **WHEN** an article is the last row shown on page 1 but is not the last article overall
- **THEN** its Move Down control SHALL remain enabled, because boundary state depends on the full ordering rather than the current page

### Requirement: Failed mutations are reported and do not corrupt the displayed list
The list SHALL apply mutation results optimistically and recover cleanly on failure.

#### Scenario: A failed mutation rolls back
- **WHEN** a delete, reorder, or status change fails on the server
- **THEN** the optimistic change SHALL be reverted so the table matches server state, and an error notification SHALL be shown

### Requirement: The articles list handles empty states
The list SHALL distinguish "nothing exists yet" from "nothing matches".

#### Scenario: No articles exist
- **WHEN** the list renders and the collection is empty
- **THEN** an empty state SHALL be shown inviting the editor to create the first article

#### Scenario: No articles match the filters
- **WHEN** the list renders with active filters that match nothing
- **THEN** a distinct "no results" state SHALL be shown with a control to clear the filters

### Requirement: Creating an article is reachable from the list
The list page SHALL provide a direct entry point to article creation.

#### Scenario: New Article button is present
- **WHEN** the articles list renders
- **THEN** a "New Article" action SHALL be visible in the page header and SHALL navigate to `/admin/articles/new`
