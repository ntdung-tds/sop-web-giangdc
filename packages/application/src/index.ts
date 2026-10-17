import type { HealthResponse } from "@sop/contracts";
import {
  createProcessWithInitialDraft,
  type CreateProcessDraftInput,
  type ProcessAggregate,
} from "@sop/domain";

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

export interface ProcessAuthoringRepository {
  findByCode(code: string): Promise<ProcessAggregate | null>;
  save(process: ProcessAggregate): Promise<void>;
}

export class ProcessCodeConflictError extends Error {
  readonly code = "PROCESS_CODE_CONFLICT";

  constructor(code: string) {
    super(`Process code already exists: ${code}`);
    this.name = "ProcessCodeConflictError";
  }
}

export async function createProcessDraft(
  repository: ProcessAuthoringRepository,
  input: CreateProcessDraftInput,
): Promise<ProcessAggregate> {
  const existing = await repository.findByCode(input.code);
  if (existing !== null) {
    throw new ProcessCodeConflictError(input.code);
  }

  const process = createProcessWithInitialDraft(input);
  await repository.save(process);
  return process;
}
