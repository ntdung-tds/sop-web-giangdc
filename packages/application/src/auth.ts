export type PermissionCode = string;
export type SystemRoleCode = string;

export interface RoleAssignment {
  roleCode: SystemRoleCode;
  scopeId: string;
}

export interface AuthUserRecord {
  id: string;
  username: string;
  displayName: string;
  passwordHash: string;
  mustChangePassword: boolean;
  failedLoginCount: number;
  lockedUntil: number | null;
  roles: RoleAssignment[];
  active: boolean;
}

export interface AuthSessionRecord {
  id: string;
  userId: string;
  tokenHash: string;
  csrfToken: string;
  createdAt: number;
  expiresAt: number;
  revokedAt: number | null;
}

export interface LoginSourceState {
  source: string;
  windowStartedAt: number;
  failureCount: number;
  blockedUntil: number | null;
}

export interface AuthRepository {
  findUserByUsername(username: string): Promise<AuthUserRecord | null>;
  findUserById(userId: string): Promise<AuthUserRecord | null>;
  saveUser(user: AuthUserRecord): Promise<void>;
  findSessionByTokenHash(tokenHash: string): Promise<AuthSessionRecord | null>;
  saveSession(session: AuthSessionRecord): Promise<void>;
  revokeSession(sessionId: string, revokedAt: number): Promise<void>;
  revokeAllSessions(userId: string, revokedAt: number): Promise<void>;
  findLoginSource(source: string): Promise<LoginSourceState | null>;
  saveLoginSource(state: LoginSourceState): Promise<void>;
  roleHasPermission(roleCode: SystemRoleCode, permissionCode: PermissionCode): Promise<boolean>;
}

export interface AuthPolicy {
  lockoutThreshold: number;
  lockoutDurationMs: number;
  sessionTtlMs: number;
  pbkdf2Iterations: number;
  sourceRateLimitThreshold?: number;
  sourceRateWindowMs?: number;
  sourceBlockDurationMs?: number;
  minimumPasswordLength?: number;
}

interface ResolvedAuthPolicy {
  lockoutThreshold: number;
  lockoutDurationMs: number;
  sessionTtlMs: number;
  pbkdf2Iterations: number;
  sourceRateLimitThreshold: number;
  sourceRateWindowMs: number;
  sourceBlockDurationMs: number;
  minimumPasswordLength: number;
}

export const AUTH_POLICY_DEFAULTS: AuthPolicy = {
  lockoutThreshold: 5,
  lockoutDurationMs: 15 * 60_000,
  sessionTtlMs: 8 * 60 * 60_000,
  pbkdf2Iterations: 600_000,
  sourceRateLimitThreshold: 20,
  sourceRateWindowMs: 15 * 60_000,
  sourceBlockDurationMs: 15 * 60_000,
  minimumPasswordLength: 12,
};

export interface PublicAuthUser {
  id: string;
  username: string;
  displayName: string;
  roles: RoleAssignment[];
}

export interface AuthenticatedSession {
  token: string;
  csrfToken: string;
  expiresAt: number;
  mustChangePassword: boolean;
  user: PublicAuthUser;
}

export interface LoginInput {
  username: string;
  password: string;
  source: string;
}

export interface AuthFailure {
  code: "INVALID_CREDENTIALS" | "INVALID_SESSION" | "PASSWORD_POLICY";
  message: string;
}

export type LoginResult =
  | { ok: true; session: AuthenticatedSession }
  | { ok: false; error: AuthFailure };

export type PasswordChangeResult = { ok: true } | { ok: false; error: AuthFailure };

export interface ChangePasswordInput {
  sessionToken: string;
  currentPassword: string;
  newPassword: string;
}

interface AuthDependencies {
  now?: () => number;
  randomBytes?: (length: number) => Uint8Array;
}

const INVALID_CREDENTIALS: AuthFailure = {
  code: "INVALID_CREDENTIALS",
  message: "Tên đăng nhập hoặc mật khẩu không đúng.",
};

const INVALID_SESSION: AuthFailure = {
  code: "INVALID_SESSION",
  message: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn.",
};

