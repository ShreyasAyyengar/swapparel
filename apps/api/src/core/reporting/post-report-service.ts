import { postReportSchema } from "@swapparel/contracts";
import { toMongooseSchema } from "mongoose-zod";
import type { z } from "zod";
import { databaseConnection } from "../../database/database";

// Mongoose Schema Definitions for MongoDB
const PostReportSchema = postReportSchema;

// Use toMongooseSchema to convert Zod schema to Mongoose schema
const PostReportSchemaMongoose = toMongooseSchema(
  PostReportSchema.mongoose({
    schemaOptions: {
      collection: "post-reports",
      versionKey: false,
    },
  })
);

// Infer the bland TypeScript type from Zod
export interface IPostReportSchemaMongoose extends z.infer<typeof PostReportSchema> {}

// Type the model with IPostReportSchema for TypeScript autocomplete
export const PostReportService = databaseConnection.model<IPostReportSchemaMongoose>("post-reports", PostReportSchemaMongoose, "post-reports");
