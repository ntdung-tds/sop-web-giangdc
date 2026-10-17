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

## G0-02B — DONE, CHỜ PRODUCTION VERIFY
- Branch: `stagesign-g0-02b-react-shell`; PR #11 → base `stagesign`.
- Mục tiêu: migrate chính UI G0-01 sang React/Vite, tuyệt đối không redesign.
- Test-first RED: CI `39019731870` fail đúng vì `uiState.ts` chưa tồn tại.
- Known failed attempts đã xử lý:
  - `39019880458`: lint React/a11y.
  - `39019959937`: semantic lint.
  - `39020035137`: typecheck do Vite/plugin bị duplicate.
  - React preview đầu sau đổi build config bị Browser Rendering timeout; xác định migration Service Worker tự đăng ký lại gây nguy cơ reload loop. Commit `978efd735570ca53bc900e93ca73411b79a251de` bỏ đăng ký mới từ React app; migration `sw.js` chỉ phục vụ client có registration cũ.
- GREEN CI: `39020165188`, `39020237291`, `39020578407` đều success lint/typecheck/unit/build ở các gate tương ứng.
- CSS parity: `site/styles.css` và `apps/web/src/styles.css` cùng blob SHA `b57434334cd5cfe9530cecab348fbcd5fd563834`.
- Cloudflare React preview sau fix: deployment `b2102a6b-eb58-4324-8311-4bc0420d19c8`, build command `npm run build -w @sop/web`, output `apps/web/dist`, build/deploy success.
- Desktop 1440 visual parity: 5/5 khối `landing-shell`, `brand-panel`, `login-panel`, `login-card`, `hero-copy` có x/y/w/h khớp chính xác production static.
- Mobile 360 visual parity: cùng 5/5 khối có x/y/w/h khớp chính xác production static.
- Interaction preview: mobile submit → dashboard pass; desktop login → dashboard pass và DOM cuối quay lại login sau logout.
- Preview có hashed React asset `/assets/index-*.js`; không phải static fallback cũ.
- `Process Authoring` không xuất hiện.
- Compare `stagesign` → task branch không có thay đổi `site/**`.
- Một lần Browser Rendering mobile gặp rate limit `2001` và một lần request gộp quá nhiều action timeout; test tách nhỏ sau đó pass. Không spam retry.

## Technical foundation đã có
- TypeScript workspace root.
- `packages/contracts` + `packages/application`.
- Thin adapters `apps/api-node` + `apps/api-cloudflare`.
- Shared health route contract `/api/v1/health`.
- StageSign CI: lint/typecheck/unit/build.
- React/Vite shell giữ nguyên visual baseline sau khi G0-02B được production verify.

## Không được suy diễn
- Auth thật, permission, D1/R2/Postgres/S3 chưa được triển khai.
- Login React vẫn là prototype SAMPLE; không được gọi là authentication production.
- Không đưa Process Authoring cũ trở lại baseline nếu owner chưa quyết định.

## Bước tiếp theo của đúng task
CI cuối trên PR #11 → merge vào `stagesign` → chờ Cloudflare production React deploy → smoke stable URL desktop/mobile và login flow → chỉ khi đó đổi G0-02B từ `done` sang `verified`.
