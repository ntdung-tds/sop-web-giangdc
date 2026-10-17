import { afterEach, describe, expect, it, vi } from "vitest";
import { login, restoreSession } from "../../apps/web/src/authClient.ts";

// Regression: a stalled restore must never make first-login takeover impossible.
describe("G0-03F auth client resilience", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("treats a failed session-restore request as unauthenticated instead of blocking login", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("network unavailable")));

    await expect(restoreSession()).resolves.toBeNull();
  });

  it("times out a stalled session-restore request so the login flow can continue", async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "fetch",
      vi.fn((_url: string, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject(new DOMException("Aborted", "AbortError"));
          });
        }),
      ),
    );

    const restored = restoreSession();
    await vi.advanceTimersByTimeAsync(5_000);

    await expect(restored).resolves.toBeNull();
  });

  it("uses browser PBKDF2 proof once for a legacy Cloudflare-incompatible hash", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            algorithm: "PBKDF2",
            hash: "SHA-256",
            iterations: 100_001,
            salt: "AAECAwQFBgcICQoLDA0ODw==",
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            authenticated: true,
            csrfToken: "csrf-fixture",
            expiresAt: 1_800_000_000_000,
            mustChangePassword: true,
            user: {
              id: "usr-legacy",
              username: "legacy.user",
              displayName: "Legacy User",
              roles: [],
            },
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      );
    vi.stubGlobal("fetch", fetchMock);

    const session = await login("legacy.user", "Legacy-Fixture-Password-42!");

    expect(session.user.username).toBe("legacy.user");
    expect(session.mustChangePassword).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("/api/v1/auth/legacy-parameters");
    expect(fetchMock.mock.calls[1]?.[0]).toBe("/api/v1/auth/legacy-login");
    const migrationBody = JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body)) as {
      username: string;
      password: string;
      proof: string;
    };
    expect(migrationBody.username).toBe("legacy.user");
    expect(migrationBody.password).toBe("Legacy-Fixture-Password-42!");
    expect(migrationBody.proof.length).toBeGreaterThan(20);
  });
});