function resolvePolicy(policy: AuthPolicy): ResolvedAuthPolicy {
  return {
    lockoutThreshold: policy.lockoutThreshold,
    lockoutDurationMs: policy.lockoutDurationMs,
    sessionTtlMs: policy.sessionTtlMs,
    pbkdf2Iterations: policy.pbkdf2Iterations,
    sourceRateLimitThreshold:
      policy.sourceRateLimitThreshold ?? AUTH_POLICY_DEFAULTS.sourceRateLimitThreshold ?? 20,
    sourceRateWindowMs:
      policy.sourceRateWindowMs ?? AUTH_POLICY_DEFAULTS.sourceRateWindowMs ?? 15 * 60_000,
    sourceBlockDurationMs:
      policy.sourceBlockDurationMs ?? AUTH_POLICY_DEFAULTS.sourceBlockDurationMs ?? 15 * 60_000,
    minimumPasswordLength:
      policy.minimumPasswordLength ?? AUTH_POLICY_DEFAULTS.minimumPasswordLength ?? 12,
  };
}

function normalizeUsername(username: string): string {
  return username.trim().toLocaleLowerCase("en-US");
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function asArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

function constantTimeEqual(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= (left[index] ?? 0) ^ (right[index] ?? 0);
  }
  return difference === 0;
}

async function pbkdf2(
  password: string,
  salt: Uint8Array,
  iterations: number,
): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: asArrayBuffer(salt), iterations },
    key,
    256,
  );
  return new Uint8Array(bits);
}

export async function createPasswordHash(
  password: string,
  iterations = AUTH_POLICY_DEFAULTS.pbkdf2Iterations,
): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const digest = await pbkdf2(password, salt, iterations);
  return `pbkdf2-sha256$${iterations}$${bytesToBase64(salt)}$${bytesToBase64(digest)}`;
}

export async function verifyPassword(password: string, encoded: string): Promise<boolean> {
  const [algorithm, iterationsRaw, saltRaw, digestRaw] = encoded.split("$");
  if (algorithm !== "pbkdf2-sha256" || !iterationsRaw || !saltRaw || !digestRaw) return false;
  const iterations = Number(iterationsRaw);
  if (!Number.isSafeInteger(iterations) || iterations <= 0) return false;
  const actual = await pbkdf2(password, base64ToBytes(saltRaw), iterations);
  return constantTimeEqual(actual, base64ToBytes(digestRaw));
}

async function sha256Base64(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return bytesToBase64(new Uint8Array(digest));
}

function randomToken(randomBytes: (length: number) => Uint8Array, length = 32): string {
  return bytesToBase64(randomBytes(length))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function publicUser(user: AuthUserRecord): PublicAuthUser {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    roles: user.roles.map((assignment) => ({ ...assignment })),
  };
}

export class InMemoryAuthRepository implements AuthRepository {
  private readonly users = new Map<string, AuthUserRecord>();
  private readonly sessions = new Map<string, AuthSessionRecord>();
  private readonly sourceStates = new Map<string, LoginSourceState>();
  private readonly rolePermissions = new Map<SystemRoleCode, Set<PermissionCode>>();

  async findUserByUsername(username: string): Promise<AuthUserRecord | null> {
    const normalized = normalizeUsername(username);
    for (const user of this.users.values()) {
      if (normalizeUsername(user.username) === normalized) return structuredClone(user);
    }
    return null;
  }

  async findUserById(userId: string): Promise<AuthUserRecord | null> {
    const user = this.users.get(userId);
    return user ? structuredClone(user) : null;
  }

  async saveUser(user: AuthUserRecord): Promise<void> {
    this.users.set(user.id, structuredClone(user));
  }

  async findSessionByTokenHash(tokenHash: string): Promise<AuthSessionRecord | null> {
    for (const session of this.sessions.values()) {
      if (session.tokenHash === tokenHash) return structuredClone(session);
    }
    return null;
  }

  async saveSession(session: AuthSessionRecord): Promise<void> {
    this.sessions.set(session.id, structuredClone(session));
  }

