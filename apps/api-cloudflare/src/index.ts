import { buildHealthResponse } from "@sop/application";
import { handleAuthHttpRequest } from "./authHttp.ts";
import { D1AuthRepository, type D1DatabaseLike } from "./d1AuthRepository.ts";

interface Env {
  SOP_DB?: D1DatabaseLike;
}

export async function handleCloudflareRequest(request: Request, env: Env = {}): Promise<Response> {
  const url = new URL(request.url);

  if (request.method === "GET" && url.pathname === "/api/v1/health") {
    return Response.json(buildHealthResponse("sop-api-cloudflare"));
  }

  if (url.pathname.startsWith("/api/v1/auth")) {
    if (!env.SOP_DB) {
      return Response.json(
        {
          error: {
            code: "AUTH_STORAGE_UNAVAILABLE",
            message: "Dịch vụ xác thực chưa sẵn sàng.",
          },
        },
        { status: 503, headers: { "cache-control": "no-store" } },
      );
    }
    const authResponse = await handleAuthHttpRequest(request, new D1AuthRepository(env.SOP_DB));
    if (authResponse) return authResponse;
  }

  return Response.json(
    {
      error: {
        code: "NOT_FOUND",
        message: "Resource not found",
      },
    },
    { status: 404 },
  );
}

export default {
  fetch(request: Request, env: Env): Promise<Response> {
    return handleCloudflareRequest(request, env);
  },
};
