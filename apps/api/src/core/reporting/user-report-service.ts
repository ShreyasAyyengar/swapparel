import { userReportSchema } from "@swapparel/contracts";
import { toMongooseSchema } from "mongoose-zod";
import type { z } from "zod";
import { databaseConnection } from "../../database/database";

// Mongoose Schema Definitions for MongoDB
const UserReportSchema = userReportSchema;

// Use toMongooseSchema to convert Zod schema to Mongoose schema
const UserReportSchemaMongoose = toMongooseSchema(
  UserReportSchema.mongoose({
    schemaOptions: {
      collection: "user-reports",
      versionKey: false,
    },
  })
);

// Infer the bland TypeScript type from Zod
export interface IUserReportSchemaMongoose extends z.infer<typeof UserReportSchema> {}

// Type the model with IUserReportSchema for TypeScript autocomplete
export const UserReportService = databaseConnection.model<IUserReportSchemaMongoose>("user-reports", UserReportSchemaMongoose, "user-reports");
