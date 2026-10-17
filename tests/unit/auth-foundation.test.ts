import { describe, expect, it } from "vitest";
import {
  AuthService,
  InMemoryAuthRepository,
  createPasswordHash,
  type AuthPolicy,
} from "@sop/application";

const TEST_POLICY: AuthPolicy = {
  lockoutThreshold: 3,
  lockoutDurationMs: 60_000,
  sessionTtlMs: 3_600_000,
  pbkdf2Iterations: 1_000,
};

async function buildService(now = Date.UTC(2026, 9, 17, 10, 0, 0)) {
  const repository = new InMemoryAuthRepository();
  const passwordHash = await createPasswordHash("Correct-Horse-42!", TEST_POLICY.pbkdf2Iterations);
  await repository.saveUser({
    id: "usr-operator-1",
    username: "operator.demo",
    displayName: "Người vận hành demo",
    passwordHash,
    mustChangePassword: true,
    failedLoginCount: 0,
    lockedUntil: null,
    roles: [{ role: "OPERATOR", scopeId: "unit-a" }],
    active: true,
  });

  let clock = now;
  const service = new AuthService(repository, TEST_POLICY, {
    now: () => clock,
  });

  return {
    repository,
    service,
    advance(ms: number) {
      clock += ms;
    },
  };
}

describe("G0-03 Authentication Foundation", () => {
  it("returns the same safe error for unknown users and wrong passwords", async () => {
    const { service } = await buildService();

    const unknown = await service.login({ username: "missing", password: "bad", source: "198.51.100.10" });
    const wrong = await service.login({ username: "operator.demo", password: "bad", source: "198.51.100.10" });

    expect(unknown.ok).toBe(false);
    expect(wrong.ok).toBe(false);
    if (!unknown.ok && !wrong.ok) {
      expect(unknown.error).toEqual(wrong.error);
      expect(unknown.error.code).toBe("INVALID_CREDENTIALS");
    }
  });

  it("temporarily locks an account after repeated failures and unlocks after the policy window", async () => {
    const { service, advance } = await buildService();

    await service.login({ username: "operator.demo", password: "bad-1", source: "198.51.100.10" });
    await service.login({ username: "operator.demo", password: "bad-2", source: "198.51.100.10" });
    await service.login({ username: "operator.demo", password: "bad-3", source: "198.51.100.10" });

    const locked = await service.login({
      username: "operator.demo",
      password: "Correct-Horse-42!",
      source: "198.51.100.10",
    });
    expect(locked.ok).toBe(false);
    if (!locked.ok) expect(locked.error.code).toBe("INVALID_CREDENTIALS");

    advance(TEST_POLICY.lockoutDurationMs + 1);
    const afterWindow = await service.login({
      username: "operator.demo",
      password: "Correct-Horse-42!",
      source: "198.51.100.10",
    });
    expect(afterWindow.ok).toBe(true);
  });

  it("marks first-login sessions for mandatory password change", async () => {
    const { service } = await buildService();
    const result = await service.login({
      username: "operator.demo",
      password: "Correct-Horse-42!",
      source: "198.51.100.10",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.session.mustChangePassword).toBe(true);
      expect(result.session.user.roles).toEqual([{ role: "OPERATOR", scopeId: "unit-a" }]);
    }
  });

  it("revokes old sessions when a mandatory password change succeeds", async () => {
    const { service } = await buildService();
    const login = await service.login({
      username: "operator.demo",
      password: "Correct-Horse-42!",
      source: "198.51.100.10",
    });
    if (!login.ok) throw new Error("fixture login failed");

    const changed = await service.changePassword({
      sessionToken: login.session.token,
      currentPassword: "Correct-Horse-42!",
      newPassword: "New-Strong-Password-84!",
    });
    expect(changed.ok).toBe(true);

    const oldSession = await service.getSession(login.session.token);
    expect(oldSession).toBeNull();

    const oldPassword = await service.login({
      username: "operator.demo",
      password: "Correct-Horse-42!",
      source: "198.51.100.10",
    });
    expect(oldPassword.ok).toBe(false);

    const newPassword = await service.login({
      username: "operator.demo",
      password: "New-Strong-Password-84!",
      source: "198.51.100.10",
    });
    expect(newPassword.ok).toBe(true);
    if (newPassword.ok) expect(newPassword.session.mustChangePassword).toBe(false);
  });

  it("enforces negative RBAC checks instead of trusting the client", async () => {
    const { service } = await buildService();
    const login = await service.login({
      username: "operator.demo",
      password: "Correct-Horse-42!",
      source: "198.51.100.10",
    });
    if (!login.ok) throw new Error("fixture login failed");

    expect(await service.isAllowed(login.session.token, "execution.read", "unit-a")).toBe(true);
    expect(await service.isAllowed(login.session.token, "users.manage", "unit-a")).toBe(false);
    expect(await service.isAllowed(login.session.token, "execution.read", "unit-b")).toBe(false);
  });

  it("logout-all revokes every active session for the user", async () => {
    const { service } = await buildService();
    const first = await service.login({ username: "operator.demo", password: "Correct-Horse-42!", source: "a" });
    const second = await service.login({ username: "operator.demo", password: "Correct-Horse-42!", source: "b" });
    if (!first.ok || !second.ok) throw new Error("fixture login failed");

    await service.logoutAll(first.session.token);

    expect(await service.getSession(first.session.token)).toBeNull();
    expect(await service.getSession(second.session.token)).toBeNull();
  });
});
