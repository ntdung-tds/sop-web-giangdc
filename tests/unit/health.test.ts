import { describe, expect, it } from "vitest";
import { buildHealthResponse } from "@sop/application";

const fixedNow = () => new Date("2026-10-17T00:00:00.000Z");

describe("buildHealthResponse", () => {
  it("returns the stable v1 health contract", () => {
    expect(buildHealthResponse("test-service", fixedNow)).toEqual({
      status: "ok",
      service: "test-service",
      version: "v1",
      timestamp: "2026-10-17T00:00:00.000Z",
    });
  });
});
