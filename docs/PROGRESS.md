# PROGRESS

Cập nhật: 17/10/2026

| Task | Trạng thái | Tiêu chí | Bằng chứng | Tiếp theo |
|---|---|---|---|---|
| G0-01A Repo | verified | Repo chính xác | GitHub repo `sop-web-giangdc` | Giữ làm source chính |
| G0-01B Branch | verified | Branch cô lập | `g0/project-foundation` đã merge qua PR #1 | Dùng branch theo task tiếp theo |
| G0-01C Bộ file điều hành | verified | Có AGENTS/SPEC/PLAN/TASKS/PROGRESS/DECISIONS/HANDOFF | Đã merge vào `main` | Duy trì sau mỗi mốc |
| G0-01D Visibility | verified | Chủ dự án quyết định | Quyết định: giữ public | Không chứa secret |
| G0-01E UI prototype | done | ONB desktop/mobile | `site/` đã merge vào `main`; chưa nghiệm thu link chạy | Chờ Pages rồi kiểm tra 360/768/1024+ |
| G0-01F Pages | blocked | URL truy cập công khai | Actions run #39006513077 và #39006538028 fail tại `Configure Pages`: GitHub App/GITHUB_TOKEN không có quyền tự tạo Pages site | Chủ dự án bật Settings → Pages → Source: GitHub Actions; sau đó rerun workflow |

Không dùng phần trăm cảm tính. Chỉ `verified` sau khi có bằng chứng.