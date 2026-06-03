// Magic constants
import { z } from "zod";

const DESCRIPTION_MAX_LENGTH = 1000;
const TITLE_MAX_LENGTH = 40;
export const PRICE_MAX = 500;

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

export const SIZES = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "One Size"] as const;

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

export const postSchema = z.object({
  _id: z.uuidv7(),
  createdBy: z.email("Creator's email is required."),
  title: z.string().min(1, "Title must be at least 1 character.").max(TITLE_MAX_LENGTH, `Title must be ${TITLE_MAX_LENGTH} characters or less.`),
  description: z
    .string()
    .min(1, "Description must be at least 1 character.")
    .max(DESCRIPTION_MAX_LENGTH, `Description must be ${DESCRIPTION_MAX_LENGTH} characters or less.`),
  garmentType: z.enum(GARMENT_TYPES, "One provided garment type must be selected."),
  colour: z.array(z.enum(COLOURS)).min(1, "At least one provided colour must be selected."),
  size: z.enum(SIZES, "One provided size must be selected."),
  material: z.array(z.enum(MATERIALS)).min(1, "At least one provided material must be selected."),
  images: z.array(z.url()).min(1, "At least one image URL is required."),
  hashtags: z
    .array(
      z
        .string()
        .regex(/^#[a-zA-Z0-9_]+$/, "Hashtag must only contain letters, numbers, and underscores.")
        .min(1, "Hashtag must be at least 1 character.")
    )
    .default([]),
  price: z.coerce.number().min(1).max(PRICE_MAX).optional(),
});

export const userFormPostSchema = z.object({
  postData: postSchema.pick({
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
