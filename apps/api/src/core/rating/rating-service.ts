import { ratingSchema } from "@swapparel/contracts";
import { toMongooseSchema } from "mongoose-zod";
import { databaseConnection } from "../../database/database";

// Mongoose Schema Definitions for MongoDB
const RatingSchema = ratingSchema;

// Use toMongooseSchema to convert Zod schema to Mongoose schema
const RatingSchemaMongoose = toMongooseSchema(
  RatingSchema.mongoose({
    schemaOptions: {
      collection: "ratings",
      versionKey: false,
    },
  })
);

// Index for per-transaction duplicate prevention
RatingSchemaMongoose.index({ raterEmail: 1, transactionId: 1 }, { unique: true });

// Infer the bland TypeScript type from Zod
export interface IRatingSchemaMongoose extends z.infer<typeof RatingSchema> {}

// Type the model with IRatingSchema for TypeScript autocomplete
export const RatingService = databaseConnection.model<IRatingSchemaMongoose>("ratings", RatingSchemaMongoose, "ratings");
