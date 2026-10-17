# PLAN

## G0-01 — Foundation + UI inspection
Trạng thái: verified.

## G0-02 — Technical foundation
1. Tạo TypeScript monorepo và package boundaries.
2. Tạo shared contracts + application layer độc lập runtime.
3. Tạo Node API adapter và Cloudflare API adapter với `/api/v1/health`.
4. Tạo React web shell thật và dùng GitHub Pages để kiểm tra giao diện.
5. Bật lint/typecheck/unit/build trong CI.
6. Chỉ đóng G0-02 khi CI xanh, Pages xanh và evidence được ghi vào PROGRESS/HANDOFF.

## Sau G0-02
Chuyển sang G1 business lock: scope, role/SOD, common data và UAT fixture. Không triển khai nghiệp vụ còn OPEN trước khi có quyết định hoặc default hợp lệ theo SRS.
