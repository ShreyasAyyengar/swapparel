import { oc } from "@orpc/contract";
import { z } from "zod";
import {internalPostSchema} from "./post-contract";

const MESSAGE_MAX_LENGTH = 1000;

export const internalSwapSchema = z.object({
  swapData: z.object({
  _id: z.uuidv7(),
  sellerEmail: z.email("Seller's email is required."),
  buyerEmail: z.email("Buyer's email is required."),
  sellerPostID: internalPostSchema.pick({_id: true}),
  buyerPostID: internalPostSchema.pick({_id: true}).optional(),
  messageToSeller: z.string().max(MESSAGE_MAX_LENGTH, "Message can only be 1000 characters long").optional(),
  dateToSwap: z.date(),
  locationToSwap: z.string(),
  })
});


export const swapContract = {
  createSwap: oc
    .route({
      method: "POST",
    })
    .input(internalSwapSchema)
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

  addMockSwap: oc
    .route({
      method: "GET",
    })
    .output(z.boolean()),
};
