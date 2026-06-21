import { oc } from "@orpc/contract";
import { z } from "zod";
import { embeddedPostSchema, transactionSchema } from "./transaction-schemas";

export const transactionContract = {
  createTransaction: oc
    .route({
      method: "POST",
    })
    .input(
      z.object({
        sellerEmail: z.email(),
        sellerPost: embeddedPostSchema,
        buyerEmail: z.email(),
        buyerPosts: z.array(embeddedPostSchema),
        dateToSwap: z.coerce.date(),
        initialMessage: z.string().optional(),
      })
    )
    .output(
      z.object({
        _id: z.uuidv7(),
      })
    )
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
      BAD_REQUEST: {
        data: z.object({
          issues: z.array(z.any()).optional(),
          message: z.string(),
        }),
      },
    }),

  deleteTransaction: oc
    .route({
      method: "DELETE",
    })
    .input(
      z.object({
        _id: z.uuidv7(),
      })
    )
    .output(
      z.object({
        success: z.boolean(),
        message: z.string(),
      })
    )
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

  getTransactions: oc
    .route({
      method: "GET",
    })
    .output(
      z.object({
        initiatedTransactions: z.array(transactionSchema),
        receivedTransactions: z.array(transactionSchema),
      })
    )
    .errors({
      NOT_FOUND: {},
      INTERNAL_SERVER_ERROR: {
        data: z.object({
          message: z.string(),
        }),
      },
    }),

  updateTransaction: oc
    .route({
      method: "PATCH",
    })
    .input(
      z.object({
        _id: z.uuidv7(),
        dateToSwap: transactionSchema.shape.dateToSwap.optional(),
        locationToSwap: transactionSchema.shape.locationToSwap.optional(),
      })
    )
    .output(
      z.object({
        success: z.boolean(),
      })
    )
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
};
