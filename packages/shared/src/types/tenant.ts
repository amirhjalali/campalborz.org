import { z } from "zod";

export const TenantSchema = z.object({
  id: z.string(),
  name: z.string(),
  subdomain: z.string(),
  domain: z.string().optional(),
  status: z.enum(["active", "inactive", "suspended"]),
  plan: z.enum(["starter", "professional", "enterprise", "custom"]),
  settings: z.object({
    branding: z.object({
      primaryColor: z.string(),
      secondaryColor: z.string(),
      logo: z.string().optional(),
      favicon: z.string().optional(),
    }),
    features: z.object({
      memberManagement: z.boolean(),
      eventManagement: z.boolean(),
      taskManagement: z.boolean(),
      resourceManagement: z.boolean(),
      paymentProcessing: z.boolean(),
      customBranding: z.boolean(),
      apiAccess: z.boolean(),
    }),
    limits: z.object({
      maxMembers: z.number(),
      maxEvents: z.number(),
      maxStorage: z.number(), // in MB
    }),
  }),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Tenant = z.infer<typeof TenantSchema>;

export const CreateTenantSchema = TenantSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateTenant = z.infer<typeof CreateTenantSchema>;