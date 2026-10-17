# StageSign deployment channel

Cập nhật: 17/10/2026

## Mục tiêu
Tách hoàn toàn kênh triển khai của luồng StageSign khỏi Cloudflare Pages project `giangdc-sop-demo` và khỏi các push trực tiếp vào nhánh `main`.

## Kênh chuẩn
- Cloudflare Pages project: `sopweb-giangdc-stagesign`
- Production URL: `https://sopweb-giangdc-stagesign.pages.dev/`
- Repository: `ntdung-tds/sop-web-giangdc`
- Production branch riêng: `stagesign`
- Preview branch pattern: `stagesign-*`
- Build command: `npm run build -w @sop/web`
- Output: `apps/web/dist`

## Quy tắc cách ly
1. Không dùng `giangdc-sop-demo` làm kênh StageSign nữa.
2. Không auto-deploy StageSign từ `main`.
3. Chỉ promote commit đã kiểm tra sang `stagesign`.
4. Task mới của luồng này dùng branch `stagesign-<task>`; PR đích là `stagesign`, không phải `main`, trừ khi owner quyết định gộp lại sau.
5. Không lấy deployment/preview của luồng khác làm bằng chứng cho StageSign.
6. Không commit secret hoặc dữ liệu thật vào repo public.

## Baseline khi tách
Nhánh `stagesign` được tách từ commit `2b76a577eae8f7f9d396ec034b1965515cf4bc57` để đóng băng trạng thái hiện có trước khi tiếp tục phát triển độc lập.
