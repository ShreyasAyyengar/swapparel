import { transaction } from "@swapparel/contracts";
import { toMongooseSchema } from "mongoose-zod";
import type { z } from "zod";
import { databaseConnection } from "../../database/database";

const TransactionSchemaMongooseZod = transaction;

const SwapSchemaMongoose = toMongooseSchema(
  TransactionSchemaMongooseZod.mongoose({
    schemaOptions: {
      collection: "swaps",
      versionKey: false,
    },
  })
);

export interface ITransactionSchemaMongoose extends z.infer<typeof TransactionSchemaMongooseZod> {}

export const TransactionCollection = databaseConnection.model<ITransactionSchemaMongoose>("swaps", SwapSchemaMongoose, "swaps");
