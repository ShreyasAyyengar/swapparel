import { userSchema } from "@swapparel/contracts";
import { toMongooseSchema } from "mongoose-zod";
import type { z } from "zod";
import { databaseConnection } from "../../database/database";

const UserSchema = userSchema;

const UserSchemaMongoose = toMongooseSchema(
  UserSchema.mongoose({
    schemaOptions: {
      collection: "user",
      versionKey: false,
    },
  })
);

export interface IUserSchemaMongoose extends z.infer<typeof UserSchema> {}

export const UserService = databaseConnection.model<IUserSchemaMongoose>("user", UserSchemaMongoose, "user");
