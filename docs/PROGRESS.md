# PROGRESS

Cập nhật: 17/10/2026

| Task | Trạng thái | Tiêu chí | Bằng chứng | Tiếp theo |
|---|---|---|---|---|
| G0-01 Repo/visibility | verified | Repo đúng, public theo quyết định owner | `ntdung-tds/sop-web-giangdc` | Không chứa secret |
| G0-01 UI baseline | verified | Landing/login/dashboard đúng bản owner duyệt | G0-01 tree; owner xác nhận 17/10/2026 | Freeze visual baseline |
| G0-01 StageSign channel | verified | Project/branch riêng, URL thật hoạt động | `sopweb-giangdc-stagesign.pages.dev`, branch `stagesign` | Chỉ promote từ StageSign task branch |
| G0-02A technical foundation | verified | lint/typecheck/unit/build xanh; UI không đổi | PR #10; CI + production smoke | Đóng G0-02A |
| G0-02B RED test | verified | Test baseline tồn tại trước implementation và fail đúng lý do | CI `39019731870` thiếu `uiState.ts` | Đã chuyển GREEN |
| G0-02B React migration | verified | Không redesign; CSS exact baseline; CI xanh; preview và production desktop/mobile parity + interaction pass | PR #11 merge `5e6a2ba169ac6f958a6f45b75a37bc05980b00c2`; post-merge CI `39020899697` success; production deploy `e8a73da3-dea2-442d-b399-c9bb2164e090` success | Đóng G0-02B |
| G0-03 auth test-first | preview-verified | RED trước implementation; final CI lint/typecheck/unit/build xanh | RED `39023986131`; final `39025297057`; 4 test files / 16 tests pass | Giữ evidence trong `docs/traceability/G0-03-authentication-foundation.md` |
| G0-03 authentication/session | preview-verified | salted PBKDF2; opaque server session; CSRF; generic error; lockout/source throttle; force-change; revoke/expiry | PR #13; unit + HTTP negative/security tests | Không mở rộng sang MFA/SSO/recovery |
| G0-03 authorization foundation | preview-verified | Backend quyết định quyền theo system-role grant + scope + persisted catalog; force-change không có business permission | catalog generic; test wrong-scope/ungranted; ADR-0002 | Chốt catalog production trước G2, không tự seed permission |
| G0-03 Cloudflare persistence | preview-verified | D1 preview/prod riêng; schema auth + permission catalog có mặt; không có seed bí mật | preview D1 `af796076-60a4-4520-8698-0cc2927c8237`; prod D1 `87302ca0-e352-4344-aafe-f143805cbe85`; users=0/roles=0/role_permissions=0 cả hai | Chỉ provision qua luồng bảo mật |
| G0-03 UI integration | preview-verified | Login prototype chuyển sang auth thật, giữ visual language G0-01; force-change/logout có UI | preview deploy `0bab18ea-521e-41c2-893d-2d36402e400d`; Functions enabled + preview D1 binding đúng | Chưa promote production |
| G0-03 production promotion | blocked-safe | Không được làm stable reviewer path mất khả dụng | production vẫn ở `4d7cc037a0ec3ac9a1954a7b547d5b699f30c658`; chưa có account được provision an toàn | Provision account/catal​og đúng quyền rồi mới merge/promote |

Known failed attempts được giữ làm evidence. G0-03 live GET/POST smoke từ môi trường review hiện không thực hiện được do công cụ không resolve hostname preview; không tính đây là pass. CI HTTP-handler tests + Cloudflare deploy/D1 evidence là bằng chứng hiện tại.
