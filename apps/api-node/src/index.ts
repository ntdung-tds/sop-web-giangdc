import { createServer } from "node:http";
import { buildHealthResponse } from "@sop/application";

const port = Number(process.env.PORT ?? 8788);

const server = createServer((request, response) => {
  if (request.method === "GET" && request.url === "/api/v1/health") {
    response.writeHead(200, { "content-type": "application/json; charset=utf-8" });
    response.end(JSON.stringify(buildHealthResponse("sop-api-node")));
    return;
  }

  response.writeHead(404, { "content-type": "application/json; charset=utf-8" });
  response.end(
    JSON.stringify({
      error: {
        code: "NOT_FOUND",
        message: "Resource not found",
      },
    }),
  );
});

server.listen(port, () => {
  console.log(`SOP API listening on http://localhost:${port}`);
});
