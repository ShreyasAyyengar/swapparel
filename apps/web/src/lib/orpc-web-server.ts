import { createORPCClient } from "@orpc/client";
import type { ContractRouterClient } from "@orpc/contract";
import type { JsonifiedClient } from "@orpc/openapi-client";
import { OpenAPILink } from "@orpc/openapi-client/fetch";
import { contract } from "@swapparel/contracts";
import { headers } from "next/headers";
import { env } from "../env";

const apiPath = env.NEXT_PUBLIC_NODE_ENV === "development" ? "/api" : "";

const link = new OpenAPILink(contract, {
  url: `${env.NEXT_PUBLIC_API_URL}${apiPath}`,
  fetch: async (request, init?: RequestInit) => {
    const headersList = await headers();
    const incoming = Object.fromEntries(headersList.entries());

    return fetch(request, {
      ...init,
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        // ...Object.fromEntries(headersList.entries()),
        // ...(init?.headers ? Object.fromEntries(new Headers(init.headers).entries()) : {}),
        ...(incoming.cookie ? { cookie: incoming.cookie } : {}),
        ...(incoming.authorization ? { authorization: incoming.authorization } : {}),
        ...(init?.headers ? Object.fromEntries(new Headers(init.headers).entries()) : {}),
      },
    });
  },
});

export const webServerORPC: JsonifiedClient<ContractRouterClient<typeof contract>> = createORPCClient(link);
