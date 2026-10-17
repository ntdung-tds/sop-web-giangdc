import type { FormEvent } from "react";
import { useState } from "react";
import {
  initialUiState,
  showDashboard,
  showLanding,
  togglePassword,
  UI_BASELINE_COPY,
} from "./uiState.ts";

export function App() {
  const [ui, setUi] = useState(initialUiState);

  const submitLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUi((state) => showDashboard(state));
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const logout = () => {
    setUi((state) => showLanding(state));
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  return (
    <>
      <div className="demo-bar">PROTOTYPE UI · SAMPLE DATA · KHÔNG DÙNG DỮ LIỆU THẬT</div>

      {ui.view === "landing" ? (
        <main id="landing" className="landing-shell">
          <section className="brand-panel" aria-labelledby="hero-title">
            <div className="brand-row">
              <div className="mark" aria-hidden="true">S</div>
              <div><strong>SOP</strong><span>Quản lý quy trình</span></div>
            </div>

            <div className="hero-copy">
              <span className="eyebrow">Vận hành có kiểm soát</span>
              <h1 id="hero-title">Mỗi quy trình rõ ràng.<br />Mỗi bước đều truy vết được.</h1>
              <p>Thiết kế, phát hành và thực hiện SOP theo đúng phiên bản; thu bằng chứng theo từng bước; xử lý ngoại lệ và xem lại toàn bộ lịch sử.</p>
            </div>

            <div className="feature-grid" aria-label="Năng lực chính">
              <article><span>01</span><h2>Đa quy trình</h2><p>Quản lý nhiều SOP độc lập theo đơn vị và phạm vi.</p></article>
              <article><span>02</span><h2>Kiểm soát phiên bản</h2><p>Lượt đang chạy giữ nguyên snapshot đã phát hành.</p></article>
              <article><span>03</span><h2>Hiện trường mobile</h2><p>Thao tác theo bước, bằng chứng và trạng thái đồng bộ.</p></article>
              <article><span>04</span><h2>Truy vết đầy đủ</h2><p>Biết ai làm gì, khi nào và quyết định nào đã được áp dụng.</p></article>
            </div>

            <div className="flow-preview" aria-label="Minh họa quy trình">
              <div className="flow-node done"><b>1</b><span>Chuẩn bị</span></div><i />
              <div className="flow-node active"><b>2</b><span>Kiểm tra</span></div><i />
              <div className="flow-node"><b>3</b><span>Xác nhận</span></div><i />
              <div className="flow-node"><b>4</b><span>Hoàn tất</span></div>
            </div>
          </section>

          <section className="login-panel">
            <div className="login-card">
              <div className="login-kicker">{UI_BASELINE_COPY.loginKicker}</div>
              <h2>{UI_BASELINE_COPY.welcomeTitle}</h2>
              <p className="muted">Truy cập công việc và quy trình trong phạm vi được phân quyền.</p>
              <form id="demo-login" onSubmit={submitLogin}>
                <label>
                  Tên đăng nhập
                  <input autoComplete="username" name="username" placeholder="Nhập tên đăng nhập" required />
                </label>
                <label>
                  Mật khẩu
                  <div className="password-wrap">
                    <input
                      id="password"
                      type={ui.passwordVisible ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Nhập mật khẩu"
                      required
                    />
                    <button
                      id="toggle-password"
                      type="button"
                      aria-label={ui.passwordVisible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      onClick={() => setUi((state) => togglePassword(state))}
                    >
                      {ui.passwordVisible ? "Ẩn" : "Hiện"}
                    </button>
                  </div>
                </label>
                <div className="form-meta">
                  <label className="check"><input type="checkbox" /> <span>Ghi nhớ trên thiết bị này</span></label>
                  <span className="policy-note">Khôi phục mật khẩu chưa bật</span>
                </div>
                <button className="primary" type="submit">Đăng nhập</button>
                <p className="demo-note">Prototype: nhập giá trị bất kỳ để xem dashboard mẫu. Không có xác thực thật.</p>
              </form>
            </div>
            <p className="support">Phiên bản giao diện thử nghiệm theo SOP Specification v1.5 Rev.10</p>
          </section>
        </main>
      ) : (
        <main id="dashboard" className="app-shell" aria-live="polite">
          <aside className="sidebar">
            <div className="app-brand"><div className="mark small">S</div><div><strong>SOP</strong><span>Operations</span></div></div>
            <nav>
              <button type="button" className="nav-item active">Tổng quan</button>
              <button type="button" className="nav-item">Việc của tôi <b>6</b></button>
              <button type="button" className="nav-item">Quy trình</button>
              <button type="button" className="nav-item">Ngoại lệ <b className="warn">2</b></button>
              <button type="button" className="nav-item">Biểu mẫu &amp; tài liệu</button>
              <button type="button" className="nav-item">Báo cáo</button>
              <button type="button" className="nav-item">Quản trị</button>
            </nav>
            <div className="sidebar-foot">SAMPLE · UI review</div>
          </aside>

          <section className="workspace">
            <header className="topbar">
              <div><span className="mobile-brand">SOP</span><span className="crumb">Trang chủ / Tổng quan</span></div>
              <div className="top-actions">
                <button type="button" className="icon-btn" aria-label="Thông báo">●<span>3</span></button>
                <button id="logout" type="button" className="profile" onClick={logout}>ND <span>Người dùng demo</span></button>
              </div>
            </header>

            <div className="content">
              <div className="welcome">
                <div><span className="eyebrow dark">Hôm nay</span><h1>Chào buổi sáng, Người dùng demo</h1><p>6 công việc có thể thao tác · 2 ngoại lệ cần chú ý.</p></div>
                <button type="button" className="secondary">+ Tạo lượt</button>
              </div>

              <section className="priority-grid">
                <article className="focus-card">
                  <div className="card-head"><span>TIẾP TỤC CÔNG VIỆC</span><span className="status green">Đang thực hiện</span></div>
                  <h2>Xuất hàng đến đại lý · EXE-2026-00128</h2>
                  <p>Bước 4/11 · Kiểm tra số lượng và tình trạng hàng</p>
                  <div className="progress"><span style={{ width: "36%" }} /></div>
                  <div className="card-foot"><span>Hạn hôm nay · 16:30</span><button type="button" className="primary compact">Tiếp tục bước 4 →</button></div>
                </article>
                <article className="alert-card">
                  <span className="mini-label">CẦN XỬ LÝ</span><strong>2</strong><h3>Ngoại lệ đang chặn</h3>
                  <p>Có hồ sơ cần quyết định trước khi quy trình tiếp tục.</p>
                  <button type="button" className="text-btn">Xem ngoại lệ →</button>
                </article>
              </section>

              <section className="stats" aria-label="Tổng quan công việc">
                <article><span>Việc của tôi</span><strong>6</strong><small>3 việc đến hạn hôm nay</small></article>
                <article><span>Đang thực hiện</span><strong>4</strong><small>1 việc vừa cập nhật</small></article>
                <article><span>Chờ duyệt</span><strong>3</strong><small>Trong phạm vi của bạn</small></article>
                <article><span>Hoàn thành tuần này</span><strong>18</strong><small>SAMPLE DATA</small></article>
              </section>

              <section className="work-list">
                <div className="section-head">
                  <div><span className="eyebrow dark">VIỆC CỦA TÔI</span><h2>Công việc ưu tiên</h2></div>
                  <button type="button" className="text-btn">Xem tất cả →</button>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Mã lượt</th><th>Quy trình</th><th>Bước hiện tại</th><th>Tiến độ</th><th>Hạn</th><th>Trạng thái</th><th /></tr></thead>
                    <tbody>
                      <tr><td>EXE-00128</td><td>Xuất hàng đến đại lý</td><td>4. Kiểm tra hàng</td><td>4/11</td><td>Hôm nay 16:30</td><td><span className="status green">Đang làm</span></td><td><button type="button" className="row-btn">Mở</button></td></tr>
                      <tr><td>EXE-00131</td><td>Kiểm tra thiết bị</td><td>2. Ghi nhận hiện trạng</td><td>2/7</td><td>18/10</td><td><span className="status amber">Sắp đến hạn</span></td><td><button type="button" className="row-btn">Mở</button></td></tr>
                      <tr><td>EXE-00109</td><td>Bàn giao ca</td><td>6. Xác nhận bàn giao</td><td>6/6</td><td>17/10</td><td><span className="status gray">Chờ xác nhận</span></td><td><button type="button" className="row-btn">Mở</button></td></tr>
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </section>
        </main>
      )}
    </>
  );
}
