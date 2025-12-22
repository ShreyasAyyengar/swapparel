import { filterPosts, internalPostSchema } from "@swapparel/contracts";
import { z } from "zod";
import { publicProcedure } from "../../libs/orpc";
import { PostCollection } from "../post/post-schema";

export const feedRouter = {
  getFeed: publicProcedure.feed.getFeed.handler(async ({ input, errors: { NOT_FOUND, INTERNAL_SERVER_ERROR }, context }) => {
    const limit = input.amount;

    // start *at* nextAvailablePost because it was not returned previously
    const documentQuery = PostCollection.find(input.nextAvailablePost ? { _id: { $lte: input.nextAvailablePost } } : {})
      .sort({ _id: -1 })
      .limit(limit + 1); // +1 to compute nextAvailablePost (next page start)

    const postDocuments = await documentQuery.exec();

    const nextDoc = postDocuments.length > limit ? postDocuments[limit] : undefined;
    const slicedDocs = postDocuments.slice(0, limit);

    let posts = z.array(internalPostSchema).parse(slicedDocs);

    // if (context.user?.email) posts = posts.filter((post) => post.createdBy !== context.user.email);

    if (input.filters !== undefined) posts = filterPosts(posts, input.filters);

    return {
      posts,
      nextAvailablePost: nextDoc?._id, // undefined if no more docs exist
    };
  }),

  testRoute: publicProcedure.feed.testRoute.handler(async ({ errors: { NOT_FOUND } }) => "Test route called"),
};
