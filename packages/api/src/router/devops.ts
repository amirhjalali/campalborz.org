import { router, protectedProcedure, adminProcedure } from '../lib/trpc';
import { devopsService } from '../services/devops';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

const pipelineTriggerSchema = z.object({
  type: z.enum(['push', 'pull_request', 'schedule', 'manual']),
  branches: z.array(z.string()).optional(),
  schedule: z.string().optional(),
  conditions: z.record(z.any()).optional()
});

const pipelineStepSchema = z.object({
  name: z.string(),
  action: z.string(),
  parameters: z.record(z.any()),
  condition: z.string().optional(),
  timeout: z.number().default(300000)
});

const pipelineStageSchema = z.object({
  name: z.string(),
  type: z.enum(['build', 'test', 'security', 'deploy', 'notify']),
  steps: z.array(pipelineStepSchema),
  dependsOn: z.array(z.string()).optional(),
  environment: z.string().optional(),
  timeout: z.number().default(1800000),
  retries: z.number().default(0),
  continueOnError: z.boolean().default(false)
});

const infrastructureResourceSchema = z.object({
  type: z.enum(['compute', 'database', 'storage', 'network', 'cdn']),
  name: z.string(),
  config: z.record(z.any()),
  dependencies: z.array(z.string()).optional()
});

const environmentSchema = z.object({
  name: z.string(),
  type: z.enum(['development', 'staging', 'production']),
  variables: z.record(z.string()),
  secrets: z.record(z.string()),
  infrastructure: z.object({
    provider: z.enum(['aws', 'gcp', 'azure', 'vercel', 'netlify']),
    region: z.string(),
    resources: z.array(infrastructureResourceSchema)
  }),
  deployment: z.object({
    strategy: z.enum(['rolling', 'blue-green', 'canary']),
    replicas: z.number().min(1).max(100),
    healthCheck: z.object({
      enabled: z.boolean(),
      endpoint: z.string(),
      timeout: z.number(),
      retries: z.number()
    })
  })
});

const pipelineSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  repository: z.string(),
  branch: z.string().default('main'),
  triggers: z.array(pipelineTriggerSchema),
  stages: z.array(pipelineStageSchema),
  environment: environmentSchema,
  isActive: z.boolean().default(true)
});

const deploymentConfigSchema = z.object({
  application: z.string(),
  version: z.string(),
  environment: z.string(),
  strategy: z.enum(['rolling', 'blue-green', 'canary']),
  replicas: z.number().min(1).max(100),
  resources: z.object({
    cpu: z.string(),
    memory: z.string()
  }),
  environmentVariables: z.record(z.string()),
  secrets: z.array(z.string()),
  healthCheck: z.object({
    endpoint: z.string(),
    initialDelay: z.number(),
    timeout: z.number(),
    retries: z.number()
  })
});

