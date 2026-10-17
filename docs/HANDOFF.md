# HANDOFF

## Trạng thái
G0-01 và G0-02 đã verified. Technical foundation đã merge vào `main` qua PR #2.

## Nền móng hiện có
- TypeScript monorepo bằng npm workspaces.
- React/Vite web shell đang deploy trên GitHub Pages.
- Shared `@sop/contracts` và `@sop/application`.
- Node API adapter và Cloudflare API adapter cùng dùng application layer.
- `/api/v1/health` contract.
- CI bắt buộc: lint, typecheck, unit test, build.
- ADR-0001 ghi quyết định stack foundation.

## Evidence
- PR #2 merged.
- CI PR run #39009918837: success.
- Pages run #39009983993: success.
- Failure đầu tiên: accessibility lint ở `App.tsx`; đã sửa và ghi lại trong PR comment.
- Demo: `https://ntdung-tds.github.io/sop-web-giangdc/`.

## Ràng buộc tiếp tục giữ
- Repo public: không đưa secret/dữ liệu thật lên GitHub.
- Không triển khai nghiệp vụ OPEN chưa khóa.
- Runtime adapters không chứa business rules.
- D1/Postgres/R2/S3 chỉ thêm sau khi persistence/storage contract tương ứng được chốt.

## Bước tiếp theo — G1 business lock
Khóa các quyết định chặn nghiệp vụ: organizational scope, common execution data, role/SOD và UAT fixture. Chỉ sau đó mới bắt đầu Process Authoring/Governance theo SRS.
