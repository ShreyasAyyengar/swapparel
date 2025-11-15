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
      if (input.filters.material && !input.filters.material.some((m) => post.material.includes(m))) return false;
      if (input.filters.color && !input.filters.color.some((c) => post.colour.includes(c))) return false;
      if (input.filters.hashtag && post.hashtags.length > 0 && !input.filters.hashtag.some((h) => post.hashtags.includes(h))) return false;
      return true;
    });

    return posts;
  }),
};
