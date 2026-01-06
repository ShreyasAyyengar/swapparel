import { transactionSchema } from "@swapparel/contracts";
import { v7 as uuidv7 } from "uuid";
import { logger } from "../../libs/logger";
import { protectedProcedure, publicProcedure } from "../../libs/orpc-procedures";
import { PostCollection } from "../post/post-schema";
import { TransactionCollection } from "./transaction-schema";

// TODO incorporate different types of swaps: e.g. one-way, two-way. etc
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

  addMockTransaction: publicProcedure.transaction.addMockTransaction.handler(async ({ input, errors, context }) => {
    const [mockSellerPostBuffer] = await PostCollection.aggregate([{ $sample: { size: 1 } }, { $project: { _id: 1, createdBy: 1 } }]);

    const mockSellerPost = mockSellerPostBuffer?._id ?? null;
    const mockSellerEmail = mockSellerPostBuffer?.createdBy ?? null;

    const [mockBuyerPostBuffer] = await PostCollection.aggregate([
      { $match: { createdBy: { $ne: mockSellerEmail } } },
      { $sample: { size: 1 } },
      { $project: { _id: 1, createdBy: 1 } },
    ]);

    const mockBuyerPost = mockBuyerPostBuffer?._id ?? null;
    const mockBuyerEmail = mockBuyerPostBuffer?.createdBy ?? null;

    const mockMessageArray = [
      "Hello, I am interested in trading!",
      "Hi, are you willing to sell",
      "I am looking to trade at McHenry instead if that is okay with you?",
      "Really cool shirt, would go great with with my pants",
    ];
    const randomNum = Math.floor(Math.random() * mockMessageArray.length);
    const mockMessage = mockMessageArray[randomNum];

    const mockDate = new Date();
    const mockLocationArray = [
      "McHenry Library, Santa Cruz, California",
      "East Field, Santa Cruz, California",
      "The Crepe Place, Santa Cruz, California",
      "Santa Cruz Cinema, Santa Cruz, California",
    ];
    const randomNumTwo = Math.floor(Math.random() * mockLocationArray.length);
    const mockLocation = mockLocationArray[randomNumTwo];
    try {
      const randomSwapData = {
        _id: uuidv7(),
        sellerEmail: mockSellerEmail,
        buyerEmail: mockBuyerEmail,
        sellerPostID: mockSellerPost,
        buyerPostID: mockBuyerPost,
        messageToSeller: mockMessage,
        dateToSwap: mockDate,
        locationToSwap: mockLocation,
      };
      await TransactionCollection.insertOne(randomSwapData);
    } catch (error) {
      logger.error(`Failed to add mock swap: ${error}`);
    }
    return true;
  }),
};
