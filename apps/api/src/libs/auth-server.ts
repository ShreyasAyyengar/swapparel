import { APIError, betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { databaseConnection } from "../database/database";
import { env } from "../env";

const database = databaseConnection.getClient().db("swapparel");

const basePath = env.NEXT_PUBLIC_NODE_ENV === "development" ? "/api/auth" : "/auth";

export const authServer = betterAuth({
  database: mongodbAdapter(database),
  baseURL: env.NEXT_PUBLIC_API_URL,
  basePath,
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
          const headers = new Headers();
          headers.set("location", `${env.NEXT_PUBLIC_WEBSITE_URL}/auth/error?message=invalid_email_domain`);
          throw new APIError("FOUND", undefined, headers);
          // status must be FOUND so that the redirect goes to WEBSITE_URL and not API_URL
        }

        return profile;
      },
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
});
