import { internalPostSchema } from "@swapparel/contracts";
import { z } from "zod";
import { publicProcedure } from "../../libs/orpc";
import { PostCollection } from "../post/post-schema";

export const feedRouter = {
  getFeed: publicProcedure.feed.getFeed.handler(async ({ input, errors: { NOT_FOUND, INTERNAL_SERVER_ERROR }, context }) => {
    const documentQuery = PostCollection.find(input.cursor ? { _id: { $lt: input.cursor } } : {})
      .sort({ _id: -1 })
      .limit(input.amount);

    const postDocuments = await documentQuery.exec();

    let posts = z.array(internalPostSchema).parse(postDocuments);

    // if (context.user?.email) posts = posts.filter((post) => post.createdBy !== context.user.email);

    if (input.filters === undefined) return { posts, cursor: postDocuments.at(-1)?._id };

    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: it's filtering, allow.
    posts = posts.filter((post) => {
      const f = input.filters;
      if (!f) return true;

      // MATERIAL
      if (f.material?.value?.length) {
        const selected = f.material.value;
        const ok = f.material.only
          ? post.material.length === selected.length && post.material.every((m) => selected.includes(m))
          : post.material.some((m) => selected.includes(m));

        if (!ok) return false;
      }

      // COLOUR
      if (f.colour?.value?.length) {
        const selected = f.colour.value;
        const ok = f.colour.only
          ? post.colour.length === selected.length && post.colour.every((c) => selected.includes(c))
          : post.colour.some((c) => selected.includes(c));

        if (!ok) return false;
      }

      // HASHTAGS
      if (f.hashtag?.value?.length) {
        const selected = f.hashtag.value;
        const ok = f.hashtag.only
          ? post.hashtags.length === selected.length && post.hashtags.every((h) => selected.includes(h))
          : post.hashtags.some((h) => selected.includes(h));

        if (!ok) return false;
      }

      // SIZE
      if (f.size?.value?.length) {
        const selected = f.size.value;
        const ok = f.size.only ? post.size === selected[0] : selected.includes(post.size);
        if (!ok) return false;
      }

      return true;
    });

    return {
      posts,
      cursor: postDocuments.at(-1)?._id,
    };
  }),

  testRoute: publicProcedure.feed.testRoute.handler(async ({ errors: { NOT_FOUND } }) => "Test route called"),
};
