# Multi-Tenant Architecture for Camp Platform

## Overview
This platform is designed as a white-label SaaS solution that allows multiple camps (Burning Man, festivals, communities) to have their own isolated instances while sharing the same codebase and infrastructure.

## Core Architecture Components

### 1. Database Schema (Already Implemented)
The `Tenant` model is the foundation - every data model includes a `tenantId` field for isolation.

### 2. Tenant Identification Strategy

#### Subdomain-Based Routing (Recommended)
```
campalborz.campplatform.org    → Camp Alborz
roboticheart.campplatform.org  → Robotic Heart
distrikt.campplatform.org      → Distrikt
```

#### Custom Domain Mapping
```
campalborz.org     → Camp Alborz (via CNAME)
mycamp.com         → Custom Camp (via CNAME)
```

### 3. Implementation Plan

## Phase 1: Enhanced Database Schema

```prisma
// Add to existing schema.prisma

model Tenant {
  // ... existing fields ...
  
  // Multi-tenant configuration
  plan            TenantPlan @default(free)
  customDomain    String?    @unique
  subdomain       String     @unique
  
  // Branding
  primaryColor    String     @default("#C75D00")
  secondaryColor  String     @default("#8B4513")
  fontFamily      String     @default("Playfair Display")
  
  // Features flags
  features        Json       @default("{}")
  limits          Json       @default("{}")
  
  // Billing
  stripeCustomerId     String?
  subscriptionId       String?
  subscriptionStatus   String?
  trialEndsAt         DateTime?
  
  // Theme configuration
  theme           Theme?
}

model Theme {
  id              String   @id @default(cuid())
  tenantId        String   @unique
  
  // Colors
  colors          Json     // {"primary": "#...", "secondary": "#...", etc}
  
  // Typography
  fonts           Json     // {"heading": "...", "body": "..."}
  
  // Layout
  layout          Json     // {"navigation": "top|side", "footer": true|false}
  
  // Custom CSS
  customCss       String?  @db.Text
  
  // Assets
  heroImage       String?
  backgroundImage String?
  
  tenant          Tenant   @relation(fields: [tenantId], references: [id])
  
  @@map("themes")
}

model TenantAdmin {
  id          String   @id @default(cuid())
  tenantId    String
  userId      String
  role        AdminRole @default(admin)
  permissions Json      @default("[]")
  createdAt   DateTime  @default(now())
  
  tenant      Tenant    @relation(fields: [tenantId], references: [id])
  user        User      @relation(fields: [userId], references: [id])
  
  @@unique([tenantId, userId])
  @@map("tenant_admins")
}

enum TenantPlan {
  free        // 50 members, basic features
  starter     // 200 members, $49/month
  growth      // 1000 members, $149/month
  enterprise  // Unlimited, custom pricing
}

enum AdminRole {
  owner
  admin
  moderator
  viewer
}
```

## Phase 2: Tenant Middleware

```typescript
// packages/api/src/middleware/tenant.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

export interface TenantRequest extends Request {
  tenant?: {
    id: string;
    slug: string;
    settings: any;
    theme?: any;
  };
}

export async function tenantMiddleware(
  req: TenantRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // Extract tenant from subdomain or custom domain
    const host = req.hostname;
    let tenant;
    
    // Check for subdomain
    if (host.includes('.campplatform.org')) {
      const subdomain = host.split('.')[0];
      tenant = await prisma.tenant.findUnique({
        where: { subdomain },
        include: { theme: true }
      });
    } 
    // Check for custom domain
    else {
      tenant = await prisma.tenant.findUnique({
        where: { customDomain: host },
        include: { theme: true }
      });
    }
    
    if (!tenant || !tenant.isActive) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    // Attach tenant to request
    req.tenant = tenant;
    next();
  } catch (error) {
    next(error);
  }
}
```

## Phase 3: Tenant-Aware Authentication

```typescript
// packages/api/src/services/auth.service.ts

export class AuthService {
  async login(email: string, password: string, tenantId: string) {
    // Find user within tenant context
    const user = await prisma.user.findUnique({
      where: {
        tenantId_email: {
          tenantId,
          email
        }
      }
    });
    
    // Verify password and generate JWT with tenantId
    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign(
        { 
          userId: user.id, 
          tenantId: user.tenantId,
          email: user.email 
        },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );
      
      return { user, token };
    }
    
    throw new Error('Invalid credentials');
  }
  
  async register(data: RegisterDTO, tenantId: string) {
    // Check tenant limits
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        _count: { select: { users: true } }
      }
    });
    
    const limits = tenant?.limits as any;
    if (limits?.maxUsers && tenant._count.users >= limits.maxUsers) {
      throw new Error('Tenant user limit reached');
    }
    
    // Create user within tenant
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        tenantId
      }
    });
  }
}
```

## Phase 4: Frontend Tenant Context

