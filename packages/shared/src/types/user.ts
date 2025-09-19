import { z } from "zod";

export const UserSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  email: z.string().email(),
  name: z.string(),
  avatar: z.string().optional(),
  role: z.enum(["super_admin", "tenant_admin", "admin", "moderator", "member"]),
  status: z.enum(["active", "inactive", "pending", "suspended"]),
  permissions: z.array(z.string()),
  metadata: z.record(z.any()).optional(),
  lastLoginAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;

export const CreateUserSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
});

export type CreateUser = z.infer<typeof CreateUserSchema>;