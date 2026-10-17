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

## D-004 — StageSign visual baseline và kênh triển khai
- Ngày: 17/10/2026
- Chủ dự án xác nhận giao diện G0-01 `landing + Đăng nhập nội bộ + dashboard SAMPLE` là baseline giao diện đúng.
- Cloudflare Pages chuẩn của luồng này: `sopweb-giangdc-stagesign`.
- Production branch của kênh này: `stagesign`; task branch dùng tiền tố `stagesign-`.
- Không dùng `giangdc-sop-demo` làm bằng chứng hoặc production cho luồng StageSign.
- Không được thay thế baseline UI trong một task kỹ thuật không có phạm vi UI. Mọi migration framework/UI phải là task riêng và có bằng chứng visual parity trước khi promote.
