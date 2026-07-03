import type { z } from "zod";

type uuidv7 = z.infer<typeof z.uuidv7>;

const activeChats = new Map<uuidv7, Set<uuidv7>>();

export const activeChatStore = {
  setActive(userId: uuidv7, transactionId: uuidv7) {
    const chats = activeChats.get(userId) ?? new Set();
    chats.add(transactionId);
    activeChats.set(userId, chats);
  },

  clearActive(userId: uuidv7, transactionId: uuidv7) {
    const chats = activeChats.get(userId);
    if (!chats) return;
    chats.delete(transactionId);
    if (chats.size === 0) activeChats.delete(userId);
  },

  isActive(userId: uuidv7, transactionId: uuidv7): boolean {
    return activeChats.get(userId)?.has(transactionId) ?? false;
  },
};
