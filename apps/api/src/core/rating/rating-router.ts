import { ratingSchema } from "@swapparel/contracts";
import { v7 as uuidv7 } from "uuid";
import { protectedProcedure, publicProcedure } from "../../libs/orpc-procedures";
import { UserService } from "../users/user-service";
import { RatingService } from "./rating-service";

export const ratingRouter = {
  submitRating: protectedProcedure.ratings.submitRating.handler(
    async ({ input, context, errors: { NOT_FOUND, BAD_REQUEST, CONFLICT, INTERNAL_SERVER_ERROR } }) => {
      const raterEmail = context.user.email;
      const { ratedUserEmail, value, comment } = input;

      if (raterEmail === ratedUserEmail) {
        throw BAD_REQUEST({ data: { message: "Cannot rate yourself" } });
      }

      const ratedUser = await UserService.findOne({ email: ratedUserEmail });
      if (!ratedUser) {
        throw NOT_FOUND({ data: { message: `User not found with email: ${ratedUserEmail}` } });
      }

      const existingRating = await RatingService.findOne({ raterEmail, ratedUserEmail });
      if (existingRating) {
        throw CONFLICT({ data: { message: "You have already rated this user" } });
      }

      const _id = uuidv7();
      const createdAt = new Date();
      const ratingData = { _id, raterEmail, ratedUserEmail, value, comment, createdAt };

      const tryParse = ratingSchema.safeParse(ratingData);
      if (!tryParse.success) {
        throw BAD_REQUEST({ data: { message: "Invalid rating data" } });
      }

      try {
        await RatingService.insertOne(tryParse.data);
      } catch (error) {
        throw INTERNAL_SERVER_ERROR({ data: { message: `Failed to insert rating. ${error}` } });
      }

      return tryParse.data;
    }
  ),

  getMyRatingForTransaction: protectedProcedure.ratings.getMyRatingForTransaction.handler(
    async ({ input, context, errors: { INTERNAL_SERVER_ERROR } }) => {
      try {
        const rating = await RatingService.findOne({ transactionId: input.transactionId, raterEmail: context.user.email });
        if (!rating) return null;

        const json = rating.toJSON({ flattenObjectIds: true });
        const tryParse = ratingSchema.safeParse(json);
        if (!tryParse.success) {
          throw INTERNAL_SERVER_ERROR({ data: { message: "Failed to parse rating data" } });
        }
        return tryParse.data;
      } catch (error) {
        throw INTERNAL_SERVER_ERROR({ data: { message: `Failed to fetch rating. ${error}` } });
      }
    }
  ),

  getRatingsForUser: publicProcedure.ratings.getRatingsForUser.handler(async ({ input, errors: { BAD_REQUEST, INTERNAL_SERVER_ERROR } }) => {
    try {
      const ratingDocs = await RatingService.find({ ratedUserEmail: input.ratedUserEmail });

      const ratings = ratingDocs.map((doc) => {
        const json = doc.toJSON({ flattenObjectIds: true });
        const tryParse = ratingSchema.safeParse(json);
        if (!tryParse.success) {
          throw BAD_REQUEST({ data: { issues: tryParse.error.issues, message: "Failed to parse rating data" } });
        }
        return tryParse.data;
      });

      const totalRatings = ratings.length;
      const averageRating = totalRatings > 0 ? ratings.reduce((sum, r) => sum + r.value, 0) / totalRatings : null;

      return { ratings, averageRating, totalRatings };
    } catch (error) {
      throw INTERNAL_SERVER_ERROR({ data: { message: `Failed to fetch ratings. ${error}` } });
    }
  }),
};
