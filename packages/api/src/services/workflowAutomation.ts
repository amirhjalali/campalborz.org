import { PrismaClient } from "@prisma/client";
import * as cron from "node-cron";

const prisma = new PrismaClient();

interface WorkflowConfig {
  name: string;
  description?: string;
  trigger: string;
  triggerConfig?: any;
  isActive?: boolean;
  version?: number;
  tags?: string[];
  metadata?: any;
}

interface WorkflowStepConfig {
  name: string;
  type: string;
  action: string;
  config?: any;
  position: number;
  condition?: any;
  retryConfig?: any;
  timeout?: number;
  dependencies?: string[];
}

interface WorkflowExecutionContext {
  workflowId: string;
  triggerData?: any;
  variables?: Record<string, any>;
  stepResults?: Record<string, any>;
}

interface ScheduleConfig {
  name: string;
  cronExpression: string;
  timezone?: string;
  config?: any;
}

interface TemplateConfig {
  name: string;
  description?: string;
  category: string;
  template: any;
  config?: any;
  isPublic?: boolean;
  tags?: string[];
}

interface VariableConfig {
  name: string;
  value: string;
  type: string;
  isSecret?: boolean;
  description?: string;
  workflowId?: string;
}

export class WorkflowAutomationService {
  private scheduledJobs: Map<string, any> = new Map();

  async createWorkflow(tenantId: string, userId: string, config: WorkflowConfig) {
    const workflow = await prisma.workflow.create({
      data: {
        ...config,
        tenantId,
        createdBy: userId,
        tags: config.tags || [],
        metadata: config.metadata || {}
      },
      include: {
        steps: true
      }
    });

    await this.logWorkflowActivity(tenantId, workflow.id, 'info', `Workflow "${workflow.name}" created`);

    return workflow;
  }

  async getWorkflows(tenantId: string, filters: {
    trigger?: string;
    isActive?: boolean;
    tags?: string[];
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const where: any = { tenantId };

    if (filters.trigger) where.trigger = filters.trigger;
    if (filters.isActive !== undefined) where.isActive = filters.isActive;
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { description: { contains: filters.search } }
      ];
    }

