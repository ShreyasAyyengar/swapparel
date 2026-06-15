import { protectedProcedure, publicProcedure } from "../../libs/orpc-procedures";

export const commentRouter = {
  getComments: publicProcedure.comments.getComments.handler(async ({ input, context }) => {
    // TODO
    // const commentDocs = await CommentService.find({ parentPostId: input.postId }).sort({ createdAt: -1 }).lean();
    //
    // if (!context?.user) return commentDocs.map((doc) => ({ ...doc, hasLiked: false }));
    //
    // return commentDocs.map((doc) => ({
    //   ...doc,
    // }));
  }),

  addComment: protectedProcedure.comments.addComment.handler(async ({ input, context, errors: { INTERNAL_SERVER_ERROR, NOT_FOUND } }) => {
    // TODO
    // const postDocument = await PostService.findById(input.parentPostId);
    // if (!postDocument) {
    //   throw NOT_FOUND({
    //     data: { message: `Post with id ${input.parentPostId} not found.` },
    //   });
    // }
    //
    // const id = uuidv7();
    // const commentDoc: z.input<typeof commentSchema> = {
    //   _id: id,
    //   parentPostId: input.parentPostId,
    //   authorId: context.user.id,
    //   authorSnapshot: {
    //     name: context.user.name,
    //     image: context.user.image ?? "",
    //   },
    //   parentCommentId: input.parentCommentId,
    //   content: input.content,
    //   createdAt: new Date(),
    // };
    //
    // const tryParse = commentSchema.safeParse(commentDoc);
    //
    // if (!tryParse.success) {
    //   throw INTERNAL_SERVER_ERROR({
    //     data: {
    //       message: `Failed to conform: ${tryParse.error.issues.map((issue) => issue.message).join(", ")}`,
    //     },
    //   });
    // }
    //
    // try {
    //   await CommentService.insertOne(commentDoc);
    // } catch (error) {
    //   throw INTERNAL_SERVER_ERROR({
    //     data: {
    //       message: `DB failed to insert comment with id ${id}: ${error}`,
    //     },
    //   });
    // }
    //
    // return { id };
  }),

  deleteComment: protectedProcedure.comments.deleteComment.handler(
    async ({ input: commentId, context, errors: { INTERNAL_SERVER_ERROR, NOT_FOUND, FORBIDDEN } }) => {
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
