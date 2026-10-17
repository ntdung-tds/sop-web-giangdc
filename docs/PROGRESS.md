# PROGRESS

Cập nhật: 17/10/2026

| Task | Trạng thái | Tiêu chí | Bằng chứng | Tiếp theo |
|---|---|---|---|---|
| G0-01 | verified | Repo, source-of-truth, Pages và UI shell đã được kiểm tra | PR #1 + Pages workflow success + chủ dự án cho phép chuyển bước | Giữ ổn định |
| G0-02 | verified | Monorepo, contracts/application, adapters, React web, CI và Pages | PR #2 + CI + Pages success | Giữ ổn định |
| G1-01 Scope | verified | OPEN-SCOPE-01 được owner chốt | D-004: một OrgUnit gốc + scope tối thiểu | Dùng cho contract/schema tiếp theo |
| G1-02 Common Execution data | verified | OPEN-DATA-01 được owner chốt | D-005: execution_no/process-version/scope/assignee/due_at | Không nhồi field nghiệp vụ riêng vào Execution |
| G1-03A SOD self-approval | verified | Không tự phê duyệt version do mình soạn/chỉnh | D-006 | Áp dụng khi làm Governance |
| G1-03B Severity mapping | pending | Owner khóa `severity -> required_approval_level` | Chưa có quyết định chính thức; chỉ có fallback SRS cho prototype | Không đóng G1 toàn gate |
| G1-04 Fixture source | verified | Chuỗi 11 bước nguồn được duyệt làm SAMPLE | D-007 | Seed source-only; OPEN-SAMPLE-01 vẫn ở G3 |
| PA-01 Process Authoring core | pending | PRC-001..005 + PRC-009 + AC-01, test/CI/Pages evidence | Chưa bắt đầu code | Mở branch riêng sau khi PR G1 docs xanh |

## Trạng thái gate
**G1 chưa verified toàn gate** vì phần severity approval mapping của OPEN-SOD-01 chưa được owner chốt. Theo SRS, agent vẫn được tiếp tục phần độc lập hoặc prototype dùng fallback có ghi nhãn; vì vậy PA-01 không bị chặn.

Chỉ `verified` khi có bằng chứng chạy thật hoặc quyết định owner được ghi vào file nguồn sự thật.
