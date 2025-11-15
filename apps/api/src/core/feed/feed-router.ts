import { internalPostSchema } from "@swapparel/contracts";
import { z } from "zod";
import { publicProcedure } from "../../libs/orpc.ts";
import { PostCollection } from "../post/post-schema.ts";

export const feedRouter = {
  getFeed: publicProcedure.feed.getFeed.handler(async ({ input, errors: { NOT_FOUND, INTERNAL_SERVER_ERROR } }) => {
    const postDocuments = await PostCollection.find().limit(input.amount).exec();
    let posts = z.array(internalPostSchema).parse(postDocuments);

    if (input.userId) posts = posts.filter((post) => post.createdBy !== input.userId);

    posts = posts.filter((post) => {
      if (!input.filters) return true;

      if (input.filters.createdBy && !input.filters.createdBy.includes(post.createdBy)) return false;
      // if (input.filters.createdByDisplayName && !input.filters.createdByDisplayName.includes(post.createdByDisplayName)) return false; TODO betterauth integration
      if (input.filters.size && !input.filters.size.includes(post.size)) return false;
      // biome-ignore lint/style/noNonNullAssertion: internalPostSchema must guarantee material[0] is defined
      if (input.filters.material && !input.filters.material.includes(post.material[0]!)) return false;
      // biome-ignore lint/style/noNonNullAssertion: internalPostSchema must guarantee material[0] is defined
      if (input.filters.color && !input.filters.color.includes(post.colour[0]!)) return false;

      if (input.filters.hashtag && input.filters.hashtag.length > 1 && !input.filters.hashtag.includes(post.hashtags[0])) return false;
      return true;
    });

    return posts;
  }),
};
