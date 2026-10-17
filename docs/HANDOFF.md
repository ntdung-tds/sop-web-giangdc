# HANDOFF

## Baseline hiện tại
- UI canonical: G0-01 landing + `Đăng nhập nội bộ` + dashboard SAMPLE đã được owner xác nhận.
- Cloudflare project: `sopweb-giangdc-stagesign`.
- Production URL: `https://sopweb-giangdc-stagesign.pages.dev/`.
- Production branch: `stagesign`.
- Không dùng `main` hoặc `giangdc-sop-demo` để triển khai task StageSign.

## G0-02A — VERIFIED
- PR #10 merged vào `stagesign`, merge commit `523f0b9b5743a6923184c60905fff6ccd4cca9bb`.
- Test-first RED: CI `39018871211` fail đúng vì `@sop/application` chưa có.
- Pre-merge GREEN: CI `39019111644` success lint/typecheck/unit/build.
- Post-merge GREEN: CI `39019154024` success lint/typecheck/unit/build.
- Cloudflare production deployment `22f3ffae-5ad0-47cb-a704-08dfd43ca336` success từ branch `stagesign`.
- Production desktop browser: đúng title/login/welcome/dashboard, không có Process Authoring.
- Preview mobile 360: submit login chuyển dashboard thành công.
- Compare baseline → G0-02A không có bất kỳ thay đổi `site/**`.
- Một lần lặp Browser Rendering mobile trên production gặp rate limit Cloudflare `2001`; không retry dồn dập. Đây là giới hạn API kiểm thử, không phải lỗi app.

## Technical foundation đã có
- TypeScript workspace root.
- `packages/contracts` + `packages/application`.
- Thin adapters `apps/api-node` + `apps/api-cloudflare`.
- Shared health route contract `/api/v1/health`.
- StageSign CI: lint/typecheck/unit/build.

## Không được suy diễn
- Auth thật, permission, D1/R2/Postgres/S3 chưa được triển khai bởi G0-02A.
- UI hiện vẫn là prototype G0-01; chưa được gọi là auth production.
- Không tự thay baseline bằng React/Process Authoring.

## Bước tiếp theo
G0-02B là task riêng: migrate đúng baseline UI sang web framework mà không redesign, với visual parity desktop/mobile trước khi promote. Chỉ bắt đầu khi owner cho tiếp tục.
