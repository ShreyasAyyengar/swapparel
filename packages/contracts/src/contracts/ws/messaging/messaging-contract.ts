import { eventIterator, oc } from "@orpc/contract";
import { z } from "zod";
import { messageSchema } from "../../http/messaging/messaging-schemas";
import { transactionSchema } from "../../http/transaction/transaction-schemas";

export const messagingContract = {
  publishChatMessage: oc
    .input(
      z.object({
        transactionId: z.uuidv7(),
        message: messageSchema,
      })
    )
    .errors({
      INTERNAL_SERVER_ERROR: {
        data: z.object({
          message: z.string(),
        }),
      },
      FORBIDDEN: {
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

  subscribeTransactionChat: oc
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
    )
    .errors({
      INTERNAL_SERVER_ERROR: {
        data: z.object({
          message: z.string(),
        }),
      },
      FORBIDDEN: {
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

  publishTransactionDataChange: oc
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
      FORBIDDEN: {
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

  subscribeTransactionDataChange: oc
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
    )
    .errors({
      INTERNAL_SERVER_ERROR: {
        data: z.object({
          message: z.string(),
        }),
      },
      FORBIDDEN: {
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
};
