import { toMongooseSchema } from "mongoose-zod";
import { z } from "zod";
import { databaseConnection } from "../../database/database.ts";
import { internalPostSchema } from "@swapparel/contracts";

// Mongoose Schema Definitions for MongoDB
const PostSchemaMongooseZod = internalPostSchema
  // certain 'Zod Types' (z.url(), z.email(), z.uuid()) must be redefined as more primitive types to serialise with Mongoose
  .omit({ _id: true, createdBy: true, images: true })
  .extend({ _id: z.string(), createdBy: z.string(), images: z.array(z.string()) });

// Use toMongooseSchema to convert Zod schema to Mongoose schema
const PostSchemaMongoose = toMongooseSchema(
  PostSchemaMongooseZod.mongoose({
    schemaOptions: {
      collection: "posts",
      versionKey: false,
    },
  })
);

// Infer the bland TypeScript type from Zod
export interface IPostSchemaMongoose extends z.infer<typeof PostSchemaMongooseZod> {
}

// Type the model with IPostSchema for TypeScript autocomplete
export const PostCollection = databaseConnection.model<IPostSchemaMongoose>("posts", PostSchemaMongoose, "posts");
