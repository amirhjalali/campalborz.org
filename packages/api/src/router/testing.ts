import { router, protectedProcedure, adminProcedure } from '../lib/trpc';
import { testingService } from '../services/testing';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

const testConfigSchema = z.object({
  timeout: z.number().min(1000).max(300000).default(30000),
  retries: z.number().min(0).max(5).default(1),
  parallel: z.boolean().default(false),
  environment: z.enum(['test', 'staging', 'production']).default('test'),
  coverage: z.object({
    enabled: z.boolean().default(true),
    threshold: z.number().min(0).max(100).default(80),
    include: z.array(z.string()).default([]),
    exclude: z.array(z.string()).default([])
  }),
  reporter: z.enum(['json', 'html', 'junit', 'console']).default('json'),
  beforeEach: z.array(z.string()).optional(),
  afterEach: z.array(z.string()).optional()
});

const testSuiteSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  type: z.enum(['unit', 'integration', 'e2e', 'performance', 'security']),
  testFiles: z.array(z.string()),
  config: testConfigSchema,
  isActive: z.boolean().default(true)
});

export const testingRouter = router({
  // Test Suite Management
  createTestSuite: adminProcedure
    .input(testSuiteSchema)
    .mutation(async ({ ctx, input }) => {
      return testingService.createTestSuite(
        ctx.tenant.id,
        ctx.user.id,
        input
      );
    }),

  getTestSuites: adminProcedure
    .input(z.object({
      type: z.enum(['unit', 'integration', 'e2e', 'performance', 'security']).optional(),
      active: z.boolean().optional()
    }))
    .query(async ({ ctx, input }) => {
      const where: any = {
        tenantId: ctx.tenant.id,
        contentTypeId: 'test-suite'
      };

      if (input.type) {
        where.content = {
          path: ['type'],
          equals: input.type
        };
      }

      if (input.active !== undefined) {
        where.content = {
          ...where.content,
          path: ['isActive'],
          equals: input.active
        };
      }

      const suites = await prisma.content.findMany({
        where,
        include: {
          author: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return suites.map(suite => ({
        id: suite.id,
        name: suite.title,
        description: (suite.content as any).description,
        type: (suite.content as any).type,
        testFiles: (suite.content as any).testFiles,
        config: (suite.content as any).config,
        isActive: (suite.content as any).isActive,
        createdAt: suite.createdAt,
        updatedAt: suite.updatedAt,
        author: suite.author
      }));
    }),

  updateTestSuite: adminProcedure
    .input(z.object({
      suiteId: z.string(),
      updates: testSuiteSchema.partial()
    }))
    .mutation(async ({ ctx, input }) => {
      const suite = await prisma.content.findFirst({
        where: {
          id: input.suiteId,
          tenantId: ctx.tenant.id,
          contentTypeId: 'test-suite'
        }
      });

      if (!suite) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Test suite not found'
        });
      }

      const currentContent = suite.content as any;

      return prisma.content.update({
        where: { id: input.suiteId },
        data: {
          title: input.updates.name || suite.title,
          content: {
            ...currentContent,
            ...(input.updates.description && { description: input.updates.description }),
            ...(input.updates.type && { type: input.updates.type }),
            ...(input.updates.testFiles && { testFiles: input.updates.testFiles }),
            ...(input.updates.config && { config: input.updates.config }),
            ...(input.updates.isActive !== undefined && { isActive: input.updates.isActive })
          },
          updatedBy: ctx.user.id
        }
      });
    }),

  deleteTestSuite: adminProcedure
    .input(z.object({
      suiteId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const suite = await prisma.content.findFirst({
        where: {
          id: input.suiteId,
          tenantId: ctx.tenant.id,
          contentTypeId: 'test-suite'
        }
      });

      if (!suite) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Test suite not found'
        });
      }

      await prisma.content.delete({
        where: { id: input.suiteId }
      });

      return { success: true };
    }),

  // Test Execution
  runTestSuite: adminProcedure
    .input(z.object({
      suiteId: z.string(),
      environment: z.enum(['test', 'staging', 'production']).optional(),
      testPattern: z.string().optional(),
      coverage: z.boolean().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      return testingService.runTestSuite(
        input.suiteId,
        ctx.user.id,
        {
          environment: input.environment,
          testPattern: input.testPattern,
          coverage: input.coverage
        }
      );
    }),

  runAllTests: adminProcedure
    .input(z.object({
      type: z.enum(['unit', 'integration', 'e2e', 'performance', 'security']).optional(),
      environment: z.enum(['test', 'staging', 'production']).default('test'),
      parallel: z.boolean().default(false)
    }))
    .mutation(async ({ ctx, input }) => {
      // Get active test suites of specified type
      const where: any = {
        tenantId: ctx.tenant.id,
        contentTypeId: 'test-suite',
        content: {
          path: ['isActive'],
          equals: true
        }
      };

      if (input.type) {
        where.content = {
          ...where.content,
          path: ['type'],
          equals: input.type
        };
      }

      const suites = await prisma.content.findMany({ where });

      const runPromises = suites.map(suite => 
        testingService.runTestSuite(
          suite.id,
          ctx.user.id,
          { environment: input.environment }
        )
      );

      if (input.parallel) {
        return Promise.all(runPromises);
      } else {
        const results = [];
        for (const promise of runPromises) {
          results.push(await promise);
        }
        return results;
      }
    }),

  // Test Results and Monitoring
  getTestRun: adminProcedure
    .input(z.object({
      runId: z.string()
    }))
    .query(async ({ ctx, input }) => {
      // Get test run from cache or database
      const testRun = await prisma.content.findFirst({
        where: {
          id: input.runId,
          tenantId: ctx.tenant.id,
          contentTypeId: 'test-run'
        }
      });

      if (!testRun) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Test run not found'
        });
      }

      return testRun.content;
    }),

  getTestRuns: adminProcedure
    .input(z.object({
      suiteId: z.string().optional(),
      status: z.enum(['running', 'passed', 'failed', 'cancelled']).optional(),
      environment: z.string().optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0)
    }))
    .query(async ({ ctx, input }) => {
      const where: any = {
        tenantId: ctx.tenant.id,
        contentTypeId: 'test-run'
      };

      if (input.suiteId) {
        where.content = {
          path: ['suiteId'],
          equals: input.suiteId
        };
      }

      if (input.status) {
        where.content = {
          ...where.content,
          path: ['status'],
          equals: input.status
        };
      }

      if (input.environment) {
        where.content = {
          ...where.content,
          path: ['environment'],
          equals: input.environment
        };
      }

      const [runs, total] = await Promise.all([
        prisma.content.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: input.limit,
          skip: input.offset
        }),
        prisma.content.count({ where })
      ]);

      return {
        runs: runs.map(run => run.content),
        total,
        hasMore: total > input.offset + input.limit
      };
    }),

  // Test Metrics and Analytics
  getTestMetrics: adminProcedure
    .input(z.object({
      days: z.number().min(1).max(365).default(30),
      type: z.enum(['unit', 'integration', 'e2e', 'performance', 'security']).optional()
    }))
    .query(async ({ ctx, input }) => {
      return testingService.getTestMetrics(ctx.tenant.id, input.days);
    }),

  getTestCoverage: adminProcedure
    .input(z.object({
      suiteId: z.string().optional(),
      days: z.number().min(1).max(90).default(7)
    }))
    .query(async ({ ctx, input }) => {
      const since = new Date();
      since.setDate(since.getDate() - input.days);

      const where: any = {
        tenantId: ctx.tenant.id,
        contentTypeId: 'test-run',
        createdAt: { gte: since },
        content: {
          path: ['coverage'],
          not: null
        }
      };

      if (input.suiteId) {
        where.content = {
          ...where.content,
          path: ['suiteId'],
          equals: input.suiteId
        };
      }

      const runs = await prisma.content.findMany({
        where,
        orderBy: { createdAt: 'desc' }
      });

      const coverageData = runs.map(run => ({
        date: run.createdAt,
        coverage: (run.content as any).coverage,
        suiteId: (run.content as any).suiteId
      }));

      return {
        current: coverageData[0]?.coverage || null,
        trend: coverageData,
        average: coverageData.reduce((sum, item) => 
          sum + (item.coverage?.statements?.percentage || 0), 0
        ) / coverageData.length || 0
      };
    }),

  // Test Data Management
  generateTestData: adminProcedure
    .input(z.object({
      dataType: z.enum(['users', 'events', 'donations', 'content']),
      count: z.number().min(1).max(1000).default(10),
      seed: z.boolean().default(false)
    }))
    .mutation(async ({ ctx, input }) => {
      const testData = await testingService.generateTestData(
        ctx.tenant.id,
        input.dataType,
        input.count
      );

      if (input.seed) {
        // Seed data to test database
        switch (input.dataType) {
          case 'users':
            await prisma.user.createMany({
              data: testData.map(user => ({
                ...user,
                passwordHash: 'test-hash',
                status: 'ACTIVE'
              }))
            });
            break;
          case 'events':
            await prisma.event.createMany({
              data: testData.map(event => ({
                ...event,
                createdBy: ctx.user.id,
                updatedBy: ctx.user.id
              }))
            });
            break;
          case 'donations':
            await prisma.donation.createMany({
              data: testData.map(donation => ({
                ...donation,
                userId: ctx.user.id
              }))
            });
            break;
          case 'content':
            await prisma.content.createMany({
              data: testData.map(content => ({
                ...content,
                createdBy: ctx.user.id,
                updatedBy: ctx.user.id
              }))
            });
            break;
        }
      }

      return {
        data: testData,
        seeded: input.seed,
        count: testData.length
      };
    }),

  cleanupTestData: adminProcedure
    .input(z.object({
      dataType: z.enum(['users', 'events', 'donations', 'content', 'all']),
      olderThan: z.number().min(1).default(1) // days
    }))
    .mutation(async ({ ctx, input }) => {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - input.olderThan);

      let deletedCount = 0;

      if (input.dataType === 'users' || input.dataType === 'all') {
        const result = await prisma.user.deleteMany({
          where: {
            tenantId: ctx.tenant.id,
            email: { startsWith: 'test' },
            createdAt: { lt: cutoffDate }
          }
        });
        deletedCount += result.count;
      }

      if (input.dataType === 'events' || input.dataType === 'all') {
        const result = await prisma.event.deleteMany({
          where: {
            tenantId: ctx.tenant.id,
            title: { startsWith: 'Test Event' },
            createdAt: { lt: cutoffDate }
          }
        });
        deletedCount += result.count;
      }

      if (input.dataType === 'donations' || input.dataType === 'all') {
        const result = await prisma.donation.deleteMany({
          where: {
            tenantId: ctx.tenant.id,
            createdAt: { lt: cutoffDate },
            status: 'COMPLETED',
            amount: { gte: 1000, lte: 10000 } // Test donation range
          }
        });
        deletedCount += result.count;
      }

      if (input.dataType === 'content' || input.dataType === 'all') {
        const result = await prisma.content.deleteMany({
          where: {
            tenantId: ctx.tenant.id,
            title: { startsWith: 'Test Content' },
            createdAt: { lt: cutoffDate }
          }
        });
        deletedCount += result.count;
      }

      return {
        deletedCount,
        dataType: input.dataType,
        cutoffDate
      };
    }),

  // Test Environment Management
  resetTestEnvironment: adminProcedure
    .mutation(async ({ ctx }) => {
      // Reset test database and environment
      await testingService.cleanupTestData(ctx.tenant.id, 'all', 0);
      
      // Clear caches
      await prisma.$executeRaw`TRUNCATE TABLE test_cache`;
      
      // Reset configuration
      await prisma.tenant.update({
        where: { id: ctx.tenant.id },
        data: {
          settings: {
            testMode: true,
            resetAt: new Date()
          }
        }
      });

      return {
        success: true,
        resetAt: new Date(),
        message: 'Test environment reset successfully'
      };
    }),

  // Continuous Integration Integration
  getCIStatus: adminProcedure
    .query(async ({ ctx }) => {
      // Get latest CI pipeline status
      const latestRuns = await prisma.content.findMany({
        where: {
          tenantId: ctx.tenant.id,
          contentTypeId: 'test-run',
          content: {
            path: ['environment'],
            equals: 'ci'
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      });

      const passRate = latestRuns.length > 0 
        ? latestRuns.filter(run => (run.content as any).status === 'passed').length / latestRuns.length * 100
        : 0;

      return {
        status: latestRuns[0] ? (latestRuns[0].content as any).status : 'unknown',
        passRate,
        lastRun: latestRuns[0]?.createdAt,
        recentRuns: latestRuns.map(run => ({
          id: run.id,
          status: (run.content as any).status,
          duration: (run.content as any).duration,
          createdAt: run.createdAt
        }))
      };
    }),

  triggerCIPipeline: adminProcedure
    .input(z.object({
      branch: z.string().default('main'),
      testTypes: z.array(z.enum(['unit', 'integration', 'e2e'])).default(['unit', 'integration'])
    }))
    .mutation(async ({ ctx, input }) => {
      // Trigger CI pipeline - would integrate with GitHub Actions, Jenkins, etc.
      const pipelineId = `pipeline-${Date.now()}`;
      
      // Store pipeline trigger
      await prisma.content.create({
        data: {
          tenantId: ctx.tenant.id,
          contentTypeId: 'ci-pipeline',
          title: `CI Pipeline ${pipelineId}`,
          content: {
            pipelineId,
            branch: input.branch,
            testTypes: input.testTypes,
            triggeredBy: ctx.user.id,
            status: 'queued'
          },
          status: 'PUBLISHED',
          createdBy: ctx.user.id,
          updatedBy: ctx.user.id
        }
      });

      return {
        pipelineId,
        status: 'queued',
        message: 'CI pipeline triggered successfully'
      };
    })
});