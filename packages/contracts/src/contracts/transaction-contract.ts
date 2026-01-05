import { oc } from "@orpc/contract";
import { z } from "zod";
import { internalPostSchema } from "./post-contract";

const MESSAGE_MIN_LENGTH = 1000;

export const transaction = z.object({
  _id: z.uuidv7(),
  sellerPostID: internalPostSchema.pick({ _id: true }), // post from the feed
  buyerPostID: z.array(internalPostSchema.pick({ _id: true })).optional(), // personal posts that viewing user wants to give away
  buyerEmail: z.email("Buyer's email is required."),
  dateToSwap: z.date(),
  locationToSwap: z.string(),
  swapItemCompleted: z.boolean().default(false),
  returnItemCompleted: z.boolean().optional(),

  messages: z.array(z.string().min(MESSAGE_MIN_LENGTH)),
});

export const transactionContract = {
  createTransaction: oc
    .route({
      method: "POST",
    })
    .input(transaction.omit({ messages: true }).extend({ initialMessage: z.string() }))
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
