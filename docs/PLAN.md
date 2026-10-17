# PLAN

## G0-01 — Foundation + UI inspection
Trạng thái: verified.

## G0-02 — Technical foundation
Trạng thái: verified.

Đã hoàn thành TypeScript monorepo, shared contracts/application, Node + Cloudflare adapters, `/api/v1/health`, React/Vite web shell, CI lint/typecheck/unit/build và GitHub Pages deploy từ web app thật.

## G1 — Business lock
### Đã khóa
1. G1-01 — `OPEN-SCOPE-01`: một OrgUnit gốc + scope tối thiểu cho MVP.
2. G1-02 — `OPEN-DATA-01`: dữ liệu Execution chung tối thiểu.
3. G1-03A — SOD: cấm tự phê duyệt ProcessVersion do chính actor soạn/chỉnh.
4. G1-04 — Fixture source: duyệt chuỗi 11 bước “Xuất hàng đến đại lý” làm SAMPLE source-only.

### Còn mở
- G1-03B — `severity -> required_approval_level` thuộc OPEN-SOD-01 chưa được owner khóa. G1 chưa được đóng toàn gate.
- Fallback SRS chỉ dùng cho prototype, không coi là quyết định production.

## Phần được phép tiếp tục độc lập
### PA-01 — Process Authoring core
1. Cập nhật contract/domain cho Process, ProcessVersion DRAFT và Step.
2. Viết test cho AC-01 và draft validation trước implementation.
3. Triển khai PRC-001..005 và PRC-009 ở domain/application; chưa persistence thật.
4. Dựng UI SAMPLE: danh sách quy trình + editor bản nháp + reorder tuyến tính + preview read-only.
5. Chạy lint/typecheck/unit/build, merge qua PR, deploy Pages và review giao diện.

### PA-02 — Versioning/Governance
Chỉ bắt đầu sau PA-01 verified; bám AC-02/GOV-001..007 và không dùng severity approval chưa khóa cho exception governance.

Không triển khai BPMN/parallel (PRC-012 DEFERRED), không thêm evidence/document/role bắt buộc ngoài nguồn fixture đã xác nhận.
