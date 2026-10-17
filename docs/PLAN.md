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

## Process Authoring
### PA-01 — Core
Trạng thái: verified.

Đã có domain/application test-first cho Process + initial DRAFT, next draft copy, add/edit/copy/remove/reorder Step, BR-001 application conflict, AC-01 independence, PRC-009 core subset và UI SAMPLE/read-only linear preview. Full PRC-009 chưa được claim.

### PA-01B — Process catalog/search — task tiếp theo
1. Bám đúng PRC-002: tìm theo mã hoặc tên; lọc theo nhóm, owner, trạng thái và đơn vị.
2. Viết failing tests cho search/filter combinations và isolation trước implementation.
3. Tạo application query model/service không gắn D1/Postgres.
4. Bổ sung UI danh mục có search/filter responsive trên Pages; dữ liệu demo phải gắn SAMPLE.
5. Không triển khai persistence/API/auth trong task này; không invent process business data để làm đẹp UI.
6. Chỉ verified sau CI xanh, Pages xanh và traceability/evidence cập nhật.

### PA-01C — Requirements/policies
Sau PA-01B: PRC-006..008 và hoàn thiện PRC-009 khi contract form/document/policy tương ứng đủ căn cứ.

### PA-02 — Versioning/Governance
Sau các phần authoring cần thiết; bám AC-02/GOV-001..007. Không sử dụng severity approval chưa khóa như quyết định production.

Không triển khai BPMN/parallel (PRC-012 DEFERRED), không thêm evidence/document/role bắt buộc ngoài nguồn đã xác nhận.
