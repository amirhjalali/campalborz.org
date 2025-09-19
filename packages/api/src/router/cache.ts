import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { cacheService } from "../services/cache";
import { checkCacheHealth, warmTenantCache } from "../middleware/cache";

// Cache management schemas
const CacheKeySchema = z.object({
  key: z.string(),
});

const CacheKeysSchema = z.object({
  keys: z.array(z.string()),
});

const CacheTagsSchema = z.object({
  tags: z.array(z.string()),
});

const CacheSetSchema = z.object({
  key: z.string(),
  value: z.any(),
  ttl: z.number().optional(),
  tags: z.array(z.string()).optional(),
});

export const cacheRouter = router({
  // Get cache statistics
  getStats: protectedProcedure
    .query(async ({ ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      // Only admins can view cache statistics
      if (!["admin", "tenant_admin", "super_admin"].includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required to view cache statistics",
        });
      }

      try {
        const stats = await cacheService.getStats();
        return stats;
      } catch (error) {
        console.error("Cache stats error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve cache statistics",
        });
      }
    }),

  // Check cache health
  getHealth: protectedProcedure
    .query(async ({ ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      // Only admins can check cache health
      if (!["admin", "tenant_admin", "super_admin"].includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required to check cache health",
        });
      }

      try {
        const health = await checkCacheHealth();
        return health;
      } catch (error) {
        console.error("Cache health check error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to check cache health",
        });
      }
    }),

  // Get cache value by key
  get: protectedProcedure
    .input(CacheKeySchema)
    .query(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      // Only admins can access cache directly
      if (!["admin", "tenant_admin", "super_admin"].includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required to access cache",
        });
      }

      try {
        // Ensure tenant isolation - only allow access to own tenant's cache
        const tenantKey = input.key.startsWith(ctx.tenant.id) ? input.key : `${ctx.tenant.id}:${input.key}`;
        
        const value = await cacheService.get(tenantKey);
        const exists = await cacheService.exists(tenantKey);
        
        return {
          key: tenantKey,
          value,
          exists,
          retrievedAt: new Date(),
        };
      } catch (error) {
        console.error("Cache get error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve cache value",
        });
      }
    }),

  // Set cache value
  set: protectedProcedure
    .input(CacheSetSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      // Only admins can set cache values
      if (!["admin", "tenant_admin", "super_admin"].includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required to set cache values",
        });
      }

      try {
        // Ensure tenant isolation
        const tenantKey = input.key.startsWith(ctx.tenant.id) ? input.key : `${ctx.tenant.id}:${input.key}`;
        
        const success = await cacheService.set(tenantKey, input.value, {
          ttl: input.ttl,
          tags: input.tags,
        });

        return {
          success,
          key: tenantKey,
          setAt: new Date(),
        };
      } catch (error) {
        console.error("Cache set error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to set cache value",
        });
      }
    }),

  // Delete cache key
  delete: protectedProcedure
    .input(CacheKeySchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      // Only admins can delete cache keys
      if (!["admin", "tenant_admin", "super_admin"].includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required to delete cache keys",
        });
      }

      try {
        // Ensure tenant isolation
        const tenantKey = input.key.startsWith(ctx.tenant.id) ? input.key : `${ctx.tenant.id}:${input.key}`;
        
        const success = await cacheService.delete(tenantKey);

        return {
          success,
          key: tenantKey,
          deletedAt: new Date(),
        };
      } catch (error) {
        console.error("Cache delete error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete cache key",
        });
      }
    }),

  // Delete multiple cache keys
  deleteMany: protectedProcedure
    .input(CacheKeysSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      // Only admins can delete cache keys
      if (!["admin", "tenant_admin", "super_admin"].includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required to delete cache keys",
        });
      }

      try {
        // Ensure tenant isolation for all keys
        const tenantKeys = input.keys.map(key => 
          key.startsWith(ctx.tenant!.id) ? key : `${ctx.tenant!.id}:${key}`
        );
        
        const deletedCount = await cacheService.deleteMany(tenantKeys);

        return {
          deletedCount,
          keys: tenantKeys,
          deletedAt: new Date(),
        };
      } catch (error) {
        console.error("Cache deleteMany error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete cache keys",
        });
      }
    }),

  // Invalidate cache by tags
  invalidateByTags: protectedProcedure
    .input(CacheTagsSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      // Only admins can invalidate cache by tags
      if (!["admin", "tenant_admin", "super_admin"].includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required to invalidate cache by tags",
        });
      }

      try {
        // Prefix tags with tenant ID for isolation
        const tenantTags = input.tags.map(tag => 
          tag.startsWith(ctx.tenant!.id) ? tag : `${ctx.tenant!.id}:${tag}`
        );
        
        const invalidatedCount = await cacheService.invalidateByTags(tenantTags);

        return {
          invalidatedCount,
          tags: tenantTags,
          invalidatedAt: new Date(),
        };
      } catch (error) {
        console.error("Cache invalidateByTags error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to invalidate cache by tags",
        });
      }
    }),

  // Flush all tenant cache
  flush: protectedProcedure
    .mutation(async ({ ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      // Only super admins can flush all cache
      if (!["super_admin"].includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Super admin access required to flush cache",
        });
      }

      try {
        const success = await cacheService.flush();

        return {
          success,
          flushedAt: new Date(),
          warning: "All cache data has been cleared",
        };
      } catch (error) {
        console.error("Cache flush error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to flush cache",
        });
      }
    }),

  // Warm tenant cache
  warm: protectedProcedure
    .mutation(async ({ ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      // Only admins can warm cache
      if (!["admin", "tenant_admin", "super_admin"].includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required to warm cache",
        });
      }

      try {
        const result = await warmTenantCache(ctx.tenant.id);

        return {
          ...result,
          warmedAt: new Date(),
        };
      } catch (error) {
        console.error("Cache warm error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to warm cache",
        });
      }
    }),

  // Check if key exists
  exists: protectedProcedure
    .input(CacheKeySchema)
    .query(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      // Only admins can check cache existence
      if (!["admin", "tenant_admin", "super_admin"].includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required to check cache",
        });
      }

      try {
        // Ensure tenant isolation
        const tenantKey = input.key.startsWith(ctx.tenant.id) ? input.key : `${ctx.tenant.id}:${input.key}`;
        
        const exists = await cacheService.exists(tenantKey);

        return {
          key: tenantKey,
          exists,
          checkedAt: new Date(),
        };
      } catch (error) {
        console.error("Cache exists error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to check cache existence",
        });
      }
    }),

  // Get cache configuration and recommendations
  getConfig: protectedProcedure
    .query(async ({ ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      // Only admins can view cache configuration
      if (!["admin", "tenant_admin", "super_admin"].includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required to view cache configuration",
        });
      }

      try {
        const stats = await cacheService.getStats();
        
        // Generate recommendations based on stats
        const recommendations = [];
        
        if (stats?.redis.connected === false) {
          recommendations.push({
            type: "warning",
            title: "Redis Disconnected",
            description: "Redis cache is not connected. Consider checking your Redis configuration.",
            priority: "high",
          });
        }
        
        if (stats?.memory.keys > 10000) {
          recommendations.push({
            type: "info",
            title: "High Memory Cache Usage",
            description: "Consider implementing more aggressive cache expiration policies.",
            priority: "medium",
          });
        }

        return {
          config: {
            defaultTTL: 3600,
            enableCompression: true,
            redisConnected: stats?.redis.connected || false,
          },
          stats,
          recommendations,
          commonKeys: [
            { pattern: `${ctx.tenant.id}:user:*`, description: "User data cache" },
            { pattern: `${ctx.tenant.id}:event:*`, description: "Event data cache" },
            { pattern: `${ctx.tenant.id}:page:*`, description: "Page content cache" },
            { pattern: `${ctx.tenant.id}:analytics:*`, description: "Analytics data cache" },
            { pattern: `${ctx.tenant.id}:search:*`, description: "Search results cache" },
          ],
          tags: [
            { name: `${ctx.tenant.id}:users`, description: "All user-related cache entries" },
            { name: `${ctx.tenant.id}:events`, description: "All event-related cache entries" },
            { name: `${ctx.tenant.id}:pages`, description: "All page content cache entries" },
            { name: `${ctx.tenant.id}:analytics`, description: "All analytics cache entries" },
            { name: `${ctx.tenant.id}:search`, description: "All search cache entries" },
          ],
        };
      } catch (error) {
        console.error("Cache getConfig error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve cache configuration",
        });
      }
    }),
});