import { APIError, betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { databaseConnection } from "../database/database";
import { env } from "../env";

const database = databaseConnection.getClient().db("swapparel");

export const authServer = betterAuth({
  database: mongodbAdapter(database),
  trustedOrigins: [env.NEXT_PUBLIC_WEBSITE_URL, "http://localhost:3000"],
  socialProviders: {
    google: {
      prompt: "select_account consent",
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      accessType: "offline",
      // mapProfileToUser: (profile) => {
      //   const email = profile.email;
      //   if (!email?.endsWith("@example.com")) {
      //     throw new APIError("BAD_REQUEST", {
      //       message: "Email must end with @example.com",
      //     });
      //   }
      // },
    },
  },
  // THIS IS USELESS UNLESS BETTERAUTH CAN FIX THEIR ROUTING. IF WORKS, MOVE DOMAIN LOGIC TO mapProfileToUser
  // onAPIError: {
  //   errorURL: "http://localhost:3000/error",
  //   throw: true,
  // },

  user: {
    additionalFields: {
      displayName: {
        type: "string",
      },
      restricted: {
        type: "boolean",
        defaultValue: true,
      },
    },
  },

  databaseHooks: {
    user: {
      create: {
        // biome-ignore lint/suspicious/useAwait: <explanation>
        before: async (user, ctx) => {
          const email = user.email;

          if (!email?.endsWith("@ucsc.edu")) {
            throw new APIError("BAD_REQUEST", {
              message: "Email must end with @ucsc.edu",
            });
          }
        },
      },
    },

    // TODO: set default displayName
  },
});
