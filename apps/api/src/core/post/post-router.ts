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

  deletePost: protectedProcedure.posts.deletePost.handler(async ({ input, errors, context }) => {
    const post = await PostCollection.findOne({ id: input.id });

    if (!post) {
      throw errors.NOT_FOUND();
    }

    PostCollection.deleteOne({ id: input.id });

    return { success: true };
  }),

  test: protectedProcedure.posts.test.handler(async () => {
    const mockPost = {
      // _id: "123",
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
