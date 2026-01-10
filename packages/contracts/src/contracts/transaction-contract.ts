import { oc } from "@orpc/contract";
import { z } from "zod";
import { internalPostSchema } from "./post-contract";

const MESSAGE_MAX_LENGTH = 300;

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

export const messageSchema = z.object({
  createdAt: z.string(),
  authorEmail: z.string(), // TODO change to email
  content: z.string().max(MESSAGE_MAX_LENGTH),
});

export const embeddedPostSchema = z.object({
  _id: internalPostSchema.shape._id,
  title: internalPostSchema.shape.title,
  createdBy: internalPostSchema.shape.createdBy,
});

export const embeddedUserSchema = z.object({
  email: z.email(),
  avatarURL: z.string(), // TODO change to z.url()
});

export const transactionSchema = z.object({
  _id: z.uuidv7(),

  // Seller info (embedded)
  seller: embeddedUserSchema,
  sellerPost: embeddedPostSchema,

  // Buyer info (embedded)
  buyer: embeddedUserSchema,
  buyerPosts: z.array(embeddedPostSchema).optional(),

  // Transaction details
  dateToSwap: z.coerce.date(),
  locationToSwap: z.union([z.enum(Object.keys(PUBLIC_LOCATIONS)), z.string()]).optional(),
  messages: z.array(messageSchema),
  completed: z.boolean().default(false),
});

export const transactionContract = {
  createTransaction: oc
    .route({
      method: "POST",
    })
    .input(
      transactionSchema
        .omit({ messages: true, locationToSwap: true, _id: true, completed: true })
        .extend({ initialMessage: z.string().optional() })
    )
    .output(
      z.object({
        _id: z.uuidv7(),
      })
    )
    .errors({
      INTERNAL_SERVER_ERROR: {
        data: z.object({
          message: z.string(),
        }),
      },
      NOT_FOUND: {
        data: z.object({
          message: z.string(),
        }),
      },
      BAD_REQUEST: {
        data: z.object({
          issues: z.array(z.any()).optional(),
          message: z.string(),
        }),
      },
    }),

  deleteTransaction: oc
    .route({
      method: "DELETE",
    })
    .input(
      z.object({
        _id: z.uuidv7(),
      })
    )
    .output(
      z.object({
        success: z.boolean(),
        message: z.string(),
      })
    )
    .errors({
      INTERNAL_SERVER_ERROR: {
        data: z.object({
          message: z.string(),
        }),
      },
      NOT_FOUND: {
        data: z.object({
          message: z.string(),
        }),
      },
    }),

  getTransactions: oc
    .route({
      method: "GET",
    })
    .output(
      z.object({
        initiatedTransactions: z.array(transactionSchema),
        receivedTransactions: z.array(transactionSchema),
      })
    )
    .errors({
      NOT_FOUND: {},
      INTERNAL_SERVER_ERROR: {
        data: z.object({
          message: z.string(),
        }),
      },
    }),

  updateTransaction: oc
    .route({
      method: "PATCH",
    })
    .input(
      z.object({
        _id: z.uuidv7(),
        dateToSwap: transactionSchema.shape.dateToSwap.optional(),
        locationToSwap: transactionSchema.shape.locationToSwap.optional(),
      })
    )
    .output(
      z.object({
        success: z.boolean(),
      })
    )
    .errors({
      INTERNAL_SERVER_ERROR: {
        data: z.object({
          message: z.string(),
        }),
      },
      NOT_FOUND: {
        data: z.object({
          message: z.string(),
        }),
      },
      UNAUTHORIZED: {
        data: z.object({
          message: z.string(),
        }),
      },
    }),
};
