import { oc } from "@orpc/contract";
import { z } from "zod";
import { internalPostSchema } from "./post-contract";

const MESSAGE_MAX_LENGTH = 1000;

export const transactionSchema = z.object({
  _id: z.uuidv7(),
  sellerPostID: internalPostSchema.shape._id, // post from the feed
  buyerEmail: z.email("Buyer's email is required."),
  buyerPostIDs: z.array(internalPostSchema.shape._id).optional(), // personal posts that viewing user wants to give away
  dateToSwap: z.coerce.date(),
  locationToSwap: z.union([z.enum(Object.keys(PUBLIC_LOCATIONS)), z.string()]).optional(),
  messages: z.array(messageSchema),
  completed: z.boolean().default(false),
});

export const transactionSchemaWithAvatar = transactionSchema.extend({ avatarURL: z.string() });

export const transactionContract = {
  createTransaction: oc
    .route({
      method: "POST",
    })
    .input(
      transactionSchema
        .omit({ messages: true, locationToSwap: true, _id: true, completed: true })
        .extend({ initialMessage: z.string().optional() })
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
        initiatedTransactions: z.array(transactionSchemaWithAvatar),
        receivedTransactions: z.array(transactionSchemaWithAvatar),
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
      UNAUTHORIZED: {
        data: z.object({
          message: z.string(),
        }),
      },
    }),
};
