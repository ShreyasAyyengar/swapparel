import { oc } from "@orpc/contract";
import { z } from "zod";
import { COLOURS, GARMENT_TYPES, internalPostSchema, MATERIALS, SIZES } from "./post-contract";

const FEED_AMOUNT = 20;

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

export const filterPosts = (posts: z.infer<typeof internalPostSchema>[], filters: z.infer<typeof feedFilterSchema> | undefined) => {
  // single-valued post fields (e.g., size is a single string on the post)
  const matchesSingle = (postValue: string | undefined, selected?: string[], only?: boolean) => {
    if (!selected?.length) return true;
    if (!postValue) return false;

    return only ? postValue === selected[0] : selected.includes(postValue);
  };

  // multi-valued post fields (e.g., material is string[] on the post)
  const matchesMulti = (postValues: string[] | undefined, selected?: string[], only?: boolean) => {
    if (!selected?.length) return true;
    if (!postValues?.length) return false;

    const selectedSet = new Set(selected);

    if (only) {
      // "only" means the exact set match
      if (postValues.length !== selected.length) return false;
      return postValues.every((v) => selectedSet.has(v));
    }

    // normal mode: any overlap
    return postValues.some((v) => selectedSet.has(v));
  };

  if (!filters) return posts;

  return posts.filter((post) => {
    if (!matchesMulti(post.material, filters.material, filters.materialOnly)) return false;
    if (!matchesMulti(post.colour, filters.color, filters.colorOnly)) return false;
    if (!matchesMulti(post.hashtags, filters.hashtag, filters.hashtagOnly)) return false;

    if (!matchesSingle(post.size, filters.size, false)) return false;
    if (!matchesSingle(post.garmentType, filters.garmentType, false)) return false;

    const hasPrice = post.price !== undefined;
    const isFree = !hasPrice || post.price === 0; // handles null/undefined OR 0
    const isPriced = hasPrice && post.price && post.price > 0;

    // mutually exclusive modes
    if (filters.freeOnly) return isFree;
    if (filters.priceOnly) return isPriced;

    // range filtering (only applies to priced items)
    // biome-ignore lint/style/noNonNullAssertion: hasPrice checks non-undefined
    if (typeof filters.minPrice === "number" && hasPrice && post.price! < filters.minPrice) return false;
    // biome-ignore lint/style/noNonNullAssertion: hasPrice checks non-undefined
    if (typeof filters.maxPrice === "number" && hasPrice && post.price! > filters.maxPrice) return false;

    return true;
  });
};
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

export const feedContract = {
  getFeed: oc
    .route({
      method: "GET",
    })
    .input(
      z.object({
        amount: z.coerce.number().default(FEED_AMOUNT),
        filters: feedFilterSchema.optional(),
        nextAvailablePost: z.uuidv7().optional(), // the last post retrieved from the previous request
      })
    )
    .output(
      z.object({
        posts: z.array(internalPostSchema),
        nextAvailablePost: z.uuidv7().optional(), // the last post retrieved from this request
      })
    )
    .errors({
      NOT_FOUND: {},
      INTERNAL_SERVER_ERROR: {
        data: z.object({
          message: z.string(),
        }),
      },
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
