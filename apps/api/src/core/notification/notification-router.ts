import { protectedProcedure } from "../../libs/orpc-procedures";
import { cleanupOldReadNotifications, notificationPublisher } from "./notification-manager";
import { NotificationService } from "./notification-service";

const DEFAULT_NOTIFICATION_LIMIT = 20;

export const notificationRouter = {
  getNotifications: protectedProcedure.notifications.getNotifications.handler(async ({ input, context, errors: { INTERNAL_SERVER_ERROR } }) => {
    const userId = context.user.id;
    const limit = input?.limit ?? DEFAULT_NOTIFICATION_LIMIT;

    try {
      const filter: Record<string, unknown> = { recipientId: userId };
      if (input?.cursor) {
        filter._id = { $lt: input.cursor };
      }

      const [notifications, unreadCount] = await Promise.all([
        NotificationService.find(filter).sort({ _id: -1 }).limit(limit).lean(),
        NotificationService.countDocuments({ recipientId: userId, read: false }),
      ]);

      const nextCursor = notifications.length === limit ? notifications.at(-1)?._id : undefined;

      return { notifications, unreadCount, nextCursor };
    } catch (error) {
      throw INTERNAL_SERVER_ERROR({
        data: { message: `Failed to fetch notifications. ${error}` },
      });
    }
  }),

  streamNotifications: protectedProcedure.notifications.streamNotifications.handler(async function* ({
    context,
    signal,
    errors: { INTERNAL_SERVER_ERROR },
  }) {
    const userId = context.user.id;

    try {
      const iterator = notificationPublisher.subscribe(userId, { signal });

      for await (const payload of iterator) {
        yield payload;
      }
    } catch (error) {
      throw INTERNAL_SERVER_ERROR({
        data: { message: `Failed to stream notifications. ${error}` },
      });
    }
  }),

  markAsRead: protectedProcedure.notifications.markAsRead.handler(async ({ input, context, errors: { INTERNAL_SERVER_ERROR } }) => {
    const userId = context.user.id;

    try {
      await NotificationService.updateOne({ _id: input.id, recipientId: userId }, { $set: { read: true } });
      await cleanupOldReadNotifications(userId);
      return { success: true };
    } catch (error) {
      throw INTERNAL_SERVER_ERROR({
        data: { message: `Failed to mark notification as read. ${error}` },
      });
    }
  }),

  markAsReadByTransactionId: protectedProcedure.notifications.markAsReadByTransactionId.handler(
    async ({ input, context, errors: { INTERNAL_SERVER_ERROR } }) => {
      const userId = context.user.id;

      try {
        await NotificationService.updateMany({ recipientId: userId, transactionId: input.transactionId, read: false }, { $set: { read: true } });
        await cleanupOldReadNotifications(userId);
        return { success: true };
      } catch (error) {
        throw INTERNAL_SERVER_ERROR({
          data: { message: `Failed to mark notifications as read. ${error}` },
        });
      }
    }
  ),

  markAllRead: protectedProcedure.notifications.markAllRead.handler(async ({ context, errors: { INTERNAL_SERVER_ERROR } }) => {
    const userId = context.user.id;

    try {
      await NotificationService.updateMany({ recipientId: userId }, { $set: { read: true } });
      await cleanupOldReadNotifications(userId);
      return { success: true };
    } catch (error) {
      throw INTERNAL_SERVER_ERROR({
        data: { message: `Failed to mark all notifications as read. ${error}` },
      });
    }
  }),
};
