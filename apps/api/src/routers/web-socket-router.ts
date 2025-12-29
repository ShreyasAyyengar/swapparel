export const webSocketRouter = {
  // ping: webSocketProcedure.ping.handler(({ input }) => ({ reply: `pong: ${input.message}` })),
  //
  // counter: webSocketProcedure.counter.handler((opts) => {
  //   return (async function* () {
  //     let count = opts.input.startFrom;
  //
  //     // Send 10 updates, one per second
  //     while (!opts.signal?.aborted && count < opts.input.startFrom + 10) {
  //       yield { count };
  //       count += 1;
  //       await new Promise((resolve) => setTimeout(resolve, 1000));
  //     }
  //   })();
  // }),
};
