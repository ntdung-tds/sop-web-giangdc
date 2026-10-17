import { useId } from "react";

const modules = [
  ["01", "Quy trình", "Phiên bản, bước, điều kiện và phê duyệt"],
  ["02", "Thực thi", "Theo dõi tiến độ, bằng chứng và trạng thái"],
  ["03", "Ngoại lệ", "Exception, rework và quyết định có kiểm soát"],
  ["04", "Báo cáo", "KPI, audit trail và dữ liệu xuất"],
];

export function App() {
  const foundationId = useId();

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand">
          <span className="mark">S</span>
          <div>
            <strong>SOP Platform</strong>
            <small>G0-02 · Technical Foundation</small>
          </div>
        </div>
        <span className="status">Foundation active</span>
      </header>

      <section className="hero">
        <div>
          <p className="eyebrow">SYSTEM OF PROCEDURES</p>
          <h1>Quản lý quy trình có kiểm soát, có bằng chứng và truy vết.</h1>
          <p className="lede">
            Đây là web shell thật của nền móng kỹ thuật. Nghiệp vụ chưa khóa vẫn được giữ ở trạng thái prototype, không suy diễn thành yêu cầu chính thức.
          </p>
          <div className="actions">
            <button type="button">Mở không gian làm việc</button>
            <a href={`#${foundationId}`}>Xem nền móng kỹ thuật</a>
          </div>
        </div>
        <aside className="heroCard" aria-label="Trạng thái hệ thống mẫu">
          <div className="heroCardHead">
            <span>Trạng thái nền tảng</span>
            <span className="dot" />
          </div>
          <div className="metric"><b>React + TypeScript</b><span>Web</span></div>
          <div className="metric"><b>/api/v1/health</b><span>API contract</span></div>
          <div className="metric"><b>Node + Cloudflare</b><span>Runtime adapters</span></div>
          <div className="metric"><b>CI required</b><span>Lint · typecheck · test · build</span></div>
        </aside>
      </section>

      <section id={foundationId} className="grid">
        {modules.map(([id, title, text]) => (
          <article className="module" key={id}>
            <span className="moduleId">{id}</span>
            <h2>{title}</h2>
            <p>{text}</p>
            <small>Module boundary</small>
          </article>
        ))}
      </section>

      <section className="foundation">
        <div>
          <p className="eyebrow">G0-02</p>
          <h2>Nền móng trước nghiệp vụ</h2>
        </div>
        <div className="checks">
          <span>✓ Shared contracts</span>
          <span>✓ Runtime-independent application layer</span>
          <span>✓ Node adapter</span>
          <span>✓ Cloudflare adapter</span>
          <span>✓ Automated CI</span>
          <span>✓ GitHub Pages preview</span>
        </div>
      </section>

      <footer>Prototype dữ liệu · Không chứa secret · Không phải production</footer>
    </main>
  );
}
