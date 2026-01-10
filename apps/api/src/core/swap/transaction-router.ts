import { transactionSchema } from "@swapparel/contracts";
import { v7 as uuidv7 } from "uuid";
import type { z } from "zod";
import { protectedProcedure } from "../../libs/orpc-procedures";
import { PostCollection } from "../post/post-schema";
import { UserCollection } from "../users/user-schema";
import { TransactionCollection } from "./transaction-schema";

export const transactionRouter = {
  createTransaction: protectedProcedure.transaction.createTransaction.handler(
    async ({ input, errors: { NOT_FOUND, BAD_REQUEST, INTERNAL_SERVER_ERROR }, context }) => {
      const buyerEmail = context.user.email;

      // Fetch all data upfront in parallel
      const [sellerPost, buyerUser, buyerPosts] = await Promise.all([
        PostCollection.findById(input.sellerPost.id).select("_id title createdBy").lean(),
        UserCollection.findOne({ email: buyerEmail }).lean(),
        input.buyerPosts
          ? PostCollection.find({ _id: { $in: input.buyerPosts.map((p) => p.id) } })
              .select("_id title createdBy")
              .lean()
          : Promise.resolve([]),
      ]);

      if (!sellerPost) {
        throw NOT_FOUND({
          data: { message: `Seller post ${input.sellerPost.id} not found.` },
        });
      }

      if (!buyerUser) {
        throw NOT_FOUND({
          data: { message: "Buyer user not found." },
        });
      }

      // Prevent trading with themselves
      if (sellerPost.createdBy === buyerEmail) {
        throw BAD_REQUEST({
          data: { message: "User cannot trade with themselves." },
        });
      }

      // Get seller user info
      const sellerUser = await UserCollection.findOne({ email: sellerPost.createdBy }).lean();
      if (!sellerUser) {
        throw NOT_FOUND({
          data: { message: "Seller user not found." },
        });
      }

      const _id = uuidv7();

      const transactionData: z.infer<typeof transactionSchema> = {
        _id,

        // Embedded seller data
        seller: {
          email: sellerUser.email,
          avatarURL: sellerUser.image,
        },
        sellerPost: {
          id: sellerPost._id,
          title: sellerPost.title,
          createdBy: sellerPost.createdBy,
        },

        // Embedded buyer data
        buyer: {
          email: buyerUser.email,
          avatarURL: buyerUser.image,
        },
        buyerPosts: buyerPosts.map((post) => ({
          id: post._id,
          title: post.title,
          createdBy: post.createdBy,
        })),

        // Transaction details
        dateToSwap: input.dateToSwap,
        messages: input.initialMessage
          ? [
              {
                createdAt: new Date().toISOString(),
                authorEmail: buyerEmail,
                content: input.initialMessage,
              },
            ]
          : [],
        completed: false,
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
        await TransactionCollection.insertOne(tryParse.data);
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

  // TODO
  // deleteTransaction: protectedProcedure.transaction.deleteTransaction.handler(async ({ input, errors }) => {
  //   const swapToDelete = await TransactionCollection.findById(input._id);
  //
  //   if (!swapToDelete) {
  //     throw errors.NOT_FOUND({
  //       data: {
  //         message: "Swap Not Found",
  //       },
  //     });
  //   }
  //
  //   let swapDeleteSuccess = false;
  //
  //   if (swapToDelete.swapItemCompleted === true) {
  //     try {
  //       const result = await TransactionCollection.deleteOne({ _id: swapToDelete._id });
  //       swapDeleteSuccess = result.deletedCount === 1;
  //     } catch (error) {
  //       throw errors.INTERNAL_SERVER_ERROR({
  //         data: {
  //           message: `Failed to delete ${swapToDelete._id}. ${error}`,
  //         },
  //       });
  //     }
  //   } else if (swapToDelete.returnItemCompleted === true) {
  //     try {
  //       const result = await TransactionCollection.deleteOne({ _id: swapToDelete._id });
  //       swapDeleteSuccess = result.deletedCount === 1;
  //     } catch (error) {
  //       throw errors.INTERNAL_SERVER_ERROR({
  //         data: {
  //           message: `Failed to delete ${swapToDelete._id}. ${error}`,
  //         },
  //       });
  //     }
  //   }
  //   if (!swapDeleteSuccess) {
  //     return { success: false, message: "Swap Still In Progress!!" };
  //   }
  //   return { success: true, message: "Swap Successfully Deleted" };
  // }),

  getTransactions: protectedProcedure.transaction.getTransactions.handler(async ({ context, errors: { INTERNAL_SERVER_ERROR } }) => {
    const email = context.user.email;

    // Simple queries - no joins needed!
    const [initiatedTransactions, receivedTransactions] = await Promise.all([
      TransactionCollection.find({ "buyer.email": email }).lean(),
      TransactionCollection.find({ "seller.email": email }).lean(),
    ]);

    return {
      initiatedTransactions,
      receivedTransactions,
    };
  }),

  updateTransaction: protectedProcedure.transaction.updateTransaction.handler(
    async ({ input, context, errors: { NOT_FOUND, UNAUTHORIZED, INTERNAL_SERVER_ERROR } }) => {
      const userEmail = context.user.email;

      // Find the transaction
      const transaction = await TransactionCollection.findById(input._id);

      if (!transaction) {
        throw NOT_FOUND({
          data: { message: `Transaction ${input._id} not found.` },
        });
      }

      const sellerPost = await PostCollection.findById(transaction.sellerPost.id);
      const isAuthorized = transaction.buyer.email === userEmail || sellerPost?.createdBy === userEmail;

      if (!isAuthorized) {
        throw UNAUTHORIZED({
          data: { message: "User not authorized to update this transaction." },
        });
      }

      const updateData: Partial<z.infer<typeof transactionSchema>> = {};
      if (input.dateToSwap !== undefined) updateData.dateToSwap = input.dateToSwap;
      if (input.locationToSwap !== undefined) updateData.locationToSwap = input.locationToSwap;

      try {
        await TransactionCollection.updateOne({ _id: input._id }, { $set: updateData });
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
