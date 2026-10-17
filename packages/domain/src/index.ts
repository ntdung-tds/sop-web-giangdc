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
  reviewTriggersJson: unknown;
  status: ProcessVersionStatus;
  changeSummary: string;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  reviewDueAt: string | null;
  steps: AuthoringStep[];
}

export interface ProcessAggregate {
  id: string;
  code: string;
  ownerUserId: string;
  groupId: string | null;
  orgScopeId: string;
  status: string;
  versions: ProcessVersionDraft[];
}

export type DraftValidationCode =
  | "OWNER_REQUIRED"
  | "STEP_REQUIRED"
  | "SEQUENCE_INVALID"
  | "STEP_CODE_DUPLICATE"
  | "STEP_TITLE_REQUIRED"
  | "STEP_ROLE_REQUIRED"
  | "CHANGE_SUMMARY_REQUIRED";

export interface DraftValidationIssue {
  code: DraftValidationCode;
  path: string;
  message: string;
}

export interface CreateProcessDraftInput {
  id: string;
  code: string;
  ownerUserId: string;
  groupId: string | null;
  orgScopeId: string;
  status: string;
  name: string;
  purpose: string;
  scopeText: string;
  audience: string;
  triggerText: string;
  finishCondition: string;
  reviewTriggersJson: unknown;
  changeSummary: string;
}

export type EditableStepPatch = Partial<
  Omit<AuthoringStep, "stepCode" | "sequenceNo">
>;

function cloneStep(step: AuthoringStep): AuthoringStep {
  return {
    ...step,
    businessRoleCodes: [...step.businessRoleCodes],
  };
}

function cloneVersion(version: ProcessVersionDraft): ProcessVersionDraft {
  return {
    ...version,
    steps: version.steps.map(cloneStep),
  };
}

function renumberSteps(steps: AuthoringStep[]): AuthoringStep[] {
  return steps.map((step, index) => ({
    ...cloneStep(step),
    sequenceNo: index + 1,
  }));
}

function requireDraft(version: ProcessVersionDraft): void {
  if (version.status !== "DRAFT") {
    throw new Error("ProcessVersion structural edits are allowed only in DRAFT");
  }
}

function requireUniqueStepCode(
  version: ProcessVersionDraft,
  stepCode: string,
): void {
  if (version.steps.some((step) => step.stepCode === stepCode)) {
    throw new Error(`Step code already exists in this version: ${stepCode}`);
  }
}

export function createProcessWithInitialDraft(
  input: CreateProcessDraftInput,
): ProcessAggregate {
  const draft: ProcessVersionDraft = {
    processId: input.id,
    versionNo: 1,
    name: input.name,
    purpose: input.purpose,
    scopeText: input.scopeText,
    audience: input.audience,
    triggerText: input.triggerText,
    finishCondition: input.finishCondition,
    reviewTriggersJson: input.reviewTriggersJson,
    status: "DRAFT",
    changeSummary: input.changeSummary,
    effectiveFrom: null,
    effectiveTo: null,
    reviewDueAt: null,
    steps: [],
  };

  return {
    id: input.id,
    code: input.code,
    ownerUserId: input.ownerUserId,
    groupId: input.groupId,
    orgScopeId: input.orgScopeId,
    status: input.status,
    versions: [draft],
  };
}

export function createNextDraftVersion(
  process: ProcessAggregate,
  changeSummary: string,
): ProcessAggregate {
  const latest = process.versions.reduce<ProcessVersionDraft | undefined>(
    (candidate, version) =>
      candidate === undefined || version.versionNo > candidate.versionNo
        ? version
        : candidate,
    undefined,
  );

  if (latest === undefined) {
    throw new Error("Cannot create the next version without a source version");
  }

  const next = cloneVersion(latest);
  next.versionNo = latest.versionNo + 1;
  next.status = "DRAFT";
  next.changeSummary = changeSummary;
  next.effectiveFrom = null;
  next.effectiveTo = null;
  next.reviewDueAt = null;

  return {
    ...process,
    versions: [...process.versions.map(cloneVersion), next],
  };
}

export function addStep(
  version: ProcessVersionDraft,
  step: Omit<AuthoringStep, "sequenceNo">,
): ProcessVersionDraft {
  requireDraft(version);
  requireUniqueStepCode(version, step.stepCode);

  const nextStep: AuthoringStep = {
    ...step,
    businessRoleCodes: [...step.businessRoleCodes],
    sequenceNo: version.steps.length + 1,
  };

  return {
    ...version,
    steps: [...version.steps.map(cloneStep), nextStep],
  };
}

