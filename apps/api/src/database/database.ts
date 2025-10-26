import mongoose from "mongoose";
import { env } from "../env";

await mongoose.connect(env.DATABASE_URL);

export const databaseConnection = mongoose.connection;

databaseConnection.once("open", () => {
  // Database connection successful
});

databaseConnection.on("error", (_error) => {
  // Database connection error - handled by mongoose internally
});

// let extended = false;
//
// function addZodExtension() {
//   if (extended) {
//     return;
//   }
//   extended = true;
//   extendZod(z);
// }
//
// export async function initializeDatabase() {
//   try {
//     await connect(env.DATABASE_URL);
//     logger.info("[MongoDB]: Successfully connected to database");
//
//     // Initialize Zod extension after successful connection
//     addZodExtension();
//   } catch (err) {
//     logger.error("[MongoDB]: Error connecting to database", err);
//     throw err;
//   }
// }
//
// mongoose.connection.once("open", () =>
//   logger.info("[MongoDB]: Successfully connected to database")
// );
//
// mongoose.connection.on("error", (err) =>
//   logger.error("[MongoDB]: Error connecting to database", err)
// );
//
// export const databaseConnection = mongoose.connection;