  async revokeSession(sessionId: string, revokedAt: number): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) this.sessions.set(sessionId, { ...session, revokedAt });
  }

  async revokeAllSessions(userId: string, revokedAt: number): Promise<void> {
    for (const [id, session] of this.sessions.entries()) {
      if (session.userId === userId && session.revokedAt === null) {
        this.sessions.set(id, { ...session, revokedAt });
      }
    }
  }

  async findLoginSource(source: string): Promise<LoginSourceState | null> {
    const state = this.sourceStates.get(source);
    return state ? structuredClone(state) : null;
  }

  async saveLoginSource(state: LoginSourceState): Promise<void> {
    this.sourceStates.set(state.source, structuredClone(state));
  }

  async roleHasPermission(
    roleCode: SystemRoleCode,
    permissionCode: PermissionCode,
  ): Promise<boolean> {
    return this.rolePermissions.get(roleCode)?.has(permissionCode) ?? false;
  }

  grantRolePermission(roleCode: SystemRoleCode, permissionCode: PermissionCode): void {
    const permissions = this.rolePermissions.get(roleCode) ?? new Set<PermissionCode>();
    permissions.add(permissionCode);
    this.rolePermissions.set(roleCode, permissions);
  }
}

export class AuthService {
  private readonly now: () => number;
  private readonly randomBytes: (length: number) => Uint8Array;
  private readonly policy: ResolvedAuthPolicy;

  constructor(
    private readonly repository: AuthRepository,
    policy: AuthPolicy = AUTH_POLICY_DEFAULTS,
    dependencies: AuthDependencies = {},
  ) {
    this.policy = resolvePolicy(policy);
    this.now = dependencies.now ?? (() => Date.now());
    this.randomBytes =
      dependencies.randomBytes ?? ((length) => crypto.getRandomValues(new Uint8Array(length)));
  }

  async login(input: LoginInput): Promise<LoginResult> {
    const now = this.now();
    if (await this.isSourceBlocked(input.source, now)) {
      return { ok: false, error: INVALID_CREDENTIALS };
    }

    const user = await this.repository.findUserByUsername(input.username);
    if (!user || !user.active) {
      await this.consumeDummyPasswordWork(input.password);
      await this.recordSourceFailure(input.source, now);
      return { ok: false, error: INVALID_CREDENTIALS };
    }

    if (user.lockedUntil !== null && user.lockedUntil > now) {
      await this.consumeDummyPasswordWork(input.password);
      await this.recordSourceFailure(input.source, now);
      return { ok: false, error: INVALID_CREDENTIALS };
    }

    const passwordValid = await verifyPassword(input.password, user.passwordHash);
    if (!passwordValid) {
      const nextFailureCount = user.failedLoginCount + 1;
      const shouldLock = nextFailureCount >= this.policy.lockoutThreshold;
      await this.repository.saveUser({
        ...user,
        failedLoginCount: shouldLock ? 0 : nextFailureCount,
        lockedUntil: shouldLock ? now + this.policy.lockoutDurationMs : null,
      });
      await this.recordSourceFailure(input.source, now);
      return { ok: false, error: INVALID_CREDENTIALS };
    }

    const resetUser = { ...user, failedLoginCount: 0, lockedUntil: null };
    await this.repository.saveUser(resetUser);
    await this.resetSourceThrottle(input.source, now);
    return { ok: true, session: await this.createSession(resetUser, now) };
  }

  async getSession(sessionToken: string): Promise<AuthenticatedSession | null> {
    const resolved = await this.resolveSession(sessionToken);
    if (!resolved) return null;
    return {
      token: sessionToken,
      csrfToken: resolved.session.csrfToken,
      expiresAt: resolved.session.expiresAt,
      mustChangePassword: resolved.user.mustChangePassword,
      user: publicUser(resolved.user),
    };
  }

  async logout(sessionToken: string): Promise<void> {
    const resolved = await this.resolveSession(sessionToken);
    if (resolved) await this.repository.revokeSession(resolved.session.id, this.now());
  }

  async logoutAll(sessionToken: string): Promise<void> {
    const resolved = await this.resolveSession(sessionToken);
    if (resolved) await this.repository.revokeAllSessions(resolved.user.id, this.now());
  }

