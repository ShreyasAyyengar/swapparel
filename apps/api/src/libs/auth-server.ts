import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { databaseConnection } from "../database/database";
import { env } from "../env";

const database = databaseConnection.getClient().db();

export const auth_server: ReturnType<typeof betterAuth> = betterAuth({
  database: mongodbAdapter(database),
  trustedOrigins: [env.NEXT_PUBLIC_WEBSITE_URL],
  socialProviders: {
    google: {
      prompt: "select_account consent",
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      accessType: "offline",
      // mapProfileToUser: async (profile) => {
      //   const sanitizedUsername = sanitizeUsername(
      //     profile.email.split("@")[0] ?? ""
      //   );
      //   const uniqueUsername = await getNextBestUsername(sanitizedUsername);
      //   return {
      //     username: uniqueUsername.toLowerCase(),
      //     displayUsername: uniqueUsername,
      //   };
      // },
    },
  },
});
