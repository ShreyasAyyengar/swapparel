import { ATTACHMENT_MAX_IMAGE_SIZE_MB, BYTES_PER_MB, type messageSchema, type transactionSchema } from "@swapparel/contracts";
import { v7 as uuidv7 } from "uuid";
import type { z } from "zod";
import { protectedWebSocketProcedure } from "../../libs/orpc-procedures";
import { R2 } from "../../libs/r2-client";
import { insertNotification } from "../notification/notification-manager";
import { TransactionService } from "../swap/transaction-service";
import { activeChatStore } from "./active-chat-store";
import { transactionChatPublisher, transactionDataPublisher } from "./chat-subscription-manager";
import { MessageService } from "./messaging-service";

const MESSAGE_PREVIEW_MAX_LENGTH = 80;

type Transaction = z.infer<typeof transactionSchema>;

export const isTransactionParticipant = (transaction: Pick<Transaction, "buyer" | "seller">, userId: string) =>
  transaction.buyer.userId === userId || transaction.seller.userId === userId;

export const messagingRouter = {
  // Messaging
  publishChatMessage: protectedWebSocketProcedure.messaging.publishChatMessage.handler(
    async ({ input, context, errors: { FORBIDDEN, INTERNAL_SERVER_ERROR, NOT_FOUND, UNPROCESSABLE_CONTENT } }) => {
      const transaction = await TransactionService.findById(input.transactionId).select("buyer seller").lean();

      if (!transaction) {
        throw NOT_FOUND({
          data: { message: `Transaction ${input.transactionId} not found.` },
        });
      }

      if (!isTransactionParticipant(transaction, context.user.id)) {
        throw FORBIDDEN({
          data: { message: "User is not a participant in this transaction." },
        });
      }

      if (transaction.status !== "ongoing") {
        throw FORBIDDEN({
          data: { message: "Cannot send messages for archived transactions." },
        });
      }

      const message: z.infer<typeof messageSchema> = {
        _id: uuidv7(),
        content: [input.message],
        transactionId: input.transactionId,
        authorId: context.user.id,
        createdAt: new Date(),
      };

      const hydratedAttachments: string[] = [];
      if (input.pendingAttachmentKeys && input.pendingAttachmentKeys.length > 0) {
        for (const key of input.pendingAttachmentKeys) {
          const fileRef = R2.file(key);
          const exists = await fileRef.exists();
          if (!exists) {
            throw NOT_FOUND({
              data: { message: `Attachment ${key} not found.` },
            });
          }

          const fileStat = await fileRef.stat();
          if (fileStat.size > ATTACHMENT_MAX_IMAGE_SIZE_MB * BYTES_PER_MB) {
            throw UNPROCESSABLE_CONTENT({
              data: { message: `Attachment ${key} exceeds maximum size of ${ATTACHMENT_MAX_IMAGE_SIZE_MB}MB.` },
            });
          }

          if (fileStat.type !== "image/png" && fileStat.type !== "image/jpeg" && fileStat.type !== "image/jpg") {
            throw UNPROCESSABLE_CONTENT({
              data: { message: `Attachment ${key} is not a valid image type.` },
            });
          }
        }

        for (const key of input.pendingAttachmentKeys) {
          const fileRef = R2.file(key);
          const url = fileRef.presign({
            method: "GET",
            expiresIn: 60 * 60,
          });
          hydratedAttachments.push(url);
        }

        message.attachments = input.pendingAttachmentKeys.map((key) => key);
      }

      try {
        await MessageService.insertOne(message);

        const messagePayload = message.attachments ? { ...message, attachments: hydratedAttachments } : message;
        await transactionChatPublisher.publish(input.transactionId, {
          edited: false,
          incomingMessage: messagePayload,
        });

        const otherParticipantId = transaction.buyer.userId === context.user.id ? transaction.seller.userId : transaction.buyer.userId;
        const senderName = transaction.buyer.userId === context.user.id ? transaction.buyer.emailSnapshot : transaction.seller.emailSnapshot;

        const isRecipientViewing = activeChatStore.isActive(otherParticipantId, input.transactionId);
        if (!isRecipientViewing) {
          await insertNotification({
            recipientId: otherParticipantId,
            type: "new_message",
            transactionId: input.transactionId,
            actorName: senderName,
            messagePreview: input.message.slice(0, MESSAGE_PREVIEW_MAX_LENGTH),
          });
        }

        return { success: true, message: messagePayload };
      } catch (error) {
        throw INTERNAL_SERVER_ERROR({
          data: { message: `Failed to publish message. ${error}` },
        });
      }
    }
  ),

  publishMessageEdit: protectedWebSocketProcedure.messaging.publishMessageEdit.handler(
    async ({ input, context, errors: { FORBIDDEN, INTERNAL_SERVER_ERROR, NOT_FOUND } }) => {
      const transaction = await TransactionService.findById(input.transactionId).select("buyer seller").lean();

      if (!transaction) {
        throw NOT_FOUND({
          data: { message: `Transaction ${input.transactionId} not found.` },
        });
      }

      if (!isTransactionParticipant(transaction, context.user.id)) {
        throw FORBIDDEN({
          data: { message: "User is not a participant in this transaction." },
        });
      }

      const existingMessage = await MessageService.findOne({
        _id: input.messageId,
        transactionId: input.transactionId,
      })
        .select("authorId")
        .lean();

      if (!existingMessage) {
        throw NOT_FOUND({
          data: { message: `Message ${input.messageId} not found.` },
        });
      }

      if (existingMessage.authorId !== context.user.id) {
        throw FORBIDDEN({
          data: { message: "Users may only edit their own messages." },
        });
      }

      const editedAt = new Date();
      let newMessage: z.infer<typeof messageSchema> | null;

      try {
        newMessage = await MessageService.findOneAndUpdate(
          {
            _id: input.messageId,
            transactionId: input.transactionId,
            authorId: context.user.id,
          },
          {
            $set: { editedAt },
            $push: { content: { $each: [input.newContent], $position: 0 } },
          },
          { new: true }
        ).lean();
      } catch (error) {
        throw INTERNAL_SERVER_ERROR({
          data: { message: `Failed to edit message ${input.messageId}. ${error}` },
        });
      }

      if (!newMessage) {
        throw NOT_FOUND({
          data: { message: `Message ${input.messageId} not found.` },
        });
      }

      try {
        await transactionChatPublisher.publish(input.transactionId, {
          edited: true,
          incomingMessage: newMessage,
        });
      } catch (error) {
        throw INTERNAL_SERVER_ERROR({
          data: { message: `Message ${input.messageId} was edited, but publishing the edit failed. ${error}` },
        });
      }

      return { success: true, newMessage };
    }
  ),

  subscribeTransactionChat: protectedWebSocketProcedure.messaging.subscribeTransactionChat.handler(async function* ({
    input,
    context,
    signal,
    lastEventId,
    errors: { FORBIDDEN, NOT_FOUND },
  }) {
    const transaction = await TransactionService.findById(input.transactionId).select("buyer seller").lean();

    if (!transaction) {
      throw NOT_FOUND({
        data: { message: `Transaction ${input.transactionId} not found.` },
      });
    }

    if (!isTransactionParticipant(transaction, context.user.id)) {
      throw FORBIDDEN({
        data: { message: "User is not a participant in this transaction." },
      });
    }

    const iterator = transactionChatPublisher.subscribe(input.transactionId, {
      signal,
      lastEventId,
    });

    activeChatStore.setActive(context.user.id, input.transactionId);
    try {
      for await (const payload of iterator) {
        yield payload;
      }
    } finally {
      activeChatStore.clearActive(context.user.id, input.transactionId);
    }
  }),

  // Transaction Data (maybe move to different router)
  publishTransactionDataChange: protectedWebSocketProcedure.messaging.publishTransactionDataChange.handler(
    async ({ input, context, errors: { FORBIDDEN, NOT_FOUND } }) => {
      const transaction = await TransactionService.findById(input.transactionId).select("buyer seller").lean();

      if (!transaction) {
        throw NOT_FOUND({
          data: { message: `Transaction ${input.transactionId} not found.` },
        });
      }

      if (!isTransactionParticipant(transaction, context.user.id)) {
        throw FORBIDDEN({
          data: { message: "User is not a participant in this transaction." },
        });
      }

      await transactionDataPublisher.publish(input.transactionId, {
        initiatedBy: context.user.id,
      });

      return { success: true };
    }
  ),

  subscribeTransactionDataChange: protectedWebSocketProcedure.messaging.subscribeTransactionDataChange.handler(async function* ({
    input,
    context,
    signal,
    lastEventId,
    errors: { FORBIDDEN, NOT_FOUND },
  }) {
    const transaction = await TransactionService.findById(input.transactionId).select("buyer seller").lean();

    if (!transaction) {
      throw NOT_FOUND({
        data: { message: `Transaction ${input.transactionId} not found.` },
      });
    }

    if (!isTransactionParticipant(transaction, context.user.id)) {
      throw FORBIDDEN({
        data: { message: "User is not a participant in this transaction." },
      });
    }

    const iterator = transactionDataPublisher.subscribe(input.transactionId, {
      signal,
      lastEventId,
    });

    for await (const payload of iterator) {
      if (payload.initiatedBy !== context.user.id) {
        yield payload;
      }
    }
  }),
};
