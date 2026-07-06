import { oc } from "@orpc/contract";
import { z } from "zod";
import { ratingSchema } from "./rating-schemas";

export const ratingContract = {
  submitRating: oc
    .route({
      method: "POST",
    })
    .input(
      ratingSchema.omit({
        _id: true,
        raterEmail: true,
        createdAt: true,
      })
    )
    .output(ratingSchema)
    .errors({
      INTERNAL_SERVER_ERROR: {
        data: z.object({
          message: z.string(),
        }),
      },
      NOT_FOUND: {
        data: z.object({
          message: z.string(),
        }),
      },
      BAD_REQUEST: {
        data: z.object({
          message: z.string(),
        }),
      },
      UNAUTHORIZED: {
        data: z.object({
          message: z.string(),
        }),
      },
      CONFLICT: {
        data: z.object({
          message: z.string(),
        }),
      },
    }),

  getMyRatingForTransaction: oc
    .route({
      method: "GET",
    })
    .input(ratingSchema.pick({ transactionId: true }))
    .output(ratingSchema.nullable())
    .errors({
      INTERNAL_SERVER_ERROR: {
        data: z.object({
          message: z.string(),
        }),
      },
    }),

  getRatingsForUser: oc
    .route({
      method: "GET",
    })
    .input(ratingSchema.pick({ ratedUserEmail: true }))
    .output(
      z.object({
        ratings: z.array(ratingSchema),
        averageRating: z.number().nullable(),
        totalRatings: z.number(),
      })
    )
    .errors({
      INTERNAL_SERVER_ERROR: {
        data: z.object({
          message: z.string(),
        }),
      },
      BAD_REQUEST: {
        data: z.object({
          issues: z.array(z.any()),
          message: z.string(),
        }),
      },
    }),

  deleteRating: oc
    .route({
      method: "DELETE",
    })
    .input(
      z.object({
        id: ratingSchema.shape._id,
      })
    )
    .output(z.object({ success: z.boolean() }))
    .errors({
      NOT_FOUND: {
        data: z.object({
          message: z.string(),
        }),
      },
      FORBIDDEN: {
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

  editRating: oc
    .route({
      method: "PATCH",
    })
    .input(
      z
        .object({
          _id: ratingSchema.shape._id,
          value: z.number().min(1).max(5).optional(),
          comment: z.string().max(500).optional().nullable(),
        })
        .refine(
          ({ value, comment }) => value !== undefined || comment !== undefined,
          { message: "At least one field must be provided." }
        )
    )
    .output(z.object({ success: z.boolean() }))
    .errors({
      NOT_FOUND: {
        data: z.object({
          message: z.string(),
        }),
      },
      FORBIDDEN: {
        data: z.object({
          message: z.string(),
        }),
      },
      BAD_REQUEST: {
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
