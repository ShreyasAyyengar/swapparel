import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { COLOURS, GARMENT_TYPES, internalPostSchema, MATERIALS, SIZES } from "@swapparel/contracts";
import heicConvert from "heic-convert";
import { v7 as uuidv7 } from "uuid";
import { env } from "../../env";
import { logger } from "../../libs/logger";
import { protectedProcedure, publicProcedure } from "../../libs/orpc-procedures";
import { UserCollection } from "../users/user-schema";
import { PostCollection } from "./post-schema";

const S3 = new S3Client({
  region: "auto",
  endpoint: `https://${env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com/`,
  credentials: {
    accessKeyId: env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
});

export const uploadToR2 = async (postId: string, file: File, mimeType: string, index: number) => {
  let finalMimeType = mimeType;
  const key = `${postId}/${index}`;
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  let body = fileBuffer;

  if (mimeType === "image/heic" || mimeType === "image/heif") {
    body = await heicConvert({
      buffer: fileBuffer,
      format: "JPEG",
      quality: 1,
    });

    finalMimeType = "image/jpeg";
  }

  const packageCommand = new PutObjectCommand({
    Bucket: env.CLOUDFLARE_R2_BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: finalMimeType,
  });
  await S3.send(packageCommand);

  return `https://cdn.swapparel.app/${postId}/${index}`;
};

export const postRouter = {
  createPost: protectedProcedure.posts.createPost.handler(
    async ({ input, errors: { NOT_FOUND, BAD_REQUEST, INTERNAL_SERVER_ERROR }, context }) => {
      const userDocument = await UserCollection.findOne({ email: context.user.email });

      if (!userDocument) {
        throw NOT_FOUND({
          data: { message: `User not found with email: ${context.user.email}` },
        });
      }

      const id = uuidv7();
      const imageURLs = await Promise.all(input.images.map((image, index) => uploadToR2(id, image.file, image.mimeType, index)));

      const postData = {
        _id: id,
        createdBy: context.user.email,
        images: imageURLs,
        ...input.postData,
      };

      const tryParse = internalPostSchema.safeParse(postData);

      if (!tryParse.success) {
        throw BAD_REQUEST({
          data: {
            issues: tryParse.error.issues,
            message: "Invalid Input",
          },
        });
      }

      try {
        await PostCollection.insertOne(postData);
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

  getPost: publicProcedure.posts.getPost.handler(async ({ input, errors: { NOT_FOUND, INTERNAL_SERVER_ERROR }, context }) => {
    const post = await PostCollection.findOne({ _id: input._id }).lean();
    if (!post) throw NOT_FOUND({ message: `Post not found with id ${input._id}` });

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

      const randomPostData = {
        _id: uuidv7(),
        title: `Post ${i + 1}`,
        createdBy: `random${Math.floor(Math.random() * 1000)}@example.com`,
        description: `Random Number: ${Math.random()}`,
        garmentType,
        colour: chosenColours,
        size,
        material: chosenMaterials,
        images: Array.from({ length: 4 }).map(() => makePicsumUrl()),
        hashtags: [],
        qaEntries: [
          {
            question: "Why do some birds migrate thousands of miles every year?",
            answer:
              "Many birds migrate long distances to reach environments with better food availability and safer breeding conditions, following seasonal patterns that help them survive.",
            followUps: [
              {
                question: "How do they know which direction to fly?",
                answer:
                  " Birds use a mix of cues—Earth’s magnetic field, the position of the sun and stars, and even familiar landmarks—to navigate incredibly long routes with surprising accuracy.",
              },
            ],
          },
        ],
      };
      documents.push(randomPostData);
    }

    await PostCollection.insertMany(documents);

    return true;
  }),
};
