import type { userSchema } from "@swapparel/contracts";
import type { z } from "zod";
import { create } from "zustand/react";

type ActiveConversationStore = {
  activeConversation: z.infer<typeof userSchema.shape._id> | undefined;
  setActiveConversation: (conversation: z.infer<typeof userSchema.shape._id> | undefined) => void;
};

export const useActiveConversationStore = create<ActiveConversationStore>((set) => ({
  activeConversation: undefined,
  setActiveConversation: (conversation) => set({ activeConversation: conversation }),
}));
