import { internalPostSchema } from "@swapparel/contracts";
import { z } from "zod";
import { publicProcedure } from "../../libs/orpc.ts";
import { PostCollection } from "../post/post-schema.ts";

export const feedRouter = {
  getFeed: publicProcedure.feed.getFeed.handler(async ({ input, errors: { NOT_FOUND, INTERNAL_SERVER_ERROR } }) => {
    let posts = await PostCollection.find().limit(input.amount).exec();
    if (input.userId) posts = posts.filter((post) => post.createdBy !== input.userId); // remove user from seeing their own posts on feed

    try {
      return z.array(internalPostSchema).parse(posts);
    } catch (error) {
      throw INTERNAL_SERVER_ERROR({ message: `Failed to convert documents to internalPostSchema: ${error}` });
    }
  }),
};
