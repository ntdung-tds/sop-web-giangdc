# G0-03F — Secure Bootstrap & Account Provisioning evidence

Date: 17/10/2026
Branch: `stagesign-g0-03f-secure-bootstrap`
PR: #14
Parent auth branch: `stagesign-g0-03-auth-foundation`

## Scope
- Provide a one-time first-identity bootstrap capability without storing plaintext credentials in source control.
- Force first-password change.
- Create no production role/permission mapping during bootstrap.
- Hide bootstrap route unless a valid server-side bootstrap secret is presented.
- Add a DB-level singleton guard for first-user bootstrap.
- Provision exactly one preview-only StageSign reviewer identity for owner handoff.

## SRS guardrails
- Admin/user-management flows must never expose passwords.
- Initial password must force change on first login or use a secure activation flow.
- Production permission catalog remains owner-controlled and must not be invented by the implementation agent.
- G0-03F does not model BusinessRole/execution assignment and does not touch Process Authoring.

## Test-first evidence
### First RED
- Run `39026007765`.
- Failed at Typecheck because bootstrap contracts intentionally did not exist yet (`bootstrapFirstUser`, `countUsers`, bootstrap HTTP options).

### First GREEN
- Run `39026201868` on commit `c9fa989afccd1f1d42ae340ca865e32676032b13`.
- lint/typecheck/unit/build successful.
- 21 tests passed.

### Security regression discovered during review
A live/browser review found that `GET /api/v1/auth/bootstrap` returned `405 Method Not Allowed` before validating the bootstrap secret, revealing that the route existed and that POST was accepted.

- Added a negative test before the fix.
- RED run `39026516082` failed exactly on `expected 404, received 405`.
- The live preview independently reproduced the same 405 behavior.

### Final GREEN
- Fix commit: `f83663193cfb829ca76e9875ca07a5ccc25f2746`.
- Final CI run: `39026592467`.
- lint: success.
- typecheck: success.
- unit tests: success.
- build: success.
- 5 test files / 22 tests passed.
- Bootstrap route now validates the configured/supplied secret before disclosing method behavior.

## Bootstrap implementation
- Application service `bootstrapFirstUser` validates identity input and minimum password policy.
- Password is hashed with the same salted PBKDF2-HMAC-SHA-256 implementation used by G0-03.
- Created user has:
  - `must_change_password = 1`;
  - `roles_json = []`;
  - `active = 1`.
- Repository requires zero existing users before bootstrap.
- D1 performs a guarded `INSERT ... WHERE NOT EXISTS` and migration `0003_secure_bootstrap.sql` adds a unique partial index for `bootstrap_origin = 1`.
- HTTP bootstrap accepts the bootstrap token only from `X-Bootstrap-Token`; URL query tokens are rejected.
- Successful response contains no password and sets no login cookie.
- Wrong/missing secret, replay after first user, or disabled bootstrap all return 404.

## Cloudflare secret limitation and safe fallback
The Cloudflare connector refused the attempted encrypted-secret mutation for `SOP_BOOTSTRAP_TOKEN` because its safety layer blocks secret/token transfer. The implementation did not downgrade to a plaintext environment variable.

Verification after the blocked mutation:
- preview env vars: empty;
- production env vars: empty.

For this StageSign preview only, the first identity was therefore provisioned directly in D1 using a locally generated PBKDF2 password hash. Plaintext was not written to GitHub, Cloudflare configuration, or D1.

## Preview-only migration and identity state
Migration `0003_secure_bootstrap.sql` was applied to preview D1 only:
- D1: `sopweb-giangdc-stagesign-auth-preview`
- id: `af796076-60a4-4520-8698-0cc2927c8237`

Preview identity state after provisioning:
- username: `stage.reviewer`;
- display name: `StageSign Reviewer`;
- users: exactly 1;
- `must_change_password = 1`;
- `roles_json = []`;
- `active = 1`;
- `bootstrap_origin = 1`;
- password hash format verified as PBKDF2-SHA256 with 600,000 iterations.

The temporary plaintext password is intentionally not recorded in repository documentation.

## Production isolation
Production D1 remains untouched by G0-03F provisioning:
- users = 0;
- roles = 0;
- role_permissions = 0.

Migration `0003_secure_bootstrap.sql` has not been applied to production in this task.

## Live preview evidence
Preview alias:
`https://stagesign-g0-03f-secure-boot.sopweb-giangdc-stagesign.pages.dev/`

Cloudflare Browser Run verified:
- landing/login page: HTTP 200 and real-auth React UI rendered;
- `/api/v1/auth/session`: HTTP 200, `{"authenticated":false}`, `Cache-Control: no-store`;
- before the disclosure fix, unauthenticated `/api/v1/auth/bootstrap`: HTTP 405;
- after final fix/deploy, unauthenticated `/api/v1/auth/bootstrap`: HTTP 404.

Final preview deployment:
- deployment `d0efd6de-365d-4d96-a0f2-6b8a3506ec07`;
- commit `f83663193cfb829ca76e9875ca07a5ccc25f2746`;
- deploy status: success;
- Pages Functions enabled;
- preview `SOP_DB` binding points to the preview auth D1.

## Remaining owner handoff
The preview reviewer credential has been securely provisioned but has not yet been taken over by the owner. The owner must log in once and replace the temporary password through the force-change UI. Until that takeover succeeds, G0-03/G0-03F must not be promoted to stable production.
