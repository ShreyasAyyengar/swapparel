import { transactionSchema } from "@swapparel/contracts";
import { v7 as uuidv7 } from "uuid";
import { protectedProcedure } from "../../libs/orpc-procedures";
import { PostCollection } from "../post/post-schema";
import { UserCollection } from "../users/user-schema";
import { TransactionCollection } from "./transaction-schema";

export const transactionRouter = {
  createTransaction: protectedProcedure.transaction.createTransaction.handler(
    async ({ input, errors: { NOT_FOUND, BAD_REQUEST, INTERNAL_SERVER_ERROR }, context }) => {
      const buyerEmailFromContex = context.user.email;

      // confirm seller post exists in the db
      const sellerPost = await PostCollection.findById(input.sellerPostID);
      if (!sellerPost) {
        throw NOT_FOUND({
          data: { message: `Seller with post ${input.sellerPostID} not found.` },
        });
      }

      // prevent trading with themselves
      if (sellerPost.createdBy === buyerEmailFromContex) {
        throw BAD_REQUEST({
          data: { message: "User cannot trade with themselves." },
        });
      }

      // creates buyerPost only if there is a post id given as input
      const buyerPosts = input.buyerPostIDs ? await PostCollection.find({ _id: { $in: input.buyerPostIDs } }) : [];

      const _id = uuidv7();

      const tryParse = transactionSchema.safeParse({
        _id,
        sellerPostID: sellerPost._id,
        buyerPostIDs: buyerPosts.map((p) => p._id),
        buyerEmail: buyerEmailFromContex,
        messages: input.initialMessage ? [input.initialMessage] : [],
        dateToSwap: input.dateToSwap,
      });

      if (!tryParse.success) {
        throw BAD_REQUEST({
          data: {
            issues: tryParse.error.issues,
            message: "Invalid Input",
          },
        });
      }
      try {
        await TransactionCollection.insertOne(tryParse.data);
      } catch (error) {
        throw INTERNAL_SERVER_ERROR({
          data: {
            message: `Failed to insert document by _id: ${_id}. ${error}`,
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

  getTransactions: protectedProcedure.transaction.getTransactions.handler(async ({ context, errors: { INTERNAL_SERVER_ERROR, NOT_FOUND } }) => {
    const email = context.user.email;

    const [initiatedTransactions, myPostIds] = await Promise.all([
      TransactionCollection.find({ buyerEmail: email }).lean(),
      PostCollection.distinct("_id", { createdBy: email }),
    ]);

    const initiatedWithAvatars = await Promise.all(
      initiatedTransactions.map(async (transaction) => {
        const sellerPost = await PostCollection.findById(transaction.sellerPostID).lean();
        const sellerUser = sellerPost ? await UserCollection.findOne({ email: sellerPost.createdBy }).lean() : null;

        return {
          ...transaction,
          avatarURL: sellerUser?.image ?? "",
        };
      })
    );

    const receivedTransactions = await TransactionCollection.find({
      sellerPostID: { $in: myPostIds },
    }).lean();

    const receivedWithAvatars = await Promise.all(
      receivedTransactions.map(async (transaction) => {
        const buyerPost = await PostCollection.findById(transaction.sellerPostID).lean();
        const buyerUser = buyerPost ? await UserCollection.findOne({ email: buyerPost.createdBy }).lean() : null;

        return {
          ...transaction,
          avatarURL: buyerUser?.image ?? "",
        };
      })
    );

    return {
      initiatedTransactions: initiatedWithAvatars,
      receivedTransactions: receivedWithAvatars,
    };
  }),
};
