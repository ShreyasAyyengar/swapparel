import {internalSwapSchema} from "@swapparel/contracts";
import {toMongooseSchema} from "mongoose-zod";
import {z} from "zod";
import {databaseConnection} from "../../database/database";

const SwapSchemaMongooseZod = internalSwapSchema

const SwapSchemaMongoose = toMongooseSchema(
  SwapSchemaMongooseZod.mongoose({
    schemaOptions: {
      collection: "swaps",
      versionKey: false,
    },
  })
);

export interface ISwapSchemaMongoose extends z.infer<typeof SwapSchemaMongooseZod> {
}

export const SwapCollection = databaseConnection.model<ISwapSchemaMongoose>("swaps", SwapSchemaMongoose, "swaps");

