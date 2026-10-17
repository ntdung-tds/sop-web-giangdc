import { handleCloudflareRequest } from "../../../apps/api-cloudflare/src/index.ts";
import type { D1DatabaseLike } from "../../../apps/api-cloudflare/src/d1AuthRepository.ts";

interface PagesContext {
  request: Request;
  env: {
    SOP_DB?: D1DatabaseLike;
    SOP_BOOTSTRAP_TOKEN?: string;
  };
}

export function onRequest(context: PagesContext): Promise<Response> {
  return handleCloudflareRequest(context.request, context.env);
}
