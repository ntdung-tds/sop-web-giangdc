# SPEC anchor

**Canonical source:** `SOP_SPEC_v1.5_FINAL_REV10.docx` do chủ dự án cung cấp ngày 17/10/2026. File này không thay thế artifact gốc; chỉ là neo vận hành cho repository.

## Baseline cần giữ
- Website responsive PWA, desktop và mobile đều đầy đủ nghiệp vụ theo quyền.
- Nhiều quy trình, phiên bản bất biến sau phát hành, Execution giữ đúng snapshot version lúc tạo.
- MVP không BPMN designer, SSO, MFA/2FA, offline sâu, app native.
- Backend + DB + account/permission là bắt buộc; UI không phải nguồn quyết định quyền.
- Demo: Cloudflare Pages/Workers/D1/R2. Production: VPS/Docker Compose/PostgreSQL/S3-compatible.
- Execution/Step/Exception semantics theo Rev.10 là FROZEN.
- Process Authoring theo PRC-001..011; PRC-012 BPMN/nhánh song song là DEFERRED.

## Quyết định G1 đã chốt
- `OPEN-SCOPE-01`: MVP dùng một OrgUnit gốc + scope tối thiểu; backend cưỡng chế scope, cấu trúc có thể mở rộng theo cây sau này.
- `OPEN-DATA-01`: Execution dùng dữ liệu chung tối thiểu `execution_no`, process/version, scope, assignee và `due_at`; assignment chuẩn nằm ở `ExecutionAssignment`.
- `OPEN-SOD-01` phần self-approval: cấm tự phê duyệt ProcessVersion do chính actor soạn/chỉnh.
- Fixture “Xuất hàng đến đại lý”: dùng đúng 11 bước nguồn làm SAMPLE; không tự biến cấu hình đề xuất thành evidence/role/document bắt buộc.

## G1 còn mở
- `OPEN-SOD-01`: bảng `severity -> required_approval_level` chưa được chủ dự án khóa chính thức. Fallback SRS chỉ được dùng cho prototype: BLOCKING cần Giám sát + người có quyền Phê duyệt; mức còn lại do Giám sát xử lý trong phạm vi.
- Vì vậy chưa được đánh dấu G1 = verified toàn gate.

## OPEN theo các gate sau
- G2: auth policy, brand, file policy; mapping permission -> SystemRole phải khóa trước G2.
- G3: Cloudflare resources, UAT matrix/browser, performance, report và `OPEN-SAMPLE-01` cho vai trò/giấy tờ/evidence chính thức.
- G4: VPS/ops, retention, SLA.

## Quy tắc triển khai khi G1 chưa đóng hoàn toàn
Được tiếp tục phần độc lập với SOD severity, ví dụ Process Authoring core, contract/schema, validation draft và UI SAMPLE. Không triển khai logic approval ngoại lệ phụ thuộc severity như quyết định production cho đến khi owner khóa phần còn lại.
