import { implement, ORPCError } from "@orpc/server";
import { contract, webSocketContract } from "@swapparel/contracts";
import type { AuthContext } from "./http-context";

export const publicProcedure = implement(contract).$context<AuthContext>();

export const protectedProcedure = publicProcedure.use(({ context, next }) => {
  if (!context.session) {
    throw new ORPCError("UNAUTHORIZED", {
      message: "Authentication required",
      cause: "No session",
    });
  }

  return next({
    context,
  });
});

export const webSocketProcedure = implement(webSocketContract).$context<AuthContext>();

export const protectedWebSocketProcedure = webSocketProcedure.use(({ context, next }) => {
  if (!context.session) {
    throw new ORPCError("UNAUTHORIZED", {
      message: "Authentication required",
      cause: "No session",
    });
  }

  return next({
    context,
  });
});
