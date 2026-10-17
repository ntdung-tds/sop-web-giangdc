export type ProcessStatus = "ACTIVE" | "INACTIVE";
export type ProcessVersionStatus =
  | "DRAFT"
  | "IN_REVIEW"
  | "APPROVED"
  | "SCHEDULED"
  | "ACTIVE"
  | "SUPERSEDED"
  | "RETIRED";

export interface AuthoringStep {
  stepCode: string;
  sequenceNo: number;
  title: string;
  prerequisiteText: string;
  inputText: string;
  instruction: string;
  noteText: string;
  warningText: string;
  expectedResult: string;
  outputText: string;
  isRequired: boolean;
  targetDurationSec: number;
  businessRoleCodes: string[];
  stepStartPolicy: "STRICT_SEQUENTIAL";
}

export interface ProcessVersionDraft {
  processId: string;
  versionNo: number;
  name: string;
  purpose: string;
  scopeText: string;
  audience: string;
  triggerText: string;
  finishCondition: string;
  status: ProcessVersionStatus;
  changeSummary: string;
  steps: AuthoringStep[];
}

export interface ProcessAggregate {
  id: string;
  code: string;
  ownerUserId: string;
  orgScopeId: string;
  groupId?: string;
  status: ProcessStatus;
  versions: ProcessVersionDraft[];
}

export interface DraftValidationIssue {
  code:
    | "OWNER_REQUIRED"
    | "STEP_REQUIRED"
    | "SEQUENCE_INVALID"
    | "STEP_TITLE_REQUIRED"
    | "STEP_ROLE_REQUIRED"
    | "CHANGE_SUMMARY_REQUIRED";
  path: string;
  message: string;
}

export interface CreateProcessDraftInput {
  id: string;
  code: string;
  ownerUserId: string;
  orgScopeId: string;
  groupId?: string;
  name: string;
  purpose: string;
  scopeText: string;
  audience: string;
  triggerText: string;
  finishCondition: string;
  changeSummary: string;
}

function notImplemented(): never {
  throw new Error("PA-01 test-first: implementation pending");
}

export function createProcessWithInitialDraft(
  _input: CreateProcessDraftInput,
): ProcessAggregate {
  return notImplemented();
}

export function createNextDraftVersion(
  _process: ProcessAggregate,
  _changeSummary: string,
): ProcessAggregate {
  return notImplemented();
}

export function addStep(
  _version: ProcessVersionDraft,
  _step: Omit<AuthoringStep, "sequenceNo">,
): ProcessVersionDraft {
  return notImplemented();
}

export function moveStep(
  _version: ProcessVersionDraft,
  _fromIndex: number,
  _toIndex: number,
): ProcessVersionDraft {
  return notImplemented();
}

export function copyStep(
  _version: ProcessVersionDraft,
  _stepCode: string,
  _newStepCode: string,
): ProcessVersionDraft {
  return notImplemented();
}

export function removeStep(
  _version: ProcessVersionDraft,
  _stepCode: string,
): ProcessVersionDraft {
  return notImplemented();
}

export function validateAuthoringDraftCore(
  _process: ProcessAggregate,
  _version: ProcessVersionDraft,
): DraftValidationIssue[] {
  return notImplemented();
}
