import { toMongooseSchema } from "mongoose-zod";
import { databaseConnection } from "../../database/database.ts";

const PostSchema = toMongooseSchema(
  createPostInput.mongoose({
    schemaOptions: {
      collection: "posts",
    },
  })
);

export const PostCollection = databaseConnection.model("posts", PostSchema, "posts");
