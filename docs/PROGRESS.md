# PROGRESS

Cập nhật: 17/10/2026

| Task | Trạng thái | Tiêu chí | Bằng chứng | Tiếp theo |
|---|---|---|---|---|
| G0-01 Repo/visibility | verified | Repo đúng, public theo quyết định owner | `ntdung-tds/sop-web-giangdc` | Không chứa secret |
| G0-01 UI baseline | verified | Landing/login/dashboard đúng bản owner duyệt | G0-01 tree; owner xác nhận ngày 17/10/2026 | Freeze visual baseline |
| G0-01 StageSign channel | verified | Project/branch riêng, URL thật hoạt động | `sopweb-giangdc-stagesign.pages.dev`, branch `stagesign` | Chỉ promote từ StageSign task branch |
| G0-02A RED test | verified | Test tồn tại trước implementation và fail đúng lý do | CI `39018871211`: TypeScript fail vì thiếu `@sop/application` | Đã chuyển GREEN |
| G0-02A technical foundation | done | lint/typecheck/unit/build xanh; site không đổi; preview smoke desktop/mobile | CI `39018950247` success; preview `a8079b7a...`; login transition mobile pass; diff không có `site/**` | Merge PR #10 rồi production verify |
| G0-02B UI framework migration | pending | Không redesign; visual parity desktop/mobile | Chưa bắt đầu | Chỉ làm task riêng |

Quy tắc: `done` chưa đồng nghĩa `verified`. G0-02A chỉ chuyển `verified` sau merge vào `stagesign`, production deploy thành công và browser smoke trên URL production.
