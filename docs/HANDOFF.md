# HANDOFF

## Baseline hiện tại
- UI canonical: G0-01 landing + `Đăng nhập nội bộ` + dashboard SAMPLE đã được owner xác nhận.
- Cloudflare project: `sopweb-giangdc-stagesign`.
- Production branch: `stagesign`.
- Không dùng `main` hoặc `giangdc-sop-demo` để triển khai task StageSign.

## Task đang xử lý
G0-02A — non-visual technical foundation trên branch `stagesign-g0-02a-technical-foundation`, PR #10 → `stagesign`.

## Evidence trước merge
- Test-first RED: CI `39018871211` fail đúng vì `@sop/application` chưa có.
- GREEN: CI `39018950247` success toàn bộ lint/typecheck/unit/build.
- Cloudflare preview deployment `a8079b7a-20e0-4ce9-af26-f68407e31835` success.
- Browser desktop: đúng title/login/dashboard, không có Process Authoring.
- Browser mobile 360: submit login chuyển dashboard thành công.
- Compare baseline → task head không có bất kỳ thay đổi `site/**`.

## Stop condition
Không merge nếu UI preview khác baseline hoặc CI không xanh.

## Bước tiếp theo
Merge PR #10 → kiểm tra production StageSign → browser smoke production → cập nhật G0-02A thành `verified`. Không tự bắt đầu G0-02B trong cùng task.
