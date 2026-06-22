import { transactionSchema } from "@swapparel/contracts";
import { toMongooseSchema } from "mongoose-zod";
// noinspection ES6UnusedImports
import type { z } from "zod";
import { databaseConnection } from "../../database/database";

const TransactionSchema = transactionSchema;

const TransactionSchemaMongoose = toMongooseSchema(
  TransactionSchema.mongoose({
    schemaOptions: {
      collection: "transactions",
      versionKey: false,
    },
  })
);

export interface ITransactionSchemaMongoose extends z.infer<typeof TransactionSchema> {}

TransactionSchemaMongoose.index({ "buyer.userId": 1, updatedAt: -1 });
TransactionSchemaMongoose.index({ "seller.userId": 1, updatedAt: -1 });

export const TransactionService = databaseConnection.model<ITransactionSchemaMongoose>(
  "transactions",
  TransactionSchemaMongoose,
  "transactions"
);
