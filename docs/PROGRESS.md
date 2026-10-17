# PROGRESS

Cập nhật: 17/10/2026

| Task | Trạng thái | Tiêu chí | Bằng chứng | Tiếp theo |
|---|---|---|---|---|
| G0-01A Repo | verified | Repo chính xác | GitHub repo `sop-web-giangdc` | Giữ làm source chính |
| G0-01B Branch | verified | Branch cô lập | `g0/project-foundation` đã merge qua PR #1 | Dùng branch theo task tiếp theo |
| G0-01C Bộ file điều hành | verified | Có AGENTS/SPEC/PLAN/TASKS/PROGRESS/DECISIONS/HANDOFF | Đã merge vào `main` | Duy trì sau mỗi mốc |
| G0-01D Visibility | verified | Chủ dự án quyết định | Quyết định: giữ public | Không chứa secret |
| G0-01E UI prototype | done | ONB desktop/mobile | `site/` đã merge vào `main`; GitHub Pages đã deploy | Chủ dự án kiểm tra trực quan; sau đó polish responsive nếu cần |
| G0-01F Pages | verified | URL truy cập công khai | Actions run #39009037512 = success; deployment URL `https://ntdung-tds.github.io/sop-web-giangdc/` | Duy trì workflow; artifact đã tách theo `run_attempt` để rerun an toàn |

Ghi chú: run #39006538028 sau khi bật Pages đã qua Configure/Upload nhưng fail vì có 2 artifact cùng tên do rerun cùng workflow run. Workflow đã được vá để artifact unique theo `github.run_attempt`; run #39009037512 deploy thành công.

Không dùng phần trăm cảm tính. Chỉ `verified` sau khi có bằng chứng.