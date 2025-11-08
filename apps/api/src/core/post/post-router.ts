import { NotFoundError } from "elysia";
import { v4 as uuidv4 } from "uuid";
import { protectedProcedure } from "../../libs/orpc.ts";
import { UserCollection } from "../users/user-schema.ts";
import { PostCollection } from "./post-schema.ts";

export const postRouter = {
  createPost: protectedProcedure.posts.createPost.handler(async ({ input }) => {
    const userDocument = await UserCollection.findOne({ email: input.createdBy });
    if (!userDocument) {
      throw new NotFoundError(`User not found with email: ${input.createdBy}`);
    }

    userDocument.restricted = false;
    await userDocument.save();

    const id = uuidv4();

    await PostCollection.insertOne({
      id,
      ...input,
    });

    return { id };
  }),

  deletePost: protectedProcedure.posts.deletePost.handler(async ({ input, errors }) => {
    // desired post must be owned by the user
    const post = await PostCollection.findOne({ id: input.id });
    if (!post) {
      throw new NotFoundError(`Post not found with id: ${input.id}`);
    }
    await PostCollection.deleteOne({ id: input.id });

    return { success: true };
  }),
};
