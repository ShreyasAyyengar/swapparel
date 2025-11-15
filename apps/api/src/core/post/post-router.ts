import { v4 as uuidv4 } from "uuid";
import { logger } from "../../libs/logger";
import { protectedProcedure, publicProcedure } from "../../libs/orpc";
import { UserCollection } from "../users/user-schema";
import { PostCollection } from "./post-schema";

export const postRouter = {
  createPost: protectedProcedure.posts.createPost.handler(async ({ input, errors: { NOT_FOUND, INTERNAL_SERVER_ERROR }, context }) => {
    const userDocument = await UserCollection.findOne({ email: context.user.email });
    if (!userDocument) throw NOT_FOUND({ message: `User not found with email: ${context.user.email}` });

    const id = uuidv4();

    try {
      await PostCollection.insertOne({
        id,
        ...input,
      });
    } catch (error) {
      throw INTERNAL_SERVER_ERROR({
        message: `DB failed to create post with id ${id}. ${error}`,
      });
    }

    return { id };
  }),

  deletePost: protectedProcedure.posts.deletePost.handler(async ({ input, errors: { NOT_FOUND, INTERNAL_SERVER_ERROR }, context }) => {
    const post = await PostCollection.findOne({ id: input.id });
    if (!post) throw NOT_FOUND({ message: `Post not found from ${context.user.email} with id ${input.id}` });

    if (post.createdBy !== context.user.email) throw NOT_FOUND({ message: `Post not found from ${context.user.email} with id ${input.id}` });

    try {
      await PostCollection.deleteOne({ id: input.id });
    } catch (error) {
      throw INTERNAL_SERVER_ERROR({
        message: `DB failed to delete post with id ${input.id}. ${error}`,
      });
    }

    return { success: true };
  }),

  getPosts: protectedProcedure.posts.getPosts.handler(({ input, errors: { NOT_FOUND, INTERNAL_SERVER_ERROR }, context }) => {
    logger.info(`Test route called: ${input} | ${context}`);
    return PostCollection.find({});
  }),

  getPost: protectedProcedure.posts.getPost.handler(async ({ input, errors: { NOT_FOUND, INTERNAL_SERVER_ERROR }, context }) => {
    const post = await PostCollection.findOne({ _id: input._id }).lean();
    if (!post) throw NOT_FOUND({ message: `Post not found with id ${input._id}` });

    return post;
  }),

  addMockPost: publicProcedure.posts.addMockPost.handler(async ({ input, errors, context }) => {
    const material = ["cotton", "silk", "wood"][Math.floor(Math.random() * 3)];
    const size = ["XXS", "XS", "S", "M", "L", "XL", "XXL"][Math.floor(Math.random() * 7)];

    try {
      const randomPostData = {
        _id: uuidv4(),
        createdBy: `random${Math.floor(Math.random() * 1000)}@example.com`,
        description: `Random Number: ${Math.random()}`,
        colour: ["red"],
        size,
        material: [material],
        images: ["https://picsum.photos/200/300"],
        hashtags: [],
        qaEntries: [],
      };
      await PostCollection.insertOne(randomPostData);
    } catch (error) {
      logger.error(`Failed to add mock post: ${error}`);
    }

    return true;
  }),
};
