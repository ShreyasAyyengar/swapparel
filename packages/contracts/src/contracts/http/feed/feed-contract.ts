import { oc } from "@orpc/contract";
import { z } from "zod";
import { postSchema } from "../post/post-schemas";
import { feedFilterSchema } from "./feed-schemas";

const FEED_AMOUNT = 20;

export const filterPosts = (posts: z.infer<typeof postSchema>[], filters: z.infer<typeof feedFilterSchema> | undefined) => {
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
        posts: z.array(postSchema),
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
};
