## ADDED Requirements

### Requirement: `DataTable` is a reusable generic component
`DataTable` SHALL be a typed React component accepting column definitions and row data, usable by any admin list page without modification.

#### Scenario: Table renders from arbitrary columns and rows
- **WHEN** a page passes `columns` and `rows` to `DataTable`
- **THEN** it SHALL render a header row from the column headers and one body row per item, rendering each cell via that column's accessor or `render` function

#### Scenario: Column types are inferred from the row type
- **WHEN** a column definition references a key that does not exist on the row type
- **THEN** it SHALL be a compile-time type error rather than a runtime failure

#### Scenario: The component carries no domain-specific logic
- **WHEN** `DataTable` is used for a collection other than articles
- **THEN** it SHALL work without changes, containing no article-specific fields, labels, or behaviour

### Requirement: Columns control their own presentation
Column definitions SHALL control alignment, width, and cell rendering.

#### Scenario: Custom cell rendering
- **WHEN** a column defines a `render` function
- **THEN** the returned content SHALL be rendered in that cell, supporting badges, formatted numbers, links, and action controls

#### Scenario: Alignment and width are respected
- **WHEN** a column specifies alignment or width
- **THEN** the header and every body cell in that column SHALL honour it

### Requirement: The table communicates loading and empty states
`DataTable` SHALL render meaningful states when there is nothing to show.

#### Scenario: Empty state replaces the body
- **WHEN** `rows` is empty and an `empty` state is provided
- **THEN** that state SHALL be rendered in place of the table body, and the caller SHALL be able to distinguish "no data" from "no matches" by supplying different content

#### Scenario: Loading state is shown while data resolves
- **WHEN** the table is in a loading state
- **THEN** a skeleton or loading indicator SHALL be rendered in place of rows, without collapsing the table's layout

### Requirement: The table is usable on small viewports
`DataTable` SHALL remain functional when its content is wider than the viewport.

#### Scenario: Wide tables scroll within their container
- **WHEN** the table is rendered below 768px with more columns than fit
- **THEN** it SHALL scroll horizontally within its own container and SHALL NOT cause the page to scroll horizontally

#### Scenario: Headers remain visible while scrolling
- **WHEN** a long table is scrolled vertically
- **THEN** the header row SHALL remain visible

### Requirement: The table is accessible
`DataTable` SHALL use semantic table structure and remain keyboard operable.

#### Scenario: Semantic table markup
- **WHEN** the table renders
- **THEN** it SHALL use `<table>`, `<thead>`, `<tbody>`, `<th>` with appropriate scope, and `<td>` elements rather than generic containers

#### Scenario: Interactive cell content is keyboard reachable
- **WHEN** a user tabs through a table containing action controls
- **THEN** every control SHALL be focusable in row order with a visible focus indicator