  async changePassword(input: ChangePasswordInput): Promise<PasswordChangeResult> {
    const resolved = await this.resolveSession(input.sessionToken);
    if (!resolved) return { ok: false, error: INVALID_SESSION };

    const currentPasswordValid = await verifyPassword(
      input.currentPassword,
      resolved.user.passwordHash,
    );
    if (!currentPasswordValid) return { ok: false, error: INVALID_CREDENTIALS };
    if (
      input.newPassword.length < this.policy.minimumPasswordLength ||
      input.newPassword === input.currentPassword
    ) {
      return {
        ok: false,
        error: {
          code: "PASSWORD_POLICY",
          message: `Mật khẩu mới phải có ít nhất ${this.policy.minimumPasswordLength} ký tự và khác mật khẩu hiện tại.`,
        },
      };
    }

    const passwordHash = await createPasswordHash(
      input.newPassword,
      this.policy.pbkdf2Iterations,
    );
    await this.repository.saveUser({
      ...resolved.user,
      passwordHash,
      mustChangePassword: false,
      failedLoginCount: 0,
      lockedUntil: null,
    });
    await this.repository.revokeAllSessions(resolved.user.id, this.now());
    return { ok: true };
  }

  async isAllowed(
    sessionToken: string,
    permissionCode: PermissionCode,
    scopeId: string,
  ): Promise<boolean> {
    const resolved = await this.resolveSession(sessionToken);
    if (!resolved || resolved.user.mustChangePassword) return false;

    for (const assignment of resolved.user.roles) {
      const scopeMatches = assignment.scopeId === "*" || assignment.scopeId === scopeId;
      if (
        scopeMatches &&
        (await this.repository.roleHasPermission(assignment.roleCode, permissionCode))
      ) {
        return true;
      }
    }
    return false;
  }

  private async createSession(
    user: AuthUserRecord,
    now: number,
  ): Promise<AuthenticatedSession> {
    const token = randomToken(this.randomBytes);
    const csrfToken = randomToken(this.randomBytes, 24);
    const session: AuthSessionRecord = {
      id: randomToken(this.randomBytes, 18),
      userId: user.id,
      tokenHash: await sha256Base64(token),
      csrfToken,
      createdAt: now,
      expiresAt: now + this.policy.sessionTtlMs,
      revokedAt: null,
    };
    await this.repository.saveSession(session);
    return {
      token,
      csrfToken,
      expiresAt: session.expiresAt,
      mustChangePassword: user.mustChangePassword,
      user: publicUser(user),
    };
  }

  private async resolveSession(
    sessionToken: string,
  ): Promise<{ session: AuthSessionRecord; user: AuthUserRecord } | null> {
    if (!sessionToken) return null;
    const tokenHash = await sha256Base64(sessionToken);
    const session = await this.repository.findSessionByTokenHash(tokenHash);
    const now = this.now();
    if (!session || session.revokedAt !== null || session.expiresAt <= now) return null;
    const user = await this.repository.findUserById(session.userId);
    if (!user || !user.active) return null;
    return { session, user };
  }

  private async isSourceBlocked(source: string, now: number): Promise<boolean> {
    const state = await this.repository.findLoginSource(source);
    if (!state) return false;
    return state.blockedUntil !== null && state.blockedUntil > now;
  }

  private async recordSourceFailure(source: string, now: number): Promise<void> {
    const current = await this.repository.findLoginSource(source);
    const outsideWindow =
      !current || now - current.windowStartedAt >= this.policy.sourceRateWindowMs;
    const failureCount = outsideWindow ? 1 : current.failureCount + 1;
    const shouldBlock = failureCount >= this.policy.sourceRateLimitThreshold;
    await this.repository.saveLoginSource({
      source,
      windowStartedAt: outsideWindow ? now : current.windowStartedAt,
      failureCount: shouldBlock ? 0 : failureCount,
      blockedUntil: shouldBlock ? now + this.policy.sourceBlockDurationMs : null,
    });
  }

  private async resetSourceThrottle(source: string, now: number): Promise<void> {
    await this.repository.saveLoginSource({
      source,
      windowStartedAt: now,
      failureCount: 0,
      blockedUntil: null,
    });
  }

  private async consumeDummyPasswordWork(password: string): Promise<void> {
    const salt = new Uint8Array(16);
    await pbkdf2(password, salt, this.policy.pbkdf2Iterations);
  }
}
