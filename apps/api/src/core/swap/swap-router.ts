import { UserCollection } from "../users/user-schema";
import { PostCollection } from "../post/post-schema";
import { internalPostSchema } from "@swapparel/contracts";
import { z } from "zod";
import { protectedProcedure, publicProcedure } from "../../libs/orpc";
import { swapContract } from "@swapparel/contracts";


export const swapRouter{
    createSwap: protectedProcedure.swap.createSwap.handler(
        async ({ input, errors: { INTERNAL_SERVER_ERROR }, context }) => {

        }
        }
    )
};

