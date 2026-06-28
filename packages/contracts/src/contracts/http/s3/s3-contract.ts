import { oc } from "@orpc/contract";
import { z } from "zod";

export const s3Contract = {
  requestAttachmentUploadURL: oc
    .route({
      method: "POST",
    })
    .input(
      z.object({
        transactionId: z.uuidv7(),
        fileInfo: z.array(
          z.object({
            contentType: z.string(),
          })
        ),
      })
    )
    .output(
      z.object({
        presignedUrls: z
          .array(
            z.object({
              key: z.string(),
              uploadUrl: z.string(),
              headers: z.object({
                "Content-Type": z.string(),
                "If-None-Match": z.string(),
              }),
            })
          )
          .min(1)
          .max(5),
      })
    )
    .errors({
      NOT_FOUND: {
        data: z.object({
          message: z.string(),
        }),
      },
      INTERNAL_SERVER_ERROR: {
        data: z.object({
          message: z.string(),
        }),
      },
    }),
};
