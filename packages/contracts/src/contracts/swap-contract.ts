import { oc } from "@orpc/contract";
import { z } from "zod";

const MESSAGE_MAX_LENGTH = 1000;

export const internalSwapSchema = z.object({
  _id: z.uuidv7(),
  sellerEmail: z.email("Seller's email is required."),
  buyerEmail: z.email("Buyer's email is required."),
  sellerPostID: z.uuidv7(),
  buyerPostID: z.uuidv7().optional(),
  messageToSeller: z.string().max(MESSAGE_MAX_LENGTH, "Message can only be 1000 characters long").optional(),
  dateToSwap: z.date(),
  locationToSwap: z.string(),
});

export const userFormSwapSchema = z.object({
  swapData: internalSwapSchema.pick({
    _id: true,
    sellerEmail: true,
    buyerEmail: true,
    sellerPostID: true,
    buyerPostID: true,
    messageToSeller: true,
    dateToSwap: true,
    locationToSwap: true,
  }),
});

export const swapContract = {
  createSwap: oc
    .route({
      method: "POST",
    })
    .input(userFormSwapSchema)
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
