import { createPostInput } from "@swapparel/contracts";
import { toMongooseSchema } from "mongoose-zod";
import { z } from "zod";
import { databaseConnection } from "../../database/database.ts";

const PostSchema = toMongooseSchema(
  createPostInput
    // certain 'Zod Types' (z.url, z.email) must be redefined as more primitive types to serialise with Mongoose
    .omit({ createdBy: true, images: true })
    .extend({ createdBy: z.string(), images: z.array(z.string()) })
    .mongoose({
      schemaOptions: {
        collection: "posts",
      },
    })
);

export const PostCollection = databaseConnection.model("posts", PostSchema, "posts");
