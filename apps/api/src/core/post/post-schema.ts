import { createPostInput } from "@swapparel/contracts";
import { toMongooseSchema } from "mongoose-zod";
import { z } from "zod";
import { databaseConnection } from "../../database/database.ts";

const PostSchemaZod = createPostInput
  // certain 'Zod Types' (z.url(), z.email()) must be redefined as more primitive types to serialise with Mongoose
  .omit({ createdBy: true, images: true })
  .extend({ createdBy: z.string(), images: z.array(z.string()) });

// Use toMongooseSchema to convert Zod schema to Mongoose schema
const PostSchema = toMongooseSchema(
  PostSchemaZod.mongoose({
    schemaOptions: {
      collection: "posts",
      versionKey: false,
    },
  })
);

// Infer the bland TypeScript type from Zod
export interface IPostSchema extends z.infer<typeof PostSchemaZod> {}

// Type the model with IPostSchema for TypeScript autocomplete
export const PostCollection = databaseConnection.model<IPostSchema>("posts", PostSchema, "posts");
