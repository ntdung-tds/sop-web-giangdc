# AGENTS.md

## Nguồn sự thật
1. SOP_SPEC_v1.5_FINAL_REV10 là baseline yêu cầu.
2. `docs/DECISIONS.md` ghi quyết định mới đã được chủ dự án chốt.
3. `docs/PROGRESS.md` là nguồn trạng thái duy nhất.
4. `docs/HANDOFF.md` là điểm tiếp tục của phiên sau.

## Quy tắc bắt buộc
- Mỗi task có phạm vi, ngoài phạm vi, tiêu chí nghiệm thu và bằng chứng.
- Không tự biến OPEN thành yêu cầu chính thức.
- Không sửa state machine/permission/contract đã FROZEN nếu chưa có quyết định và traceability.
- Không đưa secret, token, mật khẩu thật vào repo/chat.
- `done` = code/asset đã viết; `verified` = đã kiểm chứng bằng test/demo/link chạy.
- Prototype UI phải ghi rõ SAMPLE/DEMO, không giả là dữ liệu thật.

## Thứ tự triển khai feature
Contract/schema → test bất biến → migration/domain → API → UI → E2E/security → evidence → PROGRESS/HANDOFF.

## Stop condition
Dừng phần bị ảnh hưởng nếu gặp xung đột BASELINE, OPEN chặn gate, invariant không giữ được hoặc phát hiện lỗi S1/S2.