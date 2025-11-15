import { internalPostSchema } from "@swapparel/contracts";

export const data = internalPostSchema.parse([
  {
    _id: "e842525d-fe2d-4003-a88a-8e1c7da5d436",
    createdBy: "test@example.com",
    description: "Test post",
    colour: "red",
    size: "M",
    material: ["canvas"],
    images: ["https://example.com/image.jpg"],
    hashtags: [],
    qaEntries: [],
  },
]);
