# DECISIONS

## D-001 — Baseline SRS
- Ngày: 17/10/2026
- Quyết định: dùng `SOP_SPEC_v1.5_FINAL_REV10` làm baseline; execution semantics FROZEN.

## D-002 — Repository visibility
- Ngày: 17/10/2026
- Chủ dự án: giữ repository `ntdung-tds/sop-web-giangdc` ở trạng thái **public**.
- Hệ quả: tuyệt đối không commit secret, credential, dữ liệu thật hay file nội bộ chưa được phép công khai.

## D-003 — GitHub Pages cho review UI
- Ngày: 17/10/2026
- Dùng GitHub Pages để chủ dự án kiểm tra giao diện sớm.
- Trang Pages ở giai đoạn này là prototype SAMPLE, không đại diện auth/backend production.

## D-004 — OPEN-SCOPE-01 / organizational scope cho MVP
- Ngày: 17/10/2026
- Chủ dự án chấp thuận đường cơ sở **một OrgUnit gốc + scope tối thiểu** cho MVP.
- Không khóa cứng tên/mã đơn vị nghiệp vụ trong code; seed/demo dùng dữ liệu SAMPLE.
- Mô hình vẫn giữ `parent_id`/khả năng mở rộng cây đơn vị sau này mà không đổi nghĩa `scope_id`.
- Backend là nguồn quyết định scope; không tin `scope_id` do client gửi nếu actor không có assignment hợp lệ.

## D-005 — OPEN-DATA-01 / dữ liệu chung tối thiểu của Execution
- Ngày: 17/10/2026
- Dữ liệu chung tối thiểu được chốt theo SRS: `execution_no`, process/process version, scope, assignee và `due_at`.
- Nguồn phân công chuẩn vẫn là `ExecutionAssignment`; `Execution.assignee_id` nếu có chỉ là nullable shortcut/dẫn xuất, không thay thế lịch sử phân công.
- Không tự thêm trường nghiệp vụ riêng của từng quy trình vào bảng Execution chung; dữ liệu chuyên biệt đi qua form/binding/version tương ứng.

## D-006 — OPEN-SOD-01 / phần đã được chủ dự án chốt
- Ngày: 17/10/2026
- **Cấm actor tự phê duyệt ProcessVersion do chính actor soạn/chỉnh.**
- Không tự suy diễn thêm các quy tắc separation-of-duties phức tạp khi chưa có quyết định.
- Phần `severity -> required_approval_level` của OPEN-SOD-01 **chưa được khóa chính thức**. Khi cần prototype, chỉ được dùng fallback đã ghi trong SRS: BLOCKING cần Giám sát + người có quyền Phê duyệt; mức còn lại do Giám sát xử lý trong phạm vi.
- Vì còn phần severity chưa được owner phê duyệt, **G1 chưa được coi là đóng hoàn toàn**.

## D-007 — Fixture UAT/SAMPLE “Xuất hàng đến đại lý”
- Ngày: 17/10/2026
- Chấp thuận dùng đúng chuỗi **11 bước từ nội dung nguồn trong SRS Rev.10** làm fixture SAMPLE để phát triển/kiểm thử sớm.
- Không tự thêm vai trò, bằng chứng bắt buộc, giấy tờ bắt buộc hoặc tích hợp email từ bảng “cấu hình đề xuất” khi chưa được xác nhận.
- Seed chỉ chạy ở demo/UAT và phải gắn nhãn SAMPLE; không tự chạy production.
- `OPEN-SAMPLE-01` ở G3 vẫn còn hiệu lực cho vai trò/giấy tờ/evidence chính thức của seed UAT/production.
