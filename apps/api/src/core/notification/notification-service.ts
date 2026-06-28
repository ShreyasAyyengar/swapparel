import { notificationSchema } from "@swapparel/contracts";
import { toMongooseSchema } from "mongoose-zod";
import type { z } from "zod";
import { databaseConnection } from "../../database/database";

const NotificationSchema = notificationSchema;

const NotificationSchemaMongoose = toMongooseSchema(
  NotificationSchema.mongoose({
    schemaOptions: {
      collection: "notifications",
      versionKey: false,
    },
  })
);

export interface INotificationSchemaMongoose extends z.infer<typeof NotificationSchema> {}

NotificationSchemaMongoose.index({ recipientId: 1, read: 1, createdAt: -1 });

export const NotificationService = databaseConnection.model<INotificationSchemaMongoose>(
  "notifications",
  NotificationSchemaMongoose,
  "notifications"
);
