# PROGRESS

Cập nhật: 17/10/2026

| Task | Trạng thái | Tiêu chí | Bằng chứng | Tiếp theo |
|---|---|---|---|---|
| G0-01 Repo/visibility | verified | Repo đúng, public theo quyết định owner | `ntdung-tds/sop-web-giangdc` | Không chứa secret |
| G0-01 UI baseline | verified | Landing/login/dashboard đúng bản owner duyệt | G0-01 tree; owner xác nhận ngày 17/10/2026 | Freeze visual baseline |
| G0-01 StageSign channel | verified | Project/branch riêng, URL thật hoạt động | `sopweb-giangdc-stagesign.pages.dev`, branch `stagesign` | Chỉ promote từ StageSign task branch |
| G0-02A RED test | verified | Test tồn tại trước implementation và fail đúng lý do | CI `39018871211`: TypeScript fail vì thiếu `@sop/application` | Đã chuyển GREEN |
| G0-02A technical foundation | verified | lint/typecheck/unit/build xanh; site không đổi; preview + production smoke | PR #10; pre-merge CI `39019111644`; post-merge CI `39019154024`; production deploy `22f3ffae-5ad0-47cb-a704-08dfd43ca336`; production desktop browser pass | Đóng G0-02A |
| G0-02B UI framework migration | pending | Không redesign; visual parity desktop/mobile | Chưa bắt đầu | Chỉ làm task riêng khi owner cho tiếp tục |

Ghi chú kiểm chứng: preview mobile 360 đã pass thao tác login → dashboard. Production desktop browser smoke pass. Một lần lặp mobile Browser Rendering trên production gặp Cloudflare API rate limit `2001`; không coi đây là lỗi ứng dụng vì `site/**` không thay đổi giữa preview và production.