export function updateStep(
  version: ProcessVersionDraft,
  stepCode: string,
  patch: EditableStepPatch,
): ProcessVersionDraft {
  requireDraft(version);
  let found = false;
  const steps = version.steps.map((step) => {
    if (step.stepCode !== stepCode) {
      return cloneStep(step);
    }
    found = true;
    const next = { ...step, ...patch };
    return {
      ...next,
      businessRoleCodes: [...next.businessRoleCodes],
    };
  });

  if (!found) {
    throw new Error(`Step not found: ${stepCode}`);
  }

  return { ...version, steps };
}

export function moveStep(
  version: ProcessVersionDraft,
  fromIndex: number,
  toIndex: number,
): ProcessVersionDraft {
  requireDraft(version);
  if (
    !Number.isInteger(fromIndex) ||
    !Number.isInteger(toIndex) ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= version.steps.length ||
    toIndex >= version.steps.length
  ) {
    throw new Error("Step reorder index is outside the draft step list");
  }

  if (fromIndex === toIndex) {
    return cloneVersion(version);
  }

  const steps = version.steps.map(cloneStep);
  const [moved] = steps.splice(fromIndex, 1);
  if (moved === undefined) {
    throw new Error("Step reorder source is missing");
  }
  steps.splice(toIndex, 0, moved);

  return { ...version, steps: renumberSteps(steps) };
}

export function copyStep(
  version: ProcessVersionDraft,
  stepCode: string,
  newStepCode: string,
): ProcessVersionDraft {
  requireDraft(version);
  requireUniqueStepCode(version, newStepCode);
  const sourceIndex = version.steps.findIndex((step) => step.stepCode === stepCode);
  if (sourceIndex < 0) {
    throw new Error(`Step not found: ${stepCode}`);
  }

  const source = version.steps[sourceIndex];
  if (source === undefined) {
    throw new Error(`Step not found: ${stepCode}`);
  }

  const copied: AuthoringStep = {
    ...cloneStep(source),
    stepCode: newStepCode,
    sequenceNo: sourceIndex + 2,
  };
  const steps = version.steps.map(cloneStep);
  steps.splice(sourceIndex + 1, 0, copied);

  return { ...version, steps: renumberSteps(steps) };
}

export function removeStep(
  version: ProcessVersionDraft,
  stepCode: string,
): ProcessVersionDraft {
  requireDraft(version);
  if (!version.steps.some((step) => step.stepCode === stepCode)) {
    throw new Error(`Step not found: ${stepCode}`);
  }

  return {
    ...version,
    steps: renumberSteps(
      version.steps.filter((step) => step.stepCode !== stepCode),
    ),
  };
}

export function validateAuthoringDraftCore(
  process: ProcessAggregate,
  version: ProcessVersionDraft,
): DraftValidationIssue[] {
  const issues: DraftValidationIssue[] = [];

  if (process.ownerUserId.trim().length === 0) {
    issues.push({
      code: "OWNER_REQUIRED",
      path: "process.ownerUserId",
      message: "Quy trình phải có chủ sở hữu trước khi gửi thẩm định.",
    });
  }

  if (version.steps.length === 0) {
    issues.push({
      code: "STEP_REQUIRED",
      path: "version.steps",
      message: "Bản nháp phải có ít nhất một bước.",
    });
  }

  const hasContinuousSequence = version.steps.every(
    (step, index) => step.sequenceNo === index + 1,
  );
  if (!hasContinuousSequence) {
    issues.push({
      code: "SEQUENCE_INVALID",
      path: "version.steps.sequenceNo",
      message: "Thứ tự bước phải liên tục từ 1.",
    });
  }

  const seenCodes = new Set<string>();
  for (const step of version.steps) {
    if (seenCodes.has(step.stepCode)) {
      issues.push({
        code: "STEP_CODE_DUPLICATE",
        path: `version.steps.${step.stepCode}.stepCode`,
        message: `Mã bước bị trùng: ${step.stepCode}.`,
      });
    }
    seenCodes.add(step.stepCode);

    if (step.title.trim().length === 0) {
      issues.push({
        code: "STEP_TITLE_REQUIRED",
        path: `version.steps.${step.stepCode}.title`,
        message: `Bước ${step.stepCode} phải có tiêu đề.`,
      });
    }
    if (step.businessRoleCodes.length === 0) {
      issues.push({
        code: "STEP_ROLE_REQUIRED",
        path: `version.steps.${step.stepCode}.businessRoleCodes`,
        message: `Bước ${step.stepCode} phải có ít nhất một BusinessRole.`,
      });
    }
  }

  if (version.changeSummary.trim().length === 0) {
    issues.push({
      code: "CHANGE_SUMMARY_REQUIRED",
      path: "version.changeSummary",
      message: "Bản nháp phải có tóm tắt thay đổi trước khi gửi thẩm định.",
    });
  }

  return issues;
}
