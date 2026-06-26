import type { transactionSchema } from "@swapparel/contracts";
import type { z } from "zod";
import { create } from "zustand/react";

type ActiveTradeStore = {
  activeTradeId: z.infer<typeof transactionSchema.shape._id> | undefined;
  setActiveTradeId: (tradeId: z.infer<typeof transactionSchema.shape._id> | undefined) => void;
};

export const useActiveTradeStore = create<ActiveTradeStore>((set) => ({
  activeTradeId: undefined,
  setActiveTradeId: (tradeId) => set({ activeTradeId: tradeId }),
}));
