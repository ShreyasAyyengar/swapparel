import { Schema } from "mongoose";
import { databaseConnection } from "../../database/database.ts";
import { standardToJSON } from "../../database/mongoose-transforms.ts";

export interface Post extends Document {
  // Better-Auth schema
  creatorEmail: string;
  description: string;
  colour: string;
  size: "XS" | "S" | "M" | "L" | "XL";
  material: string;
  images: string[]; // Cloudflare R2 Object URLs
  hashtags: string[];
  qaEntries?: QAPair[];
  createdAt: Date;
}

export type QAPair = {
  question: string;
  answer?: string;
  followUps?: QAPair[];
};

const PostSchema = new Schema<Post>({}, { collection: "posts", toJSON: standardToJSON });

export const PostCollection = databaseConnection.model("post", PostSchema, "posts");
