import { createORPCClient } from "@orpc/client";
import type { ContractRouterClient } from "@orpc/contract";
import type { JsonifiedClient } from "@orpc/openapi-client";
import { OpenAPILink } from "@orpc/openapi-client/fetch";
import { contract } from "@swapparel/contracts/contracts";
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

export const webClientORPC: JsonifiedClient<ContractRouterClient<typeof contract>> = createORPCClient(link);
