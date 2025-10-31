import { Schema } from "mongoose";
import { databaseConnection } from "../../database/database.ts";
import { standardToJSON } from "../../database/mongoose-transforms.ts";

export interface User extends Document {
  // Better-Auth schema
  name: string;
  email: string;
  emailVerified: boolean;
  image: string;
  createdAt: Date;
  updatedAt: Date;

  // swapparel fields
  displayName: string;
  restricted: boolean;
}

const UserSchema = new Schema<User>({}, { collection: "user", toJSON: standardToJSON });

export const UserCollection = databaseConnection.model("user", UserSchema, "user");
