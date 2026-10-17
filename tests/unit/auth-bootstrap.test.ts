import { describe, expect, it } from "vitest";
import {
  AUTH_POLICY_DEFAULTS,
  AuthService,
  InMemoryAuthRepository,
  verifyPassword,
} from "@sop/application";
import { handleAuthHttpRequest } from "../../apps/api-cloudflare/src/authHttp.ts";

const BOOTSTRAP_TOKEN = "bootstrap-secret-token-for-tests-only";
const INITIAL_PASSWORD = "Temporary-StageSign-Password-42!";

function bootstrapRequest(token = BOOTSTRAP_TOKEN) {
  return new Request("https://example.test/api/v1/auth/bootstrap", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-bootstrap-token": token,
    },
    body: JSON.stringify({
      username: "stage.reviewer",
      displayName: "StageSign Reviewer",
      initialPassword: INITIAL_PASSWORD,
    }),
  });
}

describe("G0-03F secure first-account bootstrap", () => {
  it("creates exactly one identity with force-change and no invented production roles", async () => {
    const repository = new InMemoryAuthRepository();
    const service = new AuthService(repository, {
      ...AUTH_POLICY_DEFAULTS,
      pbkdf2Iterations: 1_000,
    });

    const first = await service.bootstrapFirstUser({
      username: "stage.reviewer",
      displayName: "StageSign Reviewer",
      initialPassword: INITIAL_PASSWORD,
    });
    expect(first).toEqual({ ok: true, userId: expect.any(String) });

    const stored = await repository.findUserByUsername("stage.reviewer");
    expect(stored).not.toBeNull();
    expect(stored?.mustChangePassword).toBe(true);
    expect(stored?.roles).toEqual([]);
    expect(stored?.passwordHash).not.toContain(INITIAL_PASSWORD);
    expect(await verifyPassword(INITIAL_PASSWORD, stored?.passwordHash ?? "")).toBe(true);

    const second = await service.bootstrapFirstUser({
      username: "another.reviewer",
      displayName: "Another Reviewer",
      initialPassword: "Another-Temporary-Password-84!",
    });
    expect(second).toEqual({ ok: false, code: "BOOTSTRAP_UNAVAILABLE" });
    expect(await repository.findUserByUsername("another.reviewer")).toBeNull();
  });

  it("rejects weak bootstrap passwords before persistence", async () => {
    const repository = new InMemoryAuthRepository();
    const service = new AuthService(repository, {
      ...AUTH_POLICY_DEFAULTS,
      pbkdf2Iterations: 1_000,
    });

    const result = await service.bootstrapFirstUser({
      username: "stage.reviewer",
      displayName: "StageSign Reviewer",
      initialPassword: "short",
    });

    expect(result).toEqual({ ok: false, code: "PASSWORD_POLICY" });
    expect(await repository.countUsers()).toBe(0);
  });

  it("hides bootstrap when the server secret is absent or wrong", async () => {
    const repository = new InMemoryAuthRepository();

    const absent = await handleAuthHttpRequest(bootstrapRequest(), repository, {});
    expect(absent?.status).toBe(404);

    const wrong = await handleAuthHttpRequest(bootstrapRequest("wrong-token"), repository, {
      bootstrapToken: BOOTSTRAP_TOKEN,
    });
    expect(wrong?.status).toBe(404);
    expect(await repository.countUsers()).toBe(0);
  });

  it("does not disclose bootstrap route methods without a valid secret", async () => {
    const repository = new InMemoryAuthRepository();
    const withoutSecret = await handleAuthHttpRequest(
      new Request("https://example.test/api/v1/auth/bootstrap", { method: "GET" }),
      repository,
      {},
    );
    expect(withoutSecret?.status).toBe(404);
    expect(withoutSecret?.headers.get("allow")).toBeNull();

    const withWrongSecret = await handleAuthHttpRequest(
      new Request("https://example.test/api/v1/auth/bootstrap", {
        method: "GET",
        headers: { "x-bootstrap-token": "wrong-token" },
      }),
      repository,
      { bootstrapToken: BOOTSTRAP_TOKEN },
    );
    expect(withWrongSecret?.status).toBe(404);
    expect(withWrongSecret?.headers.get("allow")).toBeNull();
  });

  it("accepts the bootstrap secret only via header, never returns the initial password, then self-disables", async () => {
    const repository = new InMemoryAuthRepository();

    const created = await handleAuthHttpRequest(bootstrapRequest(), repository, {
      bootstrapToken: BOOTSTRAP_TOKEN,
      policy: { ...AUTH_POLICY_DEFAULTS, pbkdf2Iterations: 1_000 },
    });
    expect(created?.status).toBe(201);
    const body = await created?.json();
    expect(body).toEqual({ created: true, mustChangePassword: true });
    expect(JSON.stringify(body)).not.toContain(INITIAL_PASSWORD);
    expect(created?.headers.get("set-cookie")).toBeNull();

    const replay = await handleAuthHttpRequest(bootstrapRequest(), repository, {
      bootstrapToken: BOOTSTRAP_TOKEN,
      policy: { ...AUTH_POLICY_DEFAULTS, pbkdf2Iterations: 1_000 },
    });
    expect(replay?.status).toBe(404);
    expect(await repository.countUsers()).toBe(1);
  });

  it("does not accept a bootstrap token from the URL query string", async () => {
    const repository = new InMemoryAuthRepository();
    const request = new Request(
      `https://example.test/api/v1/auth/bootstrap?token=${encodeURIComponent(BOOTSTRAP_TOKEN)}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          username: "stage.reviewer",
          displayName: "StageSign Reviewer",
          initialPassword: INITIAL_PASSWORD,
        }),
      },
    );

    const response = await handleAuthHttpRequest(request, repository, {
      bootstrapToken: BOOTSTRAP_TOKEN,
    });
    expect(response?.status).toBe(404);
    expect(await repository.countUsers()).toBe(0);
  });
});
