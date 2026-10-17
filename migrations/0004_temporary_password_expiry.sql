PRAGMA foreign_keys = ON;

ALTER TABLE auth_users ADD COLUMN temporary_password_expires_at INTEGER;

CREATE INDEX IF NOT EXISTS idx_auth_users_temporary_password_expiry
  ON auth_users(temporary_password_expires_at)
  WHERE must_change_password = 1 AND temporary_password_expires_at IS NOT NULL;
