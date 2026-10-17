import { describe, expect, it } from "vitest";
import {
  AUTH_POLICY_DEFAULTS,
  AuthService,
  InMemoryAuthRepository,
} from "@sop/application";

const TEMPORARY_PASSWORD_TTL_MS = 48 * 60 * 60_000;
const INITIAL_PASSWORD = "Temporary-StageSign-Password-48h!";

function createService(repository: InMemoryAuthRepository, clock: { now: number }) {
  return new AuthService(
    repository,
    {
      ...AUTH_POLICY_DEFAULTS,
      pbkdf2Iterations: 1_000,
      temporaryPasswordTtlMs: TEMPORARY_PASSWORD_TTL_MS,
    },
    { now: () => clock.now },
  );
}

describe("G0-03F temporary password expiry", () => {
  it("expires a bootstrap password exactly 48 hours after issue", async () => {
    const repository = new InMemoryAuthRepository();
    const clock = { now: Date.UTC(2026, 9, 17, 12, 0, 0) };
    const service = createService(repository, clock);

    const bootstrap = await service.bootstrapFirstUser({
      username: "stage.reviewer",
      displayName: "StageSign Reviewer",
      initialPassword: INITIAL_PASSWORD,
    });
    expect(bootstrap.ok).toBe(true);

    const stored = await repository.findUserByUsername("stage.reviewer");
    expect(stored?.temporaryPasswordExpiresAt).toBe(clock.now + TEMPORARY_PASSWORD_TTL_MS);

    clock.now += TEMPORARY_PASSWORD_TTL_MS;
    const expired = await service.login({
      username: "stage.reviewer",
      password: INITIAL_PASSWORD,
      source: "test-source",
    });

    expect(expired).toEqual({
      ok: false,
      error: {
        code: "INVALID_CREDENTIALS",
        message: "Tên đăng nhập hoặc mật khẩu không đúng.",
      },
    });
  });

  it("clears temporary expiry after the required password change", async () => {
    const repository = new InMemoryAuthRepository();
    const clock = { now: Date.UTC(2026, 9, 17, 12, 0, 0) };
    const service = createService(repository, clock);

    await service.bootstrapFirstUser({
      username: "stage.reviewer",
      displayName: "StageSign Reviewer",
      initialPassword: INITIAL_PASSWORD,
    });

    const login = await service.login({
      username: "stage.reviewer",
      password: INITIAL_PASSWORD,
      source: "test-source",
    });
    expect(login.ok).toBe(true);
    if (!login.ok) throw new Error("expected bootstrap login");

    const changed = await service.changePassword({
      sessionToken: login.session.token,
      currentPassword: INITIAL_PASSWORD,
      newPassword: "Permanent-StageSign-Password-2026!",
    });
    expect(changed).toEqual({ ok: true });

    const stored = await repository.findUserByUsername("stage.reviewer");
    expect(stored?.mustChangePassword).toBe(false);
    expect(stored?.temporaryPasswordExpiresAt).toBeNull();
  });
});
