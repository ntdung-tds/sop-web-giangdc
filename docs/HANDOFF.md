# HANDOFF

## Trạng thái
G0-01 đã verified. G0-02 đang thực hiện trên branch `g0/technical-foundation`.

## Mục tiêu G0-02
- Monorepo TypeScript.
- React web shell.
- Shared contracts/application.
- Node + Cloudflare API adapters.
- `/api/v1/health`.
- CI lint/typecheck/test/build.
- GitHub Pages deploy từ web app thật.

## Ràng buộc
- Không đưa secret/dữ liệu thật lên public repo.
- Không triển khai nghiệp vụ OPEN chưa khóa.
- Runtime adapters không chứa business rules.
- Chưa thêm D1/Postgres/R2/S3 trước khi có persistence/storage contract tương ứng.

## Bước tiếp theo
Chạy CI + Pages trên PR. Nếu xanh: merge, smoke check, cập nhật PROGRESS/HANDOFF và đóng G0-02.
