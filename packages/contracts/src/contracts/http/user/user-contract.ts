import { oc } from "@orpc/contract";
import { z } from "zod";
import { userSchema } from "./user-schemas";

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
