import type { messageSchema, transactionSchema } from "@swapparel/contracts";
import { v7 as uuidv7 } from "uuid";
import type { z } from "zod";
import { protectedWebSocketProcedure } from "../../libs/orpc-procedures";
import { TransactionService } from "../swap/transaction-service";
import { transactionChatPublisher, transactionDataPublisher } from "./chat-subscription-manager";
import { MessageService } from "./messaging-service";

type Transaction = z.infer<typeof transactionSchema>;

const isTransactionParticipant = (transaction: Pick<Transaction, "buyer" | "seller">, userId: string) =>
  transaction.buyer.userId === userId || transaction.seller.userId === userId;

export const messagingRouter = {
  // Messaging
  publishChatMessage: protectedWebSocketProcedure.messaging.publishChatMessage.handler(
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

      const message: z.infer<typeof messageSchema> = {
        _id: uuidv7(),
        content: [input.message],
        transactionId: input.transactionId,
        authorId: context.user.id,
        createdAt: new Date(),
      };

      try {
        await MessageService.insertOne(message);
        await transactionChatPublisher.publish(input.transactionId, {
          edited: false,
          incomingMessage: message,
        });

        return { success: true, message };
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

    for await (const payload of iterator) {
      yield payload;
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
