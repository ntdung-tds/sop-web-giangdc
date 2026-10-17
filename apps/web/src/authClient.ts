export interface AuthRoleAssignment {
  roleCode: string;
  scopeId: string;
}

export interface AuthUser {
  id: string;
  username: string;
  displayName: string;
  roles: AuthRoleAssignment[];
}

export interface AuthSession {
  authenticated: true;
  csrfToken: string;
  expiresAt: number;
  mustChangePassword: boolean;
  user: AuthUser;
}

interface ErrorEnvelope {
  error?: {
    code?: string;
    message?: string;
  };
}

export class AuthApiError extends Error {
  constructor(
    readonly code: string,
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "AuthApiError";
  }
}

async function parseJson<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function throwApiError(response: Response): Promise<never> {
  const body = await parseJson<ErrorEnvelope>(response);
  throw new AuthApiError(
    body?.error?.code ?? "AUTH_REQUEST_FAILED",
    response.status,
    body?.error?.message ?? "Không thể hoàn tất yêu cầu xác thực.",
  );
}

export async function restoreSession(): Promise<AuthSession | null> {
  const response = await fetch("/api/v1/auth/session", {
    method: "GET",
    credentials: "same-origin",
    headers: { accept: "application/json" },
  });
  if (!response.ok) return null;
  const body = await parseJson<AuthSession | { authenticated: false }>(response);
  return body?.authenticated === true ? body : null;
}

export async function login(username: string, password: string): Promise<AuthSession> {
  const response = await fetch("/api/v1/auth/login", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) return throwApiError(response);
  const body = await parseJson<AuthSession>(response);
  if (!body?.authenticated) {
    throw new AuthApiError("INVALID_SESSION", 500, "Phản hồi phiên đăng nhập không hợp lệ.");
  }
  return body;
}

export async function logout(csrfToken: string): Promise<void> {
  const response = await fetch("/api/v1/auth/logout", {
    method: "POST",
    credentials: "same-origin",
    headers: { "x-csrf-token": csrfToken },
  });
  if (!response.ok && response.status !== 401) await throwApiError(response);
}

export async function changePassword(
  csrfToken: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const response = await fetch("/api/v1/auth/change-password", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "x-csrf-token": csrfToken,
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  if (!response.ok) await throwApiError(response);
}
