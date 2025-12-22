import { oc } from "@orpc/contract";
import { z } from "zod";
import { COLOURS, internalPostSchema, MATERIALS } from "./post-contract";

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
  if (!filters) return posts;

  const hasActive =
    (filters.material?.value?.length ?? 0) > 0 ||
    (filters.colour?.value?.length ?? 0) > 0 ||
    (filters.hashtag?.value?.length ?? 0) > 0 ||
    (filters.size?.value?.length ?? 0) > 0;

  if (!hasActive) return posts;

  return posts.filter((post) => {
    // TODO streamline usages of this
    if (!filters) return true;

    // MATERIAL
    if (filters.material?.value?.length) {
      const selected = filters.material.value;
      const ok = filters.material.only
        ? post.material.length === selected.length && post.material.every((m) => selected.includes(m))
        : post.material.some((m) => selected.includes(m));
      if (!ok) return false;
    }

    // COLOUR
    if (filters.colour?.value?.length) {
      const selected = filters.colour.value;
      const ok = filters.colour.only
        ? post.colour.length === selected.length && post.colour.every((c) => selected.includes(c))
        : post.colour.some((c) => selected.includes(c));
      if (!ok) return false;
    }

    // HASHTAGS
    if (filters.hashtag?.value?.length) {
      const selected = filters.hashtag.value;
      const ok = filters.hashtag.only
        ? post.hashtags.length === selected.length && post.hashtags.every((h) => selected.includes(h))
        : post.hashtags.some((h) => selected.includes(h));
      if (!ok) return false;
    }

    // SIZE
    if (filters.size?.value?.length) {
      const selected = filters.size.value;
      const ok = filters.size.only ? post.size === selected[0] : selected.includes(post.size);
      if (!ok) return false;
    }

    return true;
  });
};

export const feedFilterSchema = z.object({
  colour: z
    .object({
      value: z.array(z.enum(COLOURS)),
      only: booleanStringSchema.default(false),
    })
    .optional(),
  material: z
    .object({
      value: z.array(z.enum(MATERIALS)),
      only: booleanStringSchema.default(false),
    })
    .optional(),
  size: z
    .object({
      value: z.array(z.enum(SIZES)),
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
        amount: z.coerce.number().default(FEED_AMOUNT), // TODO check functionality of coerce
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
