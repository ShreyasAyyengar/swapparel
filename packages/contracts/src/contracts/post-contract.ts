import { oc } from "@orpc/contract";
import { z } from "zod";

// Magic constants
const DESCRIPTION_MAX_LENGTH = 1000;
const TITLE_MAX_LENGTH = 25;

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

export const VALID_MIME_TYPES = ["image/jpeg", "image/png", "image/heic", "image/heif"] as const;

export const uploadPhotoInput = z.object({
  file: z.file("Invalid file."),
  mimeType: z.enum(VALID_MIME_TYPES, "Invalid file type."),
});

export const MATERIALS = [
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

export const COLOURS = [
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

export const SIZES = ["XXS", "XS", "S", "M", "L", "XL", "XXL"] as const;

// TODO implement garment type later
export const GARMENT_TYPES = [
  "shirt",
  "shorts",
  "pants",
  "socks",
  "jackets",
  "dress",
  "hat",
  "gloves",
  "sweater",
  "glasses",
  "wigs",
  "accessories",
] as const;

export const internalPostSchema = z.object({
  _id: z.uuidv7(),
  // biome-ignore format: readability
  createdBy: z.email("Creator's email is required."),
  // biome-ignore format: readability
  title: z.string().min(1, "Title must be at least 1 character.").max(TITLE_MAX_LENGTH, "Title must be 25 characters or less."),
  // biome-ignore format: readability
  description: z
    .string()
    .min(1, "Description must be at least 1 character.")
    .max(DESCRIPTION_MAX_LENGTH, `Description must be ${DESCRIPTION_MAX_LENGTH} characters or less.`),
  // biome-ignore format: readability
  colour: z
    .array(z.enum(COLOURS))
    .min(1, "At least one provided colour must be selected."),
  // biome-ignore format: readability
  size: z.enum(SIZES, "One provided size must be selected."),
  // biome-ignore format: readability
  material: z
    .array(z.enum(MATERIALS))
    .min(1, "At least one provided material must be selected."),
  // biome-ignore format: readability
  images: z
    .array(z.url())
    .min(1, "At least one image URL is required."),
  // biome-ignore format: readability
  hashtags: z
    .array(
      z.string()
        .regex(/^#[a-zA-Z0-9_]+$/, "Hashtag must only contain letters, numbers, and underscores.")
        .min(1, "Hashtag must be at least 1 character.")
    )
    .default([]),
  // biome-ignore format: readability
  qaEntries: z
    .array(qaEntrySchema)
    .default([]),
});

export const userFormPostSchema = z.object({
  postData: internalPostSchema.pick({
    title: true,
    description: true,
    size: true,
    colour: true,
    material: true,
    hashtags: true,
  }),
  images: z.array(uploadPhotoInput).min(1, "At least one image is required to create a post."),
});

export const postContract = {
  createPost: oc
    .route({
      method: "POST",
    })
    .input(userFormPostSchema)
    .output(
      z.object({
        id: z.uuidv7(),
      })
    )
    .errors({
      NOT_FOUND: {
        data: z.object({
          message: z.string(),
        }),
      },
      BAD_REQUEST: {
        data: z.object({
          message: z.string(),
          issues: z.array(z.any()).optional(),
        }),
      },
      INTERNAL_SERVER_ERROR: {
        data: z.object({
          message: z.string(),
        }),
      },
    }),

  deletePost: oc
    .route({
      method: "DELETE",
    })
    .input(
      z.object({
        id: z.uuidv7(),
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
