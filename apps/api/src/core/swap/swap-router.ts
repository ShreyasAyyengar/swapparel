import { UserCollection } from "../users/user-schema";
import { PostCollection } from "../post/post-schema";
import { internalPostSchema } from "@swapparel/contracts";
import { protectedProcedure } from "../../libs/orpc";
import { v7 as uuidv7 } from "uuid";


export const swapRouter = {
    createSwap: protectedProcedure.swap.createSwap.handler(
        async ({ input, errors: { NOT_FOUND, BAD_REQUEST, INTERNAL_SERVER_ERROR }, context }) => {

            //creates buyerPost only if there is a post id given as input
            const buyerPost = await PostCollection.findById(input.swapData.buyerPostID);

            //Confirms email of buyer exists
            const buyerEmailCheck = await UserCollection.findOne({ email: context.user.email });
            if (!buyerEmailCheck) {
                throw NOT_FOUND({
                    data: { message: `User not found with email: ${context.user.email}` },
                });
            }

            //confirms seller post exists given through input
            const sellerPost = await PostCollection.findById(input.swapData.sellerPostID);
            if (!sellerPost) {
                throw NOT_FOUND({
                    data: { message: "Seller post not found" }
                });
            }

            //Confirms email of seller exists after confirming seller post exists
            const sellerEmailCheck = await UserCollection.findOne({ createdBy: sellerPost.createdBy});
            if (!sellerEmailCheck) {
                throw NOT_FOUND({
                    data: { message: `User not found with email: ${sellerPost.createdBy}` },
                });
            }


            const _id = uuidv7();


            const swapData = {
                _id: _id,
                sellerEmail: sellerPost.createdBy,
                buyerEmail: context.user.email,
                sellerPostID: sellerPost._id,
                buyerPostID: buyerPost?._id,
                messageToSeller: input.swapData.messageToSeller ?? undefined,
                dateToSwap: input.swapData.dateToSwap,
                locationToSwap: input.swapData.locationToSwap,
            }


            const tryParse = internalPostSchema.safeParse(swapData);

            if (!tryParse.success) {
                throw BAD_REQUEST({
                    data: {
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
};

