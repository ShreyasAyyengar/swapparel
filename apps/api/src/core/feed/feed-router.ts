import { filterPosts, postSchema } from "@swapparel/contracts";
import { z } from "zod";
import { publicProcedure } from "../../libs/orpc-procedures";
import { hydrateR2Keys } from "../post/image-processing";
import { PostService } from "../post/post-service";

export const feedRouter = {
  getFeed: publicProcedure.feed.getFeed.handler(async ({ input, errors: { NOT_FOUND, INTERNAL_SERVER_ERROR } }) => {
    const limit = input.amount;

    // start *at* nextAvailablePost because it was not returned previously
    const documentQuery = PostService.find(input.nextAvailablePost ? { _id: { $lte: input.nextAvailablePost } } : {})
      .sort({ _id: -1 })
      .limit(limit + 1); // +1 to compute nextAvailablePost (next page start)

    const postDocuments = await documentQuery.exec();

    const nextDoc = postDocuments.length > limit ? postDocuments[limit] : undefined;
    const slicedDocs = postDocuments.slice(0, limit);

    const tryPosts = z.array(postSchema).safeParse(slicedDocs);
    if (!tryPosts.success) {
      throw INTERNAL_SERVER_ERROR({
        data: {
          message: `Failed to parse posts: ${tryPosts.error}`,
        },
      });
    }
    let posts = tryPosts.data;

    if (input.filters !== undefined) posts = filterPosts(posts, input.filters);

    // hydrate images
    for (const post of posts) post.images = await hydrateR2Keys(post.images);

    return {
      posts,
      nextAvailablePost: nextDoc?._id, // undefined if no more docs exist
    };
  }),
};
