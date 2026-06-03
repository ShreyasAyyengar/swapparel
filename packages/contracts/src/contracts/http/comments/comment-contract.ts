import { oc } from "@orpc/contract";
import { z } from "zod";
import { commentSchema } from "./comment-schemas";

export const commentContract = {
  // perhaps send first 25 comments with getPost request.
  getComments: oc
    .route({
      method: "GET",
      description: "Get comments for a post",
    })
    .input(
      z.object({
        postId: commentSchema.shape.parentPostId,
      })
    )
    .output(z.array(commentSchema)),

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
