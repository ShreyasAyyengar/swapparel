import { oc } from "@orpc/contract";
import { z } from "zod";
import { colors, internalPostSchema, materials } from "./post-contract";

const MIN_FEED_AMOUNT = 15;
const MAX_FEED_AMOUNT = 100;

// JS is stupid: Boolean("false") === true.
// https://github.com/colinhacks/zod/issues/2985#issuecomment-2085239542
const booleanStringSchema = z.preprocess((value) => {
  if (typeof value === "boolean") return value;
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  throw new Error("The string must be 'true' or 'false'");
}, z.boolean());

export const feedFilterSchema = z.object({
  createdBy: z.string().optional(),
  createdByDisplayName: z.string().optional(),
  colour: z
    .object({
      value: z.array(z.enum(colors)),
      only: booleanStringSchema.default(false),
    })
    .optional(),
  material: z
    .object({
      value: z.array(z.enum(materials)),
      only: booleanStringSchema.default(false),
    })
    .optional(),
  size: z
    .object({
      value: z.array(z.enum(["XXS", "XS", "S", "M", "L", "XL", "XXL"])),
      only: booleanStringSchema.default(false),
    })
    .optional(),
  hashtag: z
    .object({
      value: z.array(z.string()),
      only: booleanStringSchema.default(false),
    })
    .optional(),
});

export const feedContract = {
  getFeed: oc
    .route({
      method: "GET",
    })
    .input(
      z.object({
        amount: z.number().min(MIN_FEED_AMOUNT).max(MAX_FEED_AMOUNT).default(MIN_FEED_AMOUNT),
        filters: feedFilterSchema.optional(),
        cursor: z.uuid().optional(), // TODO migrate z.uuid() to z.uuidv7()
      })
    )
    .output(
      z.object({
        posts: z.array(internalPostSchema),
        cursor: z.uuid().optional(),
      })
    )
    .errors({
      NOT_FOUND: {},
      INTERNAL_SERVER_ERROR: {},
    }),

  testRoute: oc
    .route({
      method: "GET",
    })
    .output(z.string())
    .errors({
      NOT_FOUND: {},
    }),
};
