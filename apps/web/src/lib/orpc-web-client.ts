import { createORPCClient } from "@orpc/client";
import type { ContractRouterClient } from "@orpc/contract";
import type { JsonifiedClient } from "@orpc/openapi-client";
import { OpenAPILink } from "@orpc/openapi-client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { contract } from "@repo/contracts/orpc/contracts";
import type { appRouter } from "api/app-router";
import { env } from "../env";

const link = new OpenAPILink(contract, {
  url: `${env.NEXT_PUBLIC_API_URL}/rpc`,
  fetch(url, options) {
    return fetch(url, {
      ...options,
      credentials: "include",
    });
  },
});

const client: JsonifiedClient<ContractRouterClient<typeof appRouter>> =
  createORPCClient(link);

export const orpc = createTanstackQueryUtils(client);
