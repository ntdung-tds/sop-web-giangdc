# HANDOFF

## Baseline hiện tại
- Repo: `ntdung-tds/sop-web-giangdc`.
- UI canonical: G0-01 landing + `Đăng nhập nội bộ` + dashboard SAMPLE đã được owner xác nhận.
- Stable production branch: `stagesign`.
- Stable production URL: `https://sopweb-giangdc-stagesign.pages.dev/`.
- Stable production intentionally remains on the pre-auth reviewer baseline until G0-03 credential takeover is complete.
- Không dùng `main` hoặc `giangdc-sop-demo` để triển khai task StageSign.

## G0-02A / G0-02B — VERIFIED
- Technical foundation and React/Vite baseline migration đã verified/production-stable.
- G0-01 visual baseline remains frozen.

## G0-03 — PREVIEW-VERIFIED, CHƯA PROMOTE PRODUCTION
Parent branch: `stagesign-g0-03-auth-foundation`
PR: #13 (draft/open)

### Đã triển khai
- Internal username/password auth thật qua backend same-origin.
- PBKDF2-HMAC-SHA-256 với salt ngẫu nhiên; không lưu plaintext password.
- Opaque server session; DB chỉ lưu token hash.
- `__Host-sop_session`: HttpOnly + Secure + SameSite=Lax.
- Synchronizer CSRF cho state-changing auth actions.
- Generic login failure; account lockout; source throttle.
- Mandatory first-password change; password change revokes all sessions.
- Backend authorization theo system-role grant + scope + persisted permission catalog.
- Không seed permission production; không lẫn system role với BusinessRole/assignment.
- Process Authoring chưa được triển khai trong G0-03.

## G0-03F — PREVIEW PROVISIONED, AWAITING OWNER TAKEOVER
Child branch: `stagesign-g0-03f-secure-bootstrap`
PR: #14

### Code/security gate
- Initial RED CI: `39026007765` — bootstrap contracts chưa tồn tại.
- First GREEN: `39026201868`.
- Security review phát hiện bootstrap method disclosure (`GET` trả 405 trước secret validation).
- Security RED: `39026516082` — đúng 1 failure `expected 404, received 405`.
- Fix commit: `f83663193cfb829ca76e9875ca07a5ccc25f2746`.
- Final GREEN CI: `39026592467` — lint/typecheck/unit/build success, 22/22 tests pass.

### Secure bootstrap behavior
- Bootstrap first user only when repository has zero users.
- Password is hashed before persistence.
- New bootstrap identity has `must_change_password=1`, `roles=[]`, active=true.
- D1 migration `0003_secure_bootstrap.sql` adds a one-bootstrap-origin guard.
- Bootstrap token is header-only; URL query token is rejected.
- Missing/wrong secret and replay are concealed as 404.
- No password is returned and no login session is created by bootstrap.

### Cloudflare secret handling
- Attempt to write `SOP_BOOTSTRAP_TOKEN` as Cloudflare encrypted `secret_text` was blocked by connector safety policy.
- Implementation did not downgrade to a plaintext env var.
- Verified preview and production env var maps remained empty after the blocked attempt.
- For StageSign preview only, first identity was provisioned directly in D1 using a PBKDF2 hash generated locally; plaintext was not written to GitHub, Pages config or D1.

### Preview state
Preview D1:
- name: `sopweb-giangdc-stagesign-auth-preview`
- id: `af796076-60a4-4520-8698-0cc2927c8237`
- migration `0003` applied.
- exactly one user: `stage.reviewer` / `StageSign Reviewer`.
- `must_change_password=1`.
- `roles_json=[]`.
- `bootstrap_origin=1`.
- PBKDF2-SHA256 hash format with 600,000 iterations verified.

Preview URL:
`https://stagesign-g0-03f-secure-boot.sopweb-giangdc-stagesign.pages.dev/`

Final preview deployment:
- `d0efd6de-365d-4d96-a0f2-6b8a3506ec07`
- commit `f83663193cfb829ca76e9875ca07a5ccc25f2746`
- deploy success; Pages Functions enabled; preview D1 binding correct.

Live Cloudflare Browser Run checks:
- landing/login: 200, real-auth UI rendered.
- `/api/v1/auth/session`: 200 + `{"authenticated":false}` + `Cache-Control: no-store`.
- `/api/v1/auth/bootstrap` before fix: 405 (issue reproduced).
- `/api/v1/auth/bootstrap` after fix: 404 (issue closed).

### Production isolation
Production D1 remains:
- users=0;
- roles=0;
- role_permissions=0.

Migration `0003_secure_bootstrap.sql` has NOT been applied to production in G0-03F. No production account was provisioned.

## Không được suy diễn
- Không gọi G0-03/G0-03F là production-promoted.
- Không ghi temporary password vào source/docs.
- Không tự tạo production permission catalog.
- Không merge/promote chỉ để deploy khi credential chưa được owner takeover.
- Password recovery/MFA/SSO remain outside this gate.
- Không bắt đầu Process Authoring từ branch này.

## Bước tiếp theo bắt buộc
Owner đăng nhập preview bằng credential tạm được handoff ngoài repository, đổi mật khẩu ngay qua force-change UI và xác nhận thành công. Sau đó chạy authenticated smoke, retarget/merge PR #14 vào parent auth branch, merge PR #13 vào `stagesign`, và chỉ khi post-merge checks xanh mới promote stable production.

Detailed evidence: `docs/traceability/G0-03F-secure-bootstrap.md`.
