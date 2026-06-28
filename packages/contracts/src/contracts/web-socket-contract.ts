import { messagingContract } from "./ws/messaging/messaging-contract";
import { notificationContract } from "./http/notification/notification-contract";

export const webSocketContract = {
  messaging: messagingContract,
  notifications: notificationContract,
};
