import { v4 as uuidv4 } from "uuid";
import { logger } from "../../libs/logger.ts";
import { protectedProcedure, publicProcedure } from "../../libs/orpc.ts";
import { UserCollection } from "../users/user-schema.ts";
import { PostCollection } from "./post-schema.ts";

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

  logRandomData: publicProcedure.posts.logRandomData.handler(async ({ input, errors, context }) => {
    const materials = ["cotton", "silk", "wood"];
    const randomMaterial = materials[Math.floor(Math.random() * materials.length)];

    const randomPostData = {
      _id: uuidv4(),
      createdBy: `random${Math.floor(Math.random() * 1000)}@example.com`,
      description: `Random Number: ${Math.random()}`,
      colour: "some colour",
      size: "M",
      // Select random material from: cotton, silk, wood
      material: [randomMaterial],
      images: ["https://picsum.photos/200/300"],
      hashtags: [],
      qaEntries: [],
    };
    await PostCollection.insertOne(randomPostData);

    return true;
  }),
};