export const devopsRouter = router({
  // Pipeline Management
  createPipeline: adminProcedure
    .input(pipelineSchema)
    .mutation(async ({ ctx, input }) => {
      return devopsService.createPipeline(
        ctx.tenant.id,
        ctx.user.id,
        input
      );
    }),

  getPipelines: adminProcedure
    .input(z.object({
      active: z.boolean().optional(),
      repository: z.string().optional()
    }))
    .query(async ({ ctx, input }) => {
      const where: any = {
        tenantId: ctx.tenant.id,
        contentTypeId: 'pipeline'
      };

      if (input.active !== undefined) {
        where.content = {
          path: ['isActive'],
          equals: input.active
        };
      }

      if (input.repository) {
        where.content = {
          ...where.content,
          path: ['repository'],
          equals: input.repository
        };
      }

      const pipelines = await prisma.content.findMany({
        where,
        include: {
          author: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return pipelines.map(pipeline => ({
        id: pipeline.id,
        name: pipeline.title,
        description: (pipeline.content as any).description,
        repository: (pipeline.content as any).repository,
        branch: (pipeline.content as any).branch,
        isActive: (pipeline.content as any).isActive,
        createdAt: pipeline.createdAt,
        updatedAt: pipeline.updatedAt,
        author: pipeline.author,
        stagesCount: (pipeline.content as any).stages?.length || 0
      }));
    }),

  getPipeline: adminProcedure
    .input(z.object({
      pipelineId: z.string()
    }))
    .query(async ({ ctx, input }) => {
      const pipeline = await prisma.content.findFirst({
        where: {
          id: input.pipelineId,
          tenantId: ctx.tenant.id,
          contentTypeId: 'pipeline'
        },
        include: {
          author: {
            select: { id: true, name: true, email: true }
          }
        }
      });

      if (!pipeline) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Pipeline not found'
        });
      }

      return {
        id: pipeline.id,
        name: pipeline.title,
        ...pipeline.content,
        createdAt: pipeline.createdAt,
        updatedAt: pipeline.updatedAt,
        author: pipeline.author
      };
    }),

  updatePipeline: adminProcedure
    .input(z.object({
      pipelineId: z.string(),
      updates: pipelineSchema.partial()
    }))
    .mutation(async ({ ctx, input }) => {
      const pipeline = await prisma.content.findFirst({
        where: {
          id: input.pipelineId,
          tenantId: ctx.tenant.id,
          contentTypeId: 'pipeline'
        }
      });

      if (!pipeline) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Pipeline not found'
        });
      }

      const currentContent = pipeline.content as any;

      return prisma.content.update({
        where: { id: input.pipelineId },
        data: {
          title: input.updates.name || pipeline.title,
          content: {
            ...currentContent,
            ...input.updates
          },
          updatedBy: ctx.user.id
        }
      });
    }),

  deletePipeline: adminProcedure
    .input(z.object({
      pipelineId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const pipeline = await prisma.content.findFirst({
        where: {
          id: input.pipelineId,
          tenantId: ctx.tenant.id,
          contentTypeId: 'pipeline'
        }
      });

      if (!pipeline) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Pipeline not found'
        });
      }

      await prisma.content.delete({
        where: { id: input.pipelineId }
      });

      return { success: true };
    }),

  // Pipeline Execution
  executePipeline: adminProcedure
    .input(z.object({
      pipelineId: z.string(),
      branch: z.string().optional(),
      environment: z.string().optional(),
      manual: z.boolean().default(true)
    }))
    .mutation(async ({ ctx, input }) => {
      return devopsService.executePipeline(
        input.pipelineId,
        ctx.user.id,
        {
          branch: input.branch,
          environment: input.environment,
          manual: input.manual
        }
      );
    }),

  getPipelineRuns: adminProcedure
    .input(z.object({
      pipelineId: z.string().optional(),
      status: z.enum(['queued', 'running', 'success', 'failed', 'cancelled']).optional(),
      environment: z.string().optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0)
    }))
    .query(async ({ ctx, input }) => {
      const where: any = {
        tenantId: ctx.tenant.id,
        contentTypeId: 'pipeline-run'
      };

      if (input.pipelineId) {
        where.content = {
          path: ['pipelineId'],
          equals: input.pipelineId
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
        runs: runs.map(run => ({
          id: run.id,
          ...run.content,
          createdAt: run.createdAt
        })),
        total,
        hasMore: total > input.offset + input.limit
      };
    }),

  getPipelineRun: adminProcedure
    .input(z.object({
      runId: z.string()
    }))
    .query(async ({ ctx, input }) => {
      const run = await prisma.content.findFirst({
        where: {
          id: input.runId,
          tenantId: ctx.tenant.id,
          contentTypeId: 'pipeline-run'
        }
      });

      if (!run) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Pipeline run not found'
        });
      }

      return {
        id: run.id,
        ...run.content,
        createdAt: run.createdAt
      };
    }),

  cancelPipelineRun: adminProcedure
    .input(z.object({
      runId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const run = await prisma.content.findFirst({
        where: {
          id: input.runId,
          tenantId: ctx.tenant.id,
          contentTypeId: 'pipeline-run'
        }
      });

      if (!run) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Pipeline run not found'
        });
      }

      const runContent = run.content as any;
      if (runContent.status !== 'running' && runContent.status !== 'queued') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Can only cancel running or queued pipeline runs'
        });
      }

      return prisma.content.update({
        where: { id: input.runId },
        data: {
          content: {
            ...runContent,
            status: 'cancelled',
            completedAt: new Date()
          }
        }
      });
    }),

  // Environment Management
  createEnvironment: adminProcedure
    .input(environmentSchema)
    .mutation(async ({ ctx, input }) => {
      return devopsService.createEnvironment(
        ctx.tenant.id,
        ctx.user.id,
        input
      );
    }),

  getEnvironments: adminProcedure
    .input(z.object({
      type: z.enum(['development', 'staging', 'production']).optional()
    }))
    .query(async ({ ctx, input }) => {
      const where: any = {
        tenantId: ctx.tenant.id,
        contentTypeId: 'environment'
      };

      if (input.type) {
        where.content = {
          path: ['type'],
          equals: input.type
        };
      }

      const environments = await prisma.content.findMany({
        where,
        include: {
          author: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return environments.map(env => ({
        id: env.id,
        name: env.title,
        ...env.content,
        createdAt: env.createdAt,
        updatedAt: env.updatedAt,
        author: env.author
      }));
    }),

  updateEnvironment: adminProcedure
    .input(z.object({
      environmentId: z.string(),
      updates: environmentSchema.partial()
    }))
    .mutation(async ({ ctx, input }) => {
      const environment = await prisma.content.findFirst({
        where: {
          id: input.environmentId,
          tenantId: ctx.tenant.id,
          contentTypeId: 'environment'
        }
      });

      if (!environment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Environment not found'
        });
      }

      const currentContent = environment.content as any;

      return prisma.content.update({
        where: { id: input.environmentId },
        data: {
          title: input.updates.name || environment.title,
          content: {
            ...currentContent,
            ...input.updates
          },
          updatedBy: ctx.user.id
        }
      });
    }),

  deleteEnvironment: adminProcedure
    .input(z.object({
      environmentId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const environment = await prisma.content.findFirst({
        where: {
          id: input.environmentId,
          tenantId: ctx.tenant.id,
          contentTypeId: 'environment'
        }
      });

      if (!environment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Environment not found'
        });
      }

      // Check if environment is being used by any pipelines
      const pipelinesUsingEnv = await prisma.content.count({
        where: {
          tenantId: ctx.tenant.id,
          contentTypeId: 'pipeline',
          content: {
            path: ['environment', 'name'],
            equals: environment.title
          }
        }
      });

      if (pipelinesUsingEnv > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot delete environment that is being used by pipelines'
        });
      }

      await prisma.content.delete({
        where: { id: input.environmentId }
      });

      return { success: true };
    }),

  // Infrastructure Management
  generateInfrastructure: adminProcedure
    .input(z.object({
      environmentId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const environment = await prisma.content.findFirst({
        where: {
          id: input.environmentId,
          tenantId: ctx.tenant.id,
          contentTypeId: 'environment'
        }
      });

      if (!environment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Environment not found'
        });
      }

      const files = await devopsService.generateInfrastructure(
        ctx.tenant.id,
        environment.content as any
      );

      return {
        environmentId: input.environmentId,
        filesGenerated: files.length,
        files
      };
    }),

  // Deployment Management
  deployApplication: adminProcedure
    .input(deploymentConfigSchema)
    .mutation(async ({ ctx, input }) => {
      return devopsService.deployApplication(
        ctx.tenant.id,
        ctx.user.id,
        input
      );
    }),

  getDeployments: adminProcedure
    .input(z.object({
      application: z.string().optional(),
      environment: z.string().optional(),
      status: z.enum(['deploying', 'deployed', 'failed', 'rolled-back']).optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0)
    }))
    .query(async ({ ctx, input }) => {
      const where: any = {
        tenantId: ctx.tenant.id,
        contentTypeId: 'deployment'
      };

      if (input.application) {
        where.content = {
          path: ['application'],
          equals: input.application
        };
      }

      if (input.environment) {
        where.content = {
          ...where.content,
          path: ['environment'],
          equals: input.environment
        };
      }

      if (input.status) {
        where.content = {
          ...where.content,
          path: ['status'],
          equals: input.status
        };
      }

      const [deployments, total] = await Promise.all([
        prisma.content.findMany({
          where,
          include: {
            author: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: input.limit,
          skip: input.offset
        }),
        prisma.content.count({ where })
      ]);

      return {
        deployments: deployments.map(deployment => ({
          id: deployment.id,
          ...deployment.content,
          createdAt: deployment.createdAt,
          author: deployment.author
        })),
        total,
        hasMore: total > input.offset + input.limit
      };
    }),

  rollbackDeployment: adminProcedure
    .input(z.object({
      deploymentId: z.string(),
      targetVersion: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const deployment = await prisma.content.findFirst({
        where: {
          id: input.deploymentId,
          tenantId: ctx.tenant.id,
          contentTypeId: 'deployment'
        }
      });

      if (!deployment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Deployment not found'
        });
      }

      const deploymentContent = deployment.content as any;

      // Create rollback deployment
      const rollbackConfig = {
        ...deploymentContent,
        version: input.targetVersion || 'previous',
        strategy: 'rolling'
      };

      const rollbackResult = await devopsService.deployApplication(
        ctx.tenant.id,
        ctx.user.id,
        rollbackConfig
      );

      // Update original deployment status
      await prisma.content.update({
        where: { id: input.deploymentId },
        data: {
          content: {
            ...deploymentContent,
            status: 'rolled-back',
            rolledBackAt: new Date(),
            rolledBackBy: ctx.user.id
          }
        }
      });

      return rollbackResult;
    }),

  // Metrics and Monitoring
  getPipelineMetrics: adminProcedure
    .input(z.object({
      days: z.number().min(1).max(365).default(30),
      pipelineId: z.string().optional()
    }))
    .query(async ({ ctx, input }) => {
      return devopsService.getPipelineMetrics(ctx.tenant.id, input.days);
    }),

  getDeploymentMetrics: adminProcedure
    .input(z.object({
      environment: z.string().optional(),
      application: z.string().optional(),
      days: z.number().min(1).max(90).default(30)
    }))
    .query(async ({ ctx, input }) => {
      const since = new Date();
      since.setDate(since.getDate() - input.days);

      const where: any = {
        tenantId: ctx.tenant.id,
        contentTypeId: 'deployment',
        createdAt: { gte: since }
      };

      if (input.environment) {
        where.content = {
          path: ['environment'],
          equals: input.environment
        };
      }

      if (input.application) {
        where.content = {
          ...where.content,
          path: ['application'],
          equals: input.application
        };
      }

      const deployments = await prisma.content.findMany({
        where,
        orderBy: { createdAt: 'desc' }
      });

      const totalDeployments = deployments.length;
      const successfulDeployments = deployments.filter(
        d => (d.content as any).status === 'deployed'
      ).length;

      return {
        totalDeployments,
        successRate: totalDeployments > 0 ? (successfulDeployments / totalDeployments) * 100 : 0,
        deploymentFrequency: totalDeployments / input.days,
        trends: deployments.map(d => ({
          date: d.createdAt,
          application: (d.content as any).application,
          environment: (d.content as any).environment,
          status: (d.content as any).status,
          version: (d.content as any).version
        }))
      };
    }),

  // Security and Compliance
  getSecurityScan: adminProcedure
    .input(z.object({
      application: z.string(),
      version: z.string()
    }))
    .query(async ({ ctx, input }) => {
      // Get security scan results for application version
      const scanResults = await prisma.content.findMany({
        where: {
          tenantId: ctx.tenant.id,
          contentTypeId: 'security-scan',
          content: {
            path: ['application'],
            equals: input.application
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 1
      });

      if (scanResults.length === 0) {
        return {
          application: input.application,
          version: input.version,
          status: 'not-scanned',
          vulnerabilities: [],
          lastScan: null
        };
      }

      const scanResult = scanResults[0];
      return {
        application: input.application,
        version: input.version,
        ...scanResult.content,
        lastScan: scanResult.createdAt
      };
    }),

  triggerSecurityScan: adminProcedure
    .input(z.object({
      application: z.string(),
      version: z.string(),
      scanType: z.enum(['sast', 'dast', 'dependency', 'container']).default('container')
    }))
    .mutation(async ({ ctx, input }) => {
      // Trigger security scan
      const scanId = `scan-${Date.now()}`;

      // Store scan trigger
      await prisma.content.create({
        data: {
          tenantId: ctx.tenant.id,
          contentTypeId: 'security-scan',
          title: `Security Scan ${scanId}`,
          content: {
            scanId,
            application: input.application,
            version: input.version,
            scanType: input.scanType,
            status: 'running',
            triggeredBy: ctx.user.id
          },
          status: 'PUBLISHED',
          createdBy: ctx.user.id,
          updatedBy: ctx.user.id
        }
      });

      return {
        scanId,
        status: 'running',
        message: 'Security scan initiated'
      };
    }),

  // Configuration Management
  getConfigTemplates: adminProcedure
    .query(async ({ ctx }) => {
      const templates = await prisma.content.findMany({
        where: {
          tenantId: ctx.tenant.id,
          contentTypeId: 'config-template'
        },
        orderBy: { createdAt: 'desc' }
      });

      return templates.map(template => ({
        id: template.id,
        name: template.title,
        ...template.content,
        createdAt: template.createdAt
      }));
    }),

  createConfigTemplate: adminProcedure
    .input(z.object({
      name: z.string(),
      description: z.string(),
      type: z.enum(['kubernetes', 'docker', 'terraform', 'ansible']),
      template: z.string(),
      variables: z.array(z.object({
        name: z.string(),
        type: z.string(),
        description: z.string(),
        defaultValue: z.string().optional(),
        required: z.boolean().default(false)
      }))
    }))
    .mutation(async ({ ctx, input }) => {
      return prisma.content.create({
        data: {
          tenantId: ctx.tenant.id,
          contentTypeId: 'config-template',
          title: input.name,
          slug: input.name.toLowerCase().replace(/\s+/g, '-'),
          content: {
            description: input.description,
            type: input.type,
            template: input.template,
            variables: input.variables
          },
          status: 'PUBLISHED',
          createdBy: ctx.user.id,
          updatedBy: ctx.user.id
        }
      });
    })
});