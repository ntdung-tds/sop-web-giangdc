# PLAN

## G0-01 — Foundation + UI inspection
1. Xác nhận repository và visibility.
2. Tạo bộ file điều hành.
3. Dựng prototype landing/login/dashboard bám SRS UX contract.
4. Deploy và smoke test trên kênh thật.
5. Chủ dự án xác nhận baseline giao diện.

Trạng thái: **verified**. Baseline giao diện được chốt tại D-004.

## G0-02 — Technical foundation
Tách thành hai task để không làm thay đổi giao diện ngoài ý muốn.

### G0-02A — Non-visual technical foundation
- TypeScript workspace.
- Shared contracts/application layer.
- Node API adapter + Cloudflare API adapter.
- `/api/v1/health` smoke contract.
- lint/typecheck/unit/build + StageSign CI.
- Không sửa `site/`, không migrate UI.

### G0-02B — UI framework migration
Pending. Chỉ thực hiện như một task riêng khi được duyệt; mục tiêu là chuyển baseline đã chốt sang web framework mà không redesign. Bắt buộc có visual parity desktop/mobile trước khi promote.
