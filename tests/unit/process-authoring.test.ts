import { describe, expect, it } from "vitest";
import {
  addStep,
  copyStep,
  createNextDraftVersion,
  createProcessWithInitialDraft,
  moveStep,
  removeStep,
  validateAuthoringDraftCore,
  type AuthoringStep,
} from "@sop/domain";

const baseInput = {
  id: "process-a",
  code: "PROCESS_A",
  ownerUserId: "owner-a",
  orgScopeId: "root",
  name: "Process A",
  purpose: "Test process independence",
  scopeText: "Root scope",
  audience: "Test users",
  triggerText: "Start",
  finishCondition: "Finish",
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
      versions: [addStep(processA.versions[0]!, step("A-01", "Only A"))],
    };

    expect(changedA.versions[0]?.steps).toHaveLength(1);
    expect(processB.versions[0]?.steps).toHaveLength(0);
  });

  it("creates the next DRAFT version as a deep independent copy", () => {
    const initial = createProcessWithInitialDraft(baseInput);
    const withStep = {
      ...initial,
      versions: [addStep(initial.versions[0]!, step("A-01"))],
    };
    const next = createNextDraftVersion(withStep, "Revise instruction");

    expect(next.versions.at(-1)?.versionNo).toBe(2);
    expect(next.versions.at(-1)?.status).toBe("DRAFT");
    expect(next.versions.at(-1)?.changeSummary).toBe("Revise instruction");
    expect(next.versions.at(-1)?.steps).toEqual(withStep.versions[0]?.steps);
    expect(next.versions.at(-1)?.steps).not.toBe(withStep.versions[0]?.steps);
  });

  it("renumbers steps continuously after add, move, copy and remove", () => {
    const process = createProcessWithInitialDraft(baseInput);
    let draft = process.versions[0]!;
    draft = addStep(draft, step("S1", "One"));
    draft = addStep(draft, step("S2", "Two"));
    draft = addStep(draft, step("S3", "Three"));
    draft = moveStep(draft, 2, 0);
    draft = copyStep(draft, "S1", "S1-COPY");
    draft = removeStep(draft, "S2");

    expect(draft.steps.map((item) => item.sequenceNo)).toEqual([1, 2, 3]);
    expect(new Set(draft.steps.map((item) => item.stepCode)).size).toBe(3);
  });

  it("rejects structural edits outside DRAFT", () => {
    const process = createProcessWithInitialDraft(baseInput);
    const reviewVersion = { ...process.versions[0]!, status: "IN_REVIEW" as const };

    expect(() => addStep(reviewVersion, step("S1"))).toThrowError(/DRAFT/);
  });

  it("validates the PRC-009 core subset without inventing form/evidence policy", () => {
    const process = createProcessWithInitialDraft({
      ...baseInput,
      ownerUserId: "",
      changeSummary: "",
    });
    const draft = addStep(process.versions[0]!, {
      ...step("S1", ""),
      businessRoleCodes: [],
    });
    const brokenSequence = {
      ...draft,
      steps: [{ ...draft.steps[0]!, sequenceNo: 2 }],
    };

    expect(validateAuthoringDraftCore(process, brokenSequence).map((issue) => issue.code)).toEqual([
      "OWNER_REQUIRED",
      "SEQUENCE_INVALID",
      "STEP_TITLE_REQUIRED",
      "STEP_ROLE_REQUIRED",
      "CHANGE_SUMMARY_REQUIRED",
    ]);
  });
});