    const [workflows, total] = await Promise.all([
      prisma.workflow.findMany({
        where,
        include: {
          steps: {
            orderBy: { position: 'asc' }
          },
          _count: {
            select: {
              executions: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: ((filters.page || 1) - 1) * (filters.limit || 20),
        take: filters.limit || 20
      }),
      prisma.workflow.count({ where })
    ]);

    return {
      workflows,
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 20,
        total,
        pages: Math.ceil(total / (filters.limit || 20))
      }
    };
  }

  async getWorkflow(tenantId: string, workflowId: string) {
    return await prisma.workflow.findFirst({
      where: { id: workflowId, tenantId },
      include: {
        steps: {
          orderBy: { position: 'asc' }
        },
        executions: {
          orderBy: { startedAt: 'desc' },
          take: 10
        },
        schedules: true,
        variables: true,
        logs: {
          orderBy: { timestamp: 'desc' },
          take: 50
        }
      }
    });
  }

  async updateWorkflow(tenantId: string, workflowId: string, config: Partial<WorkflowConfig>) {
    const workflow = await prisma.workflow.update({
      where: { id: workflowId, tenantId },
      data: {
        ...config,
        version: { increment: 1 },
        tags: config.tags || undefined,
        metadata: config.metadata || undefined
      },
      include: {
        steps: true
      }
    });

    await this.logWorkflowActivity(tenantId, workflowId, 'info', `Workflow updated to version ${workflow.version}`);

    return workflow;
  }

  async deleteWorkflow(tenantId: string, workflowId: string) {
    await this.stopScheduledWorkflow(workflowId);

    const workflow = await prisma.workflow.delete({
      where: { id: workflowId, tenantId }
    });

    await this.logWorkflowActivity(tenantId, workflowId, 'info', `Workflow "${workflow.name}" deleted`);

    return { success: true };
  }

  async addWorkflowStep(tenantId: string, workflowId: string, config: WorkflowStepConfig) {
    const step = await prisma.workflowStep.create({
      data: {
        ...config,
        tenantId,
        workflowId,
        config: config.config || {},
        retryConfig: config.retryConfig || { maxAttempts: 3, backoffMultiplier: 2 },
        dependencies: config.dependencies || []
      }
    });

    await this.logWorkflowActivity(tenantId, workflowId, 'info', `Step "${step.name}" added at position ${step.position}`);

    return step;
  }

  async updateWorkflowStep(tenantId: string, stepId: string, config: Partial<WorkflowStepConfig>) {
    const step = await prisma.workflowStep.update({
      where: { id: stepId, tenantId },
      data: {
        ...config,
        config: config.config || undefined,
        retryConfig: config.retryConfig || undefined,
        dependencies: config.dependencies || undefined
      }
    });

    await this.logWorkflowActivity(tenantId, step.workflowId, 'info', `Step "${step.name}" updated`);

    return step;
  }

  async removeWorkflowStep(tenantId: string, stepId: string) {
    const step = await prisma.workflowStep.delete({
      where: { id: stepId, tenantId }
    });

    await this.logWorkflowActivity(tenantId, step.workflowId, 'info', `Step "${step.name}" removed`);

    return { success: true };
  }

  async executeWorkflow(tenantId: string, workflowId: string, triggerData: any = {}) {
    const workflow = await prisma.workflow.findFirst({
      where: { id: workflowId, tenantId, isActive: true },
      include: {
        steps: {
          where: { isActive: true },
          orderBy: { position: 'asc' }
        },
        variables: true
      }
    });

    if (!workflow) {
      throw new Error('Workflow not found or inactive');
    }

    const execution = await prisma.workflowExecution.create({
      data: {
        tenantId,
        workflowId,
        status: 'running',
        triggerData,
        context: {
          variables: this.buildVariableContext(workflow.variables),
          stepResults: {}
        }
      }
    });

    await this.logWorkflowActivity(tenantId, workflowId, 'info', `Workflow execution started`, execution.id);

    try {
      await this.executeWorkflowSteps(tenantId, execution.id, workflow.steps, execution.context);

      await prisma.workflowExecution.update({
        where: { id: execution.id },
        data: {
          status: 'completed',
          completedAt: new Date(),
          duration: Date.now() - execution.startedAt.getTime()
        }
      });

      await this.logWorkflowActivity(tenantId, workflowId, 'info', 'Workflow execution completed', execution.id);

    } catch (error: any) {
      await prisma.workflowExecution.update({
        where: { id: execution.id },
        data: {
          status: 'failed',
          completedAt: new Date(),
          duration: Date.now() - execution.startedAt.getTime(),
          error: error.message
        }
      });

      await this.logWorkflowActivity(tenantId, workflowId, 'error', `Workflow execution failed: ${error.message}`, execution.id);

      throw error;
    }

    return execution;
  }

  private async executeWorkflowSteps(tenantId: string, executionId: string, steps: any[], context: any) {
    for (const step of steps) {
      if (!this.shouldExecuteStep(step, context)) {
        await this.createStepExecution(tenantId, executionId, step.id, 'skipped', {}, {});
        continue;
      }

      const stepExecution = await this.createStepExecution(tenantId, executionId, step.id, 'running', context, {});

      try {
        const result = await this.executeStep(tenantId, step, context);
        
        context.stepResults[step.id] = result;

        await prisma.workflowStepExecution.update({
          where: { id: stepExecution.id },
          data: {
            status: 'completed',
            output: result,
            completedAt: new Date(),
            duration: Date.now() - stepExecution.startedAt.getTime()
          }
        });

      } catch (error: any) {
        const maxAttempts = step.retryConfig?.maxAttempts || 3;
        
        if (stepExecution.attempts < maxAttempts) {
          await prisma.workflowStepExecution.update({
            where: { id: stepExecution.id },
            data: {
              status: 'retrying',
              attempts: { increment: 1 },
              error: error.message
            }
          });

          const backoffMs = (step.retryConfig?.backoffMultiplier || 2) * 1000 * stepExecution.attempts;
          await new Promise(resolve => setTimeout(resolve, backoffMs));

          continue;
        }

        await prisma.workflowStepExecution.update({
          where: { id: stepExecution.id },
          data: {
            status: 'failed',
            completedAt: new Date(),
            duration: Date.now() - stepExecution.startedAt.getTime(),
            error: error.message
          }
        });

        throw error;
      }
    }
  }

  private shouldExecuteStep(step: any, context: any): boolean {
    if (!step.condition) return true;

    try {
      return this.evaluateCondition(step.condition, context);
    } catch (error) {
      return false;
    }
  }

  private evaluateCondition(condition: any, context: any): boolean {
    const { operator, left, right } = condition;
    const leftValue = this.resolveValue(left, context);
    const rightValue = this.resolveValue(right, context);

    switch (operator) {
      case 'equals': return leftValue === rightValue;
      case 'not_equals': return leftValue !== rightValue;
      case 'greater_than': return leftValue > rightValue;
      case 'less_than': return leftValue < rightValue;
      case 'contains': return String(leftValue).includes(String(rightValue));
      case 'exists': return leftValue != null;
      default: return true;
    }
  }

  private resolveValue(value: any, context: any): any {
    if (typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}')) {
      const path = value.slice(2, -2).trim();
      return this.getNestedValue(context, path);
    }
    return value;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private async createStepExecution(tenantId: string, executionId: string, stepId: string, status: string, input: any, output: any) {
    return await prisma.workflowStepExecution.create({
      data: {
        tenantId,
        executionId,
        stepId,
        status: status as any,
        input,
        output
      }
    });
  }

  private async executeStep(tenantId: string, step: any, context: any): Promise<any> {
    const config = this.resolveStepConfig(step.config, context);

    switch (step.action) {
      case 'send_email':
        return await this.executeEmailAction(tenantId, config);
      case 'send_notification':
        return await this.executeNotificationAction(tenantId, config);
      case 'create_record':
        return await this.executeCreateRecordAction(tenantId, config);
      case 'update_record':
        return await this.executeUpdateRecordAction(tenantId, config);
      case 'call_api':
        return await this.executeApiCallAction(config);
      case 'delay':
        return await this.executeDelayAction(config);
      case 'calculate_value':
        return await this.executeCalculationAction(config, context);
      case 'transform_data':
        return await this.executeDataTransformAction(config, context);
      default:
        throw new Error(`Unknown action: ${step.action}`);
    }
  }

  private resolveStepConfig(config: any, context: any): any {
    const resolved = JSON.parse(JSON.stringify(config));
    return this.resolveObjectValues(resolved, context);
  }

  private resolveObjectValues(obj: any, context: any): any {
    if (typeof obj === 'string') {
      return this.resolveValue(obj, context);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.resolveObjectValues(item, context));
    }
    
    if (obj && typeof obj === 'object') {
      const resolved: any = {};
      for (const [key, value] of Object.entries(obj)) {
        resolved[key] = this.resolveObjectValues(value, context);
      }
      return resolved;
    }
    
    return obj;
  }

