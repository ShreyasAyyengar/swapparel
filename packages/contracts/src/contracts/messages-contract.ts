import { z } from "zod";

export const messagesContract = {
  messageSend: z.object({
    .route({
      method: "POST",
    })
  }
)
}
