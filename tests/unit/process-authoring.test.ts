import { describe, expect, it } from "vitest";
import {
  createProcessDraft,
  ProcessCodeConflictError,
  type ProcessAuthoringRepository,
} from "@sop/application";
import {
  addStep,
  copyStep,
  createNextDraftVersion,
  createProcessWithInitialDraft,
  moveStep,
  removeStep,
  updateStep,
  validateAuthoringDraftCore,
  type AuthoringStep,
  type ProcessAggregate,
  type ProcessVersionDraft,
} from "@sop/domain";

const baseInput = {
  id: "process-a",
  code: "PROCESS_A",
  ownerUserId: "owner-a",
  groupId: null,
  orgScopeId: "root",
  status: "TEST",
  name: "Process A",
  purpose: "Test process independence",
  scopeText: "Root scope",
  audience: "Test users",
  triggerText: "Start",
  finishCondition: "Finish",
  reviewTriggersJson: null,
  changeSummary: "Initial draft",
} as const;

function step(stepCode: string, title = "Step"): Omit<AuthoringStep, "sequenceNo"> {
  return {
    stepCode,
    title,
    prerequisiteText: "",
    inputText: "",
    instruction: "Instruction",
    noteText: "",
    warningText: "",
    expectedResult: "Expected",
    outputText: "Output",
    isRequired: true,
    targetDurationSec: 60,
    businessRoleCodes: ["ROLE_A"],
    stepStartPolicy: "STRICT_SEQUENTIAL",
  };
}

function firstVersion(process: ProcessAggregate): ProcessVersionDraft {
  const version = process.versions[0];
  if (version === undefined) {
    throw new Error("Test fixture must contain an initial draft");
  }
  return version;
}

function firstStep(version: ProcessVersionDraft): AuthoringStep {
  const value = version.steps[0];
  if (value === undefined) {
    throw new Error("Test fixture must contain a step");
  }
  return value;
}

describe("PA-01 Process Authoring core", () => {
  it("AC-01 keeps two process drafts independent", () => {
    const processA = createProcessWithInitialDraft(baseInput);
    const processB = createProcessWithInitialDraft({
      ...baseInput,
      id: "process-b",
      code: "PROCESS_B",
      name: "Process B",
    });

    const changedA = {
      ...processA,
      versions: [addStep(firstVersion(processA), step("A-01", "Only A"))],
    };

    expect(changedA.versions[0]?.steps).toHaveLength(1);
    expect(processB.versions[0]?.steps).toHaveLength(0);
  });

  it("creates the next DRAFT version as a deep independent copy", () => {
    const initial = createProcessWithInitialDraft(baseInput);
    const withStep = {
      ...initial,
      versions: [addStep(firstVersion(initial), step("A-01"))],
    };
    const next = createNextDraftVersion(withStep, "Revise instruction");
    const nextDraft = next.versions.at(-1);

    expect(nextDraft?.versionNo).toBe(2);
    expect(nextDraft?.status).toBe("DRAFT");
    expect(nextDraft?.changeSummary).toBe("Revise instruction");
    expect(nextDraft?.steps).toEqual(withStep.versions[0]?.steps);
    expect(nextDraft?.steps).not.toBe(withStep.versions[0]?.steps);
  });

  it("adds, edits, moves, copies and removes only inside DRAFT", () => {
    const process = createProcessWithInitialDraft(baseInput);
    let draft = firstVersion(process);
    draft = addStep(draft, step("S1", "One"));
    draft = addStep(draft, step("S2", "Two"));
    draft = addStep(draft, step("S3", "Three"));
    draft = updateStep(draft, "S2", { title: "Two edited" });
    expect(draft.steps.some((item) => item.title === "Two edited")).toBe(true);
    draft = moveStep(draft, 2, 0);
    draft = copyStep(draft, "S1", "S1-COPY");
    draft = removeStep(draft, "S2");

    expect(draft.steps.map((item) => item.sequenceNo)).toEqual([1, 2, 3]);
    expect(new Set(draft.steps.map((item) => item.stepCode)).size).toBe(3);

    const reviewVersion = { ...draft, status: "IN_REVIEW" as const };
    expect(() => addStep(reviewVersion, step("S4"))).toThrowError(/DRAFT/);
    expect(() => updateStep(reviewVersion, "S1", { title: "No" })).toThrowError(/DRAFT/);
  });

  it("validates the PRC-009 core subset without inventing form/evidence policy", () => {
    const process = createProcessWithInitialDraft({
      ...baseInput,
      ownerUserId: "",
      changeSummary: "",
    });
    const draft = addStep(firstVersion(process), {
      ...step("S1", ""),
      businessRoleCodes: [],
    });
    const brokenSequence = {
      ...draft,
      steps: [{ ...firstStep(draft), sequenceNo: 2 }],
    };

    expect(validateAuthoringDraftCore(process, brokenSequence).map((issue) => issue.code)).toEqual([
      "OWNER_REQUIRED",
      "SEQUENCE_INVALID",
      "STEP_TITLE_REQUIRED",
      "STEP_ROLE_REQUIRED",
      "CHANGE_SUMMARY_REQUIRED",
    ]);
  });

  it("reports an empty draft as not ready for review", () => {
    const process = createProcessWithInitialDraft(baseInput);
    expect(validateAuthoringDraftCore(process, firstVersion(process)).map((issue) => issue.code)).toEqual([
      "STEP_REQUIRED",
    ]);
  });

  it("BR-001 rejects a duplicate Process code at the application boundary", async () => {
    const existing = createProcessWithInitialDraft(baseInput);
    const repository: ProcessAuthoringRepository = {
      async findByCode(code) {
        return code === existing.code ? existing : null;
      },
      async save() {
        throw new Error("save must not be called for a duplicate code");
      },
    };

    await expect(createProcessDraft(repository, baseInput)).rejects.toBeInstanceOf(
      ProcessCodeConflictError,
    );
  });
});
