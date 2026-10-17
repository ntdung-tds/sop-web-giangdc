# SPEC anchor

**Canonical source:** `SOP_SPEC_v1.5_FINAL_REV10.docx` do chủ dự án cung cấp ngày 17/10/2026. File này không thay thế artifact gốc; chỉ là neo vận hành cho repository.

## Baseline cần giữ
- Website responsive PWA, desktop và mobile đều đầy đủ nghiệp vụ theo quyền.
- Nhiều quy trình, phiên bản bất biến sau phát hành, Execution giữ đúng snapshot version lúc tạo.
- MVP không BPMN designer, SSO, MFA/2FA, offline sâu, app native.
- Backend + DB + account/permission là bắt buộc; UI không phải nguồn quyết định quyền.
- Demo: Cloudflare Pages/Workers/D1/R2. Production: VPS/Docker Compose/PostgreSQL/S3-compatible.
- Execution/Step/Exception semantics theo Rev.10 là FROZEN.

## UI contract prototype hiện tại
Prototype GitHub Pages tập trung ONB-001..011: landing + login trong first viewport, mobile one-column, desktop two-region, dashboard theo vai trò, điều hướng desktop, accessibility cơ bản. Đây chưa phải auth thật.

## OPEN cần chốt theo gate
G1: SOD, common Execution data, scope/org. G2: auth policy, brand, file policy. G3: Cloudflare resources, UAT matrix, performance, report/sample. G4: VPS/ops, retention, SLA.