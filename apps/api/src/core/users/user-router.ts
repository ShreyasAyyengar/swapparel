import { userSchema } from "@swapparel/contracts";
import { publicProcedure } from "../../libs/orpc-procedures";
import { UserCollection } from "./user-schema";

export const userRouter = {
  getUser: publicProcedure.users.getUser.handler(async ({ input, errors: { NOT_FOUND, INTERNAL_SERVER_ERROR } }) => {
    const { email } = input;
    const user = await UserCollection.findOne({ email });
    if (!user)
      throw NOT_FOUND({
        data: {
          message: `User not found with email: ${email}`,
        },
      });

    const tryParse = userSchema.safeParse(user.toJSON());
    if (!tryParse.success) {
      throw INTERNAL_SERVER_ERROR({
        data: {
          message: `Failed to parse user with email ${email}. ${tryParse.error}`,
          issues: tryParse.error.issues,
        },
      });
    }
    return tryParse.data;
  }),
};
