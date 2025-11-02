import { logger } from "../../libs/logger.ts";
import { protectedProcedure } from "../../libs/orpc.ts";

export const postRouter = {
  createPost: protectedProcedure.posts.createPost.handler(({ input }) => {
    logger.info(`Received input: ${input.id}`);
    return input.id;
  }),
  test: protectedProcedure.posts.test.handler(() => "test"),
};
