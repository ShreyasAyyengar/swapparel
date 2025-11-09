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
    .string()
    .min(1, "Colour must be at least 1 character."),
  // biome-ignore format: readability
  size: z.enum(
    ["XS", "S", "M", "L", "XL"],
    "Size must be one of: XS, S, M, L, XL."
  ),
  // biome-ignore format: readability
  material: z
    .array(
      z
        .string()
        .min(1, "Material must be at least 1 character.")
    ),
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
    .input(internalPostSchema.omit({ _id: true }))
    .output(
      z.object({
        id: z.uuid(),
      })
    ),

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
      NOT_FOUND: {
        message: "Post not found with specified id",
        status: 404,
      },
    }),

  getPosts: oc
    .route({
      method: "GET",
    })
    .input(internalPostSchema.pick({ createdBy: true }))
    .output(z.array(internalPostSchema)),

  getPost: oc
    .route({
      method: "GET",
    })
    .input(internalPostSchema.pick({ _id: true }))
    .output(internalPostSchema)
    .errors({
      NOT_FOUND: {
        message: "Post not found",
        status: 404,
      },
    }),

  test: oc
    .route({
      method: "GET",
    })
    .output(z.boolean()),
};
