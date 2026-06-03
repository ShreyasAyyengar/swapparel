// any additional fields must be described in additionalFields
// https://www.better-auth.com/docs/concepts/database#extending-core-schema
import { z } from "zod";

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  image: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
