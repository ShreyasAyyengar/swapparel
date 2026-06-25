import { userSchema } from "@swapparel/contracts";
import { publicProcedure } from "../../libs/orpc-procedures";
import { UserService } from "./user-service";

export const userRouter = {
  getUser: publicProcedure.users.getUser.handler(async ({ input, errors: { NOT_FOUND, INTERNAL_SERVER_ERROR } }) => {
    const { email, id } = input;
    const user = email ? await UserService.findOne({ email }) : await UserService.findById(id);
    // console.log(await UserService.find());

    if (!user)
      throw NOT_FOUND({
        data: {
          message: `User not found with ${email ? "email" : "id"}: ${email ?? id}`,
        },
      });

    const tryParse = userSchema.safeParse(user.toJSON());

    if (!tryParse.success) {
      throw INTERNAL_SERVER_ERROR({
        data: {
          message: `Failed to parse user with ${email ? "email" : "id"}: ${email ?? id}. ${tryParse.error}`,
          issues: tryParse.error.issues,
        },
      });
    }
    return tryParse.data;
  }),
};
