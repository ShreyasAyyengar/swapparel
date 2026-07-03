import { oc } from "@orpc/contract";
import { z } from "zod";
import { userReportSchema } from "./report-schemas";

export const createReport = {
  createReport: oc
    .route({
      method: "POST",
    })
    .input(
      userReportSchema.pick({
        reportedUserId: true,
        reason: true,
        description: true,
      })
    )
    .output(
      z.object({
        id: z.uuidv7(),
      })
    )
    .errors({
      NOT_FOUND: {
        data: z.object({
          message: z.string(),
        }),
      },
      BAD_REQUEST: {
        data: z.object({
          message: z.string(),
          issues: z.array(z.any()).optional(),
        }),
      },
      INTERNAL_SERVER_ERROR: {
        data: z.object({
          message: z.string(),
        }),
      },
    }),
};
