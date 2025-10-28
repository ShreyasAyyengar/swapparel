import { oc } from "@orpc/contract";
import { z } from "zod";

export const contract = {
  hello: {
    sayHello: oc
      .route({
        method: "GET",
        path: "/count",
      })
      .output(z.string()),

    increment: oc.output(z.number()),
    decrement: oc.output(z.number()),
  },
};

export type Contract = typeof contract;
