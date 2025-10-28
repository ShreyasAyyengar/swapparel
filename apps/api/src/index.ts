import cors from "@elysiajs/cors";
import Elysia from "elysia";
import { env } from "./env";
import { authServer } from "./libs/auth-server";
import { logger } from "./libs/logger";

const port = 3001;

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
  .listen(port, (server) => {
    logger.info(`API server started | http://localhost:${server.port}`);
  });

export type { appRouter } from "./app-router";
