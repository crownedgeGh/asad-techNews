## ADDED Requirements

### Requirement: Admin article viewer renders article as public portal does
The article view page (`/admin/articles/[id]`) SHALL render the article content in the same visual style as the public-facing article page.

#### Scenario: Article content matches public rendering
- **WHEN** an admin visits `/admin/articles/[id]`
- **THEN** the article SHALL be rendered with the same Tailwind Typography prose styles as the public `/article/[slug]` page — including title, cover image, content, and metadata (category, date)

#### Scenario: View page is accessible from articles list
- **WHEN** an admin clicks the View action button on an article row
- **THEN** they SHALL be navigated to `/admin/articles/[id]` and the full article SHALL be visible
