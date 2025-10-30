import { Schema } from "mongoose";
import { databaseConnection } from "../../database/database.ts";
import { standardToJSON } from "../../database/mongoose-transforms.ts";

// export const user = z.object({
//   // NOTE: this schema must be aligned with any additional fields for Better-Auth. auth-server.ts
//
//   // Better-Auth schema
//   id: zId(),
//   name: z.string(),
//   email: z.string().email(),
//   emailVerified: z.boolean(), // Sign-in through Google Auth guarantees email verification
//   image: z.string().url(),
//   createdAt: z.date(),
//   updatedAt: z.date(),
//
//   // swapparel fields
//   displayName: z.string(),
//   restricted: z.boolean(),
// });

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
