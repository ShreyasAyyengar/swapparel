import { transactionSchema } from "@swapparel/contracts";
import { v7 as uuidv7 } from "uuid";
import type { z } from "zod";
import { protectedProcedure } from "../../libs/orpc-procedures";
import { PostService } from "../post/post-service";
import { UserService } from "../users/user-service";
import { TransactionService } from "./transaction-service";

export const transactionRouter = {
  // TODO redo to support array of seller posts
  createTransaction: protectedProcedure.transaction.createTransaction.handler(
    async ({ input, errors: { NOT_FOUND, BAD_REQUEST, INTERNAL_SERVER_ERROR }, context }) => {
      const buyer = context.user;
      const uniqueBuyerPostIds = [...new Set(input.buyerPostIds)];

      if (uniqueBuyerPostIds.length !== input.buyerPostIds.length) {
        throw BAD_REQUEST({
          data: { message: "Buyer post IDs must be unique." },
        });
      }

      const [sellerPost, buyerPosts] = await Promise.all([
        PostService.findById(input.sellerPostId).select("_id title createdBy").lean(),
        uniqueBuyerPostIds.length
          ? PostService.find({ _id: { $in: uniqueBuyerPostIds } })
              .select("_id title createdBy")
              .lean()
          : Promise.resolve([]),
      ]);

      if (!sellerPost) {
        throw NOT_FOUND({
          data: { message: `Seller post ${input.sellerPostId} not found.` },
        });
      }

      if (sellerPost.createdBy === buyer.email) {
        throw BAD_REQUEST({
          data: { message: "User cannot trade with themselves." },
        });
      }

      const sellerUser = await UserService.findOne({ email: sellerPost.createdBy }).lean();

      if (!sellerUser) {
        throw NOT_FOUND({
          data: { message: "Seller user not found." },
        });
      }

      if (buyerPosts.length !== uniqueBuyerPostIds.length) {
        throw NOT_FOUND({
          data: { message: "One or more buyer posts were not found." },
        });
      }

      if (buyerPosts.some((post) => post.createdBy !== buyer.email)) {
        throw BAD_REQUEST({
          data: { message: "Buyer posts must belong to the authenticated user." },
        });
      }

      const _id = uuidv7();
      const now = new Date();

      const transactionData: z.infer<typeof transactionSchema> = {
        _id,
        seller: {
          userId: sellerUser.id,
          emailSnapshot: sellerUser.email,
          avatarUrlSnapshot: sellerUser.image || undefined,
        },
        sellerPost: {
          postId: sellerPost._id,
          titleSnapshot: sellerPost.title,
        },
        buyer: {
          userId: buyer.id,
          emailSnapshot: buyer.email,
          avatarUrlSnapshot: buyer.image || undefined,
        },
        buyerPosts: buyerPosts.map((post) => ({
          postId: post._id,
          titleSnapshot: post.title,
        })),
        scheduledFor: input.scheduledFor,
        status: "pending",
        createdAt: now,
        updatedAt: now,
      };

      const tryParse = transactionSchema.safeParse(transactionData);

      if (!tryParse.success) {
        throw BAD_REQUEST({
          data: {
            issues: tryParse.error.issues,
            message: "Invalid transaction data",
          },
        });
      }

      try {
        await TransactionService.insertOne(tryParse.data);
      } catch (error) {
        throw INTERNAL_SERVER_ERROR({
          data: {
            message: `Failed to insert transaction ${_id}. ${error}`,
          },
        });
      }

      return { _id };
    }
  ),
  getTransactions: protectedProcedure.transaction.getTransactions.handler(async ({ context }) => {
    const userId = context.user.id;

    const [initiatedTransactions, receivedTransactions] = await Promise.all([
      TransactionService.find({ "buyer.userId": userId }).lean(),
      TransactionService.find({ "seller.userId": userId }).lean(),
    ]);

    return {
      initiatedTransactions,
      receivedTransactions,
    };
  }),

  updateTransaction: protectedProcedure.transaction.updateTransaction.handler(
    async ({ input, context, errors: { NOT_FOUND, FORBIDDEN, BAD_REQUEST, INTERNAL_SERVER_ERROR } }) => {
      const transaction = await TransactionService.findById(input._id);

      if (!transaction) {
        throw NOT_FOUND({
          data: { message: `Transaction ${input._id} not found.` },
        });
      }

      const isAuthorized = transaction.buyer.userId === context.user.id || transaction.seller.userId === context.user.id;

      if (!isAuthorized) {
        throw FORBIDDEN({
          data: { message: "User not authorized to update this transaction." },
        });
      }

      if (transaction.status === "completed" || transaction.status === "cancelled") {
        throw BAD_REQUEST({
          data: { message: `A ${transaction.status} transaction cannot be updated.` },
        });
      }

      if (input.status !== undefined && input.status !== transaction.status) {
        const allowedTransitions = {
          pending: ["accepted", "cancelled"],
          accepted: ["completed", "cancelled"],
        } as const;

        if (!(allowedTransitions[transaction.status] as readonly string[]).includes(input.status)) {
          throw BAD_REQUEST({
            data: { message: `Cannot change transaction status from ${transaction.status} to ${input.status}.` },
          });
        }

        if (input.status === "accepted" && transaction.seller.userId !== context.user.id) {
          throw FORBIDDEN({
            data: { message: "Only the seller can accept a transaction." },
          });
        }
      }

      const updateData: Partial<z.infer<typeof transactionSchema>> = {
        updatedAt: new Date(),
      };
      if (input.scheduledFor !== undefined) updateData.scheduledFor = input.scheduledFor;
      if (input.location) updateData.location = input.location;
      if (input.status !== undefined) updateData.status = input.status;

      try {
        const update = input.location === null ? { $set: updateData, $unset: { location: 1 } } : { $set: updateData };
        await TransactionService.updateOne({ _id: input._id }, update);
        return { success: true };
      } catch (error) {
        throw INTERNAL_SERVER_ERROR({
          data: {
            message: `Failed to update transaction ${input._id}. ${error}`,
          },
        });
      }
    }
  ),
};
