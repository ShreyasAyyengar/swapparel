import { messagingRouter } from "../core/messaging/messaging-router";
import { notificationRouter } from "../core/notification/notification-router";

export const webSocketRouter = {
  messaging: messagingRouter,
  notifications: notificationRouter,
};
