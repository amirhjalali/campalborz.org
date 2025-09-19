export const PLANS = {
  STARTER: {
    id: "starter",
    name: "Starter",
    price: 29,
    maxMembers: 50,
    maxEvents: 10,
    maxStorage: 1000, // 1GB in MB
    features: [
      "memberManagement",
      "eventManagement",
      "basicReporting",
    ],
  },
  PROFESSIONAL: {
    id: "professional",
    name: "Professional",
    price: 99,
    maxMembers: 200,
    maxEvents: 50,
    maxStorage: 5000, // 5GB
    features: [
      "memberManagement",
      "eventManagement",
      "taskManagement",
      "resourceManagement",
      "paymentProcessing",
      "advancedReporting",
      "emailIntegration",
    ],
  },
  ENTERPRISE: {
    id: "enterprise",
    name: "Enterprise",
    price: 299,
    maxMembers: 1000,
    maxEvents: 200,
    maxStorage: 20000, // 20GB
    features: [
      "memberManagement",
      "eventManagement",
      "taskManagement",
      "resourceManagement",
      "paymentProcessing",
      "customBranding",
      "apiAccess",
      "advancedReporting",
      "prioritySupport",
      "sso",
      "webhooks",
    ],
  },
  CUSTOM: {
    id: "custom",
    name: "Custom",
    price: null,
    maxMembers: null,
    maxEvents: null,
    maxStorage: null,
    features: ["all"],
  },
} as const;

export type PlanId = keyof typeof PLANS;