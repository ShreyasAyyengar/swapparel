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

const isDevelopment = env.NEXT_PUBLIC_NODE_ENV === "development";
const allowedOrigins = isDevelopment ? ["http://127.0.0.1:3000", env.NEXT_PUBLIC_WEBSITE_URL] : [env.NEXT_PUBLIC_WEBSITE_URL];

const apiPrefix = isDevelopment ? "/api" : undefined;
const authRoute = isDevelopment ? "/api/auth*" : "/auth*";
const apiRoute = isDevelopment ? "/api*" : "*";

new Elysia()
  .use(
    cors({
      origin: allowedOrigins,
      methods: ["POST", "PUT", "GET", "DELETE"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  )
  .all(authRoute, async ({ request }: { request: Request }) => authServer.handler(request), {
    parse: "none",
  })
  .all(
    apiRoute,
    async ({ request }: { request: Request }) => {
      const elysiaContext: ElysiaContext = { request } as ElysiaContext;
      const authContext = await createContext({ context: elysiaContext });

      const { matched, response } = await handler.handle(request, {
        prefix: apiPrefix,
        context: authContext,
      });

      // if (matched) {
      //   return new Response(response.body, {
      //     status: response.status,
      //     statusText: response.statusText,
      //     headers: response.headers,
      //   });
      // }
      if (matched) {
        return response;
      }

      return new Response("Not Found", { status: 404 });
    },
    {
      parse: "none",
    }
  )
  .listen(
    {
      port,
      hostname: env.NEXT_PUBLIC_HOSTNAME,
    },
    (server) => {
      const protocol = isDevelopment ? "http" : "https";
      logger.info(`API server started | ${protocol}://${server.hostname}:${server.port}`);
    }
  );

export type { appRouter } from "./app-router";
