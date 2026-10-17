import type {
  AuthRepository,
  AuthSessionRecord,
  AuthUserRecord,
  LoginSourceState,
  PermissionCode,
  RoleAssignment,
  SystemRoleCode,
} from "@sop/application";

interface D1RunResultLike {
  meta?: {
    changes?: number;
  };
}

export interface D1PreparedStatementLike {
  bind(...values: unknown[]): D1PreparedStatementLike;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  run(): Promise<D1RunResultLike>;
}

export interface D1DatabaseLike {
  prepare(query: string): D1PreparedStatementLike;
}

interface UserRow {
  id: string;
  username: string;
  display_name: string;
  password_hash: string;
  must_change_password: number;
  failed_login_count: number;
  locked_until: number | null;
  roles_json: string;
  active: number;
}

interface SessionRow {
  id: string;
  user_id: string;
  token_hash: string;
  csrf_token: string;
  created_at: number;
  expires_at: number;
  revoked_at: number | null;
}

interface SourceRow {
  source: string;
  window_started_at: number;
  failure_count: number;
  blocked_until: number | null;
}

interface PermissionRow {
  allowed: number;
}

interface CountRow {
  count: number;
}

function normalizeUsername(username: string): string {
  return username.trim().toLocaleLowerCase("en-US");
}

function normalizeBase64(value: string): string | null {
  const standard = value.replaceAll("-", "+").replaceAll("_", "/");
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(standard)) return null;
  const unpadded = standard.replace(/=+$/, "");
  const remainder = unpadded.length % 4;
  if (remainder === 1) return null;
  return `${unpadded}${"=".repeat((4 - remainder) % 4)}`;
}

function normalizePersistedPasswordHash(value: string): string {
  const parts = value.split("$");
  if (parts.length !== 4) return value;
  const [algorithm, iterations, saltRaw, digestRaw] = parts;
  if (algorithm !== "pbkdf2-sha256" || !iterations || !saltRaw || !digestRaw) return value;
  const salt = normalizeBase64(saltRaw);
  const digest = normalizeBase64(digestRaw);
  if (!salt || !digest) return "invalid-password-hash";
  return `${algorithm}$${iterations}$${salt}$${digest}`;
}

function parseRoles(value: string): RoleAssignment[] {
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((candidate): RoleAssignment[] => {
      if (!candidate || typeof candidate !== "object") return [];
      const roleCode = Reflect.get(candidate, "roleCode");
      const scopeId = Reflect.get(candidate, "scopeId");
      if (typeof roleCode !== "string" || !roleCode || typeof scopeId !== "string" || !scopeId) {
        return [];
      }
      return [{ roleCode, scopeId }];
    });
  } catch {
    return [];
  }
}

function mapUser(row: UserRow): AuthUserRecord {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    passwordHash: normalizePersistedPasswordHash(row.password_hash),
    mustChangePassword: row.must_change_password === 1,
    failedLoginCount: row.failed_login_count,
    lockedUntil: row.locked_until,
    roles: parseRoles(row.roles_json),
    active: row.active === 1,
  };
}

function mapSession(row: SessionRow): AuthSessionRecord {
  return {
    id: row.id,
    userId: row.user_id,
    tokenHash: row.token_hash,
    csrfToken: row.csrf_token,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    revokedAt: row.revoked_at,
  };
}

export class D1AuthRepository implements AuthRepository {
  constructor(private readonly db: D1DatabaseLike) {}

  async findUserByUsername(username: string): Promise<AuthUserRecord | null> {
    const row = await this.db
      .prepare(
        `SELECT id, username, display_name, password_hash, must_change_password,
                failed_login_count, locked_until, roles_json, active
           FROM auth_users
          WHERE username_norm = ?1
          LIMIT 1`,
      )
      .bind(normalizeUsername(username))
      .first<UserRow>();
    return row ? mapUser(row) : null;
  }

  async findUserById(userId: string): Promise<AuthUserRecord | null> {
    const row = await this.db
      .prepare(
        `SELECT id, username, display_name, password_hash, must_change_password,
                failed_login_count, locked_until, roles_json, active
           FROM auth_users
          WHERE id = ?1
          LIMIT 1`,
      )
      .bind(userId)
      .first<UserRow>();
    return row ? mapUser(row) : null;
  }

  async saveUser(user: AuthUserRecord): Promise<void> {
    const now = Date.now();
    await this.db
      .prepare(
        `INSERT INTO auth_users (
           id, username, username_norm, display_name, password_hash,
           must_change_password, failed_login_count, locked_until, roles_json,
           active, created_at, updated_at
         ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?11)
         ON CONFLICT(id) DO UPDATE SET
           username = excluded.username,
           username_norm = excluded.username_norm,
           display_name = excluded.display_name,
           password_hash = excluded.password_hash,
           must_change_password = excluded.must_change_password,
           failed_login_count = excluded.failed_login_count,
           locked_until = excluded.locked_until,
           roles_json = excluded.roles_json,
           active = excluded.active,
           updated_at = excluded.updated_at`,
      )
      .bind(
        user.id,
        user.username,
        normalizeUsername(user.username),
        user.displayName,
        user.passwordHash,
        user.mustChangePassword ? 1 : 0,
        user.failedLoginCount,
        user.lockedUntil,
        JSON.stringify(user.roles),
        user.active ? 1 : 0,
        now,
      )
      .run();
  }

