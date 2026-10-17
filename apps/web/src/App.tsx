import type { FormEvent } from "react";
import { useEffect, useId, useState } from "react";
import {
  AuthApiError,
  changePassword,
  type AuthSession,
  login,
  logout as logoutSession,
  restoreSession,
} from "./authClient.ts";
import {
  initialUiState,
  showDashboard,
  showLanding,
  togglePassword,
  UI_BASELINE_COPY,
} from "./uiState.ts";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const selected = parts.slice(-2);
  const result = selected.map((part) => part[0]?.toLocaleUpperCase("vi-VN") ?? "").join("");
  return result || "ND";
}

export function App() {
  const [ui, setUi] = useState(initialUiState);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [authBusy, setAuthBusy] = useState(false);
  const [restoring, setRestoring] = useState(true);
  const [authError, setAuthError] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const heroTitleId = useId();

  useEffect(() => {
    let active = true;
    void restoreSession()
      .then((restored) => {
        if (!active || !restored) return;
        setSession(restored);
        if (!restored.mustChangePassword) {
          setUi((state) => showDashboard(state));
        }
      })
      .finally(() => {
        if (active) setRestoring(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const submitLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError("");
    setAuthMessage("");
    setAuthBusy(true);
    const data = new FormData(event.currentTarget);
    try {
      const authenticated = await login(
        String(data.get("username") ?? ""),
        String(data.get("password") ?? ""),
      );
      setSession(authenticated);
      if (authenticated.mustChangePassword) {
        setUi((state) => showLanding(state));
        setAuthMessage("Tài khoản cần đổi mật khẩu trước khi vào khu vực làm việc.");
      } else {
        setUi((state) => showDashboard(state));
        window.scrollTo({ top: 0, behavior: "instant" });
      }
    } catch (error) {
      setSession(null);
      setUi((state) => showLanding(state));
      setAuthError(
        error instanceof AuthApiError
          ? error.message
          : "Không thể đăng nhập. Vui lòng thử lại.",
      );
    } finally {
      setAuthBusy(false);
    }
  };

  const submitPasswordChange = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!session) return;
    setAuthError("");
    setAuthMessage("");
    const data = new FormData(event.currentTarget);
    const currentPassword = String(data.get("currentPassword") ?? "");
    const newPassword = String(data.get("newPassword") ?? "");
    const confirmPassword = String(data.get("confirmPassword") ?? "");
    if (newPassword !== confirmPassword) {
      setAuthError("Mật khẩu mới và xác nhận mật khẩu chưa khớp.");
      return;
    }

    setAuthBusy(true);
    try {
      await changePassword(session.csrfToken, currentPassword, newPassword);
      setSession(null);
      setUi((state) => showLanding(state));
      setAuthMessage("Mật khẩu đã được cập nhật. Vui lòng đăng nhập lại.");
      window.scrollTo({ top: 0, behavior: "instant" });
    } catch (error) {
      setAuthError(
        error instanceof AuthApiError
          ? error.message
          : "Không thể đổi mật khẩu. Vui lòng thử lại.",
      );
    } finally {
      setAuthBusy(false);
    }
  };

  const logout = async () => {
    if (!session || authBusy) return;
    setAuthBusy(true);
    setAuthError("");
    try {
      await logoutSession(session.csrfToken);
      setSession(null);
      setUi((state) => showLanding(state));
      setAuthMessage("Đã đăng xuất an toàn.");
      window.scrollTo({ top: 0, behavior: "instant" });
    } catch (error) {
      setAuthError(
        error instanceof AuthApiError
          ? error.message
          : "Không thể đăng xuất. Vui lòng thử lại.",
      );
    } finally {
      setAuthBusy(false);
    }
  };

  const forcePasswordChange = Boolean(session?.mustChangePassword);
  const displayName = session?.user.displayName ?? "Người dùng";

  return (
    <>
      <div className="demo-bar">MÔI TRƯỜNG THỬ NGHIỆM · AUTH NỘI BỘ · DASHBOARD DÙNG SAMPLE DATA</div>

      {ui.view === "landing" ? (
        <main className="landing-shell">
          <section className="brand-panel" aria-labelledby={heroTitleId}>
            <div className="brand-row">
              <div className="mark" aria-hidden="true">S</div>
              <div><strong>SOP</strong><span>Quản lý quy trình</span></div>
            </div>

            <div className="hero-copy">
              <span className="eyebrow">Vận hành có kiểm soát</span>
              <h1 id={heroTitleId}>Mỗi quy trình rõ ràng.<br />Mỗi bước đều truy vết được.</h1>
              <p>Thiết kế, phát hành và thực hiện SOP theo đúng phiên bản; thu bằng chứng theo từng bước; xử lý ngoại lệ và xem lại toàn bộ lịch sử.</p>
            </div>

            <section className="feature-grid" aria-label="Năng lực chính">
              <article><span>01</span><h2>Đa quy trình</h2><p>Quản lý nhiều SOP độc lập theo đơn vị và phạm vi.</p></article>
              <article><span>02</span><h2>Kiểm soát phiên bản</h2><p>Lượt đang chạy giữ nguyên snapshot đã phát hành.</p></article>
              <article><span>03</span><h2>Hiện trường mobile</h2><p>Thao tác theo bước, bằng chứng và trạng thái đồng bộ.</p></article>
              <article><span>04</span><h2>Truy vết đầy đủ</h2><p>Biết ai làm gì, khi nào và quyết định nào đã được áp dụng.</p></article>
            </section>

            <section className="flow-preview" aria-label="Minh họa quy trình">
              <div className="flow-node done"><b>1</b><span>Chuẩn bị</span></div><i />
              <div className="flow-node active"><b>2</b><span>Kiểm tra</span></div><i />
              <div className="flow-node"><b>3</b><span>Xác nhận</span></div><i />
              <div className="flow-node"><b>4</b><span>Hoàn tất</span></div>
            </section>
          </section>

          <section className="login-panel">
            <div className="login-card">
              {forcePasswordChange ? (
                <>
                  <div className="login-kicker">Bảo mật tài khoản</div>
                  <h2>Đổi mật khẩu lần đầu</h2>
                  <p className="muted">Cập nhật mật khẩu trước khi truy cập khu vực làm việc được phân quyền.</p>
                  <form onSubmit={submitPasswordChange}>
                    <label>
                      Mật khẩu hiện tại
                      <div className="password-wrap">
                        <input
                          name="currentPassword"
                          type={ui.passwordVisible ? "text" : "password"}
                          autoComplete="current-password"
                          placeholder="Nhập mật khẩu hiện tại"
                          required
                        />
                        <button
                          type="button"
                          aria-label={ui.passwordVisible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                          onClick={() => setUi((state) => togglePassword(state))}
                        >
                          {ui.passwordVisible ? "Ẩn" : "Hiện"}
                        </button>
                      </div>
                    </label>
                    <label>
                      Mật khẩu mới
                      <input
                        name="newPassword"
                        type={ui.passwordVisible ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Ít nhất 12 ký tự"
                        minLength={12}
                        required
                      />
                    </label>
                    <label>
                      Xác nhận mật khẩu mới
                      <input
                        name="confirmPassword"
                        type={ui.passwordVisible ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Nhập lại mật khẩu mới"
                        minLength={12}
                        required
                      />
                    </label>
                    {authError ? <p className="demo-note" role="alert">{authError}</p> : null}
                    {authMessage ? <p className="demo-note" role="status">{authMessage}</p> : null}
                    <button className="primary" type="submit" disabled={authBusy}>
                      {authBusy ? "Đang cập nhật…" : "Cập nhật mật khẩu"}
                    </button>
                    <p className="demo-note">Sau khi đổi mật khẩu, toàn bộ phiên hiện tại sẽ bị thu hồi và cần đăng nhập lại.</p>
                    <button className="text-btn" type="button" onClick={() => void logout()} disabled={authBusy}>Đăng xuất</button>
                  </form>
                </>
              ) : (
                <>
                  <div className="login-kicker">{UI_BASELINE_COPY.loginKicker}</div>
                  <h2>{UI_BASELINE_COPY.welcomeTitle}</h2>
                  <p className="muted">Truy cập công việc và quy trình trong phạm vi được phân quyền.</p>
                  <form onSubmit={submitLogin}>
                    <label>
                      Tên đăng nhập
                      <input autoComplete="username" name="username" placeholder="Nhập tên đăng nhập" required />
                    </label>
                    <label>
                      Mật khẩu
                      <div className="password-wrap">
                        <input
                          name="password"
                          type={ui.passwordVisible ? "text" : "password"}
                          autoComplete="current-password"
                          placeholder="Nhập mật khẩu"
                          required
                        />
                        <button
                          type="button"
                          aria-label={ui.passwordVisible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                          onClick={() => setUi((state) => togglePassword(state))}
                        >
                          {ui.passwordVisible ? "Ẩn" : "Hiện"}
                        </button>
                      </div>
                    </label>
                    <div className="form-meta">
                      <label className="check"><input type="checkbox" disabled /> <span>Ghi nhớ trên thiết bị này</span></label>
                      <span className="policy-note">Khôi phục mật khẩu chưa bật</span>
                    </div>
                    {authError ? <p className="demo-note" role="alert">{authError}</p> : null}
                    {authMessage ? <p className="demo-note" role="status">{authMessage}</p> : null}
                    <button className="primary" type="submit" disabled={authBusy || restoring}>
                      {restoring ? "Đang kiểm tra phiên…" : authBusy ? "Đang đăng nhập…" : "Đăng nhập"}
                    </button>
                    <p className="demo-note">Xác thực nội bộ dùng phiên máy chủ. Thông báo đăng nhập không tiết lộ tài khoản có tồn tại hay không.</p>
                  </form>
                </>
              )}
            </div>
            <p className="support">G0-03 Authentication Foundation · SOP Specification v1.6 Lean Baseline Rev.10</p>
          </section>
        </main>
      ) : (
        <main className="app-shell" aria-live="polite">
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
                <button
                  type="button"
                  className="profile"
                  onClick={() => void logout()}
                  disabled={authBusy}
                  aria-label={`Đăng xuất tài khoản ${displayName}`}
                  title="Đăng xuất"
                >
                  {initials(displayName)} <span>{displayName}</span>
                </button>
              </div>
            </header>

            <div className="content">
              <div className="welcome">
                <div><span className="eyebrow dark">Hôm nay</span><h1>Chào buổi sáng, {displayName}</h1><p>6 công việc có thể thao tác · 2 ngoại lệ cần chú ý.</p></div>
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
