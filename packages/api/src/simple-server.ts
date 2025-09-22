import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Load environment variables
dotenv.config();

// Initialize Prisma Client
const prisma = new PrismaClient();

// Create Express app
const app = express();
const PORT = 3005; // Using different port for simple server

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API info
app.get('/api', (req, res) => {
  res.json({
    message: 'Camp Alborz API Server',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      tenants: {
        list: 'GET /api/tenants',
        create: 'POST /api/tenants'
      },
      test: {
        seed: 'POST /api/seed'
      }
    }
  });
});

// List tenants
app.get('/api/tenants', async (req, res) => {
  try {
    const tenants = await prisma.tenant.findMany();
    res.json(tenants);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch tenants' });
  }
});

// Create tenant
app.post('/api/tenants', async (req, res) => {
  try {
    const { name, slug } = req.body;
    const tenant = await prisma.tenant.create({
      data: {
        name,
        slug,
        settings: {}
      }
    });
    res.json(tenant);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to create tenant' });
  }
});

// Seed initial data
app.post('/api/seed', async (req, res) => {
  try {
    // Create Camp Alborz tenant
    const tenant = await prisma.tenant.upsert({
      where: { slug: 'camp-alborz' },
      update: {},
      create: {
        name: 'Camp Alborz',
        slug: 'camp-alborz',
        domain: 'localhost:3000',
        settings: {
          theme: 'persian',
          language: 'en'
        }
      }
    });

    // Create default organization
    const org = await prisma.organization.upsert({
      where: { id: 'default-org' },
      update: {},
      create: {
        id: 'default-org',
        tenantId: tenant.id,
        name: 'Camp Alborz Organization',
        description: 'Burning Man theme camp celebrating Persian culture',
        type: 'nonprofit',
        website: 'https://campalborz.org'
      }
    });

    // Create admin user
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const user = await prisma.user.upsert({
      where: { 
        tenantId_email: {
          tenantId: tenant.id,
          email: 'admin@campalborz.org'
        }
      },
      update: {},
      create: {
        tenantId: tenant.id,
        email: 'admin@campalborz.org',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User'
      }
    });

    // Create sample campaign
    const campaign = await prisma.campaign.upsert({
      where: { id: 'sample-campaign' },
      update: {},
      create: {
        id: 'sample-campaign',
        tenantId: tenant.id,
        organizationId: org.id,
        title: 'Camp Alborz 2025 Fundraiser',
        description: 'Help us build an amazing Persian-themed experience at Burning Man 2025!',
        goalAmount: 50000,
        currentAmount: 12500,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-08-01'),
        createdBy: user.id
      }
    });

    // Create sample event
    const event = await prisma.event.create({
      data: {
        tenantId: tenant.id,
        organizationId: org.id,
        name: 'Camp Alborz Planning Meeting',
        description: 'Monthly planning meeting for Camp Alborz 2025',
        location: 'Online via Zoom',
        startDate: new Date('2025-02-01T19:00:00'),
        endDate: new Date('2025-02-01T21:00:00'),
        capacity: 100,
        createdBy: user.id
      }
    });

    res.json({
      message: 'Initial data seeded successfully!',
      data: {
        tenant: { id: tenant.id, name: tenant.name, slug: tenant.slug },
        organization: { id: org.id, name: org.name },
        user: { id: user.id, email: user.email },
        campaign: { id: campaign.id, title: campaign.title },
        event: { id: event.id, name: event.name }
      }
    });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ error: 'Failed to seed data' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`
🚀 Camp Alborz API Server (Simple Mode)
====================================
📡 Server: http://localhost:${PORT}
🏥 Health: http://localhost:${PORT}/health
📚 API Info: http://localhost:${PORT}/api
🌱 Seed Data: POST http://localhost:${PORT}/api/seed

Ready to serve! 
  `);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});