```typescript
// packages/web/src/contexts/TenantContext.tsx

import { createContext, useContext, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';

interface TenantTheme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  customCss?: string;
}

interface TenantContextValue {
  tenant: {
    id: string;
    name: string;
    slug: string;
    logo?: string;
    theme: TenantTheme;
    features: Record<string, boolean>;
  } | null;
  isLoading: boolean;
}

const TenantContext = createContext<TenantContextValue | null>(null);

export function TenantProvider({ children }: { children: ReactNode }) {
  const { data: tenant, isLoading } = useQuery({
    queryKey: ['tenant'],
    queryFn: async () => {
      const response = await fetch('/api/tenant/current');
      return response.json();
    },
    staleTime: Infinity // Tenant data rarely changes
  });
  
  // Apply tenant theme
  useEffect(() => {
    if (tenant?.theme) {
      applyTheme(tenant.theme);
    }
  }, [tenant]);
  
  return (
    <TenantContext.Provider value={{ tenant, isLoading }}>
      {children}
    </TenantContext.Provider>
  );
}

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within TenantProvider');
  }
  return context;
};

// Apply dynamic theme
function applyTheme(theme: TenantTheme) {
  const root = document.documentElement;
  
  // Apply CSS variables
  root.style.setProperty('--color-primary', theme.colors.primary);
  root.style.setProperty('--color-secondary', theme.colors.secondary);
  root.style.setProperty('--font-heading', theme.fonts.heading);
  root.style.setProperty('--font-body', theme.fonts.body);
  
  // Apply custom CSS if provided
  if (theme.customCss) {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = theme.customCss;
    document.head.appendChild(styleElement);
  }
}
```

## Phase 5: Camp Onboarding Flow

