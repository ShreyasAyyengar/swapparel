import { commentSchema } from "@swapparel/contracts";
import { v7 as uuidv7 } from "uuid";
import type { z } from "zod";
import { protectedProcedure, publicProcedure } from "../../libs/orpc-procedures";
import { PostService } from "../post/post-service";
import { CommentService } from "./comment-service";

export const commentRouter = {
  getComments: publicProcedure.comments.getComments.handler(async ({ input, errors: { INTERNAL_SERVER_ERROR } }) => {
    const query: Record<string, unknown> = { parentPostId: input.postId };

    if (input.cursor) {
      query._id = { $lt: input.cursor };
    }

    const commentDocs = await CommentService.find(query)
      .sort({ createdAt: -1 })
      .limit(input.limit + 1)
      .lean();

    if (!commentDocs) {
      throw INTERNAL_SERVER_ERROR({
        data: { message: `Failed to fetch comments for post ${input.postId}` },
      });
    }

    const hasMore = commentDocs.length > input.limit;
    const comments = hasMore ? commentDocs.slice(0, input.limit) : commentDocs;

    return {
      comments,
      nextCursor: hasMore ? comments.at(-1)?._id : undefined,
    };
  }),

  addComment: protectedProcedure.comments.addComment.handler(async ({ input, context, errors: { INTERNAL_SERVER_ERROR, NOT_FOUND } }) => {
    const postDocument = await PostService.findById(input.parentPostId);
    if (!postDocument) {
      throw NOT_FOUND({
        data: { message: `Post with id ${input.parentPostId} not found.` },
      });
    }

    const id = uuidv7();
    const commentDoc: z.input<typeof commentSchema> = {
      _id: id,
      parentPostId: input.parentPostId,
      authorId: context.user.id,
      authorSnapshot: {
        name: context.user.name,
        image: context.user.image ?? "",
      },
      parentCommentId: input.parentCommentId,
      content: input.content,
      createdAt: new Date(),
    };

    const tryParse = commentSchema.safeParse(commentDoc);

    if (!tryParse.success) {
      throw INTERNAL_SERVER_ERROR({
        data: {
          message: `Failed to confirm ${tryParse.error.issues.map((issue) => issue.message).join(", ")}`,
        },
      });
    }

    try {
      await CommentService.insertOne(commentDoc);
    } catch (error) {
      throw INTERNAL_SERVER_ERROR({
        data: {
          message: `DB failed to insert comment with id ${id}: ${error}`,
        },
      });
    }

    return { id };
  }),

  deleteComment: protectedProcedure.comments.deleteComment.handler(
    async (input: commentId, context, errors: INTERNAL_SERVER_ERROR, NOT_FOUND, FORBIDDEN) => {
      // TODO
      // const comment = await CommentService.findById(commentId).select({ _id: 1 });
      // if (!comment) {
      //   throw NOT_FOUND({
      //     data: {
      //       message: `Comment with id ${commentId} not found.`,
      //     },
      //   });
      // }
      //
      // const post = await PostService.findById(comment.parentPostId).select({ _id: 1 });
      // if (!post) {
      //   throw NOT_FOUND({
      //     data: {
      //       message: `Post with id ${comment.parentPostId} not found.`,
      //     },
      //   });
      // }
      //
      // if (comment.authorId !== context.user.id || post.authorId !== context.user.id) {
      //   throw FORBIDDEN({
      //     data: {
      //       message: "Forbidden.",
      //     },
      //   });
      // }
      //
      // try {
      //   const deleteResult = await CommentService.deleteOne({ _id: commentId });
      //   return { success: deleteResult.deletedCount === 1 };
      // } catch (error) {
      //   throw INTERNAL_SERVER_ERROR({
      //     data: {
      //       message: `DB failed to delete comment with id ${commentId}: ${error}`,
      //     },
      //   });
      // }
    }
  ),
};
