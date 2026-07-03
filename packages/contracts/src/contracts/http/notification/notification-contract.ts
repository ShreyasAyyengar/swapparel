import { oc } from "@orpc/contract";
import { z } from "zod";
import { notificationSchema } from "./notification-schemas";

const MIN_NOTIFICATIONS_LIMIT = 1;
const MAX_NOTIFICATIONS_LIMIT = 200;
const DEFAULT_NOTIFICATIONS_LIMIT = 20;

const getNotificationsOutputSchema = z.object({
  notifications: z.array(notificationSchema),
  unreadCount: z.number(),
  nextCursor: z.string().optional(),
});

export const notificationContract = {
  getNotifications: oc
    .route({
      method: "GET",
    })
    .input(
      z
        .object({
          limit: z.coerce.number().min(MIN_NOTIFICATIONS_LIMIT).max(MAX_NOTIFICATIONS_LIMIT).default(DEFAULT_NOTIFICATIONS_LIMIT).optional(),
          cursor: z.string().optional(),
        })
        .optional()
    )
    .output(getNotificationsOutputSchema)
    .errors({
      INTERNAL_SERVER_ERROR: {
        data: z.object({
          message: z.string(),
        }),
      },
    }),

  markAsRead: oc
    .route({
      method: "PATCH",
    })
    .input(
      z.object({
        id: z.uuidv7(),
      })
    )
    .output(
      z.object({
        success: z.boolean(),
      })
    )
    .errors({
      INTERNAL_SERVER_ERROR: {
        data: z.object({
          message: z.string(),
        }),
      },
    }),

  markAsReadByTransactionId: oc
    .route({
      method: "PATCH",
    })
    .input(
      z.object({
        transactionId: z.uuidv7(),
      })
    )
    .output(
      z.object({
        success: z.boolean(),
      })
    )
    .errors({
      INTERNAL_SERVER_ERROR: {
        data: z.object({
          message: z.string(),
        }),
      },
    }),

  markAllRead: oc
    .route({
      method: "PATCH",
    })
    .output(
      z.object({
        success: z.boolean(),
      })
    )
    .errors({
      INTERNAL_SERVER_ERROR: {
        data: z.object({
          message: z.string(),
        }),
      },
    }),
};
