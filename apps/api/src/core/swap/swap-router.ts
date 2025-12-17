import { UserCollection } from "../users/user-schema";
import { PostCollection } from "../post/post-schema";
import { internalPostSchema } from "@swapparel/contracts";
import { z } from "zod";
import { protectedProcedure, publicProcedure } from "../../libs/orpc";
import { swapContract } from "@swapparel/contracts";
import { v7 as uuidv7 } from "uuid";


export const swapRouter = {
    createSwap: protectedProcedure.swap.createSwap.handler(
        async ({ input, errors: { NOT_FOUND, INTERNAL_SERVER_ERROR,BAD_REQUEST } , context }) => {

            //Confirms email of buyer exists
            const buyerEmailCheck = await UserCollection.findOne({ email: context.user.email });

            if (!buyerEmailCheck) {
                throw NOT_FOUND({
                    data: { message: `User not found with email: ${context.user.email}` },
                });
            }

            //Confirms email of buyer exists
            const sellerEmailCheck = await UserCollection.findOne({
                email: input.swapData.sellerEmail
            });

            if (!sellerEmailCheck) {
                throw NOT_FOUND({
                    data: { message: `User not found with email: ${input.swapData.sellerEmail}` },
                });
            }
            const sellerPost = await PostCollection.findOne({
                _id: input.swapData.sellerPostID
            })
            const buyerPost = await PostCollection.findOne({
                _id: input.swapData.buyerPostID
            })



            const id = uuidv7();


            const swapData = {
                _id: id,
                sellerEmail: input.swapData.sellerEmail,
                buyerEmail: context.user.email,
                sellerPostID: sellerPost,
                buyerPostID: buyerPost,
                messageToSeller: input.swapData.messageToSeller,
                dateToSwap: input.swapData.dateToSwap,
                locationToSwap: input.swapData.locationToSwap,
            }
            const tryParse = internalPostSchema.safeParse(swapData);

            if (!tryParse.success) {
                throw BAD_REQUEST({
                    data: {
                        issues: tryParse.error.issues,
                        message: "Invalid Input",
                    },
                });
            }
        }
    ),
};

