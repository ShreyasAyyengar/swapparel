import { eventIterator, oc } from "@orpc/contract";
import { z } from "zod";
import { internalPostSchema } from "./post-contract";
import { messageSchema, transactionSchema } from "./transaction-contract";

export const feedSubscriptionPayload = z.object({
  updatedPost: internalPostSchema,
  action: z.enum(["CREATE", "UPDATE", "DELETE"]),
});

export const webSocketContract = {
  publishChatMessage: oc
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

  subscribeToChatMessages: oc
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

  publishDataChange: oc
    .input(
      z.object({
        transactionId: transactionSchema.shape._id,
      })
    )
    .output(z.object({ success: z.boolean() }))
    .errors({
      INTERNAL_SERVER_ERROR: {
        data: z.object({
          message: z.string(),
        }),
      },
      NOT_FOUND: {
        data: z.object({
          message: z.string(),
        }),
      },
    }),

  subscribeToDataChange: oc
    .input(
      z.object({
        transactionId: transactionSchema.shape._id,
      })
    )
    .output(
      eventIterator(
        z.object({
          initiatedBy: z.string(),
        })
      )
    ),

  subscribeToPostChanges: oc.output(eventIterator(feedSubscriptionPayload)),
};
