import { publicProcedure } from "./libs/orpc";

let count = 0;
export const appRouter = {
  counter: {
    count: publicProcedure.counter.count.handler(async () => count.toString()),
    increment: publicProcedure.counter.increment.handler(() => ++count),
    decrement: publicProcedure.counter.decrement.handler(() => --count),
  },
};
