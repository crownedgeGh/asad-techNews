## ADDED Requirements

### Requirement: Admin layout isolation from public portal
The admin layout SHALL be a separate Astro layout component (`AdminLayout.astro`) that does NOT import or render any public portal components (Navbar, Footer).

#### Scenario: Admin page renders without public header
- **WHEN** a user visits any `/admin/*` route
- **THEN** the page SHALL render with the admin sidebar and top bar only — no public Navbar or Footer visible

#### Scenario: Admin layout provides sidebar navigation
- **WHEN** the admin layout is rendered
- **THEN** a sidebar SHALL be present with links to: Dashboard, Articles

#### Scenario: Admin layout applies DaisyUI emerald theme
- **WHEN** the admin layout is rendered
- **THEN** the DaisyUI `emerald` theme SHALL be active, producing the warm yellow/honey color palette distinct from the public portal

#### Scenario: Admin layout is fully responsive
- **WHEN** the admin layout is viewed on mobile (<768px)
- **THEN** the sidebar SHALL collapse into a hamburger-triggered drawer and all admin content SHALL remain fully usable
