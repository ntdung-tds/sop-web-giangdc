PRAGMA foreign_keys = ON;

ALTER TABLE auth_users ADD COLUMN bootstrap_origin INTEGER NOT NULL DEFAULT 0
  CHECK (bootstrap_origin IN (0, 1));

CREATE UNIQUE INDEX IF NOT EXISTS idx_auth_users_single_bootstrap_origin
  ON auth_users(bootstrap_origin)
  WHERE bootstrap_origin = 1;
