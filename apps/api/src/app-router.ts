import { publicProcedure } from "./libs/orpc";

export const appRouter = {
  hello: publicProcedure.hello.sayHello.handler(() => "Hello, World!"),
};
