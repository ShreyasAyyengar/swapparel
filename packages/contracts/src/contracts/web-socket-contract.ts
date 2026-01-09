import { oc } from "@orpc/contract";
import { z } from "zod";
import { transactionSchema } from "./transaction-contract";

export const webSocketContract = {
  watchingTransaction: oc.input(
    z.object({
      transactionId: transactionSchema.shape._id,
    })
  ),
};
