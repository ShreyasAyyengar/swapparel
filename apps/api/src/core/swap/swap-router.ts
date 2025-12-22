import { internalSwapSchema } from "@swapparel/contracts";
import { v7 as uuidv7 } from "uuid";
import { logger } from "../../libs/logger";
import { protectedProcedure, publicProcedure } from "../../libs/orpc";
import { PostCollection } from "../post/post-schema";
import { SwapCollection } from "../swap/swap-schema";

export const swapRouter = {
  createSwap: protectedProcedure.swap.createSwap.handler(
    async ({ input, errors: { NOT_FOUND, BAD_REQUEST, INTERNAL_SERVER_ERROR }, context }) => {
      const buyerEmailContext = context.user.email;

      //creates buyerPost only if there is a post id given as input
      const buyerPost = await PostCollection.findById(input.buyerPostID);

      //confirms seller post exists given through input
      const sellerPost = await PostCollection.findById(input.sellerPostID);
      if (!sellerPost) {
        throw NOT_FOUND({
          data: { message: "Seller post not found" },
        });
      }

      //Confirms email of seller exists after confirming seller post exists
      const sellerEmailCheck = await PostCollection.findOne({ createdBy: sellerPost.createdBy });
      if (!sellerEmailCheck) {
        throw NOT_FOUND({
          data: { message: `User not found with email: ${sellerPost.createdBy}` },
        });
      }
      //Checks if user attempts to trade with themselves
      if (sellerEmailCheck === buyerEmailContext) {
        throw BAD_REQUEST({
          data: { message: "User cannot trade with themselves" },
        });
      }

      const _id = uuidv7();

      const swapData = {
        _id,
        sellerEmail: sellerPost.createdBy,
        buyerEmail: buyerEmailContext,
        sellerPostID: sellerPost._id,
        buyerPostID: buyerPost?._id,
        messageToSeller: input.messages ?? undefined,
        dateToSwap: input.dateToSwap,
        locationToSwap: input.locationToSwap,
      };

      const tryParse = internalSwapSchema.safeParse(swapData);

      if (!tryParse.success) {
        throw BAD_REQUEST({
          data: {
            issues: tryParse.error.issues,
            message: "Invalid Input",
          },
        });
      }
      try {
        await PostCollection.insertOne(swapData);
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

  addMockSwap: publicProcedure.swap.addMockSwap.handler(async ({ input, errors, context }) => {
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
      await SwapCollection.insertOne(randomSwapData);
    } catch (error) {
      logger.error(`Failed to add mock swap: ${error}`);
    }
    return true;
  }),
};
