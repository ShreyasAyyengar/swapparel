import { oc } from "@orpc/contract";
import { z } from "zod";

// Magic constants
const DESCRIPTION_MAX_LENGTH = 1000;

// Internal Schema Definitions
const qaSimpleSchema = z.object({
  question: z.string().min(1, "Question must be at least 1 character."),
  answer: z.string().optional(),
});

const qaEntrySchema = z.object({
  // biome-ignore format: readability
  question: z
    .string()
    .min(1, "Question must be at least 1 character."),
  // biome-ignore format: readability
  answer: z
    .string()
    .min(1, "Answer must be at least 1 character.")
    .optional(),
  // biome-ignore format: readability
  followUps: z
    .array(qaSimpleSchema)
    .optional(),
});

const materials = [
  "cotton",
  "linen",
  "wool",
  "silk",
  "cashmere",
  "hemp",
  "bamboo",

  "polyester",
  "nylon",
  "spandex",
  "elastane",
  "rayon",
  "viscose",
  "modal",
  "lyocell",
  "tencel",
  "acrylic",

  "denim",
  "corduroy",
  "fleece",
  "suede",
  "leather",
  "felt",
  "canvas",
  "jersey",
  "knit",
] as const;

const colors = [
  "red",
  "blue",
  "green",
  "yellow",
  "orange",
  "black",
  "white",
  "purple",
  "pink",
  "brown",
  "gray",
  "grey",
  "cyan",
  "magenta",
  "lime",
  "teal",
  "navy",
  "maroon",
  "olive",
  "beige",
  "tan",
  "turquoise",
  "gold",
  "silver",
  "lavender",
  "indigo",
  "violet",
  "peach",
  "aqua",
  "coral",
  "mint",
  "burgundy",
  "charcoal",
  "cream",
  "ivory",
] as const;

export const postFiltersSchema = z.object({
  createdBy: z.string().optional(),
  createdByDisplayName: z.string().optional(),
  color: z.enum(colors).optional(),
  material: z.enum(materials).optional(),
  size: z.enum(["XXS", "XS", "S", "M", "L", "XL", "XXL"]).optional(),
  hashtag: z.string().optional(),
});

export const internalPostSchema = z.object({
  _id: z.uuid(),
  // biome-ignore format: readability
  createdBy: z.email("Creator's email is required."),
  // biome-ignore format: readability
  description: z
    .string()
    .min(1, "Description must be at least 1 character.")
    .max(DESCRIPTION_MAX_LENGTH, `Description must be ${DESCRIPTION_MAX_LENGTH} characters or less.`),
  // biome-ignore format: readability
  colour: z
    .array(z.enum(colors))
    .min(1, "At least one provided colour must be selected."),
  // biome-ignore format: readability
  size: z.enum(
    ["XXS", "XS", "S", "M", "L", "XL", "XXL"],
    "One provided size must be selected."
  ),
  // biome-ignore format: readability
  material: z
    .array(z.enum(materials))
    .min(1, "At least one provided material must be selected."),
  // biome-ignore format: readability
  images: z
    .array(z.url())
    .min(1, "At least one image URL is required."),
  // biome-ignore format: readability
  hashtags: z
    .array(
      z
        .string()
        // .regex() TODO
        .min(1, "Hashtag must be at least 1 character.")
    )
    .default([]),
  // biome-ignore format: readability
  qaEntries: z
    .array(qaEntrySchema)
    .default([]),
});

export const postContract = {
  createPost: oc
    .route({
      method: "POST",
    })
    .input(internalPostSchema.omit({ _id: true, createdBy: true })) // _id (server-side), createdBy (auth context)
    .output(
      z.object({
        id: z.uuid(),
      })
    )
    .errors({
      NOT_FOUND: {},
      INTERNAL_SERVER_ERROR: {},
    }),

  deletePost: oc
    .route({
      method: "DELETE",
    })
    .input(
      z.object({
        id: z.uuid(),
      })
    )
    .output(z.object({ success: z.boolean(), error: z.string().optional() }))
    .errors({
      NOT_FOUND: {},
      INTERNAL_SERVER_ERROR: {},
    }),

  getPosts: oc
    .route({
      method: "GET",
    })
    .input(internalPostSchema.pick({ createdBy: true }))
    .output(z.array(internalPostSchema))
    .errors({
      NOT_FOUND: {},
      INTERNAL_SERVER_ERROR: {},
    }),

  getPost: oc
    .route({
      method: "GET",
    })
    .input(internalPostSchema.pick({ _id: true }))
    .output(internalPostSchema)
    .errors({
      NOT_FOUND: {},
      INTERNAL_SERVER_ERROR: {},
    }),

  addMockPost: oc
    .route({
      method: "GET",
    })
    .output(z.boolean()),
};
