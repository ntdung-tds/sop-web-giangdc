# G0-03 — Authentication Foundation evidence

Date: 17/10/2026
Branch: `stagesign-g0-03-auth-foundation`
PR: #13
Base: `stagesign` at `4d7cc037a0ec3ac9a1954a7b547d5b699f30c658`

## Scope completed
- Replace prototype form behavior with same-origin internal authentication flow while preserving the approved G0-01 visual language.
- Salted costed password hashing through WebCrypto PBKDF2-HMAC-SHA-256.
- Opaque server session token; only token hash persisted.
- Hardened `__Host-sop_session` cookie and synchronizer CSRF token for state-changing auth requests.
- Generic credential failure, temporary account lockout and source throttling.
- Mandatory first-password change; successful change revokes all sessions and requires reauthentication.
- Server-side authorization engine using system-role grant + scope + persisted role-permission catalog.
- Preview/production D1 schema and separate D1 bindings.
- Negative/security tests for authentication, session, CSRF, expiry, force-change and scope/catalog authorization.

## Explicitly out of scope
- Process Authoring.
- MFA/SSO.
- Password recovery while `OPEN-AUTH-POLICY-01` remains unresolved.
- BusinessRole/execution assignment modeling.
- Production role/permission catalog decisions before their SRS gate.
- Plaintext or source-controlled production credentials.

## Permission-catalog guardrail
SOP v1.6 requires the permission catalog to be locked before G2 and forbids an implementation agent from inventing permissions merely to open access. G0-03 therefore creates generic catalog storage and lookup only. No production role or role-permission mapping is seeded. `fixture.*` codes occur only in tests.

## Test-first evidence
- RED commit: `fda28512d15e3ca012ede440ba785ea6f2adc6b7`.
- RED CI: `39023986131`; Typecheck failed because auth symbols intentionally did not yet exist.
- First auth-core GREEN CI: `39024281444`.
- Final G0-03 CI on HEAD `820979ac5ff5dd92dca0d659de8f7bebeb7e70d5`: run `39025297057`, completed success.
- Final test result: 4 test files, 16 tests, all passed.
- Final quality job: lint, typecheck, unit tests and build all completed successfully.
- The two lint warnings are pre-existing `!important` rules in the frozen baseline CSS; they were intentionally not rewritten in G0-03 to avoid an unrelated visual change.

## Security coverage
`auth-foundation.test.ts` verifies:
- random salt and no plaintext password in hashes;
- correct/incorrect password verification;
- identical public error for unknown user and wrong password;
- account lock and release window;
- source throttling;
- mandatory first-password change;
- permission denial while password change is mandatory;
- session revocation after password change;
- catalog-backed permission grant and negative scope/ungranted checks;
- expired-session denial;
- logout-all revocation.

`auth-http.test.ts` verifies:
- `HttpOnly`, `Secure`, `SameSite=Lax`, `__Host-` session cookie;
- server session restoration;
- CSRF rejection/acceptance on state change;
- logout revocation;
- password-change reauthentication;
- old-password invalidation;
- generic catalog-backed authorization and wrong-scope denial through the HTTP handler.

## Cloudflare persistence/deployment evidence
Production D1:
- `sopweb-giangdc-stagesign-auth`
- id `87302ca0-e352-4344-aafe-f143805cbe85`

Preview D1:
- `sopweb-giangdc-stagesign-auth-preview`
- id `af796076-60a4-4520-8698-0cc2927c8237`

Both have migrations `0001_auth_foundation.sql` and `0002_auth_permission_catalog.sql` applied. Direct count verification after migration:
- preview: users=0, roles=0, role_permissions=0;
- production: users=0, roles=0, role_permissions=0.

Cloudflare Pages preview:
- deployment `0bab18ea-521e-41c2-893d-2d36402e400d`;
- commit `820979ac5ff5dd92dca0d659de8f7bebeb7e70d5`;
- build success;
- deploy success;
- Pages Functions enabled;
- `SOP_DB` bound to the preview D1 database.

## Live-smoke limitation
The execution environment used for this review cannot resolve the Cloudflare preview hostname for an independent external GET/POST smoke request. This is recorded as a tool/network limitation, not counted as a pass. Route behavior is covered by the CI HTTP-handler tests above, while Cloudflare independently reports successful Functions deployment and the correct D1 binding.

## Promotion status
G0-03 implementation is preview-verified, not production-promoted. The stable `stagesign` production deployment remains on G0-02B until secure account provisioning/credential ownership is decided. Promoting a real-auth UI with zero provisioned accounts would make the existing reviewer login path unusable, so the PR must not be merged solely to force a production deploy.
