import { oc } from "@orpc/contract";
import { z } from "zod";

// any additional fields must be described in additionalFields
// https://www.better-auth.com/docs/concepts/database#extending-core-schema
export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  image: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const userContract = {
  getUser: oc
    .route({
      method: "GET",
    })
    .input(
      z.object({
        email: userSchema.shape.email,
      })
    )
    .output(userSchema)
    .errors({
      NOT_FOUND: {
        data: z.object({
          message: z.string(),
        }),
      },
      INTERNAL_SERVER_ERROR: {
        data: z.object({
          message: z.string(),
          issues: z.array(z.any()).optional(),
        }),
      },
    }),
};
