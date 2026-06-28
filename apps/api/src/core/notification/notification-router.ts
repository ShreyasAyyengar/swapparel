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
      const filter: Record<string, unknown> = { recipientId: userId };
      if (input.ids) {
        filter._id = { $in: input.ids };
      }

      await NotificationService.updateMany(filter, { $set: { read: true } });
      return { success: true };
    } catch (error) {
      throw INTERNAL_SERVER_ERROR({
        data: { message: `Failed to mark notifications as read. ${error}` },
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
