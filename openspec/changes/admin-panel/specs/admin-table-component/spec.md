## ADDED Requirements

### Requirement: AdminTable is a reusable generic React component
`AdminTable` SHALL be a typed React component accepting `columns` (column definitions) and `data` (row data array) props, usable for any tabular admin list page without modification.

#### Scenario: AdminTable renders with arbitrary columns and data
- **WHEN** a page passes `columns` and `data` props to `AdminTable`
- **THEN** the table SHALL render a header row with the column labels and one data row per item in `data`, rendering each cell via the column's accessor or render function

#### Scenario: AdminTable accepts a custom action renderer per row
- **WHEN** a `columns` definition includes an "actions" column with a `render` function
- **THEN** the table SHALL render the action buttons (View, Edit, Delete, Move Up/Down) returned by that function in the actions column cell

#### Scenario: AdminTable is responsive on mobile
- **WHEN** `AdminTable` is rendered on a viewport narrower than 768px
- **THEN** the table SHALL remain scrollable horizontally without breaking the layout
