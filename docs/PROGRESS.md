# PROGRESS

Cập nhật: 17/10/2026

| Task | Trạng thái | Tiêu chí | Bằng chứng | Tiếp theo |
|---|---|---|---|---|
| G0-01 | verified | Repo, source-of-truth, Pages và UI shell đã được kiểm tra | PR #1 + Pages workflow success + chủ dự án cho phép chuyển bước | Giữ ổn định |
| G0-02 | verified | Monorepo, contracts/application, adapters, React web, CI và Pages | PR #2 + CI + Pages success | Giữ ổn định |
| CF-01 Cloudflare test channel | verified | GitHub-connected Pages build/deploy + browser smoke thực tế | PR #5; CI `39012157065`; Cloudflare production `0b14fa1f-c483-43c9-8994-f032067cede0`; Browser Rendering desktop/mobile + reorder interaction | Dùng Cloudflare làm kênh test độc lập song song GitHub Pages |
| UI-SYNC-01 GitHub/Cloudflare parity | verified | Hai kênh render cùng React app hiện tại; legacy SW không còn giữ prototype cũ | PR #6; CI `39013120038`; GitHub Pages `39013170670`; Cloudflare production `9552f05a-c710-476a-9ff3-3cc2abcc36bb`; Browser Rendering xác nhận cùng JS/CSS hash | Giữ hai kênh đồng bộ từ `apps/web` |
| G1-01 Scope | verified | OPEN-SCOPE-01 được owner chốt | D-004: một OrgUnit gốc + scope tối thiểu | Dùng cho contract/schema tiếp theo |
| G1-02 Common Execution data | verified | OPEN-DATA-01 được owner chốt | D-005: execution_no/process-version/scope/assignee/due_at | Không nhồi field nghiệp vụ riêng vào Execution |
| G1-03A SOD self-approval | verified | Không tự phê duyệt version do mình soạn/chỉnh | D-006 | Áp dụng khi làm Governance |
| G1-03B Severity mapping | pending | Owner khóa `severity -> required_approval_level` | Chưa có quyết định chính thức; chỉ có fallback SRS cho prototype | Không đóng G1 toàn gate |
| G1-04 Fixture source | verified | Chuỗi 11 bước nguồn được duyệt làm SAMPLE | D-007 | Seed source-only; OPEN-SAMPLE-01 vẫn ở G3 |
| PA-01 Process Authoring core | verified | AC-01 + PRC-001/003/004/005 core + BR-001 application invariant + PRC-009 core subset + preview | PR #4; red run `39010789658`; green run `39011213520`; Pages `39011262184`; merge `991f0922...` | Tiếp PA-01B PRC-002 catalog/search |
| PA-01B Process catalog/search | pending | PRC-002 search code/name + filter group/owner/status/unit | Chưa bắt đầu | Task độc lập tiếp theo |
| PA-01C Authoring requirements/policies | pending | PRC-006..008 + hoàn tất PRC-009 | Chờ contract/form/document/policy tương ứng | Không đánh PRC-009 full trước thời điểm này |
| PA-02 Versioning + Governance | pending | AC-02 + GOV-001..007 | Chưa bắt đầu | Sau các task authoring cần thiết và quyết định liên quan |

## PA-01 evidence
- Test-first red: run `39010789658`, 5 test PA-01 fail có chủ đích trên compiling stubs.
- Hai vòng sửa thực tế: accessibility lint rồi TypeScript narrowing; không hạ quality gate.
- Green: run `39011213520` — lint/typecheck/unit/build success.
- PR #4 merged, commit `991f092215fe7faaf49de24719f60d0df2ced8df`.
- GitHub Pages run `39011262184` success tại `https://ntdung-tds.github.io/sop-web-giangdc/`.

## Cloudflare test evidence
- Cloudflare Pages project: `giangdc-sop-demo`, source GitHub `ntdung-tds/sop-web-giangdc`, production branch `main`.
- Build contract: Node `22.23.3`, `npm run build -w @sop/web`, output `apps/web/dist`.
- Preview deployment `42919dcc-1b9b-4c2a-8dbf-d673cf115279`: clone/build/deploy success.
- PR #5 CI `39012157065`: lint/typecheck/unit/build success; merged tại `db1c981c65912ab755c958081e4ac00724172a9d`.
- Production deployment `0b14fa1f-c483-43c9-8994-f032067cede0`: clone/build/deploy success tại `https://giangdc-sop-demo.pages.dev/`.
- Browser Rendering desktop: `.appShell` load; `overflow=false`; 11 bước; `Gửi thẩm định` disabled; SAMPLE và `Xuất hàng đến đại lý` xuất hiện đúng.
- Browser Rendering mobile 360px: accessibility tree load đầy đủ fixture, form readonly và step controls.
- Interaction smoke 1024px: click reorder bước đầu làm hoán đổi chính xác bước 1 và 2 (`swapped=true`).
- Một lần burst Browser Rendering gặp rate-limit `2001`; chạy tuần tự sau đó thành công, không phải lỗi ứng dụng.

## UI parity evidence
- Nguyên nhân lệch quan sát được: prototype cũ trong `site/` đã đăng ký Service Worker cache-first với cache `sop-ui-v1`; client từng mở GitHub Pages có thể còn bị cache shell cũ.
- PR #6 thêm migration worker ở `apps/web/public/sw.js`: xóa cache `sop-ui-*`, unregister worker cũ và reload client.
- PR #6 CI `39013120038` success; merge commit `0178533c7fd55017191155192d56e9c572468ecb`.
- GitHub Pages run `39013170670` success sau merge.
- Cloudflare production deployment `9552f05a-c710-476a-9ff3-3cc2abcc36bb` success trên cùng merge commit.
- Browser Rendering sau deploy: cả GitHub Pages và Cloudflare đều có title `SOP Platform`, `Process Authoring`, fixture `Xuất hàng đến đại lý`, marker `SAMPLE`, không còn `demo-login`.
- Asset hash giống nhau trên hai kênh: JS `index-DJGPZ1zw.js`, CSS `index-rx7yvc9W.css`; chỉ khác base path (`/sop-web-giangdc/` trên GitHub Pages, `/` trên Cloudflare).

## Trạng thái gate
**G1 chưa verified toàn gate** vì phần severity approval mapping của OPEN-SOD-01 chưa được owner chốt. Phần độc lập được tiếp tục nhưng không được biến fallback thành quyết định production.

Chỉ `verified` khi có bằng chứng chạy thật hoặc quyết định owner được ghi vào file nguồn sự thật.
