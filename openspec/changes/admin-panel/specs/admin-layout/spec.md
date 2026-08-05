## ADDED Requirements

### Requirement: The admin has its own root layout, isolated from the public portal and from Payload
The custom admin SHALL render inside its own Next.js root layout in an `(admin)` route group, with its own stylesheet. It SHALL NOT import the public portal's chrome, and it SHALL NOT load Payload's admin stylesheets.

#### Scenario: Public portal chrome is absent
- **WHEN** any `/admin` route renders
- **THEN** the public `Navbar` and `Footer` components SHALL NOT appear, and neither SHALL be imported anywhere under the `(admin)` route group

#### Scenario: Payload styles do not leak into the custom admin
- **WHEN** any `/admin` route renders
- **THEN** `@payloadcms/next/css` and Payload's admin SCSS SHALL NOT be loaded, and admin styling SHALL come solely from the admin's own Tailwind stylesheet

#### Scenario: Admin styles do not leak into the public portal
- **WHEN** any public portal route renders
- **THEN** no admin stylesheet or admin component SHALL be loaded, and the portal's existing appearance SHALL be unchanged

### Requirement: The admin shell provides persistent sidebar navigation
The admin SHALL render a persistent sidebar containing navigation to the sections it manages, plus links into Payload's admin for the collections it does not.

#### Scenario: Sidebar lists managed sections
- **WHEN** the admin shell renders
- **THEN** the sidebar SHALL contain links to Dashboard (`/admin`) and Articles (`/admin/articles`), each with an accompanying icon

#### Scenario: Sidebar links out to Payload for unmanaged collections
- **WHEN** the admin shell renders
- **THEN** the sidebar SHALL contain links to `/cms` for Media, Users, Categories, and Comments, visually distinguished from the in-admin links

#### Scenario: Active section is indicated
- **WHEN** the current route is `/admin/articles` or any route beneath it
- **THEN** the Articles nav item SHALL be rendered in an active state distinguishable by more than colour alone

### Requirement: The admin shell provides a top bar with session and theme controls
The admin SHALL render a top bar exposing the current user, sign-out, theme switching, and the mobile navigation toggle.

#### Scenario: Top bar shows session identity and sign-out
- **WHEN** an authenticated user views any admin page
- **THEN** the top bar SHALL display that user's name or email and SHALL expose a sign-out control

#### Scenario: Theme toggle switches light and dark
- **WHEN** the user activates the theme toggle
- **THEN** the admin SHALL switch between light and dark mode, and the choice SHALL persist across navigations and reloads

### Requirement: The admin is fully responsive
Every admin screen SHALL be usable on mobile, tablet, and desktop viewports.

#### Scenario: Sidebar collapses on small viewports
- **WHEN** the viewport is narrower than 768px
- **THEN** the sidebar SHALL be hidden by default and SHALL open as an off-canvas drawer when the top bar's menu control is activated

#### Scenario: Drawer closes on navigation and on dismissal
- **WHEN** the mobile drawer is open and the user selects a nav item, presses Escape, or activates the overlay
- **THEN** the drawer SHALL close

#### Scenario: No horizontal page overflow on mobile
- **WHEN** any admin screen is viewed at 375px wide
- **THEN** the page SHALL NOT scroll horizontally; content that cannot fit SHALL scroll within its own container

### Requirement: The admin supports light and dark mode, sharing the portal's theme preference
The admin SHALL support both colour schemes and SHALL use the same persisted theme preference as the public portal.

#### Scenario: Both schemes are fully styled
- **WHEN** the admin is viewed in either light or dark mode
- **THEN** every surface, control, table, and dialog SHALL be legible with sufficient contrast, with no unstyled or inverted regions

#### Scenario: Theme preference carries across surfaces
- **WHEN** the user selects dark mode in the admin and then visits the public portal
- **THEN** the portal SHALL render in dark mode, and the reverse SHALL also hold

#### Scenario: No flash of incorrect theme on load
- **WHEN** an admin page loads with a persisted dark preference
- **THEN** it SHALL render dark on first paint, without a light-mode flash

### Requirement: Admin navigation is keyboard accessible
All shell navigation and controls SHALL be operable without a pointing device.

#### Scenario: Shell controls are reachable by keyboard
- **WHEN** a user tabs through an admin page
- **THEN** every sidebar link, top bar control, and page action SHALL be focusable in a logical order with a visible focus indicator
