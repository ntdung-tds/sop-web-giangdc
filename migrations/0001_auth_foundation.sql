PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS auth_users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  username_norm TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  must_change_password INTEGER NOT NULL DEFAULT 1 CHECK (must_change_password IN (0, 1)),
  failed_login_count INTEGER NOT NULL DEFAULT 0 CHECK (failed_login_count >= 0),
  locked_until INTEGER,
  roles_json TEXT NOT NULL DEFAULT '[]',
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS auth_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  csrf_token TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  revoked_at INTEGER,
  FOREIGN KEY (user_id) REFERENCES auth_users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_active
  ON auth_sessions(user_id, revoked_at, expires_at);

CREATE TABLE IF NOT EXISTS auth_login_sources (
  source TEXT PRIMARY KEY,
  window_started_at INTEGER NOT NULL,
  failure_count INTEGER NOT NULL DEFAULT 0 CHECK (failure_count >= 0),
  blocked_until INTEGER
);

CREATE TABLE IF NOT EXISTS auth_security_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  event_type TEXT NOT NULL,
  source TEXT,
  occurred_at INTEGER NOT NULL,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  FOREIGN KEY (user_id) REFERENCES auth_users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_auth_security_events_user_time
  ON auth_security_events(user_id, occurred_at DESC);
