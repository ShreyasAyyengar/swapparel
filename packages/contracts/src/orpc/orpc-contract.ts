import { oc } from "@orpc/contract";
import { z } from "zod";

export const contract = {
  count: {
    count: oc.input(z.number()).output(z.string()),
    increment: oc.input(z.number()).output(z.string()),
    decrement: oc.input(z.number()).output(z.string()),
  },
};
