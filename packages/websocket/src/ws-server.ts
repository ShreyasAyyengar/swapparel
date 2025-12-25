import type { ServerWebSocket } from "@orpc/server/bun-ws";

export function handlerUser(ws: ServerWebSocket, message: string) {
  //TODO: complete handler for message
}
export function handlerMessage(ws: ServerWebSocket, message: string) {
  //TODO: complete handler for message
}

const user = {
  roomTest: "Room 1",
  testName: "Gerardo",
};
export type User = typeof user;

const firstMessageTest = "Hello World!";
const exitMessageTest = "Trade complete: Messaging for this trade has ended.";

const wsServer = Bun.serve<User>({
  fetch(req, server) {
    if (server.upgrade(req, { data: { ...user } })) {
      return; //NTS: DO NOT return anything
    }
    return new Response("Upgrade failed", { status: 500 });
  },
  websocket: {
    open(ws) {
      ws.send(firstMessageTest);
    },
    message(ws, message) {
      ws.publish(ws.data.roomTest, message);
    },
    close(ws) {
      ws.unsubscribe(ws.data.roomTest);
      wsServer.publish(ws.data.roomTest, exitMessageTest);
    },
  },
});
