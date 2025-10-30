import mongoose from "mongoose";
import { env } from "../env";
import { logger } from "../libs/logger.ts";

await mongoose.connect(env.DATABASE_URL);

export const databaseConnection = mongoose.connection;

databaseConnection.once("open", () => {
  logger.info("[MongoDB] Connection opened!");
});

databaseConnection.on("error", (_error) => {
  logger.error("[MongoDB] Connection error: ", _error);
});
