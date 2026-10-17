import { describe, expect, it } from "vitest";
import { verifyPassword } from "@sop/application";

// Regression for StageSign preview hashes provisioned outside the runtime helper.
describe("G0-03F password hash compatibility", () => {
  it("accepts URL-safe base64 without padding for a valid PBKDF2 hash", async () => {
    const encoded =
      "pbkdf2-sha256$1000$--__AAECAwQFBgcICQoLDA$-t5JQCmRU0F4x0PHTXRPErlF1YOXCQUf7NkVKwESXT4";

    await expect(verifyPassword("correct horse battery staple", encoded)).resolves.toBe(true);
  });

  it("treats malformed persisted hashes as invalid credentials instead of throwing", async () => {
    const malformed = "pbkdf2-sha256$600000$not-valid-***$also-not-valid-***";

    await expect(verifyPassword("anything", malformed)).resolves.toBe(false);
  });
});