```typescript
// packages/web/src/app/onboarding/page.tsx

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [campData, setCampData] = useState({
    name: '',
    subdomain: '',
    type: 'burning-man', // burning-man, festival, community, other
    description: '',
    adminEmail: '',
    adminPassword: '',
    theme: 'default',
    plan: 'free'
  });
  
  const steps = [
    { title: 'Camp Information', component: <CampInfoStep /> },
    { title: 'Choose Theme', component: <ThemeSelectionStep /> },
    { title: 'Admin Account', component: <AdminAccountStep /> },
    { title: 'Select Plan', component: <PlanSelectionStep /> },
    { title: 'Review & Launch', component: <ReviewStep /> }
  ];
  
  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/tenants/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campData)
      });
      
      const { tenant, adminUser } = await response.json();
      
      // Redirect to new tenant subdomain
      window.location.href = `https://${tenant.subdomain}.campplatform.org`;
    } catch (error) {
      console.error('Failed to create camp:', error);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-desert-sand to-warm-white">
      <div className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-4xl font-display text-burnt-sienna mb-8">
          Create Your Camp Platform
        </h1>
        
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between">
            {steps.map((s, i) => (
              <div 
                key={i}
                className={`flex-1 h-2 mx-1 rounded ${
                  i < step ? 'bg-antique-gold' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
        
        {/* Current step */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          {steps[step - 1].component}
        </div>
        
        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button 
            onClick={() => setStep(step - 1)}
            disabled={step === 1}
            className="btn-secondary"
          >
            Previous
          </button>
          
          {step === steps.length ? (
            <button onClick={handleSubmit} className="btn-primary">
              Launch Your Platform
            </button>
          ) : (
            <button onClick={() => setStep(step + 1)} className="btn-primary">
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

## Phase 6: Tenant Admin Dashboard

```typescript
// packages/web/src/app/admin/tenant/page.tsx

export default function TenantAdminDashboard() {
  const { tenant } = useTenant();
  
  return (
    <AdminLayout>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Branding */}
        <Card>
          <h3>Camp Branding</h3>
          <BrandingEditor tenant={tenant} />
        </Card>
        
        {/* Theme Customization */}
        <Card>
          <h3>Theme Settings</h3>
          <ThemeCustomizer tenant={tenant} />
        </Card>
        
        {/* Domain Settings */}
        <Card>
          <h3>Domain Configuration</h3>
          <DomainSettings tenant={tenant} />
        </Card>
        
        {/* User Management */}
        <Card>
          <h3>Members</h3>
          <MembersList tenantId={tenant.id} />
        </Card>
        
        {/* Billing */}
        <Card>
          <h3>Subscription & Billing</h3>
          <BillingManagement tenant={tenant} />
        </Card>
        
        {/* Features */}
        <Card>
          <h3>Feature Settings</h3>
          <FeatureFlags tenant={tenant} />
        </Card>
      </div>
    </AdminLayout>
  );
}
```

## Phase 7: API Routes with Tenant Isolation

```typescript
// packages/api/src/routers/tenant.router.ts

export const tenantRouter = router({
  // Get current tenant info
  current: publicProcedure
    .use(tenantMiddleware)
    .query(async ({ ctx }) => {
      return ctx.tenant;
    }),
  
  // Create new tenant (public registration)
  create: publicProcedure
    .input(z.object({
      name: z.string(),
      subdomain: z.string(),
      adminEmail: z.string().email(),
      adminPassword: z.string().min(8),
      plan: z.enum(['free', 'starter', 'growth', 'enterprise'])
    }))
    .mutation(async ({ input }) => {
      // Create tenant
      const tenant = await prisma.tenant.create({
        data: {
          name: input.name,
          subdomain: input.subdomain,
          slug: input.subdomain,
          plan: input.plan,
          settings: getDefaultSettings(input.plan)
        }
      });
      
      // Create admin user
      const hashedPassword = await bcrypt.hash(input.adminPassword, 10);
      const adminUser = await prisma.user.create({
        data: {
          tenantId: tenant.id,
          email: input.adminEmail,
          password: hashedPassword,
          firstName: 'Admin',
          lastName: input.name
        }
      });
      
      // Create tenant admin role
      await prisma.tenantAdmin.create({
        data: {
          tenantId: tenant.id,
          userId: adminUser.id,
          role: 'owner'
        }
      });
      
      return { tenant, adminUser };
    }),
  
  // Update tenant settings
  update: protectedProcedure
    .use(requireTenantAdmin)
    .input(z.object({
      name: z.string().optional(),
      logo: z.string().optional(),
      settings: z.any().optional(),
      theme: z.any().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      return prisma.tenant.update({
        where: { id: ctx.tenant.id },
        data: input
      });
    })
});
```

## Phase 8: Deployment Architecture

### Subdomain Routing with Vercel

```json
// vercel.json
{
  "rewrites": [
    {
      "source": "/:path*",
      "has": [
        {
          "type": "host",
          "value": "(?<subdomain>.*)\\.campplatform\\.org"
        }
      ],
      "destination": "/api/tenant/:path*"
    }
  ]
}
```

### Environment Variables

```bash
# .env.example

# Multi-tenant configuration
PLATFORM_DOMAIN=campplatform.org
ENABLE_CUSTOM_DOMAINS=true
DEFAULT_TENANT_PLAN=free

# Limits per plan
FREE_PLAN_USER_LIMIT=50
STARTER_PLAN_USER_LIMIT=200
GROWTH_PLAN_USER_LIMIT=1000

# Feature flags
ENABLE_ONBOARDING=true
ENABLE_WHITE_LABEL=true
```

## Phase 9: Billing Integration

```typescript
// packages/api/src/services/billing.service.ts

export class BillingService {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  
  async createCustomer(tenant: Tenant, email: string) {
    const customer = await this.stripe.customers.create({
      email,
      metadata: { tenantId: tenant.id }
    });
    
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: { stripeCustomerId: customer.id }
    });
    
    return customer;
  }
  
  async createSubscription(tenantId: string, plan: TenantPlan) {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId }
    });
    
    const priceId = this.getPriceId(plan);
    
    const subscription = await this.stripe.subscriptions.create({
      customer: tenant.stripeCustomerId,
      items: [{ price: priceId }],
      trial_period_days: 14
    });
    
    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        subscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
        plan
      }
    });
    
    return subscription;
  }
  
  private getPriceId(plan: TenantPlan): string {
    const prices = {
      free: null,
      starter: process.env.STRIPE_STARTER_PRICE_ID,
      growth: process.env.STRIPE_GROWTH_PRICE_ID,
      enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID
    };
    return prices[plan];
  }
}
```

## Migration Path for Existing Camps

1. **Data Migration Script**
```typescript
// scripts/migrate-to-multitenant.ts

async function migrateCampAlborz() {
  // Create Camp Alborz tenant
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Camp Alborz',
      slug: 'campalborz',
      subdomain: 'campalborz',
      customDomain: 'campalborz.org',
      plan: 'enterprise',
      settings: {
        established: 2008,
        location: 'Black Rock City',
        theme: 'persian-culture'
      }
    }
  });
  
  // Migrate existing users
  await prisma.user.updateMany({
    data: { tenantId: tenant.id }
  });
  
  // Migrate other data...
  console.log('Migration complete!');
}
```

## Benefits of This Architecture

1. **Complete Isolation**: Each camp's data is completely separated
2. **Shared Codebase**: All camps benefit from updates and improvements
3. **Custom Branding**: Each camp can have its own look and feel
4. **Scalable**: Can handle hundreds of camps on the same infrastructure
5. **Cost-Effective**: Shared resources reduce per-camp costs
6. **Easy Onboarding**: New camps can be set up in minutes
7. **Flexible Pricing**: Different plans for different camp sizes

## Security Considerations

1. **Row-Level Security**: All queries must include tenantId
2. **API Key per Tenant**: Each tenant gets unique API keys
3. **Subdomain Isolation**: Cookies scoped to subdomains
4. **Rate Limiting**: Per-tenant rate limits
5. **Data Encryption**: Tenant data encrypted at rest
6. **Audit Logging**: Track all tenant admin actions