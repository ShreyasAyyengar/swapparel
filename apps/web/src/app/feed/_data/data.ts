import { internalPostSchema } from "@swapparel/contracts";

export const data = internalPostSchema.parse({
  _id: "e842525d-fe2d-4003-a88a-8e1c7da5d436",
  createdBy: "test@example.com",
  description: "Test post",
  colour: "red",
  size: "M",
  material: ["canvas"],
  images: ["https://static5.depositphotos.com/1039098/528/i/450/depositphotos_5288227-Happy-Indian-man-smiling.jpg"],
  hashtags: [],
  qaEntries: [],
});
