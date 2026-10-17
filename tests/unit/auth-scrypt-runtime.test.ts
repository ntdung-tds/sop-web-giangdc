import { describe, expect, it } from "vitest";
import { createPasswordHash, verifyPassword } from "@sop/application";

describe("G0-03F Cloudflare-compatible password hashing", () => {
  it("creates a scrypt hash that can be verified without PBKDF2 runtime limits", async () => {
    const password = "Cloudflare-safe-password-123!";
    const encoded = await createPasswordHash(password);

    expect(encoded.startsWith("scrypt$32768$8$1$")).toBe(true);
    await expect(verifyPassword(password, encoded)).resolves.toBe(true);
    await expect(verifyPassword(`${password}-wrong`, encoded)).resolves.toBe(false);
  });
});
