import type {
  AuthRepository,
  AuthSessionRecord,
  AuthUserRecord,
  LoginSourceState,
  RoleAssignment,
} from "@sop/application";

export interface D1PreparedStatementLike {
  bind(...values: unknown[]): D1PreparedStatementLike;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  run(): Promise<unknown>;
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

function normalizeUsername(username: string): string {
  return username.trim().toLocaleLowerCase("en-US");
}

function parseRoles(value: string): RoleAssignment[] {
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((candidate): RoleAssignment[] => {
      if (!candidate || typeof candidate !== "object") return [];
      const role = Reflect.get(candidate, "role");
      const scopeId = Reflect.get(candidate, "scopeId");
      const validRole =
        role === "ADMIN" ||
        role === "PROCESS_OWNER" ||
        role === "REVIEWER" ||
        role === "OPERATOR" ||
        role === "AUDITOR";
      if (!validRole || typeof scopeId !== "string") return [];
      return [{ role, scopeId }];
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
    passwordHash: row.password_hash,
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
}
