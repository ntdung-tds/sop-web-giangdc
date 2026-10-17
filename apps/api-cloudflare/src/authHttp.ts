import {
  AUTH_POLICY_DEFAULTS,
  AuthService,
  type AuthRepository,
} from "@sop/application";

const SESSION_COOKIE = "__Host-sop_session";
const JSON_HEADERS = {
  "cache-control": "no-store",
  "content-type": "application/json; charset=utf-8",
  "x-content-type-options": "nosniff",
} as const;

interface LoginBody {
  username?: unknown;
  password?: unknown;
}

interface ChangePasswordBody {
  currentPassword?: unknown;
  newPassword?: unknown;
}

function json(body: unknown, status = 200, extraHeaders: HeadersInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...JSON_HEADERS, ...extraHeaders },
  });
}

function methodNotAllowed(allowed: string): Response {
  return json(
    { error: { code: "METHOD_NOT_ALLOWED", message: "Phương thức không được hỗ trợ." } },
    405,
    { allow: allowed },
  );
}

function genericAuthError(): Response {
  return json(
    { error: { code: "INVALID_CREDENTIALS", message: "Tên đăng nhập hoặc mật khẩu không đúng." } },
    401,
  );
}

function invalidSession(): Response {
  return json(
    { error: { code: "INVALID_SESSION", message: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn." } },
    401,
    { "set-cookie": clearSessionCookie() },
  );
}

function forbidden(): Response {
  return json(
    { error: { code: "FORBIDDEN", message: "Bạn không có quyền thực hiện thao tác này." } },
    403,
  );
}

function parseCookies(request: Request): Map<string, string> {
  const cookies = new Map<string, string>();
  const raw = request.headers.get("cookie") ?? "";
  for (const part of raw.split(";")) {
    const separator = part.indexOf("=");
    if (separator < 1) continue;
    const name = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();
    cookies.set(name, value);
  }
  return cookies;
}

function sessionToken(request: Request): string {
  return parseCookies(request).get(SESSION_COOKIE) ?? "";
}

function sourceAddress(request: Request): string {
  const direct = request.headers.get("cf-connecting-ip")?.trim();
  if (direct) return direct;
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || "unknown";
}

function sessionCookie(token: string): string {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax`;
}

function clearSessionCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

async function readJson<T>(request: Request): Promise<T | null> {
  const type = request.headers.get("content-type")?.toLocaleLowerCase("en-US") ?? "";
  if (!type.includes("application/json")) return null;
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

function sessionResponse(session: Awaited<ReturnType<AuthService["getSession"]>>): Response {
  if (!session) return invalidSession();
  return json({
    authenticated: true,
    csrfToken: session.csrfToken,
    expiresAt: session.expiresAt,
    mustChangePassword: session.mustChangePassword,
    user: session.user,
  });
}

async function requireSession(
  request: Request,
  service: AuthService,
): Promise<{ token: string; csrfToken: string } | Response> {
  const token = sessionToken(request);
  const session = await service.getSession(token);
  if (!session) return invalidSession();
  return { token, csrfToken: session.csrfToken };
}

function hasValidCsrf(request: Request, expected: string): boolean {
  const actual = request.headers.get("x-csrf-token") ?? "";
  return actual.length > 0 && actual === expected;
}

function isValidOpaqueCode(value: string): boolean {
  return value.length > 0 && value.length <= 128 && !/\s/.test(value);
}

export async function handleAuthHttpRequest(
  request: Request,
  repository: AuthRepository,
): Promise<Response | null> {
  const url = new URL(request.url);
  const service = new AuthService(repository, AUTH_POLICY_DEFAULTS);

  if (url.pathname === "/api/v1/auth/login") {
    if (request.method !== "POST") return methodNotAllowed("POST");
    const body = await readJson<LoginBody>(request);
    if (!body || typeof body.username !== "string" || typeof body.password !== "string") {
      return genericAuthError();
    }
    const result = await service.login({
      username: body.username,
      password: body.password,
      source: sourceAddress(request),
    });
    if (!result.ok) return genericAuthError();
    return json(
      {
        authenticated: true,
        csrfToken: result.session.csrfToken,
        expiresAt: result.session.expiresAt,
        mustChangePassword: result.session.mustChangePassword,
        user: result.session.user,
      },
      200,
      { "set-cookie": sessionCookie(result.session.token) },
    );
  }

  if (url.pathname === "/api/v1/auth/session") {
    if (request.method !== "GET") return methodNotAllowed("GET");
    const token = sessionToken(request);
    if (!token) return json({ authenticated: false });
    const session = await service.getSession(token);
    if (!session) {
      return json({ authenticated: false }, 200, { "set-cookie": clearSessionCookie() });
    }
    return sessionResponse(session);
  }

  if (url.pathname === "/api/v1/auth/logout") {
    if (request.method !== "POST") return methodNotAllowed("POST");
    const required = await requireSession(request, service);
    if (required instanceof Response) return required;
    if (!hasValidCsrf(request, required.csrfToken)) return forbidden();
    await service.logout(required.token);
    return new Response(null, {
      status: 204,
      headers: { "cache-control": "no-store", "set-cookie": clearSessionCookie() },
    });
  }

  if (url.pathname === "/api/v1/auth/logout-all") {
    if (request.method !== "POST") return methodNotAllowed("POST");
    const required = await requireSession(request, service);
    if (required instanceof Response) return required;
    if (!hasValidCsrf(request, required.csrfToken)) return forbidden();
    await service.logoutAll(required.token);
    return new Response(null, {
      status: 204,
      headers: { "cache-control": "no-store", "set-cookie": clearSessionCookie() },
    });
  }

  if (url.pathname === "/api/v1/auth/change-password") {
    if (request.method !== "POST") return methodNotAllowed("POST");
    const required = await requireSession(request, service);
    if (required instanceof Response) return required;
    if (!hasValidCsrf(request, required.csrfToken)) return forbidden();
    const body = await readJson<ChangePasswordBody>(request);
    if (
      !body ||
      typeof body.currentPassword !== "string" ||
      typeof body.newPassword !== "string"
    ) {
      return json(
        { error: { code: "PASSWORD_POLICY", message: "Thông tin đổi mật khẩu không hợp lệ." } },
        400,
      );
    }
    const result = await service.changePassword({
      sessionToken: required.token,
      currentPassword: body.currentPassword,
      newPassword: body.newPassword,
    });
    if (!result.ok) {
      const status = result.error.code === "INVALID_CREDENTIALS" ? 401 : 400;
      return json({ error: result.error }, status);
    }
    return json(
      { changed: true, reauthenticate: true },
      200,
      { "set-cookie": clearSessionCookie() },
    );
  }

  if (url.pathname === "/api/v1/authz/check") {
    if (request.method !== "GET") return methodNotAllowed("GET");
    const required = await requireSession(request, service);
    if (required instanceof Response) return required;
    const permissionCode = url.searchParams.get("permission")?.trim() ?? "";
    const scopeId = url.searchParams.get("scopeId")?.trim() ?? "";
    if (!isValidOpaqueCode(permissionCode) || !isValidOpaqueCode(scopeId)) {
      return json(
        { error: { code: "BAD_REQUEST", message: "Yêu cầu phân quyền không hợp lệ." } },
        400,
      );
    }
    return json({ allowed: await service.isAllowed(required.token, permissionCode, scopeId) });
  }

  return null;
}
