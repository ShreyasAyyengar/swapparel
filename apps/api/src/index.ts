import cors from "@elysiajs/cors";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { RPCHandler } from "@orpc/server/bun-ws";
import Elysia, { type Context as ElysiaContext } from "elysia";
import { notificationPublisher } from "./core/notification/notification-manager";
import { env } from "./env";
import { authServer } from "./libs/auth-server";
import { createContext } from "./libs/http-context";
import { logger } from "./libs/logger";
import { httpRouter } from "./routers/http-router";
import { webSocketRouter } from "./routers/web-socket-router";

const port = 3001;

const httpHandler = new OpenAPIHandler(httpRouter);
const wsHandler = new RPCHandler(webSocketRouter);

const isDevelopment = env.ENV === "development";
const allowedOrigins = isDevelopment ? ["http://127.0.0.1:3000", env.WEBSITE_URL] : [env.WEBSITE_URL];

const apiPrefix = isDevelopment ? "/api" : undefined;
const authRoute = isDevelopment ? "/api/auth*" : "/auth*";
const apiRoute = isDevelopment ? "/api*" : "*";
const notificationStreamRoute = isDevelopment ? "/api/notifications/stream" : "/notifications/stream";
const SSE_HEARTBEAT_INTERVAL_MS = 15_000;

const textEncoder = new TextEncoder();

function createSseFrame(event: string, data: unknown): Uint8Array {
  const serializedData = JSON.stringify(data)
    .split("\n")
    .map((line) => `data: ${line}`)
    .join("\n");

  return textEncoder.encode(`event: ${event}\n${serializedData}\n\n`);
}

function createSseHeaders() {
  const headers = new Headers();
  headers.set("Content-Type", "text/event-stream; charset=utf-8");
  headers.set("Cache-Control", "no-cache, no-transform");
  headers.set("Connection", "keep-alive");
  headers.set("X-Accel-Buffering", "no");
  return headers;
}

new Elysia()
  .use(
    cors({
      origin: allowedOrigins,
      methods: ["POST", "PUT", "GET", "DELETE", "PATCH"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  )
  .get(
    notificationStreamRoute,
    async ({ request }: { request: Request }) => {
      const elysiaContext: ElysiaContext = { request } as ElysiaContext;
      const authContext = await createContext({ context: elysiaContext });

      if (!authContext.session) {
        return new Response("Unauthorized", { status: 401 });
      }

      const stream = new ReadableStream<Uint8Array>({
        start(controller) {
          let closed = false;
          const heartbeat = setInterval(() => {
            if (!closed) {
              controller.enqueue(textEncoder.encode(": keep-alive\n\n"));
            }
          }, SSE_HEARTBEAT_INTERVAL_MS);

          const closeStream = () => {
            if (closed) {
              return;
            }

            closed = true;
            clearInterval(heartbeat);
            controller.close();
          };

          request.signal.addEventListener("abort", closeStream, { once: true });

          controller.enqueue(textEncoder.encode(": connected\n\n"));

          const streamNotifications = async () => {
            try {
              const iterator = notificationPublisher.subscribe(authContext.user.id, {
                signal: request.signal,
              });

              for await (const payload of iterator) {
                if (closed) {
                  break;
                }

                controller.enqueue(createSseFrame("notification", payload));
              }
            } catch (error) {
              if (!request.signal.aborted) {
                logger.error({ error, userId: authContext.user.id }, "Notification SSE stream error");
              }
            } finally {
              closeStream();
            }
          };

          streamNotifications().catch((error) => {
            logger.error({ error, userId: authContext.user.id }, "Notification SSE stream error");
          });
        },
      });

      return new Response(stream, {
        headers: createSseHeaders(),
      });
    },
    {
      parse: "none",
    }
  )
  .all(authRoute, async ({ request }: { request: Request }) => authServer.handler(request), {
    parse: "none",
  })
  .all(
    apiRoute,
    async ({ request }: { request: Request }) => {
      const elysiaContext: ElysiaContext = { request } as ElysiaContext;
      const authContext = await createContext({ context: elysiaContext });

      const { matched, response } = await httpHandler.handle(request, {
        prefix: apiPrefix,
        context: authContext,
      });

      if (matched) {
        return response;
      }

      return new Response("Not Found", { status: 404 });
    },
    {
      parse: "none",
    }
  )
  .ws(isDevelopment ? "/api/ws" : "/ws", {
    parse(_ws, message) {
      // oRPC client sends JSON, oRPC server must receive raw text to decode back into JSON.
      // this prevents Elysia's native JSON re-writing, so downstream code sees a raw frame again.

      if (message && typeof message === "object" && !(message instanceof ArrayBuffer) && !(message instanceof Uint8Array)) {
        return JSON.stringify(message);
      }
      return message;
    },

    async message(ws, message: string | ArrayBuffer) {
      try {
        let msg: string | Uint8Array;

        if (typeof message === "string") msg = message;
        else msg = new Uint8Array(message);

        // Get session from WebSocket upgrade request headers
        const session = await authServer.api.getSession({
          headers: ws.data.headers,
        });

        await wsHandler.message(ws, msg, { context: session ?? { session: null, user: null } });
      } catch (error) {
        logger.error({ error }, "WebSocket message error");
      }
    },

    close(ws) {
      wsHandler.close(ws);
    },
  })
  .listen(
    {
      port,
      hostname: env.HOSTNAME,
    },
    (server) => {
      const protocol = isDevelopment ? "http" : "https";
      logger.info(`API server started | ${protocol}://${server.hostname}:${server.port}`);
    }
  );
