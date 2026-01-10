import { type Document, Schema } from "mongoose";
import { databaseConnection } from "../../database/database";

// TODO : look into consolidating this
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

const UserSchema = new Schema<User>({}, { collection: "user" });

export const UserCollection = databaseConnection.model("user", UserSchema, "user");
