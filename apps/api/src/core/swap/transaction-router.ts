import { transactionSchema } from "@swapparel/contracts";
import { v7 as uuidv7 } from "uuid";
import type { z } from "zod";
import { protectedProcedure } from "../../libs/orpc-procedures";
import { MessageService } from "../messaging/messaging-service";
import { PostService } from "../post/post-service";
import { UserService } from "../users/user-service";
import { TransactionService } from "./transaction-service";

export const transactionRouter = {
  createTransaction: protectedProcedure.transaction.createTransaction.handler(
    async ({ input, errors: { NOT_FOUND, UNPROCESSABLE_CONTENT, INTERNAL_SERVER_ERROR }, context }) => {
      const buyer = context.user;

      const [sellerPost, buyerPosts] = await Promise.all([
        PostService.findById(input.sellerPostId).select("_id title createdBy").lean(),
        PostService.find({ _id: { $in: input.buyerPostIds }, createdBy: buyer.email })
          .select("_id title")
          .lean(),
      ]);

      if (!sellerPost) {
        throw NOT_FOUND({
          data: { message: `Seller post ${input.sellerPostId} not found.` },
        });
      }
      if (buyerPosts.length !== input.buyerPostIds.length) {
        throw UNPROCESSABLE_CONTENT({
          data: { message: "One or more buyer post IDs do not exist." },
        });
      }
      if (buyerPosts.some((p) => p.createdBy !== buyer.email)) {
        throw UNPROCESSABLE_CONTENT({
          data: { message: "Buyer post must belong to the authenticated user." },
        });
      }

      if (sellerPost.createdBy === buyer.email) {
        throw UNPROCESSABLE_CONTENT({
          data: { message: "User cannot trade with themselves." },
        });
      }

      const sellerUser = await UserService.findOne({ email: sellerPost.createdBy }).lean();
      if (!sellerUser) {
        throw NOT_FOUND({
          data: { message: "Seller user not found." },
        });
      }

      if (buyerPosts.some((p) => p.createdBy !== buyer.email)) {
        throw UNPROCESSABLE_CONTENT({
          data: { message: "Buyer post must belong to the authenticated user." },
        });
      }

      const _id = uuidv7();
      const now = new Date();

      const transactionData: z.infer<typeof transactionSchema> = {
        _id,

        seller: {
          userId: sellerUser._id,
          emailSnapshot: sellerUser.email,
          avatarUrlSnapshot: sellerUser.image || undefined,
        },
        sellerPosts: [
          {
            postId: sellerPost._id,
            titleSnapshot: sellerPost.title,
          },
        ], // initially buyer chooses one post to swap with;

        buyer: {
          userId: buyer.id,
          emailSnapshot: buyer.email,
          avatarUrlSnapshot: buyer.image || undefined,
        },
        buyerPosts: buyerPosts.map((p) => ({
          postId: p._id,
          titleSnapshot: p.title,
        })),

        scheduledFor: input.scheduledFor,
        status: "ongoing",
        createdAt: now,
        updatedAt: now,
      };

      const tryParse = transactionSchema.safeParse(transactionData);
      if (!tryParse.success) {
        throw UNPROCESSABLE_CONTENT({
          data: {
            message: tryParse.error.message,
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

      if (input.initialMessage) {
        await MessageService.insertOne({
          _id: uuidv7(),
          transactionId: _id,
          authorId: buyer.id,
          createdAt: now,
          content: [input.initialMessage],
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
      transactions: [...initiatedTransactions, ...receivedTransactions],
    };
  }),

  getTransactionsByInterlocutor: protectedProcedure.transaction.getTransactionsByInterlocutor.handler(({ input, context }) => {
    const userId = context.user.id;

    return TransactionService.find({
      $and: [
        {
          $or: [
            { "buyer.userId": userId },
            { "seller.userId": userId },
          ],
        },
        {
          $or: [
            { "buyer.userId": input.interlocutorId },
            { "seller.userId": input.interlocutorId },
          ],
        },
      ],
    }).lean();
  }),

  getInterlocutors: protectedProcedure.transaction.getInterlocutors.handler(({ context }) => {
    const userId = context.user.id;

    return TransactionService.aggregate([
      {
        $match: {
          $or: [{ "buyer.userId": userId }, { "seller.userId": userId }],
        },
      },
      {
        $project: {
          interlocutorId: {
            $cond: [{ $eq: ["$buyer.userId", userId] }, "$seller.userId", "$buyer.userId"],
          },
        },
      },
      {
        $group: {
          _id: "$interlocutorId",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          interlocutorId: "$_id",
          count: 1,
        },
      },
    ]);
  }),

  updateTransaction: protectedProcedure.transaction.updateTransaction.handler(
    async ({ input, context, errors: { NOT_FOUND, INTERNAL_SERVER_ERROR, FORBIDDEN, UNPROCESSABLE_CONTENT } }) => {
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
        throw UNPROCESSABLE_CONTENT({
          data: { message: `A ${transaction.status} transaction cannot be updated.` },
        });
      }

      // status checks
      if (input.status !== undefined && input.status !== transaction.status) {
        const allowedTransitions = {
          ongoing: ["completed", "cancelled"],
        } as const;

        if (!(allowedTransitions[transaction.status] as readonly string[]).includes(input.status)) {
          throw UNPROCESSABLE_CONTENT({
            data: { message: `Cannot change transaction status from ${transaction.status} to ${input.status}.` },
          });
        }
      }

      // postIds check
      if (input.updatedBuyerPosts !== undefined) {
        const buyerPostIdsSet = new Set(input.updatedBuyerPosts.map((item) => item.postId));
        if (buyerPostIdsSet.size !== input.updatedBuyerPosts.length) {
          throw UNPROCESSABLE_CONTENT({
            data: { message: "Duplicate post IDs provided for buyer." },
          });
        }

        // Ensure all post IDs exist in the database and belong to the buyer
        const buyerPostIds = input.updatedBuyerPosts.map((item) => item.postId);
        // TODO: this is a bit scuffed because emails change. ideally only compare identities using userIds.
        const buyerPostsExist = await PostService.find({ _id: { $in: buyerPostIds }, createdBy: transaction.buyer.emailSnapshot })
          .select("_id")
          .lean();
        if (buyerPostsExist.length !== buyerPostIds.length) {
          throw UNPROCESSABLE_CONTENT({
            data: { message: "One or more buyer post IDs do not exist." },
          });
        }
      }
      if (input.updatedSellerPosts !== undefined) {
        const sellerPostIdsSet = new Set(input.updatedSellerPosts.map((item) => item.postId));
        if (sellerPostIdsSet.size !== input.updatedSellerPosts.length) {
          throw UNPROCESSABLE_CONTENT({
            data: { message: "Duplicate post IDs provided for seller." },
          });
        }

        const sellerPostIds = input.updatedSellerPosts.map((item) => item.postId);
        const sellerPostsExist = await PostService.find({ _id: { $in: sellerPostIds }, createdBy: transaction.seller.emailSnapshot })
          .select("_id")
          .lean();
        if (sellerPostsExist.length !== sellerPostIds.length) {
          throw UNPROCESSABLE_CONTENT({
            data: { message: "One or more seller post IDs do not exist." },
          });
        }
      }

      const updateData: Partial<z.infer<typeof transactionSchema>> = {
        updatedAt: new Date(),
      };
      if (input.scheduledFor !== undefined) updateData.scheduledFor = input.scheduledFor;
      if (input.location) updateData.location = input.location;
      if (input.status !== undefined) updateData.status = input.status;
      if (input.updatedBuyerPosts !== undefined) updateData.buyerPosts = input.updatedBuyerPosts;
      if (input.updatedSellerPosts !== undefined) updateData.sellerPosts = input.updatedSellerPosts;

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

  getMessageHistory: protectedProcedure.transaction.getMessageHistory.handler(
    async ({ input, errors: { NOT_FOUND, INTERNAL_SERVER_ERROR } }) => {
      const transaction = await TransactionService.findById(input.transactionId);
      if (!transaction) {
        throw NOT_FOUND({
          data: { message: `Transaction ${input.transactionId} not found.` },
        });
      }
      return { messages: await MessageService.find({ transactionId: input.transactionId }).sort({ createdAt: 1 }).lean() };
    }
  ),
};
