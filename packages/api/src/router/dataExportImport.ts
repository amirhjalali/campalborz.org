import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { DataExportImportService } from "../services/dataExportImport";
import { TRPCError } from "@trpc/server";

const dataExportImportService = new DataExportImportService();

export const dataExportImportRouter = router({
  // Export Operations
  createExport: protectedProcedure
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      exportType: z.enum(['FULL', 'INCREMENTAL', 'FILTERED', 'CUSTOM']),
      format: z.enum(['CSV', 'JSON', 'XLSX', 'XML', 'PDF', 'SQL']),
      entityTypes: z.array(z.string()),
      filters: z.record(z.any()).optional(),
      fields: z.array(z.string()).optional(),
      expiresAt: z.date().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await dataExportImportService.createExport(ctx.session.user.activeTenantId!, ctx.session.user.id, input);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create export'
        });
      }
    }),

  getExports: protectedProcedure
    .input(z.object({
      userId: z.string().optional()
    }))
    .query(async ({ ctx, input }) => {
      try {
        return await dataExportImportService.getExports(ctx.session.user.activeTenantId!, input.userId);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch exports'
        });
      }
    }),

  getExport: protectedProcedure
    .input(z.object({
      exportId: z.string()
    }))
    .query(async ({ ctx, input }) => {
      try {
        return await dataExportImportService.getExport(ctx.session.user.activeTenantId!, input.exportId);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch export'
        });
      }
    }),

  cancelExport: protectedProcedure
    .input(z.object({
      exportId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        await dataExportImportService.cancelExport(ctx.session.user.activeTenantId!, input.exportId);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to cancel export'
        });
      }
    }),

  // Import Operations
  createImport: protectedProcedure
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      importType: z.enum(['CREATE', 'UPDATE', 'UPSERT', 'DELETE']),
      format: z.enum(['CSV', 'JSON', 'XLSX', 'XML']),
      entityType: z.string(),
      fileUrl: z.string(),
      fileName: z.string(),
      fileSize: z.number(),
      mapping: z.record(z.string()),
      validation: z.record(z.any()).optional(),
      options: z.record(z.any()).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await dataExportImportService.createImport(ctx.session.user.activeTenantId!, ctx.session.user.id, input);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create import'
        });
      }
    }),

  getImports: protectedProcedure
    .input(z.object({
      userId: z.string().optional()
    }))
    .query(async ({ ctx, input }) => {
      try {
        return await dataExportImportService.getImports(ctx.session.user.activeTenantId!, input.userId);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch imports'
        });
      }
    }),

  getImport: protectedProcedure
    .input(z.object({
      importId: z.string()
    }))
    .query(async ({ ctx, input }) => {
      try {
        return await dataExportImportService.getImport(ctx.session.user.activeTenantId!, input.importId);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch import'
        });
      }
    }),

  // Template Management
  createTemplate: protectedProcedure
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      type: z.enum(['EXPORT', 'IMPORT']),
      entityType: z.string(),
      format: z.enum(['CSV', 'JSON', 'XLSX', 'XML', 'PDF', 'SQL']),
      fields: z.array(z.string()).optional(),
      filters: z.record(z.any()).optional(),
      mapping: z.record(z.string()).optional(),
      isPublic: z.boolean().default(false)
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await dataExportImportService.createTemplate(ctx.session.user.activeTenantId!, ctx.session.user.id, input);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create template'
        });
      }
    }),

  getTemplates: protectedProcedure
    .input(z.object({
      type: z.enum(['EXPORT', 'IMPORT']).optional(),
      entityType: z.string().optional()
    }))
    .query(async ({ ctx, input }) => {
      try {
        return await dataExportImportService.getTemplates(ctx.session.user.activeTenantId!, input.type, input.entityType);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch templates'
        });
      }
    }),

  updateTemplate: protectedProcedure
    .input(z.object({
      templateId: z.string(),
      name: z.string().optional(),
      description: z.string().optional(),
      format: z.enum(['CSV', 'JSON', 'XLSX', 'XML', 'PDF', 'SQL']).optional(),
      fields: z.array(z.string()).optional(),
      filters: z.record(z.any()).optional(),
      mapping: z.record(z.string()).optional(),
      isPublic: z.boolean().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { templateId, ...updateData } = input;
        return await dataExportImportService.updateTemplate(ctx.session.user.activeTenantId!, templateId, updateData);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update template'
        });
      }
    }),

  deleteTemplate: protectedProcedure
    .input(z.object({
      templateId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        await dataExportImportService.deleteTemplate(ctx.session.user.activeTenantId!, input.templateId);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete template'
        });
      }
    }),

  // Export from Template
  exportFromTemplate: protectedProcedure
    .input(z.object({
      templateId: z.string(),
      name: z.string(),
      description: z.string().optional(),
      exportType: z.enum(['FULL', 'INCREMENTAL', 'FILTERED', 'CUSTOM']).default('FULL'),
      filters: z.record(z.any()).optional(),
      expiresAt: z.date().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const template = await dataExportImportService.getTemplates(ctx.session.user.activeTenantId!);
        const targetTemplate = template.find(t => t.id === input.templateId);
        
        if (!targetTemplate) {
          throw new Error('Template not found');
        }

        const exportOptions = {
          name: input.name,
          description: input.description,
          exportType: input.exportType,
          format: targetTemplate.format,
          entityTypes: [targetTemplate.entityType],
          filters: { ...targetTemplate.filters, ...input.filters },
          fields: targetTemplate.fields as string[] || undefined,
          expiresAt: input.expiresAt
        };

        return await dataExportImportService.createExport(ctx.session.user.activeTenantId!, ctx.session.user.id, exportOptions);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create export from template'
        });
      }
    }),

  // Data Sync
  createSync: protectedProcedure
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      sourceType: z.enum(['DATABASE', 'API', 'FILE', 'WEBHOOK']),
      targetType: z.enum(['DATABASE', 'API', 'FILE', 'EMAIL']),
      sourceConfig: z.record(z.any()),
      targetConfig: z.record(z.any()),
      mapping: z.record(z.any()),
      schedule: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await dataExportImportService.createSync(ctx.session.user.activeTenantId!, ctx.session.user.id, input);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create sync configuration'
        });
      }
    }),

  getSyncs: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        return await dataExportImportService.getSyncs(ctx.session.user.activeTenantId!);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch sync configurations'
        });
      }
    }),

  executeSync: protectedProcedure
    .input(z.object({
      syncId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await dataExportImportService.executeSync(ctx.session.user.activeTenantId!, input.syncId);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to execute sync'
        });
      }
    }),

  // Backup Operations
  createBackup: protectedProcedure
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      backupType: z.enum(['FULL', 'INCREMENTAL', 'SELECTIVE']),
      entityTypes: z.array(z.string()).optional(),
      compression: z.boolean().default(true),
      encryption: z.boolean().default(true),
      expiresAt: z.date().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await dataExportImportService.createBackup(ctx.session.user.activeTenantId!, ctx.session.user.id, input);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create backup'
        });
      }
    }),

  getBackups: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        return await dataExportImportService.getBackups(ctx.session.user.activeTenantId!);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch backups'
        });
      }
    }),

  // Quick Export Operations
  exportUsers: protectedProcedure
    .input(z.object({
      format: z.enum(['CSV', 'JSON', 'XLSX']).default('CSV'),
      filters: z.record(z.any()).optional(),
      fields: z.array(z.string()).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await dataExportImportService.createExport(ctx.session.user.activeTenantId!, ctx.session.user.id, {
          name: `users-export-${Date.now()}`,
          exportType: 'FILTERED',
          format: input.format,
          entityTypes: ['users'],
          filters: input.filters,
          fields: input.fields
        });
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to export users'
        });
      }
    }),

  exportEvents: protectedProcedure
    .input(z.object({
      format: z.enum(['CSV', 'JSON', 'XLSX']).default('CSV'),
      filters: z.record(z.any()).optional(),
      fields: z.array(z.string()).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await dataExportImportService.createExport(ctx.session.user.activeTenantId!, ctx.session.user.id, {
          name: `events-export-${Date.now()}`,
          exportType: 'FILTERED',
          format: input.format,
          entityTypes: ['events'],
          filters: input.filters,
          fields: input.fields
        });
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to export events'
        });
      }
    }),

  exportDonations: protectedProcedure
    .input(z.object({
      format: z.enum(['CSV', 'JSON', 'XLSX']).default('CSV'),
      filters: z.record(z.any()).optional(),
      fields: z.array(z.string()).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await dataExportImportService.createExport(ctx.session.user.activeTenantId!, ctx.session.user.id, {
          name: `donations-export-${Date.now()}`,
          exportType: 'FILTERED',
          format: input.format,
          entityTypes: ['donations'],
          filters: input.filters,
          fields: input.fields
        });
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to export donations'
        });
      }
    }),

  // Import Validation
  validateImportFile: protectedProcedure
    .input(z.object({
      fileUrl: z.string(),
      format: z.enum(['CSV', 'JSON', 'XLSX', 'XML']),
      entityType: z.string(),
      mapping: z.record(z.string()),
      validation: z.record(z.any()).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // This would validate the file without actually importing
        // Return validation results and preview
        return {
          isValid: true,
          errors: [],
          warnings: [],
          preview: [
            { name: 'John Doe', email: 'john@example.com', status: 'Valid' },
            { name: 'Jane Smith', email: 'jane@example.com', status: 'Valid' }
          ],
          totalRows: 2,
          validRows: 2
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to validate import file'
        });
      }
    }),

  // Data Migration
  migrateData: protectedProcedure
    .input(z.object({
      sourceEntityType: z.string(),
      targetEntityType: z.string(),
      mapping: z.record(z.string()),
      filters: z.record(z.any()).optional(),
      batchSize: z.number().default(100)
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // This would handle data migration between entity types
        // For example, migrating old user format to new format
        return {
          migrationId: 'migration-' + Date.now(),
          status: 'PENDING',
          totalRecords: 0,
          processedRecords: 0
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to start data migration'
        });
      }
    }),

  // Cleanup Operations
  cleanupExpiredExports: protectedProcedure
    .mutation(async ({ ctx }) => {
      try {
        await dataExportImportService.cleanupExpiredExports();
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to cleanup expired exports'
        });
      }
    }),

  cleanupExpiredBackups: protectedProcedure
    .mutation(async ({ ctx }) => {
      try {
        await dataExportImportService.cleanupExpiredBackups();
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to cleanup expired backups'
        });
      }
    }),

  // Analytics
  getDataOperationsStats: protectedProcedure
    .input(z.object({
      period: z.enum(['day', 'week', 'month']).default('week')
    }))
    .query(async ({ ctx, input }) => {
      try {
        return await dataExportImportService.getDataOperationsStats(ctx.session.user.activeTenantId!, input.period);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch data operations statistics'
        });
      }
    }),

  // Bulk Operations
  bulkExport: protectedProcedure
    .input(z.object({
      exports: z.array(z.object({
        name: z.string(),
        entityType: z.string(),
        format: z.enum(['CSV', 'JSON', 'XLSX']),
        filters: z.record(z.any()).optional()
      }))
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const results = [];
        
        for (const exportConfig of input.exports) {
          const exportResult = await dataExportImportService.createExport(ctx.session.user.activeTenantId!, ctx.session.user.id, {
            name: exportConfig.name,
            exportType: 'FILTERED',
            format: exportConfig.format,
            entityTypes: [exportConfig.entityType],
            filters: exportConfig.filters
          });
          
          results.push(exportResult);
        }
        
        return results;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create bulk exports'
        });
      }
    }),

  // Scheduled Operations
  scheduleExport: protectedProcedure
    .input(z.object({
      name: z.string(),
      schedule: z.string(), // Cron expression
      exportConfig: z.object({
        exportType: z.enum(['FULL', 'INCREMENTAL', 'FILTERED', 'CUSTOM']),
        format: z.enum(['CSV', 'JSON', 'XLSX', 'XML', 'PDF', 'SQL']),
        entityTypes: z.array(z.string()),
        filters: z.record(z.any()).optional(),
        fields: z.array(z.string()).optional()
      })
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // This would create a scheduled export job
        // In production, would integrate with a job scheduler like Bull or Agenda
        return {
          scheduleId: 'schedule-' + Date.now(),
          name: input.name,
          schedule: input.schedule,
          status: 'ACTIVE',
          nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000) // Next day
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to schedule export'
        });
      }
    })
});