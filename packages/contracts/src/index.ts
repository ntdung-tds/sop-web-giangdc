export interface HealthResponse {
  status: "ok";
  service: string;
  version: string;
  timestamp: string;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    requestId?: string;
  };
}
