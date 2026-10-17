PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS auth_roles (
  role_code TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS auth_role_permissions (
  role_code TEXT NOT NULL,
  permission_code TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (role_code, permission_code),
  FOREIGN KEY (role_code) REFERENCES auth_roles(role_code) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_auth_role_permissions_permission
  ON auth_role_permissions(permission_code, role_code);

-- Intentionally no role or permission seed here.
-- SOP v1.6 requires the permission catalog to be locked before G2;
-- G0-03 only provides the authorization engine and persistence boundary.
