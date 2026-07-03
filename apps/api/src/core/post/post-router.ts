import { COLOURS, GARMENT_TYPES, MATERIALS, postSchema, SIZES } from "@swapparel/contracts";
import { fileTypeFromBuffer } from "file-type";
import { v7 as uuidv7 } from "uuid";
import { protectedProcedure, publicProcedure } from "../../libs/orpc-procedures";
import { UserService } from "../users/user-service";
import { convertToJpeg, getBlockingLabel, hydrateR2Keys, moderateImage, uploadToR2 } from "./image-processing";
import { PostService } from "./post-service";

export const postRouter = {
  createPost: protectedProcedure.posts.createPost.handler(
    async ({ input, errors: { NOT_FOUND, BAD_REQUEST, UNPROCESSABLE_CONTENT, INTERNAL_SERVER_ERROR }, context }) => {
      const userDocument = await UserService.findOne({ email: context.user.email });

      if (!userDocument) {
        throw NOT_FOUND({
          data: { message: `User not found with email: ${context.user.email}` },
        });
      }

      // convert images to jpeg if necessary
      const fileBuffers: Buffer[] = [];
      for (const image of input.images) {
        const fileBuffer = Buffer.from(await image.arrayBuffer());
        const uploadMimeType = (await fileTypeFromBuffer(fileBuffer))?.mime;

        if (uploadMimeType === "image/jpeg" || uploadMimeType === "image/png") fileBuffers.push(fileBuffer);
        else fileBuffers.push(await convertToJpeg(fileBuffer));
      }

      // moderate images
      const imageKeys: string[] = [];
      for (const fileBuffer of fileBuffers) {
        const moderationLabels = await moderateImage(fileBuffer);
        const blockingLabel = getBlockingLabel(moderationLabels);
        if (blockingLabel) {
          throw UNPROCESSABLE_CONTENT({ data: { message: `Image blocked by ${blockingLabel.name}` } });
        }
      }

      const id = uuidv7();
      for (let i = 0; i < fileBuffers.length; i++) {
        // biome-ignore lint/style/noNonNullAssertion: flow control
        imageKeys.push(await uploadToR2(id, fileBuffers[i]!, i));
      }

      const postData = {
        _id: id,
        createdBy: context.user.email,
        images: imageKeys,
        ...input.postData,
      };

      const tryParse = postSchema.safeParse(postData);

      if (!tryParse.success) {
        throw BAD_REQUEST({
          data: {
            issues: tryParse.error.issues,
            message: "Invalid Input",
          },
        });
      }

      try {
        await PostService.insertOne(postData);
      } catch (error) {
        throw INTERNAL_SERVER_ERROR({
          data: {
            message: `Failed to insert document by _id: ${id}. ${error}`,
          },
        });
      }

      return { id };
    }
  ),

  deletePost: protectedProcedure.posts.deletePost.handler(async ({ input, errors: { NOT_FOUND, INTERNAL_SERVER_ERROR }, context }) => {
    const post = await PostService.findOne({ _id: input.id });
    if (!post) throw NOT_FOUND({ message: `Post not found from ${context.user.email} with id ${input.id}` });

    if (post.createdBy !== context.user.email) throw NOT_FOUND({ message: `Post not found from ${context.user.email} with id ${input.id}` });

    try {
      const t = await PostService.deleteOne({ _id: input.id });
      if (t.deletedCount === 1) return { success: true };
      return { success: false };
    } catch (error) {
      throw INTERNAL_SERVER_ERROR({
        message: `DB failed to delete post with id ${input.id}. ${error}`,
      });
    }
  }),

  getPosts: publicProcedure.posts.getPosts.handler(async ({ input, errors: { NOT_FOUND, INTERNAL_SERVER_ERROR }, context }) => {
    const posts = await PostService.find({ createdBy: input.createdBy });
    await Promise.all(
      posts.map(async (post) => {
        post.images = await hydrateR2Keys(post.images);
      })
    );
    return posts;
  }),

  getPost: publicProcedure.posts.getPost.handler(async ({ input, errors: { NOT_FOUND, INTERNAL_SERVER_ERROR }, context }) => {
    const post = await PostService.findOne({ _id: input._id }).lean();
    if (!post) throw NOT_FOUND({ message: `Post not found with id ${input._id}` });

    // hydrate images
    post.images = await hydrateR2Keys(post.images);

    return post;
  }),

  addMockPost: publicProcedure.posts.addMockPost.handler(async ({ input, errors, context }) => {
    const documents = [];

    const imageWidthHeight = [
      "50/50",
      "50/100",
      "50/200",
      "50/300",
      "50/400",
      "50/500",
      "100/100",
      "100/200",
      "100/300",
      "100/400",
      "100/500",
      "200/200",
      "200/300",
      "200/400",
      "200/500",
      "300/300",
      "300/400",
      "300/500",
      "400/400",
      "400/500",
      "500/500",
      "400/200",
      "500/200",
      "400/100",
      "500/100",
    ];

    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    const randomFrom = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]!;

    const makePicsumUrl = () => {
      const [w, h] = randomFrom(imageWidthHeight).split("/");
      // `seed` makes it stable per image (so refreshes don’t constantly change)
      const seed = uuidv7();
      return `https://picsum.photos/seed/${seed}/${w}/${h}`;
    };

    for (let i = 0; i < 100; i++) {
      const chosenMaterials = Array.from(
        new Set(Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map(() => MATERIALS[Math.floor(Math.random() * MATERIALS.length)]))
      );
      const chosenColours = Array.from(
        new Set(Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map(() => COLOURS[Math.floor(Math.random() * COLOURS.length)]))
      );
      const garmentType = GARMENT_TYPES[Math.floor(Math.random() * GARMENT_TYPES.length)];
      const size = SIZES[Math.floor(Math.random() * SIZES.length)];
      const containPrice = Math.random() > 0.5;
      const price = containPrice ? Math.floor(Math.random() * 100) + 1 : undefined;

      const randomPostData = {
        _id: uuidv7(),
        title: `Post ${i + 1}`,
        createdBy: `random${Math.floor(Math.random() * 1000)}@example.com`,
        description: `Random Number: ${Math.random()}`,
        garmentType,
        colour: chosenColours,
        price,
        size,
        material: chosenMaterials,
        images: Array.from({ length: 4 }).map(() => makePicsumUrl()),
        hashtags: [],
        comments: [
          {
            rootComment: { comment: "Why do some birds migrate thousands of miles every year?", author: "random@example.com" },
            childReplies: [
              {
                comment:
                  "Many birds migrate long distances to reach environments with better food availability and safer breeding conditions, following seasonal patterns that help them survive.",
                author: "random@example.com",
              },
              { comment: "vro what r u talmbt?", author: "random@example.com" },
            ],
          },

          {
            rootComment: { comment: "What is the fastest land animal?", author: "random@example.com" },
            childReplies: [
              {
                comment: "Cheetahs can reach speeds of up to 70 mph (113 km/h) in short bursts.",
                author: "random@example.com",
              },
            ],
          },

          {
            rootComment: { comment: "What is the largest animal?", author: "random@example.com" },
            childReplies: [
              {
                comment: "Blue whales are the largest animals on Earth, reaching lengths of up to 100 feet (30 meters).",
                author: "random@example.com",
              },
            ],
          },
        ],
      };
      documents.push(randomPostData);
    }

    await PostService.insertMany(documents);

    return true;
  }),
};
