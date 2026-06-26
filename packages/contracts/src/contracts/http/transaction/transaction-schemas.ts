import { z } from "zod";
import { postSchema } from "../post/post-schemas";
import { userSchema } from "../user/user-schemas";

export const PUBLIC_LOCATIONS = {
  C9_JRL_DINING_HALL: {
    name: "C9/JRL Dining Hall",
    embed_url:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3186.3781794098504!2d-122.06040882326947!3d37.0007733563661!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808e410a5df1fe0d%3A0x5f5ceef5d651e6ca!2sCollege%20Nine%2FJohn%20R.%20Lewis%20Dining%20Hall!5e0!3m2!1sen!2sus!4v1767933411168!5m2!1sen!2sus",
  },
  STEVENSON_COWELL_DINING_HALL: {
    name: "Stevenson/Cowell Dining Hall",
    embed_url:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d446.31102314669994!2d-122.0534344934366!3d36.996891203228806!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808e4109b8cbf3a9%3A0xc5950288a06e1e5b!2sEast%20Rd%2C%20Santa%20Cruz%2C%20CA%2095064!5e0!3m2!1sen!2sus!4v1767937652439!5m2!1sen!2sus",
  },
  CROWN_MERRILL_DINING_HALL: {
    name: "Crown/Merrill Dining Hall",
    embed_url:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d265.17977978326667!2d-122.05455638958514!3d37.00007047064221!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808e41a75b2ff18b%3A0x8f6e287bd3f7ade3!2sCrown%2FMerrill%20Dining%20Hall!5e0!3m2!1sen!2sus!4v1767937701775!5m2!1sen!2sus",
  },
  PORTER_KRESGE_DINING_HALL: {
    name: "Porter/Kresge Dining Hall",
    embed_url:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d218.50905171047577!2d-122.06604398574198!3d36.99423569807727!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808e419e8ff298a9%3A0xc0cc7592fcea39a0!2sPorter%2FKresge%20Dining%20Hall!5e0!3m2!1sen!2sus!4v1767937759273!5m2!1sen!2sus",
  },
  OAKES_RACHEL_DINING_HALL: {
    name: "Oakes/Rachel Carson Dining Hall",
    embed_url:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d218.50905171047577!2d-122.06604398574198!3d36.99423569807727!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808e419940c684cb%3A0x27fb53a425d50bfd!2sRachel%20Carson%2FOakes%20Dining%20Hall!5e0!3m2!1sen!2sus!4v1767937785306!5m2!1sen!2sus",
  },
  EAST_FIELD: {
    name: "East Field",
    embed_url:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d384.55430510719964!2d-122.0535374093298!3d36.99508557156394!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808e419940c684cb%3A0x27fb53a425d50bfd!2sRachel%20Carson%2FOakes%20Dining%20Hall!5e0!3m2!1sen!2sus!4v1767937827705!5m2!1sen!2sus",
  },
  QUARRY_PLAZA: {
    name: "Quarry Plaza",
    embed_url:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d285.91188517085675!2d-122.05583259203779!3d36.997732774711906!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808e41a129678157%3A0x8e8bf280410db45a!2sUCSC%20Quarry%20Plaza!5e0!3m2!1sen!2sus!4v1767937858240!5m2!1sen!2sus",
  },
};

export const transactionPartySchema = z.object({
  userId: userSchema.shape._id,
  emailSnapshot: z.email(),
  avatarUrlSnapshot: z.url().optional(),
});

export const transactionItemSchema = z.object({
  postId: postSchema.shape._id,
  titleSnapshot: postSchema.shape.title,
});

export const transactionStatusSchema = z.enum(["ongoing", "completed", "cancelled"]);

export const transactionSchema = z.object({
  _id: z.uuidv7(),

  seller: transactionPartySchema,
  buyer: transactionPartySchema,

  sellerPosts: z.array(transactionItemSchema),
  buyerPosts: z.array(transactionItemSchema),

  scheduledFor: z.date(),
  location: z.string().trim().min(1).optional(),

  status: transactionStatusSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});
