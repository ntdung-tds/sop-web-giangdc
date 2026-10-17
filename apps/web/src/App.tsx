import { useId, useState } from "react";
import {
  moveStep,
  validateAuthoringDraftCore,
  type ProcessAggregate,
  type ProcessVersionDraft,
} from "@sop/domain";
import { shippingSample } from "./sampleShipping";

function replaceVersion(
  process: ProcessAggregate,
  version: ProcessVersionDraft,
): ProcessAggregate {
  return {
    ...process,
    versions: process.versions.map((item) =>
      item.versionNo === version.versionNo ? version : item,
    ),
  };
}

export function App() {
  const [process, setProcess] = useState<ProcessAggregate>(shippingSample);
  const [selectedStepCode, setSelectedStepCode] = useState("SAMPLE-01");
  const sampleHeadingId = useId();
  const draft = process.versions.at(-1);

  if (draft === undefined) {
    return <main className="emptyState">Không tìm thấy bản nháp SAMPLE.</main>;
  }

  const selectedStep =
    draft.steps.find((step) => step.stepCode === selectedStepCode) ?? draft.steps[0];
  const issues = validateAuthoringDraftCore(process, draft);
  const roleIssueCount = issues.filter((issue) => issue.code === "STEP_ROLE_REQUIRED").length;
  const otherIssueCount = issues.length - roleIssueCount;

  function reorder(index: number, direction: -1 | 1) {
    const currentDraft = process.versions.at(-1);
    if (currentDraft === undefined) {
      return;
    }
    const target = index + direction;
    if (target < 0 || target >= currentDraft.steps.length) {
      return;
    }
    const nextDraft = moveStep(currentDraft, index, target);
    setProcess((current) => replaceVersion(current, nextDraft));
  }

  return (
    <main className="appShell">
      <header className="appHeader">
        <div className="brandCluster">
          <span className="brandMark">S</span>
          <div>
            <strong>SOP Platform</strong>
            <small>Process Authoring · PA-01</small>
          </div>
        </div>
        <div className="headerActions">
          <span className="samplePill">SAMPLE</span>
          <button className="secondaryButton" type="button" disabled>
            Gửi thẩm định
          </button>
        </div>
      </header>

      <section className="notice" aria-labelledby={sampleHeadingId}>
        <div>
          <p className="eyebrow" id={sampleHeadingId}>FIXTURE UAT · SOURCE ONLY</p>
          <h1>Thiết kế quy trình theo phiên bản, không suy diễn nghiệp vụ.</h1>
        </div>
        <p>
          11 bước bên dưới lấy từ fixture “Xuất hàng đến đại lý” trong SRS Rev.10.
          Vai trò, evidence và giấy tờ bắt buộc chưa được Process Owner xác nhận nên hệ thống
          cố ý hiển thị là <b>chưa chốt</b> và chưa cho gửi thẩm định.
        </p>
      </section>

      <div className="workspace">
        <aside className="processRail" aria-label="Danh sách quy trình">
          <div className="railHeading">
            <div>
              <p className="eyebrow">QUY TRÌNH</p>
              <h2>Danh mục</h2>
            </div>
            <button className="iconButton" type="button" disabled aria-label="Tạo quy trình">
              +
            </button>
          </div>
          <button className="processCard active" type="button">
            <span className="processCode">{process.code}</span>
            <strong>{draft.name}</strong>
            <span className="processMeta">v{draft.versionNo} · {draft.status}</span>
          </button>
          <div className="railFootnote">
            PRC-002 search/filter sẽ được nối với backend ở task API/persistence sau.
          </div>
        </aside>

        <section className="editorPanel" aria-label="Bản nháp quy trình">
          <div className="editorTopline">
            <div>
              <p className="eyebrow">BẢN NHÁP v{draft.versionNo}</p>
              <h2>{draft.name}</h2>
              <p className="muted">{process.code} · Scope: {process.orgScopeId}</p>
            </div>
            <span className="draftBadge">DRAFT</span>
          </div>

          <div className="metadataGrid">
            <label>
              <span>Tên quy trình</span>
              <input value={draft.name} readOnly />
            </label>
            <label>
              <span>Chủ sở hữu</span>
              <input value="Process Owner · SAMPLE" readOnly />
            </label>
            <label>
              <span>Mục đích</span>
              <input value={draft.purpose || "Chưa chốt từ nguồn"} readOnly />
            </label>
            <label>
              <span>Đối tượng áp dụng</span>
              <input value={draft.audience || "Chưa chốt từ nguồn"} readOnly />
            </label>
            <label>
              <span>Điều kiện bắt đầu</span>
              <input value={draft.triggerText || "Chưa chốt từ nguồn"} readOnly />
            </label>
            <label>
              <span>Điều kiện kết thúc</span>
              <input value={draft.finishCondition || "Chưa chốt từ nguồn"} readOnly />
            </label>
          </div>

          <div className="sectionHeading">
            <div>
              <p className="eyebrow">PRC-004 · TUYẾN TÍNH</p>
              <h3>{draft.steps.length} bước</h3>
            </div>
            <span className="muted">BPMN/parallel không thuộc MVP</span>
          </div>

          <div className="stepList">
            {draft.steps.map((step, index) => (
              <article
                className={`stepRow ${selectedStep?.stepCode === step.stepCode ? "selected" : ""}`}
                key={step.stepCode}
              >
                <button
                  className="stepMain"
                  type="button"
                  onClick={() => setSelectedStepCode(step.stepCode)}
                >
                  <span className="stepNumber">{String(step.sequenceNo).padStart(2, "0")}</span>
                  <span className="stepCopy">
                    <strong>{step.title}</strong>
                    <small>{step.stepCode} · Vai trò: Chưa chốt</small>
                  </span>
                </button>
                <div className="reorderActions">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => reorder(index, -1)}
                    aria-label={`Đưa ${step.stepCode} lên`}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={index === draft.steps.length - 1}
                    onClick={() => reorder(index, 1)}
                    aria-label={`Đưa ${step.stepCode} xuống`}
                  >
                    ↓
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="inspector" aria-label="Chi tiết và kiểm tra bản nháp">
          <section className="inspectorCard">
            <p className="eyebrow">CHI TIẾT BƯỚC</p>
            {selectedStep ? (
              <>
                <div className="inspectorTitle">
                  <span>{String(selectedStep.sequenceNo).padStart(2, "0")}</span>
                  <h3>{selectedStep.title}</h3>
                </div>
                <dl>
                  <div><dt>Mã bước</dt><dd>{selectedStep.stepCode}</dd></div>
                  <div><dt>Vai trò</dt><dd className="openValue">Chưa chốt</dd></div>
                  <div><dt>Bắt buộc</dt><dd>{selectedStep.isRequired ? "Có" : "Không"}</dd></div>
                  <div><dt>Thời lượng</dt><dd>Chưa chốt</dd></div>
                  <div><dt>Chính sách bắt đầu</dt><dd>{selectedStep.stepStartPolicy}</dd></div>
                </dl>
                {selectedStep.noteText ? (
                  <div className="sourceNote">
                    <span>Ghi chú nguồn</span>
                    <p>{selectedStep.noteText}</p>
                  </div>
                ) : null}
              </>
            ) : null}
          </section>

          <section className="inspectorCard validationCard">
            <div className="validationHead">
              <div>
                <p className="eyebrow">PRC-009 · CORE</p>
                <h3>Kiểm tra bản nháp</h3>
              </div>
              <span className={issues.length === 0 ? "count good" : "count"}>{issues.length}</span>
            </div>
            {roleIssueCount > 0 ? (
              <div className="validationIssue warning">
                <strong>{roleIssueCount} bước thiếu BusinessRole</strong>
                <span>OPEN-SAMPLE-01 · chưa được phép tự gán vai trò.</span>
              </div>
            ) : null}
            {otherIssueCount > 0 ? (
              <div className="validationIssue">
                <strong>{otherIssueCount} lỗi cấu trúc khác</strong>
                <span>Cần xử lý trước khi gửi thẩm định.</span>
              </div>
            ) : null}
            <p className="validationScope">
              Đây mới là validation core. Form/document, skip/failure policy thuộc PRC-006..008
              sẽ được bổ sung trước khi đóng toàn bộ PRC-009.
            </p>
          </section>

          <section className="inspectorCard linearPreview">
            <p className="eyebrow">PREVIEW · READ ONLY</p>
            <h3>Tuyến thực hiện</h3>
            <ol>
              {draft.steps.map((step) => (
                <li key={`preview-${step.stepCode}`}>
                  <span>{step.sequenceNo}</span>
                  <p>{step.title}</p>
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>

      <footer className="appFooter">
        PA-01 · SAMPLE fixture · Không chứa secret/dữ liệu thật · Không phải production
      </footer>
    </main>
  );
}
