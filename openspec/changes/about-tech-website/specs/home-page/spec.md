## ADDED Requirements

### Requirement: Home Page Structure
The system SHALL provide a home page acting as the main landing point for users.

#### Scenario: User visits the root URL
- **WHEN** a user visits `/`
- **THEN** they see the Navbar, Trending news section, Tech News section, AI Tools section, Reviews section, and General News section.

### Requirement: Responsive Layout
The home page layout SHALL be fully responsive.

#### Scenario: User views on mobile
- **WHEN** a user visits the home page on a mobile device screen size
- **THEN** the layout adapts to a single column or vertically stacked layout without horizontal scrolling.

### Requirement: Article Listing UI
The system SHALL list articles in a consistent format across sections.

#### Scenario: Viewing a list of articles
- **WHEN** articles are displayed in sections like Trending or Tech News
- **THEN** each article item displays an image on the left and content (title/summary) on the right.
