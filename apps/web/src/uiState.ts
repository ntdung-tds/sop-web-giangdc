export type UiView = "landing" | "dashboard";

export interface UiState {
  view: UiView;
  passwordVisible: boolean;
}

export const UI_BASELINE_COPY = {
  loginKicker: "Đăng nhập nội bộ",
  welcomeTitle: "Chào mừng trở lại",
  heroTitle: "Mỗi quy trình rõ ràng. Mỗi bước đều truy vết được.",
} as const;

export function initialUiState(): UiState {
  return { view: "landing", passwordVisible: false };
}

export function showDashboard(_state: UiState): UiState {
  return { view: "dashboard", passwordVisible: false };
}

export function showLanding(_state: UiState): UiState {
  return initialUiState();
}

export function togglePassword(state: UiState): UiState {
  return { ...state, passwordVisible: !state.passwordVisible };
}
