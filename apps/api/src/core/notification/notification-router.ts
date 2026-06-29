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

      const nextCursor = notifications.length === limit ? notifications[notifications.length - 1]._id : undefined;

      return { notifications, unreadCount, nextCursor };
    } catch (error) {
      throw INTERNAL_SERVER_ERROR({
        data: { message: `Failed to fetch notifications. ${error}` },
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

  subscribeNotifications: protectedProcedure.notifications.subscribeNotifications.handler(async function* ({ context, signal }) {
    const iterator = notificationPublisher.subscribe(context.user.id, {
      signal,
    });

    for await (const payload of iterator) {
      yield payload;
    }
  }),
};
