import { internalPostSchema } from "@swapparel/contracts";
import { toMongooseSchema } from "mongoose-zod";
import type { z } from "zod";
import { databaseConnection } from "../../database/database";

// Mongoose Schema Definitions for MongoDB
const PostSchemaMongooseZod = internalPostSchema;

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
export interface IPostSchemaMongoose extends z.infer<typeof PostSchemaMongooseZod> {}

// Type the model with IPostSchema for TypeScript autocomplete
export const PostCollection = databaseConnection.model<IPostSchemaMongoose>("posts", PostSchemaMongoose, "posts");
