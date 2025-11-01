import { implement, ORPCError } from "@orpc/server";
import { contract } from "@swapparel/contracts/contracts";
import type { AuthContext } from "./http-context";

export const os = implement(contract).$context<AuthContext>();

export const publicProcedure = os;

export const protectedProcedure = os.use(({ context, next }) => {
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
