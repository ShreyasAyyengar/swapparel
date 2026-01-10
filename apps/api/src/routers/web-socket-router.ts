import { transactionSubscriptionManager } from "../core/messaging/chat-subscription-manager";
import { TransactionCollection } from "../core/swap/transaction-schema";
import { protectedWebSocketProcedure } from "../libs/orpc-procedures";

export const webSocketRouter = {
  sendMessage: protectedWebSocketProcedure.sendMessage.handler(async ({ input, context }) => {
    const { transactionId, message } = input;

    const outgoingMessage = {
      createdAt: new Date().toISOString(),
      authorEmail: context.user.email,
      content: message.content,
    };

    const result = await TransactionCollection.updateOne({ _id: transactionId }, { $push: { messages: outgoingMessage } });

    if (result.modifiedCount === 1) {
      transactionSubscriptionManager.notify(transactionId, outgoingMessage);

      return { outgoingMessage };
    }

    throw new Error("Failed to send message");
  }),

  watchingTransaction: protectedWebSocketProcedure.watchingTransaction.handler(async ({ input, context, signal }) => {
    const transaction = await TransactionCollection.findById(input.transactionId);

    if (!transaction) throw new Error("Transaction not found");

    console.log("User watching transaction:", {
      transactionId: input.transactionId,
      userEmail: context.user.email,
    });

    // Return an async generator that yields messages
    return (async function* () {
      const messageQueue: any[] = [];
      let resolveNext: (() => void) | null = null;

      // Subscribe to new messages
      const unsubscribe = transactionSubscriptionManager.subscribe(input.transactionId, (message) => {
        messageQueue.push({ incomingMessage: message });
        if (resolveNext) {
          resolveNext();
          resolveNext = null;
        }
      });

      // Clean up on disconnect
      signal?.addEventListener("abort", () => {
        unsubscribe();
        console.log("User stopped watching transaction:", {
          transactionId: input.transactionId,
          userEmail: context.user?.email,
        });
      });

      try {
        while (!signal?.aborted) {
          if (messageQueue.length > 0) {
            yield messageQueue.shift();
          } else {
            await new Promise<void>((resolve) => {
              resolveNext = resolve;
              signal?.addEventListener("abort", () => resolve(), { once: true });
            });
          }
        }
      } finally {
        unsubscribe();
      }
    })();
  }),
};
