const activeChats = new Map<string, Set<string>>();

export const activeChatStore = {
  setActive(userId: string, transactionId: string) {
    const chats = activeChats.get(userId) ?? new Set();
    chats.add(transactionId);
    activeChats.set(userId, chats);
  },

  clearActive(userId: string, transactionId: string) {
    const chats = activeChats.get(userId);
    if (!chats) return;
    chats.delete(transactionId);
    if (chats.size === 0) activeChats.delete(userId);
  },

  isActive(userId: string, transactionId: string): boolean {
    return activeChats.get(userId)?.has(transactionId) ?? false;
  },
};
