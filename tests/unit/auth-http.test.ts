import { describe, expect, it } from "vitest";
import { InMemoryAuthRepository, createPasswordHash } from "@sop/application";
import { handleAuthHttpRequest } from "../../apps/api-cloudflare/src/authHttp.ts";

const FIXTURE_ROLE = "fixture.http-role";
const FIXTURE_PERMISSION = "fixture.http.read";

async function fixture() {
  const repository = new InMemoryAuthRepository();
  repository.grantRolePermission(FIXTURE_ROLE, FIXTURE_PERMISSION);
  await repository.saveUser({
    id: "usr-http-1",
    username: "operator.http",
    displayName: "Người vận hành HTTP",
    passwordHash: await createPasswordHash("Correct-Horse-42!", 1_000),
    mustChangePassword: true,
    failedLoginCount: 0,
    lockedUntil: null,
    roles: [{ roleCode: FIXTURE_ROLE, scopeId: "unit-a" }],
    active: true,
  });
  return repository;
}

async function login(repository: InMemoryAuthRepository, password = "Correct-Horse-42!") {
  const response = await handleAuthHttpRequest(
    new Request("https://example.test/api/v1/auth/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "cf-connecting-ip": "198.51.100.20",
      },
      body: JSON.stringify({ username: "operator.http", password }),
    }),
    repository,
  );
  if (!response) throw new Error("login route was not handled");
  return response;
}

function cookiePair(response: Response): string {
  return response.headers.get("set-cookie")?.split(";")[0] ?? "";
}

describe("G0-03 auth HTTP security boundary", () => {
  it("sets an opaque hardened session cookie and restores server session state", async () => {
    const repository = await fixture();
    const response = await login(repository);
    expect(response.status).toBe(200);

    const setCookie = response.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain("__Host-sop_session=");
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("Secure");
    expect(setCookie).toContain("SameSite=Lax");
    expect(setCookie).not.toContain("Max-Age=");

    const session = await handleAuthHttpRequest(
      new Request("https://example.test/api/v1/auth/session", {
        headers: { cookie: cookiePair(response) },
      }),
      repository,
    );
    expect(session?.status).toBe(200);
    expect(await session?.json()).toMatchObject({
      authenticated: true,
      mustChangePassword: true,
      user: { username: "operator.http" },
    });
  });

  it("rejects state-changing requests without the session CSRF token", async () => {
    const repository = await fixture();
    const response = await login(repository);
    const body = (await response.json()) as { csrfToken: string };
    const cookie = cookiePair(response);

    const rejected = await handleAuthHttpRequest(
      new Request("https://example.test/api/v1/auth/logout", {
        method: "POST",
        headers: { cookie },
      }),
      repository,
    );
    expect(rejected?.status).toBe(403);

    const accepted = await handleAuthHttpRequest(
      new Request("https://example.test/api/v1/auth/logout", {
        method: "POST",
        headers: { cookie, "x-csrf-token": body.csrfToken },
      }),
      repository,
    );
    expect(accepted?.status).toBe(204);
    expect(accepted?.headers.get("set-cookie")).toContain("Max-Age=0");

    const afterLogout = await handleAuthHttpRequest(
      new Request("https://example.test/api/v1/auth/session", {
        headers: { cookie },
      }),
      repository,
    );
    expect(await afterLogout?.json()).toEqual({ authenticated: false });
  });

  it("forces reauthentication after password change and uses catalog-backed scope checks", async () => {
    const repository = await fixture();
    const response = await login(repository);
    const body = (await response.json()) as { csrfToken: string };
    const cookie = cookiePair(response);

    const changed = await handleAuthHttpRequest(
      new Request("https://example.test/api/v1/auth/change-password", {
        method: "POST",
        headers: {
          cookie,
          "content-type": "application/json",
          "x-csrf-token": body.csrfToken,
        },
        body: JSON.stringify({
          currentPassword: "Correct-Horse-42!",
          newPassword: "New-Strong-Password-84!",
        }),
      }),
      repository,
    );
    expect(changed?.status).toBe(200);
    expect(changed?.headers.get("set-cookie")).toContain("Max-Age=0");

    expect((await login(repository)).status).toBe(401);
    const reauthenticated = await login(repository, "New-Strong-Password-84!");
    expect(reauthenticated.status).toBe(200);
    const authenticatedCookie = cookiePair(reauthenticated);

    const allowed = await handleAuthHttpRequest(
      new Request(
        `https://example.test/api/v1/authz/check?permission=${FIXTURE_PERMISSION}&scopeId=unit-a`,
        { headers: { cookie: authenticatedCookie } },
      ),
      repository,
    );
    expect(await allowed?.json()).toEqual({ allowed: true });

    const wrongScope = await handleAuthHttpRequest(
      new Request(
        `https://example.test/api/v1/authz/check?permission=${FIXTURE_PERMISSION}&scopeId=unit-b`,
        { headers: { cookie: authenticatedCookie } },
      ),
      repository,
    );
    expect(await wrongScope?.json()).toEqual({ allowed: false });
  });
});
