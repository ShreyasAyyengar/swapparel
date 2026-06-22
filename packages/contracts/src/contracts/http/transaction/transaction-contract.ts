import { oc } from "@orpc/contract";
import { z } from "zod";
import { MAX_MESSAGE_LENGTH } from "../messaging/messaging-schemas";
import { postSchema } from "../post/post-schemas";
import { transactionItemSchema, transactionSchema } from "./transaction-schemas";

const transactionIdSchema = transactionSchema.shape._id;
const postIdSchema = postSchema.shape._id;

const updateTransactionInputSchema = z
  .object({
    _id: transactionIdSchema,
    scheduledFor: z.coerce.date().optional(),
    location: z.string().trim().min(1).optional().nullable(),
    status: transactionSchema.shape.status.optional(),
    updatedBuyerPosts: z.array(transactionItemSchema).optional(),
    updatedSellerPosts: z.array(transactionItemSchema).optional(),
  })
  .refine(
    ({ scheduledFor, location, status, updatedBuyerPosts, updatedSellerPosts }) =>
      scheduledFor !== undefined ||
      location !== undefined ||
      status !== undefined ||
      updatedBuyerPosts !== undefined ||
      updatedSellerPosts !== undefined,
    {
      message: "At least one transaction field must be provided.",
    }
  );

export const transactionContract = {
  createTransaction: oc
    .route({
      method: "POST",
    })
    .input(
      z.object({
        sellerPostId: postIdSchema,
        buyerPostId: postIdSchema,
        scheduledFor: z.coerce.date(),
        initialMessage: z.string().trim().min(1).max(MAX_MESSAGE_LENGTH).optional(),
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
      UNPROCESSABLE_CONTENT: {
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
};
