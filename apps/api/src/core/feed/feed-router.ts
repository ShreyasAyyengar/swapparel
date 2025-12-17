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

    if (context.user?.email) posts = posts.filter((post) => post.createdBy !== context.user.email);

    if (!input.filters) return { posts, cursor: postDocuments.at(-1)?._id };

    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: it's filtering, allow.
    posts = posts.filter((post) => {
      if (!input.filters) return true; // assert input.filters is not null

      // if (input.filters.createdBy && !input.filters.createdBy.includes(post.createdBy)) return false;
      // if (input.filters.createdByDisplayName && !input.filters.createdByDisplayName.includes(post.createdByDisplayName)) return false; TODO betterauth integration

      if (input.filters.material?.value) {
        if (input.filters.material.only) {
          return (
            // biome-ignore lint/style/noNonNullAssertion: we already checked for null
            post.material.length === input.filters!.material!.value.length &&
            // biome-ignore lint/style/noNonNullAssertion: we already checked for null
            post.material.every((m) => input.filters!.material!.value.includes(m))
          );
        }

        // biome-ignore lint/style/noNonNullAssertion: we already checked for null
        return post.material.some((m) => input.filters!.material!.value.includes(m));
      }

      if (input.filters.colour?.value) {
        if (input.filters.colour.only) {
          return (
            // biome-ignore lint/style/noNonNullAssertion: we already checked for null
            post.colour.length === input.filters!.colour!.value.length &&
            // biome-ignore lint/style/noNonNullAssertion: we already checked for null
            post.colour.every((c) => input.filters!.colour!.value.includes(c))
          );
        }

        // biome-ignore lint/style/noNonNullAssertion: we already checked for null
        return post.colour.some((c) => input.filters!.colour!.value.includes(c));
      }

      if (input.filters.hashtag?.value) {
        if (input.filters.hashtag.only) {
          return (
            // biome-ignore lint/style/noNonNullAssertion: we already checked for null
            post.hashtags.length === input.filters!.hashtag!.value.length &&
            // biome-ignore lint/style/noNonNullAssertion: we already checked for null
            post.hashtags.every((h) => input.filters!.hashtag!.value.includes(h))
          );
        }

        // biome-ignore lint/style/noNonNullAssertion: we already checked for null
        return post.hashtags.some((h) => input.filters!.hashtag!.value.includes(h));
      }

      if (input.filters.size?.value) {
        if (input.filters.size.only) {
          return (
            // biome-ignore lint/style/noNonNullAssertion: we already checked for null
            post.size === input.filters!.size!.value[0]
          );
        }

        // biome-ignore lint/style/noNonNullAssertion: we already checked for null
        return input.filters!.size!.value.includes(post.size);
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
