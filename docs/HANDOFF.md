# HANDOFF

## Trạng thái
G0-01 và G0-02 đã verified. G1 đã khóa scope, common Execution data, self-approval SOD và fixture source; severity approval mapping vẫn OPEN. PA-01 Process Authoring core đã verified.

## PA-01 đã hoàn thành
- Domain/application test-first cho Process + initial DRAFT, next DRAFT deep copy và Step structural editing trong DRAFT.
- AC-01: nhiều Process độc lập.
- BR-001 application boundary: trùng Process code bị từ chối; DB unique chờ persistence.
- PRC-009 core subset: owner, >=1 step, sequence liên tục, step title, >=1 BusinessRole, change summary.
- UI SAMPLE dùng đúng 11 bước nguồn “Xuất hàng đến đại lý”, có reorder và read-only linear preview.
- Không tự gán BusinessRole/evidence/document chưa được xác nhận.

## Evidence
- Red run `39010789658`: 5 test PA-01 fail có chủ đích trên stubs.
- Fix history: `39011069824` accessibility lint fail; `39011136238` TypeScript narrowing fail.
- Green CI `39011213520`: lint/typecheck/unit/build success.
- PR #4 merged tại `991f092215fe7faaf49de24719f60d0df2ced8df`.
- Pages `39011262184`: success tại `https://ntdung-tds.github.io/sop-web-giangdc/`.

## Không được hiểu quá phạm vi
- PRC-002 chưa làm.
- PRC-006..008 chưa làm; do đó PRC-009 **chưa hoàn tất toàn bộ**.
- Persistence/API/auth chưa thuộc PA-01.
- BPMN/parallel vẫn DEFERRED.
- G1 vẫn chưa đóng toàn gate do `severity -> required_approval_level` chưa được owner khóa.

## Bước tiếp theo đã chuẩn bị
**PA-01B — Process catalog/search (PRC-002)**:
- search mã hoặc tên;
- filter group/owner/status/unit;
- tests trước implementation;
- application query model độc lập persistence;
- UI responsive trên Pages;
- SAMPLE-only, không invent dữ liệu nghiệp vụ để lấp giao diện.

Chỉ bắt đầu PA-01B khi owner tiếp tục chấp thuận task kế tiếp.
