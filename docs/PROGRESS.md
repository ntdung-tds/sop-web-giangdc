# PROGRESS

Cập nhật: 17/10/2026

| Task | Trạng thái | Tiêu chí | Bằng chứng | Tiếp theo |
|---|---|---|---|---|
| G0-01 | verified | Repo, source-of-truth, Pages và UI shell đã được kiểm tra | PR #1 + Pages workflow success + chủ dự án cho phép chuyển bước | Giữ ổn định |
| G0-02A Monorepo | verified | TypeScript monorepo có package boundaries | PR #2 merged, npm workspaces: `apps/*`, `packages/*` | Giữ boundary |
| G0-02B Contracts/Application | verified | Shared contract + runtime-independent application service | `packages/contracts`, `packages/application`; unit test pass | Mở rộng theo requirement IDs |
| G0-02C API adapters | verified | Node + Cloudflare cùng dùng application layer | `apps/api-node`, `apps/api-cloudflare`; build pass | Chưa thêm business rules vào adapter |
| G0-02D Web | verified | React/Vite web shell build và deploy | Pages run #39009983993 success | Tiếp tục dùng Pages để review UI |
| G0-02E CI | verified | lint/typecheck/test/build | PR CI run #39009918837 success | Duy trì bắt buộc cho PR |
| G0-02F Evidence | verified | Failure/fix history + CI + Pages + handoff | PR #2 comment ghi failure lint đầu tiên và bản sửa; PR #2 merged | Chuyển G1 |

## G0-02 result
- PR: #2 `G0-02: technical foundation`.
- Merge commit: `fb67489c3cdc178cc4e371d9dfde2fc37e57e70d`.
- CI xanh: run `39009918837`.
- Pages xanh: run `39009983993`.
- URL giao diện: `https://ntdung-tds.github.io/sop-web-giangdc/`.

Chỉ `verified` khi có bằng chứng chạy thật.
