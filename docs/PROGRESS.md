# PROGRESS

Cập nhật: 17/10/2026

| Task | Trạng thái | Tiêu chí | Bằng chứng | Tiếp theo |
|---|---|---|---|---|
| G0-01 | verified | Repo, source-of-truth, Pages và UI shell đã được kiểm tra | PR #1 + Pages workflow success + chủ dự án cho phép chuyển bước | Giữ ổn định |
| G0-02A Monorepo | in_progress | TypeScript monorepo có package boundaries | Branch `g0/technical-foundation` | CI verify |
| G0-02B Contracts/Application | in_progress | Shared contract + runtime-independent application service | `packages/contracts`, `packages/application` | Unit/typecheck |
| G0-02C API adapters | in_progress | Node + Cloudflare cùng dùng application layer | `apps/api-node`, `apps/api-cloudflare` | Build |
| G0-02D Web | in_progress | React/Vite web shell responsive | `apps/web` | Pages deploy |
| G0-02E CI | in_progress | lint/typecheck/test/build | `.github/workflows/ci.yml` | Chờ workflow |
| G0-02F Evidence | pending | CI + Pages success + docs cập nhật | Chưa đủ evidence | Sau workflow |

Chỉ `verified` khi có bằng chứng chạy thật.
