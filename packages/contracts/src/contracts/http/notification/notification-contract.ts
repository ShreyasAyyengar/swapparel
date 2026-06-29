import { eventIterator, oc } from "@orpc/contract";
import { z } from "zod";
import { notificationSchema } from "./notification-schemas";

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
          limit: z.coerce.number().min(1).max(200).default(20).optional(),
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

  subscribeNotifications: oc
    .output(
      eventIterator(
        z.object({
          notification: notificationSchema,
        })
      )
    )
    .errors({
      INTERNAL_SERVER_ERROR: {
        data: z.object({
          message: z.string(),
        }),
      },
    }),
};
