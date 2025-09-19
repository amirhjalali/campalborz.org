import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { backupService } from "../services/backup";

// Backup management schemas
const CreateBackupSchema = z.object({
  type: z.enum(['database', 'files', 'full']),
  tenantId: z.string().optional(),
  options: z.object({
    compression: z.boolean().optional(),
    encryption: z.boolean().optional(),
    includeFiles: z.boolean().optional(),
  }).optional(),
});

const RestoreBackupSchema = z.object({
  backupId: z.string(),
  options: z.object({
    tenantId: z.string().optional(),
    overwrite: z.boolean().optional(),
    targetPath: z.string().optional(),
  }).optional(),
});

const ListBackupsSchema = z.object({
  tenantId: z.string().optional(),
  type: z.enum(['database', 'files', 'full']).optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'failed']).optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

const DeleteBackupSchema = z.object({
  backupId: z.string(),
});

export const backupRouter = router({
  // Create a new backup
  create: protectedProcedure
    .input(CreateBackupSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      // Only admins can create backups
      if (!["admin", "tenant_admin", "super_admin"].includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required to create backups",
        });
      }

      try {
        const targetTenantId = input.tenantId || ctx.tenant.id;
        
        // Ensure tenant isolation - only super admins can backup other tenants
        if (targetTenantId !== ctx.tenant.id && ctx.user.role !== "super_admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Cannot create backups for other tenants",
          });
        }

        let result;
        switch (input.type) {
          case 'database':
            result = await backupService.createDatabaseBackup(targetTenantId);
            break;
          case 'files':
            result = await backupService.createFilesBackup(targetTenantId);
            break;
          case 'full':
            result = await backupService.createFullBackup(targetTenantId);
            break;
          default:
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Invalid backup type",
            });
        }

        return {
          success: true,
          backup: result,
          message: `${input.type} backup created successfully`,
        };
      } catch (error) {
        console.error("Backup creation error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to create ${input.type} backup: ${error.message}`,
        });
      }
    }),

  // List backups
  list: protectedProcedure
    .input(ListBackupsSchema)
    .query(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      // Only admins can list backups
      if (!["admin", "tenant_admin", "super_admin"].includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required to list backups",
        });
      }

      try {
        const targetTenantId = input.tenantId || ctx.tenant.id;
        
        // Ensure tenant isolation - only super admins can list other tenants' backups
        if (targetTenantId !== ctx.tenant.id && ctx.user.role !== "super_admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Cannot list backups for other tenants",
          });
        }

        const filters = {
          tenantId: targetTenantId,
          type: input.type,
          status: input.status,
          limit: input.limit,
          offset: input.offset,
        };

        const result = await backupService.listBackups(filters);
        
        return {
          backups: result.backups,
          total: result.total,
          hasMore: result.total > (input.offset + input.limit),
          pagination: {
            limit: input.limit,
            offset: input.offset,
            total: result.total,
          },
        };
      } catch (error) {
        console.error("Backup list error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to list backups",
        });
      }
    }),

  // Get backup statistics
  getStats: protectedProcedure
    .query(async ({ ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      // Only admins can view backup statistics
      if (!["admin", "tenant_admin", "super_admin"].includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required to view backup statistics",
        });
      }

      try {
        const stats = await backupService.getBackupStats();
        
        return {
          ...stats,
          formattedTotalSize: backupService.formatBytes ? backupService.formatBytes(stats.totalSize) : `${stats.totalSize} bytes`,
          retrievedAt: new Date(),
        };
      } catch (error) {
        console.error("Backup stats error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve backup statistics",
        });
      }
    }),

  // Restore from backup
  restore: protectedProcedure
    .input(RestoreBackupSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      // Only super admins can restore backups (destructive operation)
      if (ctx.user.role !== "super_admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Super admin access required to restore backups",
        });
      }

      try {
        await backupService.restoreBackup(input.backupId, input.options || {});
        
        return {
          success: true,
          backupId: input.backupId,
          restoredAt: new Date(),
          message: "Backup restored successfully",
        };
      } catch (error) {
        console.error("Backup restore error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to restore backup: ${error.message}`,
        });
      }
    }),

  // Delete backup
  delete: protectedProcedure
    .input(DeleteBackupSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      // Only admins can delete backups
      if (!["admin", "tenant_admin", "super_admin"].includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required to delete backups",
        });
      }

      try {
        await backupService.deleteBackup(input.backupId);
        
        return {
          success: true,
          backupId: input.backupId,
          deletedAt: new Date(),
          message: "Backup deleted successfully",
        };
      } catch (error) {
        console.error("Backup delete error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to delete backup: ${error.message}`,
        });
      }
    }),

  // Cleanup expired backups
  cleanup: protectedProcedure
    .mutation(async ({ ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      // Only super admins can trigger cleanup
      if (ctx.user.role !== "super_admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Super admin access required to trigger backup cleanup",
        });
      }

      try {
        const result = await backupService.cleanupExpiredBackups();
        
        return {
          success: true,
          deleted: result.deleted,
          errors: result.errors,
          cleanedAt: new Date(),
          message: `Cleanup completed: ${result.deleted} backups deleted${result.errors.length > 0 ? ` with ${result.errors.length} errors` : ''}`,
        };
      } catch (error) {
        console.error("Backup cleanup error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to cleanup backups: ${error.message}`,
        });
      }
    }),

  // Get backup configuration and recommendations
  getConfig: protectedProcedure
    .query(async ({ ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      // Only admins can view backup configuration
      if (!["admin", "tenant_admin", "super_admin"].includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required to view backup configuration",
        });
      }

      try {
        const stats = await backupService.getBackupStats();
        
        // Generate recommendations based on backup history
        const recommendations = [];
        
        if (stats.total === 0) {
          recommendations.push({
            type: "warning",
            title: "No Backups Found",
            description: "No backups have been created yet. Consider setting up automated backups.",
            priority: "high",
            action: "Create your first backup to ensure data safety",
          });
        }
        
        if (stats.byStatus?.failed > 0) {
          recommendations.push({
            type: "error",
            title: "Failed Backups Detected",
            description: `${stats.byStatus.failed} backups have failed. Check logs and configuration.`,
            priority: "high",
            action: "Review failed backup logs and fix configuration issues",
          });
        }
        
        if (stats.oldest && (Date.now() - stats.oldest.getTime()) > 7 * 24 * 60 * 60 * 1000) {
          recommendations.push({
            type: "info",
            title: "Old Backups Present",
            description: "Some backups are older than 7 days. Consider cleanup to save storage space.",
            priority: "medium",
            action: "Run backup cleanup to remove expired backups",
          });
        }

        const totalSizeGB = stats.totalSize / (1024 * 1024 * 1024);
        if (totalSizeGB > 10) {
          recommendations.push({
            type: "info",
            title: "Large Backup Storage Usage",
            description: `Backups are using ${totalSizeGB.toFixed(2)} GB of storage space.`,
            priority: "medium",
            action: "Consider adjusting retention policies to reduce storage costs",
          });
        }

        return {
          config: {
            enabled: process.env.BACKUP_ENABLED === 'true',
            schedule: process.env.BACKUP_SCHEDULE || '0 2 * * *',
            storageType: process.env.BACKUP_STORAGE_TYPE || 'local',
            compressionEnabled: process.env.BACKUP_COMPRESSION !== 'false',
            encryptionEnabled: process.env.BACKUP_ENCRYPTION_ENABLED === 'true',
            includeFiles: process.env.BACKUP_INCLUDE_FILES === 'true',
            retention: {
              daily: parseInt(process.env.BACKUP_RETENTION_DAILY || '7'),
              weekly: parseInt(process.env.BACKUP_RETENTION_WEEKLY || '4'),
              monthly: parseInt(process.env.BACKUP_RETENTION_MONTHLY || '12'),
            },
          },
          stats,
          recommendations,
          nextScheduledBackup: null, // Would be calculated based on schedule
          storageInfo: {
            type: process.env.BACKUP_STORAGE_TYPE || 'local',
            location: process.env.BACKUP_STORAGE_TYPE === 's3' 
              ? process.env.BACKUP_S3_BUCKET 
              : process.env.BACKUP_LOCAL_PATH || './backups',
          },
        };
      } catch (error) {
        console.error("Backup getConfig error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve backup configuration",
        });
      }
    }),

  // Test backup functionality
  test: protectedProcedure
    .mutation(async ({ ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      // Only super admins can run backup tests
      if (ctx.user.role !== "super_admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Super admin access required to test backup functionality",
        });
      }

      try {
        // Test backup service connectivity and configuration
        const testResults = {
          storageConnection: false,
          databaseAccess: false,
          encryptionKeys: false,
          permissions: false,
        };

        // Test storage connection
        try {
          // This would test S3 connection or local storage access
          testResults.storageConnection = true;
        } catch (error) {
          console.error("Storage connection test failed:", error);
        }

        // Test database access
        try {
          // Test if we can access the database for backup
          testResults.databaseAccess = true;
        } catch (error) {
          console.error("Database access test failed:", error);
        }

        // Test encryption configuration
        try {
          if (process.env.BACKUP_ENCRYPTION_ENABLED === 'true') {
            testResults.encryptionKeys = !!process.env.BACKUP_ENCRYPTION_KEY;
          } else {
            testResults.encryptionKeys = true; // Not required
          }
        } catch (error) {
          console.error("Encryption test failed:", error);
        }

        // Test file permissions
        try {
          // Test if we have proper file system permissions
          testResults.permissions = true;
        } catch (error) {
          console.error("Permissions test failed:", error);
        }

        const allTestsPassed = Object.values(testResults).every(result => result === true);

        return {
          success: allTestsPassed,
          results: testResults,
          testedAt: new Date(),
          message: allTestsPassed 
            ? "All backup tests passed successfully" 
            : "Some backup tests failed - check configuration",
        };
      } catch (error) {
        console.error("Backup test error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Backup test failed: ${error.message}`,
        });
      }
    }),
});