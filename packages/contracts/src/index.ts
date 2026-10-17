export interface HealthResponse {
  status: "ok";
  service: string;
  apiVersion: "v1";
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    requestId?: string;
  };
}

export interface AuthLoginRequest {
  username: string;
  password: string;
}

export interface AuthRoleAssignmentResponse {
  roleCode: string;
  scopeId: string;
}

export interface AuthUserResponse {
  id: string;
  username: string;
  displayName: string;
  roles: AuthRoleAssignmentResponse[];
}

export interface AuthSessionResponse {
  authenticated: true;
  csrfToken: string;
  expiresAt: number;
  mustChangePassword: boolean;
  user: AuthUserResponse;
}

export interface AuthAnonymousResponse {
  authenticated: false;
}

export interface AuthChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface AuthPermissionCheckResponse {
  allowed: boolean;
}
