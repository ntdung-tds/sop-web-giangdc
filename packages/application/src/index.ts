import type { HealthResponse } from "@sop/contracts";

export const API_VERSION = "v1";

export function buildHealthResponse(
  service: string,
  now: () => Date = () => new Date(),
): HealthResponse {
  return {
    status: "ok",
    service,
    version: API_VERSION,
    timestamp: now().toISOString(),
  };
}
