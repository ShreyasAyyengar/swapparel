import { oc } from "@orpc/contract";
import { z } from "zod";

export const zodUserSchema = z.object({
  name: z.string(),
  email: z.email(),
  image: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  restricted: z.boolean(),
});

export const userContract = {
  getUser: oc
    .route({
      method: "GET",
    })
    .input(
      z.object({
        email: zodUserSchema.shape.email,
      })
    )
    .output(zodUserSchema)
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
