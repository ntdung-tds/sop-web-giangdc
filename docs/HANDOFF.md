# HANDOFF

## Trạng thái
G0-01 foundation đã merge vào `main`. Repo public theo quyết định của chủ dự án. Prototype UI đã được triển khai lên GitHub Pages và workflow deploy đã chạy thành công.

## Đã verified
- Repo chính xác: `ntdung-tds/sop-web-giangdc`.
- Branch foundation đã tạo và merge qua PR #1.
- Quyết định giữ public.
- Bộ file điều hành đã có trên `main`.
- GitHub Pages deploy thành công ở run #39009037512.
- URL demo: `https://ntdung-tds.github.io/sop-web-giangdc/`.

## Còn dở
- Chủ dự án kiểm tra trực quan giao diện demo.
- Rà/polish responsive 360/768/1024/1280 nếu phát hiện vấn đề.
- Bắt đầu G0-02 technical foundation sau khi chốt giao diện shell hiện tại.

## Không nên làm
- Không đưa secret/dữ liệu thật lên public repo.
- Không gọi prototype là hệ thống đã hoàn thành.
- Không coi SAMPLE data là production data.

## Lưu ý kỹ thuật
Rerun workflow cũ từng sinh trùng artifact `github-pages`; workflow hiện đã dùng artifact theo `github.run_attempt` để rerun an toàn hơn.

## Bước tiếp theo
Chủ dự án xem GitHub Pages → ghi nhận chỉnh sửa UI nếu có → triển khai G0-02.