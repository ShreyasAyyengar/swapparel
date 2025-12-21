import { oc } from "@orpc/contract";
import { z } from "zod";
import { colors, internalPostSchema, materials } from "./post-contract";

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
    if (filters.material?.value?.length) {
      const v = filters.material.value;
      const only = filters.material.only;
      const pass = only
        ? post.material.length === v.length && post.material.every((m) => v.includes(m))
        : post.material.some((m) => v.includes(m));
      if (!pass) return false;
    }

    if (filters.colour?.value?.length) {
      const v = filters.colour.value;
      const only = filters.colour.only;
      const pass = only ? post.colour.length === v.length && post.colour.every((c) => v.includes(c)) : post.colour.some((c) => v.includes(c));
      if (!pass) return false;
    }

    if (filters.hashtag?.value?.length) {
      const v = filters.hashtag.value;
      const only = filters.hashtag.only;
      const pass = only
        ? post.hashtags.length === v.length && post.hashtags.every((h) => v.includes(h))
        : post.hashtags.some((h) => v.includes(h));
      if (!pass) return false;
    }

    if (filters.size?.value?.length) {
      const v = filters.size.value;
      const only = filters.size.only;
      const pass = only ? post.size === v[0] : v.includes(post.size);
      if (!pass) return false;
    }

    return true;
  });
};

export const feedFilterSchema = z.object({
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
