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
