import { oc } from "@orpc/contract";
import { z } from "zod";
import { postSchema } from "../post/post-schemas";
import { transactionSchema } from "./transaction-schemas";

const transactionIdSchema = transactionSchema.shape._id;
const postIdSchema = postSchema.shape._id;

const updateTransactionInputSchema = z
  .object({
    _id: transactionIdSchema,
    scheduledFor: z.coerce.date().optional(),
    location: z.string().trim().min(1).optional().nullable(),
    status: transactionSchema.shape.status.optional(),
  })
  .refine(({ scheduledFor, location, status }) => scheduledFor !== undefined || location !== undefined || status !== undefined, {
    message: "At least one transaction field must be provided.",
  });

export const transactionContract = {
  createTransaction: oc
    .route({
      method: "POST",
    })
    .input(
      z.object({
        sellerPostId: postIdSchema,
        buyerPostIds: z.array(postIdSchema),
        scheduledFor: z.coerce.date(),
      })
    )
    .output(
      z.object({
        _id: transactionIdSchema,
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
    .input(updateTransactionInputSchema)
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
