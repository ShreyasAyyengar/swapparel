import { oc } from "@orpc/contract";
import { z } from "zod";
import { internalPostSchema } from "./post-contract";

const MESSAGE_MIN_LENGTH = 1000;

export const internalSwapSchema = z.object({
  _id: z.uuidv7(),
  sellerPostID: internalPostSchema.pick({ _id: true }),
  buyerPostID: internalPostSchema.pick({ _id: true }).optional(),
  buyerEmail: z.email("Buyer's email is required."),
  messages: z.array(z.string().min(MESSAGE_MIN_LENGTH)),
  dateToSwap: z.date(),
  locationToSwap: z.string(),
  swapItemCompleted: z.boolean().default(false),
  returnItemCompleted: z.boolean().optional(),
});

export const swapContract = {
  createSwap: oc
    .route({
      method: "POST",
    })
    .input(internalSwapSchema.omit({ messages: true }).extend({ initialMessage: z.string() }))
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

  deleteSwap: oc
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

  addMockSwap: oc
    .route({
      method: "GET",
    })
    .output(z.boolean()),

  addMessage: oc
    .route({
      method: "PATCH",
    })
    .input(
      z.object({
        messageInput: z.string(),
        _id: z.uuidv7(),
      })
    )
    .output(
      z.object({
        success: z.boolean(),
        messageOutput: z.string().optional(),
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

  deleteMessage: oc
    .route({
      method: "PATCH",
    })
    .input(
      z.object({
        _id: z.uuidv7(),
        messageToDelete: z.string(),
      })
    )
    .output(
      z.object({
        messageDeleteSuccess: z.boolean(),
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
