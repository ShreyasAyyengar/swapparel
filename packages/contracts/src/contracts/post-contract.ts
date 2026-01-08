import { oc } from "@orpc/contract";
import { z } from "zod";

// Magic constants
const DESCRIPTION_MAX_LENGTH = 1000;
const TITLE_MAX_LENGTH = 25;
export const PRICE_MAX = 500;

// TODO change back to z.email()
export const singleCommentSchema = z.object({
  comment: z.string().min(1, "Reply must be at least 1 character."),
  author: z.string("Author's email is required."),
});

export const commentsSchema = z.object({
  // biome-ignore format: readability
  rootComment: singleCommentSchema,
  // biome-ignore format: readability
  childReplies: z
    .array(singleCommentSchema)
    .default([]),
});

export const VALID_MIME_TYPES = ["image/jpeg", "image/png", "image/heic", "image/heif"] as const;

export const uploadPhotoInput = z.object({
  id: z.string().uuid(),
  file: z.file("Invalid file."),
  mimeType: z.enum(VALID_MIME_TYPES, "Invalid file type."),
});

export const MATERIALS = [
  "Cotton",
  "Linen",
  "Wool",
  "Silk",
  "Cashmere",
  "Hemp",
  "Bamboo",

  "Polyester",
  "Nylon",
  "Spandex",
  "Elastane",
  "Rayon",
  "Viscose",
  "Modal",
  "Lyocell",
  "Tencel",
  "Acrylic",

  "Denim",
  "Corduroy",
  "Fleece",
  "Suede",
  "Leather",
  "Felt",
  "Canvas",
  "Jersey",
  "Knit",
] as const;

export const COLOURS = [
  "Red",
  "Blue",
  "Green",
  "Yellow",
  "Orange",
  "Black",
  "White",
  "Purple",
  "Pink",
  "Brown",
  "Gray",
  "Grey",
  "Cyan",
  "Magenta",
  "Lime",
  "Teal",
  "Navy",
  "Maroon",
  "Olive",
  "Beige",
  "Tan",
  "Turquoise",
  "Gold",
  "Silver",
  "Lavender",
  "Indigo",
  "Violet",
  "Peach",
  "Aqua",
  "Coral",
  "Mint",
  "Burgundy",
  "Charcoal",
  "Cream",
  "Ivory",
] as const;

export const SIZES = ["XXS", "XS", "S", "M", "L", "XL", "XXL"] as const;

export const GARMENT_TYPES = [
  "Shirt",
  "Shorts",
  "Pants",
  "Socks",
  "Jackets",
  "Dress",
  "Hat",
  "Gloves",
  "Sweater",
  "Glasses",
  "Wigs",
  "Accessories",
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
  garmentType: z.enum(GARMENT_TYPES, "One provided garment type must be selected."),
  colour: z.array(z.enum(COLOURS)).min(1, "At least one provided colour must be selected."),
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
  comments: z
    .array(commentsSchema)
    .default([]),

  price: z.coerce.number().min(1).max(PRICE_MAX).optional(),
});

export const userFormPostSchema = z.object({
  postData: internalPostSchema.pick({
    title: true,
    description: true,
    garmentType: true,
    size: true,
    colour: true,
    material: true,
    hashtags: true,
    price: true,
  }),
  images: z.array(uploadPhotoInput).min(1, "At least one image is required to create a post."),
});

export const postContract = {
  createPost: oc
    .route({
      method: "POST",
    })
    // id is only for frontend state management. we do not need it in the payload
    .input(userFormPostSchema.omit({ images: true }).extend({ images: z.array(uploadPhotoInput.omit({ id: true })).min(1) }))
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

  replyToComment: oc
    .route({
      method: "PUT",
    })
    .input(
      z.object({
        postId: internalPostSchema.shape._id,
        commentIndex: z.coerce.number().min(0),
        reply: z.string().min(1, "Reply must be at least 1 character."),
      })
    )
    .output(z.object({ success: z.boolean() }))
    .errors({
      NOT_FOUND: {
        data: z.object({
          message: z.string(),
        }),
      },
      BAD_REQUEST: {},
      INTERNAL_SERVER_ERROR: {
        data: z.object({
          message: z.string(),
        }),
      },
    }),

  createNewComment: oc
    .route({
      method: "PUT",
    })
    .input(
      z.object({
        postId: internalPostSchema.shape._id,
        comment: singleCommentSchema.shape.comment,
      })
    )
    .output(z.object({ success: z.boolean() }))
    .errors({
      NOT_FOUND: {},
      BAD_REQUEST: {},
      INTERNAL_SERVER_ERROR: {},
    }),

  addMockPost: oc
    .route({
      method: "GET",
    })
    .output(z.boolean()),
};
