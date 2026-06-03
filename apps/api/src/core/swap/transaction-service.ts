import { transactionSchema } from "@swapparel/contracts";
import { toMongooseSchema } from "mongoose-zod";
import { databaseConnection } from "../../database/database";
import { z } from "zod";

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

export const TransactionService = databaseConnection.model<ITransactionSchemaMongoose>(
  "transactions",
  TransactionSchemaMongoose,
  "transactions"
);
