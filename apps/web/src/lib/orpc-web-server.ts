import { createORPCClient } from "@orpc/client";
import type { ContractRouterClient } from "@orpc/contract";
import type { JsonifiedClient } from "@orpc/openapi-client";
import { OpenAPILink } from "@orpc/openapi-client/fetch";
import { contract } from "@repo/contracts";
import { headers } from "next/headers";
import type { appRouter } from "../../../api/src";
import { env } from "../env";

const link = new OpenAPILink(contract, {
  url: `${env.NEXT_PUBLIC_API_URL}/rpc`,
  fetch: async (request, init?: RequestInit) => {
    const headersList = await headers();
    return fetch(request, {
      ...init,
      credentials: "include",
      headers: {
        ...(init?.headers ? Object.fromEntries(new Headers(init.headers).entries()) : {}),
        ...Object.fromEntries(headersList.entries()),
      },
    });
  },
});

export const webServerORPC: JsonifiedClient<ContractRouterClient<typeof appRouter>> = createORPCClient(link);
