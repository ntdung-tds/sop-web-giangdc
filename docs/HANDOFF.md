# HANDOFF

## Baseline hiện tại
- UI canonical: G0-01 landing + `Đăng nhập nội bộ` + dashboard SAMPLE đã được owner xác nhận.
- Web shell hiện đã migrate sang React/Vite nhưng giữ nguyên visual baseline.
- Cloudflare project: `sopweb-giangdc-stagesign`.
- Production URL: `https://sopweb-giangdc-stagesign.pages.dev/`.
- Production branch: `stagesign`.
- Không dùng `main` hoặc `giangdc-sop-demo` để triển khai task StageSign.

## G0-02A — VERIFIED
- PR #10 merged vào `stagesign`, merge commit `523f0b9b5743a6923184c60905fff6ccd4cca9bb`.
- RED CI `39018871211`; GREEN CI trước/sau merge `39019111644` / `39019154024`.
- Cloudflare production + browser smoke pass; UI G0-01 không đổi.

## G0-02B — VERIFIED
- PR #11 squash-merged vào `stagesign`, merge commit `5e6a2ba169ac6f958a6f45b75a37bc05980b00c2`.
- Test-first RED: CI `39019731870` fail đúng vì `uiState.ts` chưa tồn tại.
- Known failed attempts đã được xử lý và giữ làm evidence:
  - `39019880458`: lint React/a11y.
  - `39019959937`: semantic lint.
  - `39020035137`: typecheck do Vite/plugin duplicate.
  - Preview React đầu phát hiện migration Service Worker có nguy cơ reload-loop; sửa ở `978efd735570ca53bc900e93ca73411b79a251de` bằng cách không đăng ký migration worker trên client mới.
- CSS canonical: `site/styles.css` và `apps/web/src/styles.css` cùng blob SHA `b57434334cd5cfe9530cecab348fbcd5fd563834`.
- Final pre-merge CI `39020854958`: success lint/typecheck/unit/build.
- Post-merge CI `39020899697`: completed success trên `stagesign`.
- Production React deployment: `e8a73da3-dea2-442d-b399-c9bb2164e090`, build + deploy success từ đúng merge SHA.
- Stable production desktop 1440: `landing-shell`, `brand-panel`, `login-panel`, `login-card`, `hero-copy` đều có x/y/w/h khớp chính xác baseline static; hero/login/welcome đúng; hashed `/assets/index-*.js` có mặt; `Process Authoring` không có.
- Stable production mobile 360: cùng 5/5 layout metrics khớp chính xác baseline; mobile submit login prototype → dashboard pass.
- Login hiện vẫn là SAMPLE prototype, không phải authentication thật.

## Technical foundation đã có
- TypeScript workspace root.
- `packages/contracts` + `packages/application`.
- Thin adapters `apps/api-node` + `apps/api-cloudflare`.
- Shared health route contract `/api/v1/health`.
- StageSign CI: lint/typecheck/unit/build.
- React/Vite web shell giữ nguyên visual baseline G0-01.

## Không được suy diễn
- Auth thật, permission, D1/R2/Postgres/S3 chưa được triển khai.
- Không gọi prototype login là auth production.
- Không đưa Process Authoring cũ trở lại baseline nếu owner chưa quyết định.
- Task tiếp theo phải là task riêng, branch `stagesign-<task>`, có acceptance/evidence riêng trước khi code/merge.

## Bước tiếp theo
Chờ owner duyệt task tiếp theo. Không tự mở rộng G0-02B sau khi đã verified.
