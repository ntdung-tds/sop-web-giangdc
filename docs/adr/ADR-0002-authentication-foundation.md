# ADR-0002 — G0-03 Authentication Foundation

Status: Accepted for StageSign G0-03 implementation
Date: 17/10/2026

## Context
SOP Specification v1.6 Lean Baseline Rev.10 requires an internal username/password sign-in foundation, generic authentication failures, temporary lockout/rate limiting, salted costed password hashing, revocable server sessions, mandatory first-password change, server-side RBAC/scope enforcement and negative security tests. `OPEN-AUTH-POLICY-01` remains open, so this ADR must not turn unresolved enterprise identity/recovery policy into a frozen product requirement.

The owner-approved G0-01 login/dashboard visual baseline must remain recognizable. G0-03 changes behavior and required auth states, not the established visual language, and does not begin Process Authoring.

## Decision

### Session transport
- Use an opaque random server session token in the `__Host-sop_session` cookie.
- Cookie attributes: `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`.
- Store only a SHA-256 hash of the session token in persistence.
- Session-changing authentication endpoints require a separate synchronizer CSRF token through `X-CSRF-Token`.
- Auth/session responses use `Cache-Control: no-store`.
- Logout, logout-all and successful password change can revoke server sessions. Successful password change revokes all sessions and requires reauthentication.

### Password handling
- Never persist or log plaintext passwords.
- StageSign implementation uses salted PBKDF2-HMAC-SHA-256 through WebCrypto; each password receives a random salt.
- The current StageSign work factor is 600,000 iterations.
- Initial credentials must set `must_change_password`; while that flag is true, business permissions are denied server-side.
- Current StageSign minimum password length is 12 characters and the replacement must differ from the current password.

### Abuse controls
- Current StageSign account policy: 5 failed attempts trigger a 15-minute temporary lock.
- Current StageSign source policy: 20 failures within 15 minutes trigger a 15-minute source block.
- Unknown account, wrong password, locked account and source throttling return the same public `INVALID_CREDENTIALS` response.
- Unknown/locked-account paths perform password-derivation work to reduce obvious timing distinctions.

### Authorization
- Authorization is evaluated on the server from persisted role assignments plus `scopeId`.
- StageSign foundation roles are `ADMIN`, `PROCESS_OWNER`, `REVIEWER`, `OPERATOR`, and `AUDITOR`.
- Direct permission checks deny invalid/expired/revoked sessions, wrong scope, missing role capability, and any session whose user must still change password.
- UI visibility is not an authorization boundary.

### Persistence and deployment
- Authentication application logic remains runtime-independent behind `AuthRepository`.
- Cloudflare StageSign uses a D1 repository adapter and separate preview/production D1 databases bound as `SOP_DB`.
- The schema stores users, sessions, source-throttle state and security-event storage without storing plaintext credentials.
- A future VPS/PostgreSQL deployment can replace the repository adapter without changing the application invariants.

### UI behavior
- Preserve the approved landing/login/dashboard structure and styling.
- The existing login form now calls the real same-origin auth API.
- Mandatory password change reuses the login-card visual surface and blocks entry to the sample dashboard until complete.
- Password recovery remains disabled while `OPEN-AUTH-POLICY-01` is unresolved.
- “Remember this device” is not activated in G0-03.
- MFA/SSO are out of MVP scope and are not implemented here.

## Policy-bound defaults
The numeric password/session/lockout values in this ADR are StageSign implementation defaults, not an attempt to close `OPEN-AUTH-POLICY-01`. They must be revalidated before a later production-policy gate if the controlling specification or security policy changes.

## Security test obligations
G0-03 evidence must cover at minimum:
- salted hash and plaintext absence;
- generic credential failure;
- account lock and release window;
- source throttling;
- mandatory first-password change;
- session revocation on password change/logout-all;
- expired/revoked session denial;
- RBAC and scope negative checks;
- denial of business permissions before mandatory password change;
- hardened cookie attributes and CSRF rejection for state-changing endpoints.

## Consequences
- The approved prototype login becomes a real internal authentication boundary without introducing Process Authoring.
- Authentication/session policy is centralized and testable rather than trusted to the browser.
- Preview authentication data is isolated from production data.
- Production account provisioning is intentionally not encoded as a plaintext credential in source control. Provisioning must supply a password hash or use a later secure administrative workflow.
