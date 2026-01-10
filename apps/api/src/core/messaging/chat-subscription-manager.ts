import type { messageSchema } from "@swapparel/contracts";
import type { z } from "zod";

type Message = z.infer<typeof messageSchema>;
type Subscriber = (message: Message) => void;

class TransactionSubscriptionManager {
  private subscribers: Map<string, Set<Subscriber>> = new Map();

  /**
   * Subscribe to transaction updates
   * @param transactionId - The transaction to watch
   * @param callback - Function to call when new messages arrive
   * @returns Unsubscribe function
   */
  subscribe(transactionId: string, callback: Subscriber): () => void {
    if (!this.subscribers.has(transactionId)) {
      this.subscribers.set(transactionId, new Set());
    }

    this.subscribers.get(transactionId)!.add(callback);

    // Return unsubscribe function
    return () => {
      const subs = this.subscribers.get(transactionId);
      if (subs) {
        subs.delete(callback);
        // Clean up empty sets
        if (subs.size === 0) {
          this.subscribers.delete(transactionId);
        }
      }
    };
  }

  /**
   * Notify all subscribers of a transaction about a new message
   */
  notify(transactionId: string, message: Message): void {
    const subs = this.subscribers.get(transactionId);
    if (subs) {
      subs.forEach((callback) => callback(message));
    }
  }

  /**
   * Get count of active subscribers for a transaction
   */
  getSubscriberCount(transactionId: string): number {
    return this.subscribers.get(transactionId)?.size ?? 0;
  }

  /**
   * Get all active transaction IDs being watched
   */
  getActiveTransactions(): string[] {
    return Array.from(this.subscribers.keys());
  }
}

// Singleton instance
export const transactionSubscriptionManager = new TransactionSubscriptionManager();
