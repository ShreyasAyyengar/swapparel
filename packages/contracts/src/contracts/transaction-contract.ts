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
  locationToSwap: z.string().optional(),
  messages: z.array(z.string().max(MESSAGE_MAX_LENGTH)),
  completed: z.boolean().default(false),
});

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

  addMockTransaction: oc
    .route({
      method: "GET",
    })
    .output(z.boolean()),
};
