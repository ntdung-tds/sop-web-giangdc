# TASKS

| ID | Task | Status | Acceptance/evidence |
|---|---|---|---|
| G0-01A | Xác định repo SOP | verified | `ntdung-tds/sop-web-giangdc` |
| G0-01B | Luồng StageSign cô lập | verified | `stagesign` + Cloudflare project riêng |
| G0-01C | Bộ file điều hành | verified | AGENTS/SPEC/PLAN/TASKS/PROGRESS/DECISIONS/HANDOFF |
| G0-01D | Visibility | verified | Chủ dự án chốt giữ public |
| G0-01E | Prototype UI | verified | Chủ dự án xác nhận đúng landing/login/dashboard G0-01 |
| G0-01F | StageSign Pages | verified | `https://sopweb-giangdc-stagesign.pages.dev/` chạy đúng baseline |
| G0-02A | Non-visual technical foundation | verified | PR #10; RED→GREEN CI; production smoke pass |
| G0-02B | Migrate baseline UI sang React/Vite | verified | PR #11; CSS exact baseline; post-merge CI `39020899697`; production deploy `e8a73da3-dea2-442d-b399-c9bb2164e090`; stable desktop/mobile parity + mobile login flow pass |
| G0-03A | Authentication domain + security invariants | preview-verified | PR #13; RED CI `39023986131`; final CI `39025297057`; 16/16 tests; PBKDF2/session/lockout/force-change/CSRF |
| G0-03B | Generic authorization foundation | preview-verified | system-role grant + scope + persisted catalog lookup; no production permission seed; negative scope/catalog tests |
| G0-03C | Cloudflare D1 auth persistence | preview-verified | separate preview/prod D1; migrations `0001` + `0002`; direct counts users=0, roles=0, role_permissions=0 |
| G0-03D | Login UI → real auth flow | preview-verified | approved G0-01 visual language retained; real login/session/force-change/logout wiring; preview deploy `0bab18ea-521e-41c2-893d-2d36402e400d` |
| G0-03E | Production promotion | blocked-safe | Không merge khi chưa có secure account provisioning; production `stagesign` giữ G0-02B để không làm mất đường vào demo/review |
