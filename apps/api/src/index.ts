import cors from "@elysiajs/cors";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import Elysia from "elysia";
import { appRouter } from "./app-router";
import { env } from "./env";
import { authServer } from "./libs/auth-server";
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
  .mount(authServer.handler)
  .all(
    "/rpc*",
    async ({ request }: { request: Request }) => {
      const { response } = await handler.handle(request, {
        prefix: "/rpc",
        context: undefined,
      });

      return response ?? new Response("Not Found", { status: 404 });
    },
    {
      parse: "none",
    }
  )
  .listen(port, (server) => {
    logger.info(`API server started | http://localhost:${server.port}`);
  });

export type { appRouter } from "./app-router";
