import { oc } from "@orpc/contract";
import { z } from "zod";
import { postSchema, uploadPhotoInput, userFormPostSchema } from "./post-schemas";

export const postContract = {
  createPost: oc
    .route({
      method: "POST",
    })
    // id is only for frontend state management. we do not need it in the payload
    .input(userFormPostSchema.omit({ images: true }).extend({ images: z.array(uploadPhotoInput.omit({ id: true })).min(1) }))
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

  deletePost: oc
    .route({
      method: "DELETE",
    })
    .input(
      z.object({
        id: z.uuidv7(),
      })
    )
    .output(z.object({ success: z.boolean(), error: z.string().optional() }))
    .errors({
      NOT_FOUND: {},
      INTERNAL_SERVER_ERROR: {},
    }),

  getPosts: oc
    .route({
      method: "GET",
    })
    .input(postSchema.pick({ createdBy: true }))
    .output(z.array(postSchema))
    .errors({
      NOT_FOUND: {},
      INTERNAL_SERVER_ERROR: {},
    }),

  getPost: oc
    .route({
      method: "GET",
    })
    .input(postSchema.pick({ _id: true }))
    .output(postSchema)
    .errors({
      NOT_FOUND: {},
      INTERNAL_SERVER_ERROR: {},
    }),

  addMockPost: oc
    .route({
      method: "GET",
    })
    .output(z.boolean()),
};
