import { afterEach, describe, expect, it, vi } from "vitest";
import { restoreSession } from "../../apps/web/src/authClient.ts";

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
});
