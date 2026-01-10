import { eventIterator, oc } from "@orpc/contract";
import { z } from "zod";
import { messageSchema, transactionSchema } from "./transaction-contract";

export const webSocketContract = {
  watchingTransaction: oc
    .input(
      z.object({
        transactionId: transactionSchema.shape._id,
      })
    )
    .output(
      eventIterator(
        z.object({
          incomingMessage: messageSchema,
        })
      )
    ),

  sendMessage: oc
    .input(
      z.object({
        transactionId: transactionSchema.shape._id,
        message: messageSchema,
      })
    )
    .output(
      z.object({
        outgoingMessage: messageSchema,
      })
    ),
};