  async countUsers(): Promise<number> {
    const row = await this.db
      .prepare(`SELECT COUNT(*) AS count FROM auth_users`)
      .first<CountRow>();
    return row?.count ?? 0;
  }

  async saveBootstrapUser(user: AuthUserRecord): Promise<boolean> {
    const now = Date.now();
    const result = await this.db
      .prepare(
        `INSERT OR IGNORE INTO auth_users (
           id, username, username_norm, display_name, password_hash,
           must_change_password, failed_login_count, locked_until, roles_json,
           active, created_at, updated_at, bootstrap_origin
         )
         SELECT ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?11, 1
          WHERE NOT EXISTS (SELECT 1 FROM auth_users LIMIT 1)`,
      )
      .bind(
        user.id,
        user.username,
        normalizeUsername(user.username),
        user.displayName,
        user.passwordHash,
        user.mustChangePassword ? 1 : 0,
        user.failedLoginCount,
        user.lockedUntil,
        JSON.stringify(user.roles),
        user.active ? 1 : 0,
        now,
      )
      .run();
    return result.meta?.changes === 1;
  }

  async findSessionByTokenHash(tokenHash: string): Promise<AuthSessionRecord | null> {
    const row = await this.db
      .prepare(
        `SELECT id, user_id, token_hash, csrf_token, created_at, expires_at, revoked_at
           FROM auth_sessions
          WHERE token_hash = ?1
          LIMIT 1`,
      )
      .bind(tokenHash)
      .first<SessionRow>();
    return row ? mapSession(row) : null;
  }

  async saveSession(session: AuthSessionRecord): Promise<void> {
    await this.db
      .prepare(
        `INSERT INTO auth_sessions (
           id, user_id, token_hash, csrf_token, created_at, expires_at, revoked_at
         ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
         ON CONFLICT(id) DO UPDATE SET
           user_id = excluded.user_id,
           token_hash = excluded.token_hash,
           csrf_token = excluded.csrf_token,
           created_at = excluded.created_at,
           expires_at = excluded.expires_at,
           revoked_at = excluded.revoked_at`,
      )
      .bind(
        session.id,
        session.userId,
        session.tokenHash,
        session.csrfToken,
        session.createdAt,
        session.expiresAt,
        session.revokedAt,
      )
      .run();
  }

  async revokeSession(sessionId: string, revokedAt: number): Promise<void> {
    await this.db
      .prepare(`UPDATE auth_sessions SET revoked_at = ?2 WHERE id = ?1 AND revoked_at IS NULL`)
      .bind(sessionId, revokedAt)
      .run();
  }

  async revokeAllSessions(userId: string, revokedAt: number): Promise<void> {
    await this.db
      .prepare(
        `UPDATE auth_sessions
            SET revoked_at = ?2
          WHERE user_id = ?1 AND revoked_at IS NULL`,
      )
      .bind(userId, revokedAt)
      .run();
  }

  async findLoginSource(source: string): Promise<LoginSourceState | null> {
    const row = await this.db
      .prepare(
        `SELECT source, window_started_at, failure_count, blocked_until
           FROM auth_login_sources
          WHERE source = ?1
          LIMIT 1`,
      )
      .bind(source)
      .first<SourceRow>();
    if (!row) return null;
    return {
      source: row.source,
      windowStartedAt: row.window_started_at,
      failureCount: row.failure_count,
      blockedUntil: row.blocked_until,
    };
  }

  async saveLoginSource(state: LoginSourceState): Promise<void> {
    await this.db
      .prepare(
        `INSERT INTO auth_login_sources (
           source, window_started_at, failure_count, blocked_until
         ) VALUES (?1, ?2, ?3, ?4)
         ON CONFLICT(source) DO UPDATE SET
           window_started_at = excluded.window_started_at,
           failure_count = excluded.failure_count,
           blocked_until = excluded.blocked_until`,
      )
      .bind(state.source, state.windowStartedAt, state.failureCount, state.blockedUntil)
      .run();
  }

  async roleHasPermission(
    roleCode: SystemRoleCode,
    permissionCode: PermissionCode,
  ): Promise<boolean> {
    const row = await this.db
      .prepare(
        `SELECT 1 AS allowed
           FROM auth_role_permissions
          WHERE role_code = ?1 AND permission_code = ?2
          LIMIT 1`,
      )
      .bind(roleCode, permissionCode)
      .first<PermissionRow>();
    return row?.allowed === 1;
  }
}
