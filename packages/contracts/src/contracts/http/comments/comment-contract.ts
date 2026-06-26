import { oc } from "@orpc/contract";
import { z } from "zod";
import { commentSchema } from "./comment-schemas";

const DEFAULT_PAGINATION_LIMIT = 15;
const MAX_PAGINATION_LIMIT = 25;

export const commentContract = {
  getComments: oc
    .route({
      method: "GET",
      description: "Get comments for a post",
    })
    .input(
      z.object({
        postId: commentSchema.shape.parentPostId,
        limit: z.coerce.number().min(1).max(MAX_PAGINATION_LIMIT).default(DEFAULT_PAGINATION_LIMIT),
        cursor: z.uuidv7().optional(),
      })
    )
    .output(
      z.object({
        comments: z.array(commentSchema),
        nextCursor: z.uuidv7().optional(),
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
      FORBIDDEN: {
        data: z.object({
          message: z.string(),
        }),
      },
    }),

  addComment: oc
    .route({
      method: "POST",
      description: "Add a comment",
    })
    .input(
      commentSchema.pick({
        parentPostId: true,
        content: true,
        parentCommentId: true,
      })
    )
    .output(
      z.object({
        id: commentSchema.shape._id,
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
        }),
      },
      INTERNAL_SERVER_ERROR: {
        data: z.object({
          message: z.string(),
        }),
      },
      FORBIDDEN: {
        data: z.object({
          message: z.string(),
        }),
      },
    }),
  deleteComment: oc
    .route({
      method: "DELETE",
      description: "Delete a comment",
    })
    .input(
      z.object({
        id: commentSchema.shape._id,
      })
    )
    .output(
      z.object({
        success: z.boolean(),
        error: z.string().optional(),
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
      FORBIDDEN: {
        data: z.object({
          message: z.string(),
        }),
      },
    }),
};
