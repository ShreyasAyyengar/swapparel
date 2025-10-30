import { APIError, betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { databaseConnection } from "../database/database";
import { env } from "../env";

const database = databaseConnection.getClient().db("swapparel");

export const authServer = betterAuth({
  database: mongodbAdapter(database),
  trustedOrigins: [env.NEXT_PUBLIC_WEBSITE_URL],
  socialProviders: {
    google: {
      prompt: "select_account consent",
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      accessType: "offline",
      mapProfileToUser: (profile) => {
        const email = profile.email;
        if (!email?.endsWith("@ucsc.edu")) {
          throw new APIError("BAD_REQUEST", {
            message: "Email must end with @ucsc.edu",
          });
        }

        return profile;
      },
    },
  },
  //
  onAPIError: {
    errorURL: "http://localhost:3000/sign-in-error",
  },

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

  hooks: {
    // biome-ignore lint/suspicious/useAwait: <explanation>
    // before: createAuthMiddleware(async (ctx) => {
    //   // Check if the request is for email sign-up
    //   console.log(ctx.path);
    //   if (ctx.path !== "/sign-in/google") {
    //     return;
    //   }
    //
    //   // Get the email from the request body
    //   const email = ctx.body?.email;
    //   console.log("Email:", email);
    //   if (!email?.endsWith("@exmaple.domain")) {
    //     throw new APIError("BAD_REQUEST", {
    //       message: "Email must end with @example.domain",
    //     });
    //   }
    // }),
  },
  databaseHooks: {
    // TODO: set default displayName
  },
});
