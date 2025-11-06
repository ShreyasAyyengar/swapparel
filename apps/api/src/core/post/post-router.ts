import { NotFoundError } from "elysia";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../../libs/logger.ts";
import { protectedProcedure } from "../../libs/orpc.ts";
import { UserCollection } from "../users/user-schema.ts";
import { PostCollection } from "./post-schema.ts";

export const postRouter = {
  createPost: protectedProcedure.posts.createPost.handler(async ({ input }) => {
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

  deletePost: protectedProcedure.posts.deletePost.handler(({ input }) => {
    logger.info("hello from deletePost!");

    return {
      success: true,
    };
  }),
};
