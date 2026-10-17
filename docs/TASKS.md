# TASKS

| ID | Task | Status | Acceptance/evidence |
|---|---|---|---|
| G0-01A | Xác định repo SOP | verified | `ntdung-tds/sop-web-giangdc` |
| G0-01B | Branch foundation | verified | `g0/project-foundation` đã merge |
| G0-01C | Bộ file điều hành | verified | Có AGENTS/SPEC/PLAN/TASKS/PROGRESS/DECISIONS/HANDOFF |
| G0-01D | Visibility | verified | Chủ dự án chốt giữ public |
| G0-01E | Prototype UI | verified | Chủ dự án đã xem Pages và cho phép chuyển bước |
| G0-01F | GitHub Pages | verified | Workflow deploy thành công, URL public truy cập được |
| G0-02A | Monorepo TypeScript | verified | npm workspaces + package boundaries, PR #2 |
| G0-02B | Shared contracts/application | verified | Contract health + application service + unit test |
| G0-02C | API adapters | verified | Node + Cloudflare build thành công |
| G0-02D | Web shell | verified | React/Vite build và Pages success |
| G0-02E | CI | verified | lint + typecheck + unit + build success |
| G0-02F | Evidence/handoff | verified | PROGRESS/HANDOFF cập nhật, failure/fix được giữ lại |
| G1-01 | Organizational scope | verified | D-004: một OrgUnit gốc + scope tối thiểu; backend enforcement |
| G1-02 | Common execution data | verified | D-005: execution_no/process-version/scope/assignee/due_at; ExecutionAssignment authoritative |
| G1-03A | SOD self-approval | verified | D-006: cấm tự phê duyệt ProcessVersion do chính actor soạn/chỉnh |
| G1-03B | Severity approval mapping | pending | Owner phải khóa `severity -> required_approval_level`; fallback chỉ cho prototype |
| G1-04 | UAT fixture source content | verified | D-007: 11 bước “Xuất hàng đến đại lý” được duyệt làm SAMPLE source-only |
| PA-01 | Process Authoring core | verified | PR #4; AC-01, PRC-001/003/004/005 core, BR-001 app invariant, PRC-009 core subset, PRC-010 preview; CI `39011213520`, Pages `39011262184` |
| PA-01B | Process catalog/search | pending | PRC-002: search code/name; filter group/owner/status/unit; test/application/UI evidence |
| PA-01C | Requirements + policy authoring | pending | PRC-006..008 và full PRC-009; không invent form/document/evidence policy |
| PA-02 | Versioning + Governance | pending | AC-02 + GOV-001..007; self-approval rule phải được enforce; phần severity vẫn không suy diễn |

`OPEN-SAMPLE-01` vẫn là việc của G3 cho vai trò/giấy tờ/evidence chính thức. PA-01 chỉ dùng fixture source-only và không coi các trường chưa chốt là requirement production.
