import { eventIterator, oc } from "@orpc/contract";
import { z } from "zod";
import { transactionSchema } from "../../http/transaction/transaction-schemas";
import { messageContent, messageSchema } from "./messaging-schemas";

export const messagingContract = {
  publishChatMessage: oc
    .input(
      z.object({
        transactionId: z.uuidv7(),
        message: messageContent,
        pendingAttachmentKeys: z.array(z.string()).optional(),
      })
    )
    .output(
      z.object({
        success: z.boolean(),
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
      UNPROCESSABLE_CONTENT: {
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

  publishMessageEdit: oc
    .input(
      z.object({
        transactionId: transactionSchema.shape._id,
        messageId: messageSchema.shape._id,
        newContent: messageContent,
      })
    )
    .output(
      z.object({
        success: z.boolean(),
        newMessage: messageSchema,
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

  setActiveChat: oc
    .input(
      z.object({
        transactionId: transactionSchema.shape._id,
      })
    )
    .output(z.object({ success: z.boolean() }))
    .errors({
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

  clearActiveChat: oc
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
    }),

  // also subscribe to message edits
  subscribeTransactionChat: oc
    .input(
      z.object({
        transactionId: transactionSchema.shape._id,
      })
    )
    .output(
      eventIterator(
        z.object({
          edited: z.boolean().default(false),
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
