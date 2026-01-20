import { createORPCClient } from "@orpc/client";
import type { ContractRouterClient } from "@orpc/contract";
import { OpenAPILink } from "@orpc/openapi-client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { contract } from "@swapparel/contracts";
import { env } from "../env";

const apiPath = env.NEXT_PUBLIC_NODE_ENV === "development" ? "/api" : "";

const link = new OpenAPILink(contract, {
  url: `${env.NEXT_PUBLIC_API_URL}${apiPath}`,
  fetch(url, options) {
    return fetch(url, {
      ...options,
      credentials: "include",
    });
  },
});

const client: ContractRouterClient<typeof contract> = createORPCClient(link);
export const webClientORPC = createTanstackQueryUtils(client);
