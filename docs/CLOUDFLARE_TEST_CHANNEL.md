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
5. không biến dữ liệu SAMPLE thành production data.

## Guardrails
- Không commit secret hoặc dữ liệu thật vào repo public.
- Không coi Pages preview là production backend.
- G1 severity approval mapping vẫn OPEN cho tới khi Process Owner chốt.
- Test Cloudflare không thay thế CI; lint/typecheck/unit/build vẫn là quality gate bắt buộc.
