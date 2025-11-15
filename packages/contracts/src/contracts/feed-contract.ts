import { oc } from "@orpc/contract";
import { z } from "zod";
import { internalPostSchema } from "./post-contract.ts";

const MIN_FEED_AMOUNT = 25;
const MAX_FEED_AMOUNT = 100;

export const feedContract = {
  getFeed: oc
    .route({
      method: "GET",
    })
    .input(
      z.object({
        userId: z.string(), // eliminate seeing own posts
        amount: z.number().min(MIN_FEED_AMOUNT).max(MAX_FEED_AMOUNT).default(MIN_FEED_AMOUNT),
      })
    )
    .output(z.array(internalPostSchema))
    .errors({
      NOT_FOUND: {},
      INTERNAL_SERVER_ERROR: {},
    }),
};
