import { transactionDataPublisher, transactionPublisher } from "../core/messaging/chat-subscription-manager";
import { TransactionCollection } from "../core/swap/transaction-schema";
import { protectedWebSocketProcedure } from "../libs/orpc-procedures";

export const webSocketRouter = {
  publishChatMessage: protectedWebSocketProcedure.publishChatMessage.handler(async ({ input, context }) => {
    const { transactionId, message } = input;

    const outgoingMessage = {
      createdAt: new Date().toISOString(),
      authorEmail: context.user.email,
      content: message.content,
    };

    const result = await TransactionCollection.updateOne({ _id: transactionId }, { $push: { messages: outgoingMessage } });

    if (result.modifiedCount === 1) {
      await transactionPublisher.publish(transactionId, { incomingMessage: outgoingMessage });

      return { outgoingMessage };
    }

    throw new Error("Failed to send message");
  }),

  subscribeToChatMessages: protectedWebSocketProcedure.subscribeToChatMessages.handler(async function* ({ input, signal, lastEventId }) {
    const transaction = await TransactionCollection.findById(input.transactionId);

    if (!transaction) throw new Error("Transaction not found");

    const iterator = transactionPublisher.subscribe(input.transactionId, {
      signal,
      lastEventId,
    });

    for await (const payload of iterator) {
      yield payload;
    }
  }),

  publishDataChange: protectedWebSocketProcedure.publishDataChange.handler(async ({ input, context, errors: { NOT_FOUND } }) => {
    const { transactionId } = input;
    const transaction = await TransactionCollection.findById(transactionId);

    if (!transaction) throw NOT_FOUND({ data: { message: "Transaction not found." } });

    await transactionDataPublisher.publish(transactionId, {
      initiatedBy: context.user.email,
    });

    return { success: true };
  }),

  subscribeToDataChange: protectedWebSocketProcedure.subscribeToDataChange.handler(async function* ({ input, context, signal, lastEventId }) {
    const iterator = transactionDataPublisher.subscribe(input.transactionId, {
      signal,
      lastEventId,
    });

    for await (const payload of iterator) {
      if (payload.initiatedBy === context.user.email) continue;

      yield payload;
    }
  }),
};
