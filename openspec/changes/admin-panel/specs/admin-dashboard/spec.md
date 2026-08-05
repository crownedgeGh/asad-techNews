## ADDED Requirements

### Requirement: The dashboard shows aggregate engagement statistics
`/admin` SHALL display aggregate counts across all articles so an editor can assess the publication at a glance.

#### Scenario: Stat cards render the five headline figures
- **WHEN** an authenticated editor visits `/admin`
- **THEN** stat cards SHALL display total article count, total views, total likes, total comments, and the number of drafts

#### Scenario: Totals span all articles, not one page
- **WHEN** the site contains more articles than a single query page returns
- **THEN** each total SHALL reflect every article in the collection, not only those in the first page of results

#### Scenario: Large numbers are formatted for legibility
- **WHEN** a total is four digits or more
- **THEN** it SHALL be rendered with thousands separators

### Requirement: The dashboard distinguishes published from draft content
The dashboard SHALL make the published/draft split visible rather than reporting a single undifferentiated article count.

#### Scenario: Draft count is shown alongside the total
- **WHEN** the dashboard renders
- **THEN** the number of articles whose status is `draft` SHALL be displayed distinctly from the total article count

### Requirement: The dashboard shows recent editorial activity
The dashboard SHALL list the most recently updated articles as an entry point into ongoing work.

#### Scenario: Five most recently updated articles are listed
- **WHEN** the dashboard renders and at least one article exists
- **THEN** the five most recently updated articles SHALL be listed, each showing title, category, publication status, and a relative updated time

#### Scenario: Activity entries link to the editor
- **WHEN** an editor selects an entry in the recent activity list
- **THEN** they SHALL be navigated to that article's edit page

### Requirement: The dashboard handles the empty state
The dashboard SHALL remain useful before any content exists.

#### Scenario: Zero state guides the first action
- **WHEN** the dashboard renders and no articles exist
- **THEN** all totals SHALL display zero, and an explanatory empty state SHALL be shown with a link to `/admin/articles/new` in place of the recent activity list

### Requirement: The dashboard is responsive
The dashboard SHALL adapt its layout across viewport sizes.

#### Scenario: Stat cards reflow on narrow viewports
- **WHEN** the dashboard is viewed below 768px
- **THEN** the stat cards SHALL stack into a single or two-column grid without clipping their values or overflowing horizontally
