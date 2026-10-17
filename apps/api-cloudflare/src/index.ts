import { buildHealthResponse } from "@sop/application";

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/api/v1/health") {
      return Response.json(buildHealthResponse("sop-api-cloudflare"));
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
  },
};
