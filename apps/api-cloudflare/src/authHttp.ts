import {
  AUTH_POLICY_DEFAULTS,
  AuthService,
  createPasswordHash,
  type AuthPolicy,
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

interface LegacyLoginBody extends LoginBody {
  proof?: unknown;
}

interface ChangePasswordBody {
  currentPassword?: unknown;
  newPassword?: unknown;
}

interface BootstrapBody {
  username?: unknown;
  displayName?: unknown;
  initialPassword?: unknown;
}

export interface AuthHttpOptions {
  bootstrapToken?: string;
  policy?: AuthPolicy;
  legacyBridgeEnabled?: boolean;
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

function notFound(): Response {
  return json(
    { error: { code: "NOT_FOUND", message: "Resource not found" } },
    404,
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

function loginResponse(session: Awaited<ReturnType<AuthService["login"]>>): Response {
  if (!session.ok) return genericAuthError();
  return json(
    {
      authenticated: true,
      csrfToken: session.session.csrfToken,
      expiresAt: session.session.expiresAt,
      mustChangePassword: session.session.mustChangePassword,
      user: session.session.user,
    },
    200,
    { "set-cookie": sessionCookie(session.session.token) },
  );
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

async function sha256(value: string): Promise<Uint8Array> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return new Uint8Array(digest);
}

async function secureStringEqual(actual: string, expected: string): Promise<boolean> {
  const [left, right] = await Promise.all([sha256(actual), sha256(expected)]);
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= (left[index] ?? 0) ^ (right[index] ?? 0);
  }
  return difference === 0;
}

function normalizeBase64(value: string): string | null {
  const standard = value.replaceAll("-", "+").replaceAll("_", "/");
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(standard)) return null;
  const unpadded = standard.replace(/=+$/, "");
  const remainder = unpadded.length % 4;
  if (remainder === 1) return null;
  return `${unpadded}${"=".repeat((4 - remainder) % 4)}`;
}

function base64ToBytes(value: string): Uint8Array | null {
  const normalized = normalizeBase64(value);
  if (!normalized) return null;
  try {
    const binary = atob(normalized);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return bytes;
  } catch {
    return null;
  }
}

function constantTimeBase64Equal(leftRaw: string, rightRaw: string): boolean {
  const left = base64ToBytes(leftRaw);
  const right = base64ToBytes(rightRaw);
  if (!left || !right || left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= (left[index] ?? 0) ^ (right[index] ?? 0);
  }
  return difference === 0;
}

interface LegacyPbkdf2Hash {
  iterations: number;
  salt: string;
  digest: string;
}

function parseLegacyPbkdf2Hash(encoded: string): LegacyPbkdf2Hash | null {
  const [algorithm, iterationsRaw, saltRaw, digestRaw, ...extra] = encoded.split("$");
  if (
    extra.length > 0 ||
    algorithm !== "pbkdf2-sha256" ||
    !iterationsRaw ||
    !saltRaw ||
    !digestRaw
  ) {
    return null;
  }
  const iterations = Number(iterationsRaw);
  const salt = normalizeBase64(saltRaw);
  const digest = normalizeBase64(digestRaw);
  if (!Number.isSafeInteger(iterations) || iterations <= 100_000 || !salt || !digest) return null;
  const digestBytes = base64ToBytes(digest);
  if (!digestBytes || digestBytes.length !== 32) return null;
  return { iterations, salt, digest };
}

function legacyUserEligible(
  user: Awaited<ReturnType<AuthRepository["findUserByUsername"]>>,
  now: number,
): user is NonNullable<typeof user> {
  if (!user || !user.active || !user.mustChangePassword) return false;
  if (user.lockedUntil !== null && user.lockedUntil > now) return false;
  if (
    typeof user.temporaryPasswordExpiresAt === "number" &&
    user.temporaryPasswordExpiresAt <= now
  ) {
    return false;
  }
  return parseLegacyPbkdf2Hash(user.passwordHash) !== null;
}

function sourceBlocked(
  state: Awaited<ReturnType<AuthRepository["findLoginSource"]>>,
  now: number,
): boolean {
  return Boolean(state?.blockedUntil && state.blockedUntil > now);
}

export async function handleAuthHttpRequest(
  request: Request,
  repository: AuthRepository,
  options: AuthHttpOptions = {},
): Promise<Response | null> {
  const url = new URL(request.url);
  const service = new AuthService(repository, options.policy ?? AUTH_POLICY_DEFAULTS);

  if (url.pathname === "/api/v1/auth/bootstrap") {
    const configuredToken = options.bootstrapToken ?? "";
    const suppliedToken = request.headers.get("x-bootstrap-token") ?? "";
    if (!configuredToken || !suppliedToken || !(await secureStringEqual(suppliedToken, configuredToken))) {
      return notFound();
    }
    if ((await repository.countUsers()) !== 0) return notFound();
    if (request.method !== "POST") return methodNotAllowed("POST");

    const body = await readJson<BootstrapBody>(request);
    if (
      !body ||
      typeof body.username !== "string" ||
      typeof body.displayName !== "string" ||
      typeof body.initialPassword !== "string"
    ) {
      return json(
        { error: { code: "INVALID_INPUT", message: "Thông tin khởi tạo không hợp lệ." } },
        400,
      );
    }

    const result = await service.bootstrapFirstUser({
      username: body.username,
      displayName: body.displayName,
      initialPassword: body.initialPassword,
    });
    if (!result.ok) {
      if (result.code === "BOOTSTRAP_UNAVAILABLE") return notFound();
      return json(
        {
          error: {
            code: result.code,
            message:
              result.code === "PASSWORD_POLICY"
                ? "Mật khẩu khởi tạo không đáp ứng chính sách."
                : "Thông tin khởi tạo không hợp lệ.",
          },
        },
        400,
      );
    }

    return json({ created: true, mustChangePassword: true }, 201);
  }

  if (url.pathname === "/api/v1/auth/legacy-parameters") {
    if (!options.legacyBridgeEnabled) return notFound();
    if (request.method !== "GET") return methodNotAllowed("GET");
    const username = url.searchParams.get("username")?.trim() ?? "";
    if (!username || username.length > 128) return notFound();
    const now = Date.now();
    const user = await repository.findUserByUsername(username);
    if (!legacyUserEligible(user, now)) return notFound();
    const parsed = parseLegacyPbkdf2Hash(user.passwordHash);
    if (!parsed) return notFound();
    return json({
      algorithm: "PBKDF2",
      hash: "SHA-256",
      iterations: parsed.iterations,
      salt: parsed.salt,
    });
  }

  if (url.pathname === "/api/v1/auth/legacy-login") {
    if (!options.legacyBridgeEnabled) return notFound();
    if (request.method !== "POST") return methodNotAllowed("POST");
    const body = await readJson<LegacyLoginBody>(request);
    if (
      !body ||
      typeof body.username !== "string" ||
      typeof body.password !== "string" ||
      typeof body.proof !== "string"
    ) {
      return genericAuthError();
    }

    const now = Date.now();
    const source = sourceAddress(request);
    const [user, sourceState] = await Promise.all([
      repository.findUserByUsername(body.username),
      repository.findLoginSource(source),
    ]);
    if (!legacyUserEligible(user, now) || sourceBlocked(sourceState, now)) {
      return genericAuthError();
    }
    const parsed = parseLegacyPbkdf2Hash(user.passwordHash);
    if (!parsed || !constantTimeBase64Equal(body.proof, parsed.digest)) {
      await service.login({ username: body.username, password: body.password, source });
      return genericAuthError();
    }

    const migratedPasswordHash = await createPasswordHash(body.password);
    await repository.saveUser({
      ...user,
      passwordHash: migratedPasswordHash,
      failedLoginCount: 0,
      lockedUntil: null,
    });
    const migratedLogin = await service.login({
      username: body.username,
      password: body.password,
      source,
    });
    return loginResponse(migratedLogin);
  }

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
    return loginResponse(result);
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
