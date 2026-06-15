import { z } from "zod";
import { COLOURS, GARMENT_TYPES, MATERIALS, SIZES } from "../post/post-schemas";

// TODO find alternative to this hack
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
  throw new Error(`The string must be 'true' or 'false', got: ${value}`);
}, z.boolean());

export const feedFilterSchema = z.object({
  color: z.array(z.enum(COLOURS)).optional(),
  colorOnly: booleanStringSchema.default(false),
  material: z.array(z.enum(MATERIALS)).optional(),
  materialOnly: booleanStringSchema.default(false),
  size: z.array(z.enum(SIZES)).optional(),
  garmentType: z.array(z.enum(GARMENT_TYPES)).optional(),
  hashtag: z.array(z.string()).optional(),
  hashtagOnly: booleanStringSchema.default(false),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  priceOnly: booleanStringSchema.default(false),
  freeOnly: booleanStringSchema.default(false),
});
