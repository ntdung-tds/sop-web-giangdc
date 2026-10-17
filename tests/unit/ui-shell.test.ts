import { describe, expect, it } from "vitest";
import {
  UI_BASELINE_COPY,
  initialUiState,
  showDashboard,
  showLanding,
} from "../../apps/web/src/uiState.ts";

describe("StageSign G0-01 UI baseline state", () => {
  it("starts at the approved landing/login view", () => {
    expect(initialUiState()).toEqual({ view: "landing", passwordVisible: false });
    expect(UI_BASELINE_COPY.loginKicker).toBe("Đăng nhập nội bộ");
    expect(UI_BASELINE_COPY.welcomeTitle).toBe("Chào mừng trở lại");
    expect(UI_BASELINE_COPY.heroTitle).toContain("Mỗi quy trình rõ ràng");
  });

  it("keeps the prototype login and logout transitions", () => {
    const dashboard = showDashboard(initialUiState());
    expect(dashboard.view).toBe("dashboard");

    const landing = showLanding(dashboard);
    expect(landing).toEqual({ view: "landing", passwordVisible: false });
  });
});
