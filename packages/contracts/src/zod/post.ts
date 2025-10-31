import { z } from "zod";

const qaSimpleSchema = z.object({
  question: z.string().min(1),
  answer: z.string().optional(),
});

const qaEntrySchema = z.object({
  question: z
    .string()
    .min(1, "Question must be at least 1 character."),
  answer: z.string().optional().or(z.literal()),
  followUps: z.array(qaSimpleSchema).optional(),
});

export const createPostInput = z.object({
  // biome-ignore
  createdBy: z.email("Creator's email is required."),
  description: z
    .string()
    .min(1, "Description must be at least 1 character.")
    .max(1000, "Description must be 1000 characters or less."),
  colour: z.string().min(1, "Colour must be at least 1 character."),
  size: z.enum(
    ["XS", "S", "M", "L", "XL"],
    "Size must be one of: XS, S, M, L, XL."
  ),
  material: z
    .string()
    .min(1, "Material must be at least 1 character."),
  images: z
    .array(z.url().min(1, "At least one image URL is required."))
    .min(1, "At least one image URL is required."),
  hashtags: z
    .array(z.string().min(1, "Hashtag must be at least 1 character."))
    .default([]),
  qaEntries: z.array(qaEntrySchema).default([]),
});

export type CreatePostInput = z.infer<typeof createPostInput>;
