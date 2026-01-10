import type { transactionSchema } from "@swapparel/contracts";
import type { z } from "zod";
import { create } from "zustand/react";

type ActiveTradeStore = {
  activeTrade: z.infer<typeof transactionSchema> | undefined;
  setActiveTrade: (trade: z.infer<typeof transactionSchema> | undefined) => void;
};

export const useActiveTradeStore = create<ActiveTradeStore>((set) => ({
  activeTrade: undefined,
  setActiveTrade: (trade) => set({ activeTrade: trade }),
}));
