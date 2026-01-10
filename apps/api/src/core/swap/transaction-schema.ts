import { transactionSchema } from "@swapparel/contracts";
import { toMongooseSchema } from "mongoose-zod";
import type { z } from "zod";
import { databaseConnection } from "../../database/database";

const TransactionSchemaMongooseZod = transactionSchema;

const TransactionSchemaMongoose = toMongooseSchema(
  TransactionSchemaMongooseZod.mongoose({
    schemaOptions: {
      collection: "transactions",
      versionKey: false,
    },
  })
);

export interface ITransactionSchemaMongoose extends z.infer<typeof TransactionSchemaMongooseZod> {}

export const TransactionCollection = databaseConnection.model<ITransactionSchemaMongoose>(
  "transactions",
  TransactionSchemaMongoose,
  "transactions"
);
