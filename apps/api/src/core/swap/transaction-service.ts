import { transactionSchema } from "@swapparel/contracts";
import { Schema } from "mongoose";
import { databaseConnection } from "../../database/database";

// TODO completely redo
const TransactionSchema = transactionSchema;

export interface ITransactionSchemaMongoose extends z.infer<typeof TransactionSchema> {}

const embeddedUserSchema = {
  email: { type: String, required: true },
  avatarURL: { type: String, required: true },
};

const embeddedPostSchema = {
  id: { type: String, required: true },
  title: { type: String, required: true },
  createdBy: { type: String, required: true },
};

const embeddedPostArraySchema = new Schema(embeddedPostSchema, { _id: false, id: false });

const messageSchema = new Schema(
  {
    createdAt: { type: String, required: true },
    authorEmail: { type: String, required: true },
    content: { type: String, required: true },
  },
  { _id: false, id: false }
);

const TransactionSchemaMongoose = new Schema<ITransactionSchemaMongoose>(
  {
    _id: { type: String, required: true },
    seller: embeddedUserSchema,
    sellerPost: embeddedPostSchema,
    buyer: embeddedUserSchema,
    buyerPosts: { type: [embeddedPostArraySchema], default: undefined },
    dateToSwap: { type: Date, required: true },
    locationToSwap: { type: String, required: false },
    messages: { type: [messageSchema], default: [] },
    completed: { type: Boolean, default: false },
  },
  {
    collection: "transactions",
    versionKey: false,
  }
);

export const TransactionService = databaseConnection.model<ITransactionSchemaMongoose>(
  "transactions",
  TransactionSchemaMongoose,
  "transactions"
);
