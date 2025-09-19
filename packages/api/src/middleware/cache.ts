// Cache middleware for tRPC procedures
import { TRPCError } from '@trpc/server';
import { cacheService, CacheOptions } from '../services/cache';

export interface CacheMiddlewareOptions extends CacheOptions {
  keyGenerator?: (input: any, ctx: any) => string;
  condition?: (input: any, ctx: any) => boolean;
  invalidateOn?: string[]; // Mutation names that should invalidate this cache
}

// Cache middleware for queries
export function withCache(options: CacheMiddlewareOptions = {}) {
  return async function <T>(opts: {
    ctx: any;
    input: any;
    next: () => Promise<T>;
    path?: string;
  }): Promise<T> {
    const { ctx, input, next, path } = opts;

    // Check condition if provided
    if (options.condition && !options.condition(input, ctx)) {
      return next();
    }

    // Generate cache key
    const key = options.keyGenerator 
      ? options.keyGenerator(input, ctx)
      : generateDefaultKey(path || 'unknown', input, ctx);

    try {
      // Try to get from cache
      const cached = await cacheService.get<T>(key);
      if (cached !== null) {
        console.log(`🎯 Cache hit: ${key}`);
        return cached;
      }

      // Cache miss - execute and cache
      console.log(`⚡ Cache miss: ${key}`);
      const result = await next();
      
      // Cache the result
      await cacheService.set(key, result, {
        ttl: options.ttl,
        tags: options.tags,
        version: options.version,
      });

      return result;
    } catch (error) {
      console.error(`Cache middleware error for ${key}:`, error);
      // If caching fails, still return the actual result
      return next();
    }
  };
}

// Cache invalidation middleware for mutations
export function withCacheInvalidation(keys: string[] | ((input: any, ctx: any, result: any) => string[])) {
  return async function <T>(opts: {
    ctx: any;
    input: any;
    next: () => Promise<T>;
  }): Promise<T> {
    const { ctx, input, next } = opts;

    try {
      // Execute the mutation
      const result = await next();

      // Invalidate cache keys
      const keysToInvalidate = typeof keys === 'function' 
        ? keys(input, ctx, result)
        : keys;

      if (keysToInvalidate.length > 0) {
        await cacheService.deleteMany(keysToInvalidate);
        console.log(`🗑️ Invalidated cache keys: ${keysToInvalidate.join(', ')}`);
      }

      return result;
    } catch (error) {
      // Don't invalidate cache if mutation failed
      throw error;
    }
  };
}

// Tag-based cache invalidation
export function withTagInvalidation(tags: string[] | ((input: any, ctx: any, result: any) => string[])) {
  return async function <T>(opts: {
    ctx: any;
    input: any;
    next: () => Promise<T>;
  }): Promise<T> {
    const { ctx, input, next } = opts;

    try {
      // Execute the mutation
      const result = await next();

      // Invalidate cache by tags
      const tagsToInvalidate = typeof tags === 'function' 
        ? tags(input, ctx, result)
        : tags;

      if (tagsToInvalidate.length > 0) {
        const invalidatedCount = await cacheService.invalidateByTags(tagsToInvalidate);
        console.log(`🏷️ Invalidated ${invalidatedCount} cache entries by tags: ${tagsToInvalidate.join(', ')}`);
      }

      return result;
    } catch (error) {
      // Don't invalidate cache if mutation failed
      throw error;
    }
  };
}

// Default key generator
function generateDefaultKey(path: string, input: any, ctx: any): string {
  const tenantId = ctx.tenant?.id || 'no-tenant';
  const userId = ctx.user?.id || 'anonymous';
  const inputHash = input ? JSON.stringify(input) : 'no-input';
  
  return `${tenantId}:${path}:${userId}:${inputHash}`;
}

// Utility to create cached procedures
export function createCachedProcedure<T>(
  procedure: any,
  cacheOptions: CacheMiddlewareOptions = {}
) {
  return procedure.use(withCache(cacheOptions));
}

// Common cache configurations
export const CacheConfigs = {
  // Short-term cache (5 minutes)
  short: {
    ttl: 300,
  },
  
  // Medium-term cache (1 hour)
  medium: {
    ttl: 3600,
  },
  
  // Long-term cache (24 hours)
  long: {
    ttl: 86400,
  },
  
  // User-specific cache (30 minutes)
  user: {
    ttl: 1800,
    keyGenerator: (input: any, ctx: any) => 
      `${ctx.tenant?.id || 'no-tenant'}:user:${ctx.user?.id || 'anonymous'}:${JSON.stringify(input)}`,
  },
  
  // Tenant-specific cache (2 hours)
  tenant: {
    ttl: 7200,
    keyGenerator: (input: any, ctx: any) => 
      `${ctx.tenant?.id || 'no-tenant'}:tenant:${JSON.stringify(input)}`,
  },
  
  // Public content cache (6 hours)
  public: {
    ttl: 21600,
    condition: (input: any, ctx: any) => !ctx.user, // Only cache for non-authenticated requests
  },
  
  // Analytics cache (30 minutes)
  analytics: {
    ttl: 1800,
    tags: ['analytics'],
    keyGenerator: (input: any, ctx: any) => 
      `${ctx.tenant?.id || 'no-tenant'}:analytics:${JSON.stringify(input)}`,
  },
  
  // Search cache (15 minutes)
  search: {
    ttl: 900,
    tags: ['search'],
    keyGenerator: (input: any, ctx: any) => 
      `${ctx.tenant?.id || 'no-tenant'}:search:${JSON.stringify(input)}`,
  },
};

// Cache warming utilities
export async function warmTenantCache(tenantId: string) {
  console.log(`🔥 Warming cache for tenant: ${tenantId}`);
  
  // Define cache warming functions
  const warmingFunctions = [
    {
      key: `${tenantId}:config`,
      fn: async () => {
        // Warm tenant configuration
        return { warmedAt: new Date() };
      },
      options: CacheConfigs.long,
    },
    // Add more warming functions as needed
  ];

  return cacheService.warmCache(warmingFunctions);
}

// Cache health check
export async function checkCacheHealth() {
  try {
    const testKey = 'health-check';
    const testValue = { timestamp: Date.now() };
    
    // Test set
    await cacheService.set(testKey, testValue, { ttl: 60 });
    
    // Test get
    const retrieved = await cacheService.get(testKey);
    
    // Test delete
    await cacheService.delete(testKey);
    
    const isHealthy = retrieved && retrieved.timestamp === testValue.timestamp;
    
    return {
      healthy: isHealthy,
      stats: await cacheService.getStats(),
      timestamp: new Date(),
    };
  } catch (error) {
    return {
      healthy: false,
      error: error.message,
      timestamp: new Date(),
    };
  }
}