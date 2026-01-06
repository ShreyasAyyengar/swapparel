import { transactionSchema } from "@swapparel/contracts";
import { toMongooseSchema } from "mongoose-zod";
import { z } from "zod";
import { databaseConnection } from "../../database/database";

const TransactionSchemaMongooseZod = transactionSchema
  // certain 'Zod Types' (z.url(), z.email(), z.uuid()) must be redefined as more primitive types to serialise with Mongoose
  .omit({ _id: true, sellerPostID: true, buyerPostIDs: true, buyerEmail: true })
  .extend({ _id: z.string(), sellerPostID: z.string(), buyerPostIDs: z.array(z.string()), buyerEmail: z.string() });

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
