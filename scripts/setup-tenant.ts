import { PrismaClient } from "@prisma/client";
import { PLANS, ROLE_PERMISSIONS } from "@camp-platform/shared";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function setupTenant() {
  try {
    console.log("🏕️  Setting up Camp Alborz as initial tenant...");

    // Create Camp Alborz tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: "Camp Alborz",
        subdomain: "campalborz",
        status: "ACTIVE",
        plan: "PROFESSIONAL",
        settings: {
          branding: {
            primaryColor: "#8B5A3C", // Persian brown
            secondaryColor: "#D4AF37", // Persian gold
            logo: "",
            favicon: "",
          },
          features: {
            memberManagement: true,
            eventManagement: true,
            taskManagement: true,
            resourceManagement: true,
            paymentProcessing: true,
            customBranding: false,
            apiAccess: false,
          },
          limits: {
            maxMembers: PLANS.PROFESSIONAL.maxMembers,
            maxEvents: PLANS.PROFESSIONAL.maxEvents,
            maxStorage: PLANS.PROFESSIONAL.maxStorage,
          },
        },
      },
    });

    console.log(`✅ Tenant created: ${tenant.name} (${tenant.subdomain})`);

    // Create admin user
    const passwordHash = await bcrypt.hash("admin123", 12);
    
    const adminUser = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        email: "admin@campalborz.org",
        name: "Camp Alborz Admin",
        role: "ADMIN",
        status: "ACTIVE",
        permissions: ROLE_PERMISSIONS.admin,
        passwordHash,
      },
    });

    console.log(`✅ Admin user created: ${adminUser.email}`);

    // Create Camp Alborz organization
    const organization = await prisma.organization.create({
      data: {
        tenantId: tenant.id,
        name: "Camp Alborz",
        type: "CAMP",
        description: "A Burning Man theme camp focused on Persian culture and community building",
        website: "https://campalborz.org",
        location: "Black Rock City, Nevada",
        settings: {
          memberRoles: [
            { name: "Camp Lead", permissions: ["all"] },
            { name: "Art Lead", permissions: ["art:*", "member:view"] },
            { name: "Build Lead", permissions: ["task:*", "resource:*"] },
            { name: "Kitchen Lead", permissions: ["event:kitchen", "resource:kitchen"] },
            { name: "Camper", permissions: ["member:view", "event:view"] },
          ],
          membershipTypes: [
            { name: "Full Camper", price: 500, duration: 365, benefits: ["Camp placement", "Meals", "Infrastructure"] },
            { name: "Day Pass", price: 50, duration: 1, benefits: ["Day access", "Meals"] },
            { name: "Volunteer", price: 200, duration: 365, benefits: ["Reduced fee for volunteering"] },
          ],
          eventTypes: ["Build Weekend", "Planning Meeting", "Art Project", "Social Event", "Burning Man"],
          taskCategories: ["Construction", "Art", "Kitchen", "Logistics", "Fundraising"],
          resourceCategories: ["Tools", "Materials", "Vehicles", "Kitchen Equipment", "Art Supplies"],
        },
        isActive: true,
      },
    });

    console.log(`✅ Organization created: ${organization.name}`);

    console.log(`
🎉 Setup complete!

Tenant: ${tenant.name}
URL: http://campalborz.localhost:3000 (or campalborz.localhost:3000)
Admin Login: admin@campalborz.org / admin123

Next steps:
1. Start the API server: cd packages/api && npm run dev
2. Set up the web application
3. Configure your local hosts file to point campalborz.localhost to 127.0.0.1
    `);

  } catch (error) {
    console.error("❌ Setup failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setupTenant();