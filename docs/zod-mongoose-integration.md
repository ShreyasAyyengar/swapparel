# Zod + Mongoose Integration Guide

This guide demonstrates multiple approaches to integrate Zod schema validation with Mongoose models in your TypeScript application.

## Overview

We've enhanced the User model with proper Zod validation, including email format validation using `z.string().email()`. Here are the different
integration approaches available:

## Updated Zod Schema

First, we updated the Zod schema in `packages/contracts/src/zod/user.ts`:

```typescript
export const user = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  emailVerified: z.boolean(),
  image: z.string().url().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
```

## Approach 1: Using @zodyac/zod-mongoose (Recommended)

**File:** `apps/api/src/models/user.model.ts`

This is the most seamless approach. The `@zodyac/zod-mongoose` package automatically converts your Zod schema to a Mongoose schema.

```typescript
import { zodSchema } from "@zodyac/zod-mongoose";
import { user } from "../../../packages/contracts/src/zod/user";

// Create Mongoose schema from Zod schema
const UserSchema = zodSchema(user)
  .add({
    _id: { type: Schema.Types.ObjectId, auto: true },
  })
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .toSchema({
    timestamps: true,
    versionKey: false,
    collection: 'users',
    toJSON: standardToJSON,
  });
```

**Pros:**

- Automatic validation during save/update operations
- Single source of truth for schema definition
- Type safety throughout the stack
- Minimal boilerplate

**Cons:**

- Requires the `@zodyac/zod-mongoose` package
- Less control over validation timing

## Approach 2: Manual Mongoose Schema with Zod Middleware

**File:** `apps/api/src/models/user-validation-examples.ts`

This approach uses traditional Mongoose schemas with Zod validation added as middleware.

```typescript
const UserSchemaManual = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  emailVerified: { type: Boolean, required: true, default: false },
  image: { type: String, required: false },
}, {
  timestamps: true,
  versionKey: false,
  collection: 'users',
  toJSON: standardToJSON,
});

// Add Zod validation as pre-save middleware
UserSchemaManual.pre('save', function (next) {
  try {
    const docObject = this.toObject();
    const validationData = {
      id: docObject._id?.toString(),
      name: docObject.name,
      email: docObject.email,
      emailVerified: docObject.emailVerified,
      image: docObject.image,
      createdAt: docObject.createdAt,
      updatedAt: docObject.updatedAt,
    };

    userSchema.parse(validationData);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const mongooseError = new ValidationError(error.message);
      mongooseError.message = `Zod validation failed: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`;
      next(mongooseError);
    } else {
      next(error as Error);
    }
  }
});
```

**Pros:**

- Full control over validation timing
- Can use existing Mongoose features
- Clear separation of concerns

**Cons:**

- More boilerplate code
- Manual mapping between Mongoose and Zod schemas
- Potential for schema drift

## Approach 3: Validation Functions for Manual Checking

**File:** `apps/api/src/models/user-validation-examples.ts`

This approach provides utility functions for manual validation before or after database operations.

```typescript
export const UserValidator = {
  validateCreate(userData: unknown): asserts userData is z.infer<typeof userSchema> {
    userSchema.parse(userData);
  },

  validateUpdate(userData: unknown) {
    const partialUserSchema = userSchema.partial();
    partialUserSchema.parse(userData);
  },

  validateDocument(doc: UserManual): boolean {
    try {
      const docObject = doc.toObject();
      const validationData = {
        id: docObject._id?.toString(),
        name: docObject.name,
        email: docObject.email,
        emailVerified: docObject.emailVerified,
        image: docObject.image,
        createdAt: docObject.createdAt,
        updatedAt: docObject.updatedAt,
      };

      userSchema.parse(validationData);
      return true;
    } catch {
      return false;
    }
  },
} as const;
```

**Pros:**

- Flexible validation timing
- Can be used for data integrity checks
- Good for migrations and data cleanup

**Cons:**

- Requires manual invocation
- No automatic validation protection

## Approach 4: Custom Schema Types

**File:** `apps/api/src/models/user-validation-examples.ts`

This approach creates custom Mongoose schema types that embed Zod validation directly.

