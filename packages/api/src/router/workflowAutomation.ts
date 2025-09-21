import { z } from "zod";
import { router, protectedProcedure, adminProcedure } from "../trpc";
import { WorkflowAutomationService } from "../services/workflowAutomation";

const workflowAutomationService = new WorkflowAutomationService();

const workflowConfigSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  trigger: z.enum(['manual', 'schedule', 'webhook', 'event', 'api_call', 'file_upload', 'database_change', 'email_received', 'form_submission', 'timer', 'conditional']),
  triggerConfig: z.any().optional(),
  isActive: z.boolean().default(true),
  version: z.number().default(1),
  tags: z.array(z.string()).default([]),
  metadata: z.any().default({})
});

const workflowStepConfigSchema = z.object({
  name: z.string(),
  type: z.enum(['action', 'condition', 'loop', 'parallel', 'delay', 'approval', 'notification', 'integration', 'custom']),
  action: z.enum(['send_email', 'send_notification', 'create_record', 'update_record', 'delete_record', 'call_api', 'run_script', 'generate_report', 'process_file', 'send_webhook', 'create_user', 'update_user', 'assign_role', 'trigger_workflow', 'wait_for_approval', 'calculate_value', 'transform_data', 'validate_data', 'backup_data', 'archive_data', 'custom_function']),
  config: z.any().default({}),
  position: z.number(),
  condition: z.any().optional(),
  retryConfig: z.any().optional(),
  timeout: z.number().optional(),
  dependencies: z.array(z.string()).default([])
});

const scheduleConfigSchema = z.object({
  name: z.string(),
  cronExpression: z.string(),
  timezone: z.string().default("UTC"),
  config: z.any().default({})
});

const templateConfigSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  category: z.string(),
  template: z.any(),
  config: z.any().default({}),
  isPublic: z.boolean().default(false),
  tags: z.array(z.string()).default([])
});

const variableConfigSchema = z.object({
  name: z.string(),
  value: z.string(),
  type: z.enum(['string', 'number', 'boolean', 'json', 'secret', 'file', 'reference']),
  isSecret: z.boolean().default(false),
  description: z.string().optional(),
  workflowId: z.string().optional()
});

