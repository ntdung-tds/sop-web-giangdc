# PROGRESS

Cập nhật: 17/10/2026

| Task | Trạng thái | Tiêu chí | Bằng chứng | Tiếp theo |
|---|---|---|---|---|
| G0-01 Repo/visibility | verified | Repo đúng, public theo quyết định owner | `ntdung-tds/sop-web-giangdc` | Không chứa secret |
| G0-01 UI baseline | verified | Landing/login/dashboard đúng bản owner duyệt | G0-01 tree; owner xác nhận 17/10/2026 | Freeze visual baseline |
| G0-01 StageSign channel | verified | Project/branch riêng, URL thật hoạt động | `sopweb-giangdc-stagesign.pages.dev`, branch `stagesign` | Chỉ promote từ StageSign task branch |
| G0-02A technical foundation | verified | lint/typecheck/unit/build xanh; UI không đổi | PR #10; CI + production smoke | Đóng G0-02A |
| G0-02B RED test | verified | Test baseline tồn tại trước implementation và fail đúng lý do | CI `39019731870` thiếu `uiState.ts` | Đã chuyển GREEN |
| G0-02B React migration | verified | Không redesign; CSS exact baseline; CI xanh; preview và production desktop/mobile parity + interaction pass | PR #11 merge `5e6a2ba169ac6f958a6f45b75a37bc05980b00c2`; post-merge CI `39020899697` success; production deploy `e8a73da3-dea2-442d-b399-c9bb2164e090` success; stable URL desktop/mobile 5/5 layout metrics exact; mobile login → dashboard pass; React hashed asset present; `Process Authoring` absent | Đóng G0-02B |

Known failed attempts G0-02B được giữ làm bằng chứng: CI `39019880458`, `39019959937`, `39020035137`; preview reload-loop được phát hiện và fix ở `978efd735570ca53bc900e93ca73411b79a251de`. CSS canonical vẫn là blob `b57434334cd5cfe9530cecab348fbcd5fd563834` cho cả static baseline và React shell.