  private async executeEmailAction(tenantId: string, config: any) {
    // Mock email sending - integrate with your email service
    await new Promise(resolve => setTimeout(resolve, 100));
    return {
      sent: true,
      to: config.to,
      subject: config.subject,
      timestamp: new Date()
    };
  }

  private async executeNotificationAction(tenantId: string, config: any) {
    // Mock notification sending
    await new Promise(resolve => setTimeout(resolve, 50));
    return {
      sent: true,
      type: config.type,
      message: config.message,
      timestamp: new Date()
    };
  }

  private async executeCreateRecordAction(tenantId: string, config: any) {
    // Mock record creation - integrate with your data layer
    const record = {
      id: `record_${Date.now()}`,
      ...config.data,
      tenantId,
      createdAt: new Date()
    };
    
    return { created: true, record };
  }

  private async executeUpdateRecordAction(tenantId: string, config: any) {
    // Mock record update
    const record = {
      id: config.recordId,
      ...config.data,
      updatedAt: new Date()
    };
    
    return { updated: true, record };
  }

  private async executeApiCallAction(config: any) {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 200));
    return {
      status: 200,
      data: { message: 'API call successful' },
      url: config.url,
      method: config.method,
      timestamp: new Date()
    };
  }

  private async executeDelayAction(config: any) {
    const delayMs = config.duration || 1000;
    await new Promise(resolve => setTimeout(resolve, delayMs));
    return { delayed: delayMs, timestamp: new Date() };
  }

  private async executeCalculationAction(config: any, context: any) {
    const { expression, variables } = config;
    const resolvedVariables = this.resolveObjectValues(variables, context);
    
    // Simple calculation engine
    let result = expression;
    for (const [key, value] of Object.entries(resolvedVariables)) {
      result = result.replace(new RegExp(`{${key}}`, 'g'), value);
    }
    
    try {
      const calculatedValue = eval(result); // Note: Use a proper expression parser in production
      return { result: calculatedValue, expression };
    } catch (error) {
      throw new Error(`Calculation failed: ${error}`);
    }
  }

  private async executeDataTransformAction(config: any, context: any) {
    const { input, transformations } = config;
    const data = this.resolveValue(input, context);
    
    let transformed = data;
    for (const transformation of transformations) {
      switch (transformation.type) {
        case 'filter':
          transformed = transformed.filter((item: any) => 
            this.evaluateCondition(transformation.condition, { item, ...context })
          );
          break;
        case 'map':
          transformed = transformed.map((item: any) => 
            this.resolveObjectValues(transformation.mapping, { item, ...context })
          );
          break;
        case 'sort':
          transformed = transformed.sort((a: any, b: any) => {
            const aVal = this.getNestedValue(a, transformation.field);
            const bVal = this.getNestedValue(b, transformation.field);
            return transformation.order === 'desc' ? bVal - aVal : aVal - bVal;
          });
          break;
      }
    }
    
    return { transformed, originalCount: data.length, transformedCount: transformed.length };
  }

  private buildVariableContext(variables: any[]): Record<string, any> {
    const context: Record<string, any> = {};
    for (const variable of variables) {
      context[variable.name] = this.parseVariableValue(variable.value, variable.type);
    }
    return context;
  }

  private parseVariableValue(value: string, type: string): any {
    switch (type) {
      case 'number': return parseFloat(value);
      case 'boolean': return value === 'true';
      case 'json': return JSON.parse(value);
      default: return value;
    }
  }

  async getWorkflowExecutions(tenantId: string, workflowId: string, filters: {
    status?: string;
    startTime?: Date;
    endTime?: Date;
    page?: number;
    limit?: number;
  }) {
    const where: any = { tenantId, workflowId };

    if (filters.status) where.status = filters.status;
    if (filters.startTime || filters.endTime) {
      where.startedAt = {};
      if (filters.startTime) where.startedAt.gte = filters.startTime;
      if (filters.endTime) where.startedAt.lte = filters.endTime;
    }

    const [executions, total] = await Promise.all([
      prisma.workflowExecution.findMany({
        where,
        include: {
          stepExecutions: {
            include: {
              step: {
                select: { name: true, action: true }
              }
            }
          }
        },
        orderBy: { startedAt: 'desc' },
        skip: ((filters.page || 1) - 1) * (filters.limit || 20),
        take: filters.limit || 20
      }),
      prisma.workflowExecution.count({ where })
    ]);

    return {
      executions,
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 20,
        total,
        pages: Math.ceil(total / (filters.limit || 20))
      }
    };
  }

  async scheduleWorkflow(tenantId: string, workflowId: string, config: ScheduleConfig) {
    const schedule = await prisma.workflowSchedule.create({
      data: {
        ...config,
        tenantId,
        workflowId,
        nextRunAt: this.calculateNextRun(config.cronExpression, config.timezone)
      }
    });

    if (schedule.isActive) {
      await this.startScheduledWorkflow(schedule);
    }

    return schedule;
  }

  private calculateNextRun(cronExpression: string, timezone: string = 'UTC'): Date {
    // Simple next run calculation - use a proper cron library in production
    const now = new Date();
    return new Date(now.getTime() + 60 * 60 * 1000); // Next hour for demo
  }

  private async startScheduledWorkflow(schedule: any) {
    if (this.scheduledJobs.has(schedule.id)) {
      this.scheduledJobs.get(schedule.id).destroy();
    }

    const task = cron.schedule(schedule.cronExpression, async () => {
      try {
        await this.executeWorkflow(schedule.tenantId, schedule.workflowId, {
          trigger: 'schedule',
          scheduleId: schedule.id
        });

        await prisma.workflowSchedule.update({
          where: { id: schedule.id },
          data: {
            lastRunAt: new Date(),
            nextRunAt: this.calculateNextRun(schedule.cronExpression, schedule.timezone)
          }
        });
      } catch (error: any) {
        await this.logWorkflowActivity(
          schedule.tenantId,
          schedule.workflowId,
          'error',
          `Scheduled execution failed: ${error.message}`
        );
      }
    }, {
      scheduled: true,
      timezone: schedule.timezone
    });

    this.scheduledJobs.set(schedule.id, task);
  }

  private async stopScheduledWorkflow(workflowId: string) {
    const schedules = await prisma.workflowSchedule.findMany({
      where: { workflowId, isActive: true }
    });

    for (const schedule of schedules) {
      if (this.scheduledJobs.has(schedule.id)) {
        this.scheduledJobs.get(schedule.id).destroy();
        this.scheduledJobs.delete(schedule.id);
      }
    }
  }

  async createTemplate(tenantId: string, userId: string, config: TemplateConfig) {
    return await prisma.workflowTemplate.create({
      data: {
        ...config,
        tenantId,
        createdBy: userId,
        tags: config.tags || []
      }
    });
  }

  async getTemplates(tenantId: string, filters: {
    category?: string;
    isPublic?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const where: any = {};

    if (filters.isPublic !== undefined) {
      where.OR = [
        { tenantId, isPublic: false },
        { isPublic: true }
      ];
    } else {
      where.tenantId = tenantId;
    }

    if (filters.category) where.category = filters.category;
    if (filters.search) {
      where.name = { contains: filters.search };
    }

    const [templates, total] = await Promise.all([
      prisma.workflowTemplate.findMany({
        where,
        include: {
          creator: {
            select: { name: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: ((filters.page || 1) - 1) * (filters.limit || 20),
        take: filters.limit || 20
      }),
      prisma.workflowTemplate.count({ where })
    ]);

    return {
      templates,
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 20,
        total,
        pages: Math.ceil(total / (filters.limit || 20))
      }
    };
  }

  async createWorkflowFromTemplate(tenantId: string, userId: string, templateId: string, customization: any = {}) {
    const template = await prisma.workflowTemplate.findFirst({
      where: {
        id: templateId,
        OR: [
          { tenantId },
          { isPublic: true }
        ]
      }
    });

    if (!template) {
      throw new Error('Template not found');
    }

    const workflowData = {
      ...template.template,
      ...customization,
      name: customization.name || `${template.name} - Copy`,
      description: customization.description || template.description
    };

    const workflow = await this.createWorkflow(tenantId, userId, workflowData);

    await prisma.workflowTemplate.update({
      where: { id: templateId },
      data: { downloadCount: { increment: 1 } }
    });

    return workflow;
  }

  async setVariable(tenantId: string, config: VariableConfig) {
    return await prisma.workflowVariable.upsert({
      where: {
        tenantId_workflowId_name: {
          tenantId,
          workflowId: config.workflowId || null,
          name: config.name
        }
      },
      update: {
        value: config.value,
        type: config.type as any,
        isSecret: config.isSecret,
        description: config.description
      },
      create: {
        ...config,
        tenantId,
        type: config.type as any
      }
    });
  }

  async getVariables(tenantId: string, workflowId?: string) {
    return await prisma.workflowVariable.findMany({
      where: {
        tenantId,
        workflowId: workflowId || null
      },
      select: {
        id: true,
        name: true,
        type: true,
        isSecret: true,
        description: true,
        value: true, // Consider masking secrets in production
        createdAt: true,
        updatedAt: true
      }
    });
  }

  private async logWorkflowActivity(tenantId: string, workflowId: string, level: string, message: string, executionId?: string) {
    await prisma.workflowLog.create({
      data: {
        tenantId,
        workflowId,
        executionId,
        level: level as any,
        message,
        timestamp: new Date()
      }
    });
  }

  async getWorkflowLogs(tenantId: string, workflowId: string, filters: {
    level?: string;
    executionId?: string;
    startTime?: Date;
    endTime?: Date;
    page?: number;
    limit?: number;
  }) {
    const where: any = { tenantId, workflowId };

    if (filters.level) where.level = filters.level;
    if (filters.executionId) where.executionId = filters.executionId;
    if (filters.startTime || filters.endTime) {
      where.timestamp = {};
      if (filters.startTime) where.timestamp.gte = filters.startTime;
      if (filters.endTime) where.timestamp.lte = filters.endTime;
    }

    const [logs, total] = await Promise.all([
      prisma.workflowLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip: ((filters.page || 1) - 1) * (filters.limit || 50),
        take: filters.limit || 50
      }),
      prisma.workflowLog.count({ where })
    ]);

    return {
      logs,
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 50,
        total,
        pages: Math.ceil(total / (filters.limit || 50))
      }
    };
  }

  async getWorkflowAnalytics(tenantId: string, timeRange: { start: Date; end: Date }) {
    const [
      totalExecutions,
      executionsByStatus,
      executionsByWorkflow,
      averageDuration,
      failureRate
    ] = await Promise.all([
      prisma.workflowExecution.count({
        where: {
          tenantId,
          startedAt: {
            gte: timeRange.start,
            lte: timeRange.end
          }
        }
      }),
      prisma.workflowExecution.groupBy({
        by: ['status'],
        where: {
          tenantId,
          startedAt: {
            gte: timeRange.start,
            lte: timeRange.end
          }
        },
        _count: true
      }),
      prisma.workflowExecution.groupBy({
        by: ['workflowId'],
        where: {
          tenantId,
          startedAt: {
            gte: timeRange.start,
            lte: timeRange.end
          }
        },
        _count: true,
        orderBy: {
          _count: {
            workflowId: 'desc'
          }
        },
        take: 10
      }),
      prisma.workflowExecution.aggregate({
        where: {
          tenantId,
          status: 'completed',
          startedAt: {
            gte: timeRange.start,
            lte: timeRange.end
          }
        },
        _avg: {
          duration: true
        }
      }),
      prisma.workflowExecution.aggregate({
        where: {
          tenantId,
          status: 'failed',
          startedAt: {
            gte: timeRange.start,
            lte: timeRange.end
          }
        },
        _count: true
      })
    ]);

    return {
      totalExecutions,
      executionsByStatus,
      executionsByWorkflow,
      averageDuration: averageDuration._avg.duration || 0,
      failureRate: totalExecutions > 0 ? (failureRate._count / totalExecutions * 100).toFixed(2) : '0.00',
      timeRange
    };
  }

  async initializeScheduler() {
    const activeSchedules = await prisma.workflowSchedule.findMany({
      where: { isActive: true }
    });

    for (const schedule of activeSchedules) {
      await this.startScheduledWorkflow(schedule);
    }

    console.log(`Initialized ${activeSchedules.length} workflow schedules`);
  }

  async cleanup() {
    for (const [scheduleId, task] of this.scheduledJobs) {
      task.destroy();
    }
    this.scheduledJobs.clear();
  }
}