import type { internalPostSchema, transactionSchemaWithAvatar } from "@swapparel/contracts";
import type { z } from "zod";
import { create } from "zustand/react";

type ActiveTradeStore = {
  activeTrade:
    | {
        post: z.infer<typeof internalPostSchema>;
        transaction: z.infer<typeof transactionSchemaWithAvatar>;
      }
    | undefined;
  setActiveTrade: (
    trade: { post: z.infer<typeof internalPostSchema>; transaction: z.infer<typeof transactionSchemaWithAvatar> } | undefined
  ) => void;
};

export const useActiveTradeStore = create<ActiveTradeStore>((set) => ({
  activeTrade: undefined,
  setActiveTrade: (trade) => set({ activeTrade: trade }),
}));
