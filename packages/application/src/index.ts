import type { HealthResponse } from "@sop/contracts";

export const API_VERSION = "v1" as const;

export function buildHealthResponse(service: string): HealthResponse {
  return {
    status: "ok",
    service,
    apiVersion: API_VERSION,
  };
}
