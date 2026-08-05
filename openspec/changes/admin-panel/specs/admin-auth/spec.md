## ADDED Requirements

### Requirement: Every admin route requires an authenticated session
All `/admin/*` routes except the login page SHALL require an authenticated user resolved server-side. The check SHALL NOT rely on client-side rendering or on the mere presence of a cookie.

#### Scenario: Unauthenticated user is redirected to login
- **WHEN** a user with no valid session requests any `/admin` route
- **THEN** they SHALL be redirected to `/admin/login` and no admin data SHALL be present in the response

#### Scenario: Deep links are guarded
- **WHEN** an unauthenticated user requests a deep link such as `/admin/articles/42/edit`
- **THEN** they SHALL be redirected to `/admin/login` rather than shown a partially rendered page or an error

#### Scenario: Session is validated, not merely detected
- **WHEN** a request carries a `payload-token` cookie that is expired, malformed, or forged
- **THEN** the request SHALL be treated as unauthenticated and redirected to `/admin/login`

### Requirement: Admin access is restricted by role
Only users whose `role` is `admin` or `editor` SHALL be granted access to the custom admin.

#### Scenario: Authorized roles are admitted
- **WHEN** a user with role `admin` or `editor` signs in
- **THEN** they SHALL be admitted to the admin and the dashboard SHALL render

#### Scenario: Unauthorized role is rejected
- **WHEN** an authenticated user whose role is neither `admin` nor `editor` requests an admin route
- **THEN** access SHALL be denied and they SHALL be redirected to `/admin/login`

### Requirement: Login authenticates against the users collection
`/admin/login` SHALL authenticate email and password against Payload's `users` collection and establish the standard Payload session cookie.

#### Scenario: Successful login establishes a session
- **WHEN** valid credentials for an `admin` or `editor` user are submitted
- **THEN** the Payload session cookie SHALL be set as `httpOnly` with `sameSite: 'lax'`, marked `secure` in production, and the user SHALL be redirected to `/admin`

#### Scenario: Invalid credentials show an inline error
- **WHEN** invalid credentials are submitted
- **THEN** an inline error SHALL be shown on the form, no session SHALL be established, and the error SHALL NOT reveal whether the email address exists

#### Scenario: Login page is reachable while signed out
- **WHEN** an unauthenticated user requests `/admin/login`
- **THEN** the login form SHALL render without redirecting, and SHALL render outside the admin shell (no sidebar or top bar)

### Requirement: One session serves both admin surfaces
Because the custom admin uses Payload's own auth, a session established in one surface SHALL be valid in the other.

#### Scenario: Custom admin session carries to Payload's admin
- **WHEN** a user signs in at `/admin/login` and then navigates to `/cms`
- **THEN** they SHALL already be authenticated and SHALL NOT be asked to sign in again

### Requirement: Sign-out clears the session
The admin SHALL provide a sign-out control that invalidates the session.

#### Scenario: Signing out ends the session
- **WHEN** a user activates sign-out from the top bar
- **THEN** the session cookie SHALL be cleared, the user SHALL be redirected to `/admin/login`, and navigating back SHALL NOT restore access to admin content

### Requirement: Server Actions authenticate independently of route guards
Every admin Server Action SHALL resolve and authorize the caller itself, because a layout-level guard does not protect an action invoked directly.

#### Scenario: Action invoked without a session is rejected
- **WHEN** an admin Server Action is invoked by a caller with no valid session
- **THEN** the action SHALL reject the call and SHALL NOT perform any read or write, regardless of any route-level guard

### Requirement: Development auto-login does not weaken the custom admin
Payload's dev-only `autoLogin` SHALL NOT silently authenticate a user into the custom admin. Dev convenience SHALL be an explicit, clearly labelled affordance.

#### Scenario: Dev credentials are offered, not applied
- **WHEN** the login page renders with `NODE_ENV=development`
- **THEN** the seeded dev credentials MAY be prefilled and SHALL be labelled as a development affordance, and the user SHALL still submit the form to establish a session

#### Scenario: No dev bypass in production
- **WHEN** the application runs outside development
- **THEN** no credentials SHALL be prefilled and no authentication bypass SHALL exist
