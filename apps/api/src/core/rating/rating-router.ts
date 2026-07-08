import { ratingSchema } from "@swapparel/contracts";
import { v7 as uuidv7 } from "uuid";
import { protectedProcedure, publicProcedure } from "../../libs/orpc-procedures";
import { UserService } from "../users/user-service";
import { TransactionService } from "../swap/transaction-service";
import { RatingService } from "./rating-service";

export const ratingRouter = {
  submitRating: protectedProcedure.ratings.submitRating.handler(
    async ({ input, context, errors: { NOT_FOUND, BAD_REQUEST, CONFLICT, INTERNAL_SERVER_ERROR } }) => {
      const raterEmail = context.user.email;
      const { ratedUserEmail, value, comment, transactionId } = input;

      if (raterEmail === ratedUserEmail) {
        throw BAD_REQUEST({ data: { message: "Cannot rate yourself" } });
      }

      const ratedUser = await UserService.findOne({ email: ratedUserEmail });
      if (!ratedUser) {
        throw NOT_FOUND({ data: { message: `User not found with email: ${ratedUserEmail}` } });
      }

      const transaction = await TransactionService.findOne({
        _id: transactionId,
        $or: [
          { "buyer.emailSnapshot": raterEmail, "seller.emailSnapshot": ratedUserEmail },
          { "buyer.emailSnapshot": ratedUserEmail, "seller.emailSnapshot": raterEmail },
        ],
      });
      if (!transaction) {
        throw NOT_FOUND({ data: { message: "No transaction found between you and this user" } });
      }

      const existingRating = await RatingService.findOne({ raterEmail, transactionId });
      if (existingRating) {
        throw CONFLICT({ data: { message: "You have already rated this transaction" } });
      }

      const _id = uuidv7();
      const createdAt = new Date();
      const ratingData = { _id, raterEmail, ratedUserEmail, transactionId, value, comment, createdAt };

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

  getRatingForTransaction: protectedProcedure.ratings.getRatingForTransaction.handler(
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

  deleteRating: protectedProcedure.ratings.deleteRating.handler(
    async ({ input, context, errors: { NOT_FOUND, FORBIDDEN, INTERNAL_SERVER_ERROR } }) => {
      const rating = await RatingService.findOne({ _id: input.id });
      if (!rating) {
        throw NOT_FOUND({ data: { message: `Rating not found with id ${input.id}` } });
      }
      if ((rating as any).raterEmail !== context.user.email) {
        throw FORBIDDEN({ data: { message: "You can only delete your own rating" } });
      }

      try {
        await RatingService.deleteOne({ _id: input.id });
        return { success: true };
      } catch (error) {
        throw INTERNAL_SERVER_ERROR({ data: { message: `Failed to delete rating. ${error}` } });
      }
    }
  ),

  editRating: protectedProcedure.ratings.editRating.handler(
    async ({ input, context, errors: { NOT_FOUND, FORBIDDEN, BAD_REQUEST, INTERNAL_SERVER_ERROR } }) => {
      const rating = await RatingService.findOne({ _id: input._id });
      if (!rating) {
        throw NOT_FOUND({ data: { message: `Rating not found with id ${input._id}` } });
      }
      if ((rating as any).raterEmail !== context.user.email) {
        throw FORBIDDEN({ data: { message: "You can only edit your own rating" } });
      }

      try {
        const $set: Record<string, unknown> = {};
        if (input.value !== undefined) $set.value = input.value;
        if (input.comment !== undefined && input.comment !== null) $set.comment = input.comment;

        if (input.comment === null) {
          await RatingService.updateOne(
            { _id: input._id },
            { $set, $unset: { comment: "" } }
          );
        } else {
          await RatingService.updateOne({ _id: input._id }, { $set });
        }

        return { success: true };
      } catch (error) {
        throw INTERNAL_SERVER_ERROR({ data: { message: `Failed to edit rating. ${error}` } });
      }
    }
  ),
};
