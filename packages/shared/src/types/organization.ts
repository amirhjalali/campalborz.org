import { z } from "zod";

export const OrganizationSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  name: z.string(),
  type: z.enum(["camp", "festival", "collective", "community", "other"]),
  description: z.string().optional(),
  logo: z.string().optional(),
  website: z.string().url().optional(),
  location: z.string().optional(),
  settings: z.object({
    memberRoles: z.array(z.object({
      name: z.string(),
      permissions: z.array(z.string()),
    })),
    membershipTypes: z.array(z.object({
      name: z.string(),
      price: z.number().optional(),
      duration: z.number().optional(), // in days
      benefits: z.array(z.string()),
    })),
    eventTypes: z.array(z.string()),
    taskCategories: z.array(z.string()),
    resourceCategories: z.array(z.string()),
  }),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Organization = z.infer<typeof OrganizationSchema>;

export const CreateOrganizationSchema = OrganizationSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateOrganization = z.infer<typeof CreateOrganizationSchema>;