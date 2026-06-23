import { userSchema } from "@swapparel/contracts";
import { publicProcedure } from "../../libs/orpc-procedures";
import { UserService } from "./user-service";

export const userRouter = {
  getUser: publicProcedure.users.getUser.handler(async ({ input, errors: { NOT_FOUND, INTERNAL_SERVER_ERROR } }) => {
    const { email } = input;
    const user = await UserService.findOne({ email });
    if (!user)
      throw NOT_FOUND({
        data: {
          message: `User not found with email: ${email}`,
        },
      });

    const json = user.toJSON({ flattenObjectIds: true });
    const tryParse = userSchema.safeParse({ ...json, id: json._id ?? json._id });
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
