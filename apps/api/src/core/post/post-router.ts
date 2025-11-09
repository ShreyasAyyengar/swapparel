import { NotFoundError } from "elysia";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../../libs/logger.ts";
import { protectedProcedure } from "../../libs/orpc.ts";
import { UserCollection } from "../users/user-schema.ts";
import { PostCollection } from "./post-schema.ts";

export const postRouter = {
  createPost: protectedProcedure.postContract.createPost.handler(async ({ input }) => {
    const userDocument = await UserCollection.findOne({ email: input.createdBy });
    if (!userDocument) {
      throw new NotFoundError(`User not found with email: ${input.createdBy}`);
    }
    const id = uuidv4();

    await PostCollection.insertOne({
      id,
      ...input,
    });

    return { id };
  }),

  deletePost: protectedProcedure.postContract.deletePost.handler(async ({ input, errors, context }) => {
    const post = await PostCollection.findOne({ id: input.id });

    if (!post) {
      throw errors.NOT_FOUND();
    }

    PostCollection.deleteOne({ id: input.id });

    return { success: true };
  }),

  getPosts: protectedProcedure.postContract.getPosts.handler(({ input, errors, context }) => {
    logger.info(`Test route called: ${input} | ${context} | ${errors}`);

    return PostCollection.find({});
  }),

  getPost: protectedProcedure.postContract.getPost.handler(async ({ input, errors: { NOT_FOUND }, context }) => {
    logger.info(`Test route called: ${input} | ${context} | ${NOT_FOUND}`);

    const post = await PostCollection.findOne({ _id: input.id }).lean();

    if (!post) {
      throw NOT_FOUND();
    }

    return post;
  }),
  test: protectedProcedure.postContract.test.handler(async ({ input, errors, context }) => {
    const mockPost = {
      _id: uuidv4(),
      createdBy: "test@example.com",
      description: "This is a test post",
      colour: "red",
      size: "M",
      material: ["canvas"],
      images: ["https://example.com/image.jpg"],
      hashtags: ["#test", "#post"],
      qaEntries: [{ question: "What is your name?", answer: "John" }],
    };

    await PostCollection.insertOne(mockPost);

    return true;
  }),
};
