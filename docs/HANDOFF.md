# HANDOFF

## Trạng thái
G0-01 và G0-02 đã verified. Cloudflare test channel CF-01 đã verified. G1 đã khóa scope, common Execution data, self-approval SOD và fixture source; severity approval mapping vẫn OPEN. PA-01 Process Authoring core đã verified.

## PA-01 đã hoàn thành
- Domain/application test-first cho Process + initial DRAFT, next DRAFT deep copy và Step structural editing trong DRAFT.
- AC-01: nhiều Process độc lập.
- BR-001 application boundary: trùng Process code bị từ chối; DB unique chờ persistence.
- PRC-009 core subset: owner, >=1 step, sequence liên tục, step title, >=1 BusinessRole, change summary.
- UI SAMPLE dùng đúng 11 bước nguồn “Xuất hàng đến đại lý”, có reorder và read-only linear preview.
- Không tự gán BusinessRole/evidence/document chưa được xác nhận.

## Evidence PA-01
- Red run `39010789658`: 5 test PA-01 fail có chủ đích trên stubs.
- Fix history: `39011069824` accessibility lint fail; `39011136238` TypeScript narrowing fail.
- Green CI `39011213520`: lint/typecheck/unit/build success.
- PR #4 merged tại `991f092215fe7faaf49de24719f60d0df2ced8df`.
- GitHub Pages `39011262184`: success tại `https://ntdung-tds.github.io/sop-web-giangdc/`.

## Cloudflare test channel
- Project: `giangdc-sop-demo`.
- Production URL: `https://giangdc-sop-demo.pages.dev/`.
- Source: GitHub `ntdung-tds/sop-web-giangdc`, production branch `main`.
- Node pin `22.23.3`; build `npm run build -w @sop/web`; output `apps/web/dist`.
- PR #5 CI `39012157065` xanh; merge `db1c981c65912ab755c958081e4ac00724172a9d`.
- Production deployment `0b14fa1f-c483-43c9-8994-f032067cede0`: clone/build/deploy success.
- Browser Rendering desktop: không horizontal overflow, đủ 11 bước, `.appShell` render, SAMPLE đúng, `Gửi thẩm định` disabled.
- Browser Rendering mobile 360px: accessibility tree tải đủ nội dung/controls.
- Interaction 1024px: thao tác reorder bước 1 xuống đổi đúng thứ tự (`swapped=true`).
- Một lần Browser Rendering burst gặp rate-limit `2001`; rerun tuần tự thành công, không phải lỗi ứng dụng.

## Không được hiểu quá phạm vi
- PRC-002 chưa làm.
- PRC-006..008 chưa làm; do đó PRC-009 **chưa hoàn tất toàn bộ**.
- Persistence/API/auth chưa thuộc PA-01.
- BPMN/parallel vẫn DEFERRED.
- G1 vẫn chưa đóng toàn gate do `severity -> required_approval_level` chưa được owner khóa.
- Cloudflare Pages hiện là kênh test frontend; chưa đồng nghĩa backend Cloudflare/D1/R2 đã hoàn tất.

## Bước tiếp theo đã chuẩn bị
**PA-01B — Process catalog/search (PRC-002)**:
- search mã hoặc tên;
- filter group/owner/status/unit;
- tests trước implementation;
- application query model độc lập persistence;
- UI responsive trên cả GitHub Pages và Cloudflare Pages;
- SAMPLE-only, không invent dữ liệu nghiệp vụ để lấp giao diện.

Cloudflare sẽ tiếp tục được dùng làm kênh test độc lập; sau mỗi thay đổi UI/frontend quan trọng phải có CI xanh, deploy Cloudflare và smoke test thực tế trước khi đánh verified.
