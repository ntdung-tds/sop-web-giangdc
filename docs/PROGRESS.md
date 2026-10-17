# PROGRESS

Cập nhật: 17/10/2026

| Task | Trạng thái | Tiêu chí | Bằng chứng | Tiếp theo |
|---|---|---|---|---|
| G0-01 Repo/visibility | verified | Repo đúng, public theo quyết định owner | `ntdung-tds/sop-web-giangdc` | Không chứa secret |
| G0-01 UI baseline | verified | Landing/login/dashboard đúng bản owner duyệt | G0-01 tree; owner xác nhận 17/10/2026 | Freeze visual baseline |
| G0-01 StageSign channel | verified | Project/branch riêng, URL thật hoạt động | `sopweb-giangdc-stagesign.pages.dev`, branch `stagesign` | Chỉ promote từ StageSign task branch |
| G0-02A technical foundation | verified | lint/typecheck/unit/build xanh; UI không đổi | PR #10; CI + production smoke | Đóng G0-02A |
| G0-02B React migration | verified | Không redesign; CSS exact baseline; CI xanh; preview và production desktop/mobile parity + interaction pass | PR #11; post-merge CI `39020899697`; production deploy `e8a73da3-dea2-442d-b399-c9bb2164e090` | Đóng G0-02B |
| G0-03 auth foundation | preview-verified | salted PBKDF2; opaque session; CSRF; lockout/source throttle; force-change; catalog-backed authz | PR #13; RED `39023986131`; CI `39025297057` | Chưa promote production |
| G0-03 permission guardrail | preview-verified | Không hard-code/seed permission production; system-role khác BusinessRole | ADR-0002 + negative tests | Chốt catalog production trước G2 |
| G0-03F test-first bootstrap | preview-verified | first-user bootstrap, singleton guard, no role seed, force-change | PR #14; initial RED `39026007765`; first GREEN `39026201868` | Đã security-review tiếp |
| G0-03F route concealment | verified | Không lộ bootstrap route/method nếu không có secret | security RED `39026516082`; final GREEN `39026592467`; 22/22 tests | Đóng code gate G0-03F |
| G0-03F Cloudflare preview | verified | Functions + D1 preview chạy thật; landing/session/bootstrap negative live smoke | final deploy `d0efd6de-365d-4d96-a0f2-6b8a3506ec07`; unauth session 200; bootstrap unauth 404 | Chờ credential takeover |
| G0-03F reviewer identity | provisioned-awaiting-owner | exactly 1 preview user; force-change; roles rỗng; hash PBKDF2; plaintext không nằm trong repo/DB/config | `stage.reviewer`; preview D1 `af796076-60a4-4520-8698-0cc2927c8237` | Owner đăng nhập + đổi mật khẩu |
| G0-03F production isolation | verified | Không provision production trong task này | prod users=0, roles=0, role_permissions=0; `0003` chưa áp dụng production | Giữ production ổn định |
| G0-03/G0-03F promotion | blocked-safe | Không merge/promote trước khi owner chiếm quyền credential và authenticated smoke đạt | PR #13/#14 còn mở/draft | Owner takeover → authenticated smoke → merge stack |

Ghi chú: connector Cloudflare chặn thao tác ghi encrypted secret `SOP_BOOTSTRAP_TOKEN`; không hạ chuẩn sang plaintext env. StageSign preview được provision bằng password hash tạo cục bộ, không đưa plaintext vào GitHub, Cloudflare config hoặc D1. Evidence chi tiết: `docs/traceability/G0-03F-secure-bootstrap.md`.
