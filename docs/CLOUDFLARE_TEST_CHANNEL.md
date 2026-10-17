# Cloudflare test channel

Cập nhật: 17/10/2026

## Mục tiêu
Dùng Cloudflare Pages làm kênh kiểm thử độc lập với GitHub Pages. GitHub Pages tiếp tục là kênh đối chiếu giao diện; Cloudflare Pages là kênh build/deploy từ GitHub và smoke test trên hạ tầng Cloudflare.

## Project
- Cloudflare Pages project: `giangdc-sop-demo`
- Production branch: `main`
- Production URL: `https://giangdc-sop-demo.pages.dev/`
- Source: GitHub `ntdung-tds/sop-web-giangdc`
- Preview deployment: bật cho branch/PR.
- Docs-only path được exclude khỏi auto deploy để tránh build không cần thiết.

## Build contract
- Build image: Pages v3.
- Node pin: `.node-version` = `22.23.3`.
- Build command: `npm run build -w @sop/web`.
- Output directory: `apps/web/dist`.
- Root directory: repository root.

## Test gate
Một deployment chỉ được dùng làm bằng chứng khi:
1. clone/build/deploy của Cloudflare đều success;
2. browser smoke load được `.appShell`;
3. DOM có fixture `Xuất hàng đến đại lý`, marker `SAMPLE`, và 11 bước;
4. nút `Gửi thẩm định` vẫn disabled khi role/evidence/document chưa chốt;
5. kiểm tra responsive/a11y tối thiểu có viewport mobile;
6. interaction quan trọng của prototype đang test phải chạy thực tế;
7. không biến dữ liệu SAMPLE thành production data.

## Evidence 17/10/2026
- PR #5: Cloudflare test channel; CI `39012157065` success.
- Merge commit: `db1c981c65912ab755c958081e4ac00724172a9d`.
- Preview deployment: `42919dcc-1b9b-4c2a-8dbf-d673cf115279` — clone/build/deploy success.
- Production deployment: `0b14fa1f-c483-43c9-8994-f032067cede0` — clone/build/deploy success.
- Build logs xác nhận Node `22.23.3`, Vite `7.1.9`, 31 modules transformed, assets publish success.
- Browser Rendering desktop 1440px: `overflow=false`, `.appShell=yes`, `steps=11`, `submitDisabled=true`, fixture và SAMPLE đúng.
- Browser Rendering mobile 360px: accessibility tree render đầy đủ fixture, readonly fields và step controls.
- Browser Rendering interaction 1024px: click nút đưa bước đầu xuống làm hoán đổi đúng bước 1/2 (`swapped=true`).
- Một request Browser Rendering dạng burst gặp Cloudflare rate-limit `2001`; chạy tuần tự lại thành công. Đây là giới hạn test API, không phải lỗi ứng dụng.

## Guardrails
- Không commit secret hoặc dữ liệu thật vào repo public.
- Không coi Pages preview là production backend.
- G1 severity approval mapping vẫn OPEN cho tới khi Process Owner chốt.
- Test Cloudflare không thay thế CI; lint/typecheck/unit/build vẫn là quality gate bắt buộc.
- Cloudflare Pages hiện chỉ xác nhận frontend channel; D1/R2/Workers backend sẽ được kiểm tra ở task riêng khi tới phạm vi.
