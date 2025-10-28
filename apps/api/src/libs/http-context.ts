import type { Context as ElysiaContext } from "elysia";
import { authServer } from "./auth-server";

export type CreateContextOptions = {
  context: ElysiaContext;
};

export async function createContext({ context }: CreateContextOptions) {
  return await authServer.api.getSession({
    headers: context.request.headers,
  });
}

export type AuthContext = NonNullable<
  Awaited<ReturnType<typeof createContext>>
>;
