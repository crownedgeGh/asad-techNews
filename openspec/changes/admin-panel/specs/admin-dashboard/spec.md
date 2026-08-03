## ADDED Requirements

### Requirement: Dashboard displays aggregate site statistics
The admin dashboard page (`/admin`) SHALL display summary statistics including: total published articles, total views across all articles, total likes across all articles, and total comments across all articles.

#### Scenario: Stats cards render with current data
- **WHEN** an admin visits `/admin`
- **THEN** four stat cards SHALL be visible showing: Total Articles, Total Views, Total Likes, Total Comments — each with its current aggregate count

#### Scenario: Recent activity feed shows latest articles
- **WHEN** an admin visits `/admin`
- **THEN** a list of the 5 most recently created or updated articles SHALL be displayed with their title, category, published status, and creation date

#### Scenario: Dashboard is accessible from sidebar
- **WHEN** the admin sidebar is rendered
- **THEN** a "Dashboard" link SHALL be present that navigates to `/admin`
