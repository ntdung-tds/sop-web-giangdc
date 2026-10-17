import { describe, expect, it } from "vitest";
import { API_VERSION, buildHealthResponse } from "@sop/application";

describe("technical foundation health contract", () => {
  it("keeps the API namespace at v1", () => {
    expect(API_VERSION).toBe("v1");
  });

  it("returns an explicit healthy service response", () => {
    expect(buildHealthResponse("sop-test")).toEqual({
      status: "ok",
      service: "sop-test",
      apiVersion: "v1",
    });
  });
});
