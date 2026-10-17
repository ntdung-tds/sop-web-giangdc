# HANDOFF

## Baseline hiện tại
- UI canonical: G0-01 landing + `Đăng nhập nội bộ` + dashboard SAMPLE đã được owner xác nhận.
- Web shell đã migrate sang React/Vite và G0-03 giữ nguyên visual language của baseline này.
- Cloudflare project: `sopweb-giangdc-stagesign`.
- Stable production URL: `https://sopweb-giangdc-stagesign.pages.dev/`.
- Production branch: `stagesign`.
- Không dùng `main` hoặc `giangdc-sop-demo` để triển khai task StageSign.

## G0-02A — VERIFIED
- PR #10 merged vào `stagesign`, merge commit `523f0b9b5743a6923184c60905fff6ccd4cca9bb`.
- RED CI `39018871211`; GREEN CI trước/sau merge `39019111644` / `39019154024`.
- Cloudflare production + browser smoke pass; UI G0-01 không đổi.

## G0-02B — VERIFIED
- PR #11 squash-merged vào `stagesign`, merge commit `5e6a2ba169ac6f958a6f45b75a37bc05980b00c2`.
- Test-first RED: CI `39019731870` fail đúng vì `uiState.ts` chưa tồn tại.
- CSS canonical: `site/styles.css` và `apps/web/src/styles.css` cùng baseline đã owner duyệt.
- Post-merge CI `39020899697` success.
- Stable production hiện vẫn ở G0-02B/G0-02B documentation baseline để reviewer không bị khóa ngoài trong lúc G0-03 chưa có account được provision.

## G0-03 — PREVIEW-VERIFIED, CHƯA PROMOTE PRODUCTION
Branch: `stagesign-g0-03-auth-foundation`
PR: #13 (giữ chưa merge)

### Đã triển khai
- Auth nội bộ username/password thật qua backend same-origin.
- PBKDF2-HMAC-SHA-256 bằng WebCrypto, salt ngẫu nhiên; không lưu plaintext password.
- Opaque server session; DB chỉ lưu hash token.
- Cookie `__Host-sop_session` với `HttpOnly`, `Secure`, `SameSite=Lax`.
- Synchronizer CSRF token cho auth mutation.
- Generic credential error; account lockout; source throttle.
- Mandatory first-password change; đổi thành công revoke mọi session và buộc đăng nhập lại.
- Expired/revoked session bị từ chối.
- Authorization engine chạy backend theo system-role grant + `scopeId` + persisted role-permission catalog.
- Session còn `must_change_password` không có business permission.
- Login/dashboard UI nối vào auth thật nhưng giữ visual language đã chốt; dashboard vẫn ghi SAMPLE DATA.
- Không triển khai Process Authoring.

### Guardrail permission theo SRS
- G0-03 không hard-code matrix permission production.
- Không seed role production hoặc mapping role-permission production.
- `fixture.*` chỉ nằm trong tests.
- System-role grant trong Identity & Access không được coi là BusinessRole/actual execution assignment.
- Catalog production phải được contract owner khóa trước G2 theo SRS.

### Evidence
- RED auth CI: `39023986131`.
- Final G0-03 CI trên commit `820979ac5ff5dd92dca0d659de8f7bebeb7e70d5`: `39025297057` success.
- Test result: 4 files, 16/16 tests pass.
- Preview deployment: `0bab18ea-521e-41c2-893d-2d36402e400d`, build + deploy success, Pages Functions enabled.
- Preview D1: `af796076-60a4-4520-8698-0cc2927c8237`.
- Production D1: `87302ca0-e352-4344-aafe-f143805cbe85`.
- Migrations `0001_auth_foundation.sql` + `0002_auth_permission_catalog.sql` đã áp dụng cả hai.
- Direct DB verification sau migration: users=0, roles=0, role_permissions=0 ở cả preview và production.
- Evidence chi tiết: `docs/traceability/G0-03-authentication-foundation.md`.

### Giới hạn kiểm thử hiện tại
Môi trường công cụ review không resolve được hostname Cloudflare preview cho external live GET/POST; việc này được ghi là tool/network limitation và không tính là pass. Route behavior đã có HTTP-handler tests trong CI; Cloudflare xác nhận deploy Functions thành công và đúng D1 binding.

## Technical foundation hiện có
- TypeScript workspace root.
- `packages/contracts` + `packages/application`.
- Thin adapters `apps/api-node` + `apps/api-cloudflare`.
- Shared health route contract `/api/v1/health`.
- StageSign CI: lint/typecheck/unit/build.
- React/Vite web shell giữ visual language G0-01.
- D1 authentication adapter + auth Pages Functions.
- Separate preview/production auth D1 bindings.

## Không được suy diễn
- Không gọi G0-03 là production-promoted khi PR #13 chưa merge.
- Không tự tạo tài khoản/mật khẩu production hoặc gửi secret vào source control.
- Không tự chốt permission catalog production trước gate SRS.
- Không lẫn system authorization role với BusinessRole/assignment nghiệp vụ.
- Password recovery vẫn tắt trong khi `OPEN-AUTH-POLICY-01` chưa chốt.
- MFA/SSO không thuộc MVP G0-03.
- Không đưa Process Authoring vào task này.

## Bước tiếp theo an toàn
Hoàn tất secure account provisioning/credential ownership cho StageSign và chốt tối thiểu system role grant cần để reviewer đăng nhập. Sau đó mới chạy authenticated live smoke, merge PR #13 và promote `stagesign` production. Không merge chỉ để ép deploy khi chưa có account hợp lệ.
