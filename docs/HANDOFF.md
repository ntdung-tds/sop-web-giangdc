# HANDOFF

## Baseline hiện tại
- UI canonical: G0-01 landing + `Đăng nhập nội bộ` + dashboard SAMPLE đã được owner xác nhận.
- Cloudflare project: `sopweb-giangdc-stagesign`.
- Production URL: `https://sopweb-giangdc-stagesign.pages.dev/`.
- Production branch: `stagesign`.
- Không dùng `main` hoặc `giangdc-sop-demo` để triển khai task StageSign.

## G0-02A — VERIFIED
- PR #10 merged vào `stagesign`, merge commit `523f0b9b5743a6923184c60905fff6ccd4cca9bb`.
- RED CI `39018871211`; GREEN CI trước/sau merge `39019111644` / `39019154024`.
- Cloudflare production + browser smoke pass; `site/**` không đổi.

## G0-02B — IN PROGRESS
- Branch: `stagesign-g0-02b-react-shell`; PR #11 → base `stagesign`.
- Mục tiêu: migrate chính UI G0-01 sang React/Vite, tuyệt đối không redesign.
- Test-first RED: CI `39019731870` fail đúng vì `uiState.ts` chưa tồn tại.
- Các vòng kỹ thuật đã ghi nhận, không che lỗi:
  - CI `39019880458`: fail lint React/a11y.
  - CI `39019959937`: fail lint semantic group.
  - CI `39020035137`: lint pass, fail typecheck do hai instance type Vite/plugin.
- GREEN nền tảng: CI `39020165188` success toàn bộ lint/typecheck/unit/build sau khi bỏ plugin Vite dư.
- CSS React đã được pin đúng blob của baseline static: `b57434334cd5cfe9530cecab348fbcd5fd563834` cho cả `site/styles.css` và `apps/web/src/styles.css`.
- CI sau khi pin CSS: `39020237291` success toàn bộ.
- Cloudflare project đã chuyển build config sang React: `npm run build -w @sop/web` → `apps/web/dist`; production branch vẫn `stagesign`, preview chỉ `stagesign-*`.
- Production chưa được promote sang React tại thời điểm ghi này; phải kiểm tra preview desktop/mobile + login/logout trước khi merge.

## Technical foundation đã có
- TypeScript workspace root.
- `packages/contracts` + `packages/application`.
- Thin adapters `apps/api-node` + `apps/api-cloudflare`.
- Shared health route contract `/api/v1/health`.
- StageSign CI: lint/typecheck/unit/build.

## Không được suy diễn
- Auth thật, permission, D1/R2/Postgres/S3 chưa được triển khai.
- Login React vẫn là prototype SAMPLE; không được gọi là authentication production.
- Không đưa Process Authoring cũ trở lại baseline nếu owner chưa quyết định.

## Bước tiếp theo của đúng task
Chờ preview React từ commit tài liệu này → browser test desktop/mobile + login/logout → nếu pass thì cập nhật evidence, CI cuối và merge PR #11 vào `stagesign` → smoke production.
