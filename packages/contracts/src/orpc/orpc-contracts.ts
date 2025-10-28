import { oc } from "@orpc/contract";
import { z } from "zod";

export const contract = {
  counter: {
    count: oc
      .route({
        method: "GET",
        path: "/counter/count",
      })
      .output(z.string()),

    increment: oc
      .route({
        method: "GET",
      })
      .output(z.number()),

    decrement: oc
      .route({
        method: "GET",
      })
      .output(z.number()),
  },
};
