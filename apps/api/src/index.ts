import cors from "@elysiajs/cors";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import Elysia, { type Context as ElysiaContext } from "elysia";
import { appRouter } from "./app-router";
import { env } from "./env";
import { authServer } from "./libs/auth-server";
import { createContext } from "./libs/http-context";
import { logger } from "./libs/logger";

const port = 3001;

const handler = new OpenAPIHandler(appRouter);

new Elysia()
  .use(
    cors({
      origin: env.NEXT_PUBLIC_WEBSITE_URL || "",
      methods: ["GET", "POST", "OPTIONS"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  )
  .all("/api/auth*", async ({ request }: { request: Request }) => authServer.handler(request), {
    parse: "none",
  })
  .all(
    "/api*",
    async ({ request }: { request: Request }) => {
      const elysiaContext: ElysiaContext = { request } as ElysiaContext;
      const authContext = await createContext({ context: elysiaContext });

      const { matched, response } = await handler.handle(request, {
        prefix: "/api",
        context: authContext,
      });

      if (matched) {
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
      }

      return new Response("Not Found", { status: 404 });
    },
    {
      parse: "none",
    }
  )
  .listen(port, (server) => {
    logger.info(`API server started | http://localhost:${server.port}`);
  });

export type { appRouter } from "./app-router";
