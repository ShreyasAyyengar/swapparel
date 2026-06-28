import { protectedProcedure } from "../../libs/orpc-procedures";
import { notificationPublisher } from "./notification-manager";
import { NotificationService } from "./notification-service";

const DEFAULT_NOTIFICATION_LIMIT = 20;

export const notificationRouter = {
  getNotifications: protectedProcedure.notifications.getNotifications.handler(async ({ input, context, errors: { INTERNAL_SERVER_ERROR } }) => {
    const userId = context.user.id;
    const limit = input?.limit ?? DEFAULT_NOTIFICATION_LIMIT;

    try {
      const [notifications, unreadCount] = await Promise.all([
        NotificationService.find({ recipientId: userId }).sort({ createdAt: -1 }).limit(limit).lean(),
        NotificationService.countDocuments({ recipientId: userId, read: false }),
      ]);

      return { notifications, unreadCount };
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