export const workflowAutomationRouter = router({
  // Workflow Management
  createWorkflow: protectedProcedure
    .input(workflowConfigSchema)
    .mutation(async ({ input, ctx }) => {
      return await workflowAutomationService.createWorkflow(
        ctx.user.tenantId,
        ctx.user.id,
        input
      );
    }),

  getWorkflows: protectedProcedure
    .input(z.object({
      trigger: z.string().optional(),
      isActive: z.boolean().optional(),
      tags: z.array(z.string()).optional(),
      search: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(20)
    }))
    .query(async ({ input, ctx }) => {
      return await workflowAutomationService.getWorkflows(
        ctx.user.tenantId,
        input
      );
    }),

  getWorkflow: protectedProcedure
    .input(z.object({ workflowId: z.string() }))
    .query(async ({ input, ctx }) => {
      return await workflowAutomationService.getWorkflow(
        ctx.user.tenantId,
        input.workflowId
      );
    }),

  updateWorkflow: protectedProcedure
    .input(z.object({
      workflowId: z.string(),
      config: workflowConfigSchema.partial()
    }))
    .mutation(async ({ input, ctx }) => {
      return await workflowAutomationService.updateWorkflow(
        ctx.user.tenantId,
        input.workflowId,
        input.config
      );
    }),

  deleteWorkflow: protectedProcedure
    .input(z.object({ workflowId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return await workflowAutomationService.deleteWorkflow(
        ctx.user.tenantId,
        input.workflowId
      );
    }),

  // Workflow Steps Management
  addWorkflowStep: protectedProcedure
    .input(z.object({
      workflowId: z.string(),
      step: workflowStepConfigSchema
    }))
    .mutation(async ({ input, ctx }) => {
      return await workflowAutomationService.addWorkflowStep(
        ctx.user.tenantId,
        input.workflowId,
        input.step
      );
    }),

  updateWorkflowStep: protectedProcedure
    .input(z.object({
      stepId: z.string(),
      config: workflowStepConfigSchema.partial()
    }))
    .mutation(async ({ input, ctx }) => {
      return await workflowAutomationService.updateWorkflowStep(
        ctx.user.tenantId,
        input.stepId,
        input.config
      );
    }),

  removeWorkflowStep: protectedProcedure
    .input(z.object({ stepId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return await workflowAutomationService.removeWorkflowStep(
        ctx.user.tenantId,
        input.stepId
      );
    }),

  // Workflow Execution
  executeWorkflow: protectedProcedure
    .input(z.object({
      workflowId: z.string(),
      triggerData: z.any().default({})
    }))
    .mutation(async ({ input, ctx }) => {
      return await workflowAutomationService.executeWorkflow(
        ctx.user.tenantId,
        input.workflowId,
        input.triggerData
      );
    }),

  getWorkflowExecutions: protectedProcedure
    .input(z.object({
      workflowId: z.string(),
      status: z.string().optional(),
      startTime: z.date().optional(),
      endTime: z.date().optional(),
      page: z.number().default(1),
      limit: z.number().default(20)
    }))
    .query(async ({ input, ctx }) => {
      return await workflowAutomationService.getWorkflowExecutions(
        ctx.user.tenantId,
        input.workflowId,
        input
      );
    }),

  // Workflow Scheduling
  scheduleWorkflow: protectedProcedure
    .input(z.object({
      workflowId: z.string(),
      schedule: scheduleConfigSchema
    }))
    .mutation(async ({ input, ctx }) => {
      return await workflowAutomationService.scheduleWorkflow(
        ctx.user.tenantId,
        input.workflowId,
        input.schedule
      );
    }),

  // Workflow Templates
  createTemplate: protectedProcedure
    .input(templateConfigSchema)
    .mutation(async ({ input, ctx }) => {
      return await workflowAutomationService.createTemplate(
        ctx.user.tenantId,
        ctx.user.id,
        input
      );
    }),

  getTemplates: protectedProcedure
    .input(z.object({
      category: z.string().optional(),
      isPublic: z.boolean().optional(),
      search: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(20)
    }))
    .query(async ({ input, ctx }) => {
      return await workflowAutomationService.getTemplates(
        ctx.user.tenantId,
        input
      );
    }),

  createWorkflowFromTemplate: protectedProcedure
    .input(z.object({
      templateId: z.string(),
      customization: z.any().default({})
    }))
    .mutation(async ({ input, ctx }) => {
      return await workflowAutomationService.createWorkflowFromTemplate(
        ctx.user.tenantId,
        ctx.user.id,
        input.templateId,
        input.customization
      );
    }),

  // Variables Management
  setVariable: protectedProcedure
    .input(variableConfigSchema)
    .mutation(async ({ input, ctx }) => {
      return await workflowAutomationService.setVariable(
        ctx.user.tenantId,
        input
      );
    }),

  getVariables: protectedProcedure
    .input(z.object({
      workflowId: z.string().optional()
    }))
    .query(async ({ input, ctx }) => {
      return await workflowAutomationService.getVariables(
        ctx.user.tenantId,
        input.workflowId
      );
    }),

  // Workflow Logs
  getWorkflowLogs: protectedProcedure
    .input(z.object({
      workflowId: z.string(),
      level: z.string().optional(),
      executionId: z.string().optional(),
      startTime: z.date().optional(),
      endTime: z.date().optional(),
      page: z.number().default(1),
      limit: z.number().default(50)
    }))
    .query(async ({ input, ctx }) => {
      return await workflowAutomationService.getWorkflowLogs(
        ctx.user.tenantId,
        input.workflowId,
        input
      );
    }),

  // Analytics and Reporting
  getWorkflowAnalytics: protectedProcedure
    .input(z.object({
      timeRange: z.object({
        start: z.date(),
        end: z.date()
      })
    }))
    .query(async ({ input, ctx }) => {
      return await workflowAutomationService.getWorkflowAnalytics(
        ctx.user.tenantId,
        input.timeRange
      );
    }),

  // Webhook Integration
  triggerWebhook: protectedProcedure
    .input(z.object({
      webhookUrl: z.string(),
      payload: z.any(),
      workflowId: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      if (input.workflowId) {
        return await workflowAutomationService.executeWorkflow(
          ctx.user.tenantId,
          input.workflowId,
          {
            trigger: 'webhook',
            payload: input.payload,
            webhookUrl: input.webhookUrl
          }
        );
      }
      
      return { message: 'Webhook received', payload: input.payload };
    }),

  // Workflow Testing
  validateWorkflow: protectedProcedure
    .input(z.object({
      workflowId: z.string(),
      testData: z.any().default({})
    }))
    .mutation(async ({ input, ctx }) => {
      const workflow = await workflowAutomationService.getWorkflow(
        ctx.user.tenantId,
        input.workflowId
      );

      if (!workflow) {
        throw new Error('Workflow not found');
      }

      const validation = {
        valid: true,
        errors: [] as string[],
        warnings: [] as string[]
      };

      // Validate workflow structure
      if (!workflow.steps || workflow.steps.length === 0) {
        validation.errors.push('Workflow must have at least one step');
        validation.valid = false;
      }

      // Validate step dependencies
      for (const step of workflow.steps) {
        const dependencies = step.dependencies || [];
        for (const depId of dependencies) {
          if (!workflow.steps.find((s: any) => s.id === depId)) {
            validation.errors.push(`Step "${step.name}" has invalid dependency: ${depId}`);
            validation.valid = false;
          }
        }
      }

      // Check for circular dependencies
      const visited = new Set();
      const recursionStack = new Set();
      
      const hasCycle = (stepId: string): boolean => {
        if (recursionStack.has(stepId)) return true;
        if (visited.has(stepId)) return false;

        visited.add(stepId);
        recursionStack.add(stepId);

        const step = workflow.steps.find((s: any) => s.id === stepId);
        if (step?.dependencies) {
          for (const depId of step.dependencies) {
            if (hasCycle(depId)) return true;
          }
        }

        recursionStack.delete(stepId);
        return false;
      };

      for (const step of workflow.steps) {
        if (hasCycle(step.id)) {
          validation.errors.push('Workflow contains circular dependencies');
          validation.valid = false;
          break;
        }
      }

      return validation;
    }),

  testWorkflowStep: protectedProcedure
    .input(z.object({
      stepId: z.string(),
      testData: z.any().default({})
    }))
    .mutation(async ({ input, ctx }) => {
      // Mock step testing - implement actual step validation
      return {
        stepId: input.stepId,
        testResult: 'success',
        output: { message: 'Step test completed', testData: input.testData },
        duration: Math.random() * 1000,
        timestamp: new Date()
      };
    }),

  // Bulk Operations
  bulkExecuteWorkflows: protectedProcedure
    .input(z.object({
      workflowIds: z.array(z.string()),
      triggerData: z.any().default({})
    }))
    .mutation(async ({ input, ctx }) => {
      const results = [];
      
      for (const workflowId of input.workflowIds) {
        try {
          const execution = await workflowAutomationService.executeWorkflow(
            ctx.user.tenantId,
            workflowId,
            input.triggerData
          );
          results.push({ workflowId, success: true, execution });
        } catch (error: any) {
          results.push({ workflowId, success: false, error: error.message });
        }
      }

      return { results, totalRequested: input.workflowIds.length };
    }),

  exportWorkflow: protectedProcedure
    .input(z.object({ workflowId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const workflow = await workflowAutomationService.getWorkflow(
        ctx.user.tenantId,
        input.workflowId
      );

      if (!workflow) {
        throw new Error('Workflow not found');
      }

      const exportData = {
        name: workflow.name,
        description: workflow.description,
        trigger: workflow.trigger,
        triggerConfig: workflow.triggerConfig,
        steps: workflow.steps.map((step: any) => ({
          name: step.name,
          type: step.type,
          action: step.action,
          config: step.config,
          position: step.position,
          condition: step.condition,
          retryConfig: step.retryConfig,
          timeout: step.timeout,
          dependencies: step.dependencies
        })),
        variables: workflow.variables?.map((v: any) => ({
          name: v.name,
          type: v.type,
          description: v.description,
          defaultValue: v.isSecret ? '[REDACTED]' : v.value
        })),
        metadata: workflow.metadata,
        exportedAt: new Date(),
        version: workflow.version
      };

      return exportData;
    }),

  importWorkflow: protectedProcedure
    .input(z.object({
      workflowData: z.any(),
      name: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      const workflowConfig = {
        name: input.name || input.workflowData.name || 'Imported Workflow',
        description: input.workflowData.description,
        trigger: input.workflowData.trigger,
        triggerConfig: input.workflowData.triggerConfig,
        metadata: input.workflowData.metadata
      };

      const workflow = await workflowAutomationService.createWorkflow(
        ctx.user.tenantId,
        ctx.user.id,
        workflowConfig
      );

      // Add steps
      if (input.workflowData.steps) {
        for (const stepData of input.workflowData.steps) {
          await workflowAutomationService.addWorkflowStep(
            ctx.user.tenantId,
            workflow.id,
            stepData
          );
        }
      }

      // Add variables
      if (input.workflowData.variables) {
        for (const variableData of input.workflowData.variables) {
          if (!variableData.defaultValue || variableData.defaultValue === '[REDACTED]') {
            continue; // Skip secret variables without values
          }
          
          await workflowAutomationService.setVariable(ctx.user.tenantId, {
            ...variableData,
            value: variableData.defaultValue,
            workflowId: workflow.id
          });
        }
      }

      return workflow;
    }),

  // Admin Functions
  initializeScheduler: adminProcedure
    .mutation(async () => {
      return await workflowAutomationService.initializeScheduler();
    }),

  getSystemStats: adminProcedure
    .query(async () => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      return {
        recentExecutions: await workflowAutomationService.getWorkflowAnalytics('system', {
          start: oneHourAgo,
          end: new Date()
        }),
        timestamp: new Date()
      };
    })
});