# HANDOFF

## Trạng thái
G0-01 và G0-02 đã verified. G1 business lock đã chốt scope, common Execution data, self-approval SOD và fixture source content; còn một phần OPEN-SOD-01 chưa đóng.

## Quyết định mới
- D-004: một OrgUnit gốc + scope tối thiểu cho MVP; backend enforcement.
- D-005: Execution common data tối thiểu; `ExecutionAssignment` là nguồn phân công chuẩn.
- D-006: cấm tự phê duyệt ProcessVersion do chính actor soạn/chỉnh.
- D-007: chuỗi 11 bước “Xuất hàng đến đại lý” được dùng làm SAMPLE source-only.

## Việc còn mở của G1
`severity -> required_approval_level` thuộc OPEN-SOD-01 chưa được owner phê duyệt. Không được biến fallback thành quyết định production. Khi cần prototype, fallback SRS là BLOCKING cần Giám sát + người có quyền Phê duyệt; mức còn lại do Giám sát xử lý trong phạm vi.

## Việc độc lập được phép tiếp tục
PA-01 Process Authoring core không phụ thuộc severity mapping:
- PRC-001..005, PRC-009.
- AC-01 nhiều quy trình độc lập.
- Contract/domain trước UI/API.
- Test invariant trước implementation.
- UI SAMPLE trên Pages để review.
- Không BPMN/parallel; không tự thêm role/evidence/document bắt buộc.

## Ràng buộc tiếp tục giữ
- Repo public: không secret/dữ liệu thật.
- Runtime adapter không chứa business rules.
- Không gọi SAMPLE/prototype là production.
- G1 chỉ được đánh `verified` toàn gate sau khi owner khóa severity approval mapping.

## Bước tiếp theo
Sau khi PR tài liệu G1 CI xanh và merge, mở branch `g1/process-authoring-core`, triển khai PA-01, chạy CI, deploy Pages và ghi evidence.
