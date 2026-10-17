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

interface LegacyParameters {
  algorithm: "PBKDF2";
  hash: "SHA-256";
  iterations: number;
  salt: string;
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

function base64ToBytes(value: string): Uint8Array | null {
  const standard = value.replaceAll("-", "+").replaceAll("_", "/");
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(standard)) return null;
  const unpadded = standard.replace(/=+$/, "");
  const remainder = unpadded.length % 4;
  if (remainder === 1) return null;
  const padded = `${unpadded}${"=".repeat((4 - remainder) % 4)}`;
  try {
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return bytes;
  } catch {
    return null;
  }
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function asArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

async function deriveLegacyProof(password: string, parameters: LegacyParameters): Promise<string> {
  if (
    parameters.algorithm !== "PBKDF2" ||
    parameters.hash !== "SHA-256" ||
    !Number.isSafeInteger(parameters.iterations) ||
    parameters.iterations <= 100_000 ||
    parameters.iterations > 1_000_000
  ) {
    throw new Error("Unsupported legacy parameters");
  }
  const salt = base64ToBytes(parameters.salt);
  if (!salt) throw new Error("Invalid legacy salt");
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: asArrayBuffer(salt),
      iterations: parameters.iterations,
    },
    key,
    256,
  );
  return bytesToBase64(new Uint8Array(bits));
}

async function parseSession(response: Response): Promise<AuthSession> {
  const body = await parseJson<AuthSession>(response);
  if (!body?.authenticated) {
    throw new AuthApiError("INVALID_SESSION", 500, "Phản hồi phiên đăng nhập không hợp lệ.");
  }
  return body;
}

async function tryLegacyLogin(username: string, password: string): Promise<AuthSession | null> {
  let parametersResponse: Response;
  try {
    parametersResponse = await fetch(
      `/api/v1/auth/legacy-parameters?username=${encodeURIComponent(username)}`,
      {
        method: "GET",
        credentials: "same-origin",
        headers: { accept: "application/json" },
      },
    );
  } catch {
    return null;
  }
  if (!parametersResponse.ok) return null;

  const parameters = await parseJson<LegacyParameters>(parametersResponse);
  if (!parameters) return null;

  let proof: string;
  try {
    proof = await deriveLegacyProof(password, parameters);
  } catch {
    return null;
  }

  const migrated = await fetch("/api/v1/auth/legacy-login", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify({ username, password, proof }),
  });
  if (!migrated.ok) await throwApiError(migrated);
  return parseSession(migrated);
}

export async function restoreSession(): Promise<AuthSession | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4_000);
  try {
    const response = await fetch("/api/v1/auth/session", {
      method: "GET",
      credentials: "same-origin",
      headers: { accept: "application/json" },
      signal: controller.signal,
    });
    if (!response.ok) return null;
    const body = await parseJson<AuthSession | { authenticated: false }>(response);
    return body?.authenticated === true ? body : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function login(username: string, password: string): Promise<AuthSession> {
  const legacySession = await tryLegacyLogin(username, password);
  if (legacySession) return legacySession;

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
  return parseSession(response);
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
