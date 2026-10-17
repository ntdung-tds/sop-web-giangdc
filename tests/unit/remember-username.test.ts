import { describe, expect, it } from "vitest";
import {
  loadRememberedUsername,
  persistRememberedUsername,
  REMEMBERED_USERNAME_KEY,
  type UsernameStorage,
} from "../../apps/web/src/rememberUsername.ts";

class MemoryStorage implements UsernameStorage {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }
}

describe("remember username on this device", () => {
  it("stores only the normalized username when explicitly enabled", () => {
    const storage = new MemoryStorage();

    persistRememberedUsername(storage, "  stage.reviewer  ", true);

    expect(storage.getItem(REMEMBERED_USERNAME_KEY)).toBe("stage.reviewer");
    expect(loadRememberedUsername(storage)).toBe("stage.reviewer");
  });

  it("removes remembered username when the option is disabled", () => {
    const storage = new MemoryStorage();
    persistRememberedUsername(storage, "stage.reviewer", true);

    persistRememberedUsername(storage, "stage.reviewer", false);

    expect(loadRememberedUsername(storage)).toBe("");
  });
});