```typescript
class ZodStringType extends SchemaType {
  private readonly zodValidator: z.ZodString;

  constructor(key: string, options: Record<string, unknown>, zodValidator: z.ZodString) {
    super(key, options, "String");
    this.zodValidator = zodValidator;
  }

  cast(val: unknown) {
    const result = this.zodValidator.safeParse(val);
    if (!result.success) {
      throw new Error(`Zod validation failed: ${result.error.errors.map((e) => e.message).join(", ")}`);
    }
    return result.data;
  }

  validate(value: unknown, _options: Record<string, unknown>) {
    try {
      this.zodValidator.parse(value);
      return true;
    } catch {
      return false;
    }
  }
}

// Usage
const UserSchemaCustom = new Schema({
  name: { type: String, required: true },
  email: {
    type: ZodStringType,
    required: true,
    zodValidator: z.string().email("Invalid email format")
  },
  // ... other fields
});
```

**Pros:**

- Field-level validation
- Reusable across different schemas
- Integrates deeply with Mongoose

**Cons:**

- Complex implementation
- More maintenance overhead
- Limited documentation

## Usage Examples

**File:** `apps/api/src/services/user.service.ts`

### Creating Users with Automatic Validation

```typescript
// Approach 1: Using @zodyac/zod-mongoose (Recommended)
const newUser = await UserService.createUserWithZodIntegration({
  name: "John Doe",
  email: "john@example.com", // Will be validated as email
  emailVerified: true,
  image: "https://example.com/avatar.jpg"
});
```

### Safe Creation with Error Handling

```typescript
try {
  const user = await UserService.safeCreateUser({
    name: "Jane Doe",
    email: "jane@example.com",
  });
} catch (error) {
  if (error.message.includes('Validation failed')) {
    // Handle validation errors
    console.error('Validation error:', error.message);
  }
}
```

### Validating Existing Data

```typescript
// Check all users for schema compliance
const validationReport = await UserService.validateAllUsers();
console.log(`Found ${validationReport.invalidUsers.length} invalid users`);

// Validate a specific user after retrieval
const user = await UserService.getUserAndValidate(userId);
```

## Recommendations

### For New Projects

Use **Approach 1 (@zodyac/zod-mongoose)** because:

- It provides the best developer experience
- Automatic validation prevents data integrity issues
- Single source of truth for schemas
- Minimal boilerplate

### For Existing Projects

Consider **Approach 2 (Manual Middleware)** if:

- You have existing Mongoose schemas
- You need fine-grained control over validation timing
- You want to gradually adopt Zod validation

### For Data Integrity

Use **Approach 3 (Validation Functions)** for:

- Data migrations
- Batch validation operations
- Health checks and data audits

## Error Handling

All approaches provide detailed error messages from Zod validation:

```typescript
try {
  userSchema.parse(invalidData);
} catch (error) {
  if (error instanceof z.ZodError) {
    // Example error: "email: Invalid email format"
    const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
  }
}
```

## Performance Considerations

- **Approach 1**: Minimal overhead, validation happens during Mongoose operations
- **Approach 2**: Slight overhead from middleware, but negligible for most use cases
- **Approach 3**: No overhead until explicitly called
- **Approach 4**: Field-level validation, good performance for large documents

## Testing

All approaches are testable. Here's an example test for Approach 1:

```typescript
describe('User Model Validation', () => {
  it('should validate email format', async () => {
    const invalidUser = new UserModel({
      name: 'Test User',
      email: 'invalid-email', // Invalid email
    });

    await expect(invalidUser.save()).rejects.toThrow(/Zod validation failed/);
  });

  it('should accept valid email', async () => {
    const validUser = new UserModel({
      name: 'Test User',
      email: 'test@example.com', // Valid email
    });

    const saved = await validUser.save();
    expect(saved.email).toBe('test@example.com');
  });
});
```

## Migration Strategy

If you're migrating from plain Mongoose to Zod validation:

1. **Start with Approach 3** to validate existing data
2. **Gradually adopt Approach 2** for critical models
3. **Eventually migrate to Approach 1** for new development

This ensures data integrity while minimizing disruption to existing functionality.