// Caching service with Redis support
import { Redis } from 'ioredis';

export interface CacheConfig {
  redis?: {
    host: string;
    port: number;
    password?: string;
    db?: number;
    keyPrefix?: string;
  };
  defaultTTL?: number; // in seconds
  enableCompression?: boolean;
}

export interface CacheEntry<T = any> {
  data: T;
  createdAt: number;
  expiresAt: number;
  version?: string;
  tags?: string[];
}

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Tags for cache invalidation
  compress?: boolean;
  version?: string; // For cache versioning
}

class CacheService {
  private redis: Redis | null = null;
  private memoryCache: Map<string, CacheEntry> = new Map();
  private config: CacheConfig;
  private isRedisConnected = false;

  constructor(config: CacheConfig = {}) {
    this.config = {
      defaultTTL: 3600, // 1 hour default
      enableCompression: true,
      ...config,
    };

    // Initialize Redis if config provided
    if (config.redis) {
      this.initializeRedis();
    }

    // Cleanup memory cache periodically
    setInterval(() => this.cleanupMemoryCache(), 60000); // Every minute
  }

  private async initializeRedis() {
    try {
      if (!this.config.redis) return;

      this.redis = new Redis({
        host: this.config.redis.host,
        port: this.config.redis.port,
        password: this.config.redis.password,
        db: this.config.redis.db || 0,
        keyPrefix: this.config.redis.keyPrefix || 'camp:',
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
      });

      this.redis.on('connect', () => {
        console.log('✅ Redis connected successfully');
        this.isRedisConnected = true;
      });

      this.redis.on('error', (error) => {
        console.error('❌ Redis connection error:', error);
        this.isRedisConnected = false;
      });

      this.redis.on('close', () => {
        console.log('🔌 Redis connection closed');
        this.isRedisConnected = false;
      });

      await this.redis.connect();
    } catch (error) {
      console.error('Failed to initialize Redis:', error);
      this.isRedisConnected = false;
    }
  }

  // Get value from cache
  async get<T>(key: string): Promise<T | null> {
    try {
      // Try Redis first if available
      if (this.isRedisConnected && this.redis) {
        const data = await this.redis.get(key);
        if (data) {
          const parsed = JSON.parse(data) as CacheEntry<T>;
          
          // Check if expired
          if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
            await this.delete(key);
            return null;
          }
          
          return parsed.data;
        }
      }

      // Fallback to memory cache
      const memEntry = this.memoryCache.get(key);
      if (memEntry) {
        // Check if expired
        if (memEntry.expiresAt && Date.now() > memEntry.expiresAt) {
          this.memoryCache.delete(key);
          return null;
        }
        
        return memEntry.data as T;
      }

      return null;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  // Set value in cache
  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<boolean> {
    try {
      const ttl = options.ttl || this.config.defaultTTL || 3600;
      const now = Date.now();
      const expiresAt = now + (ttl * 1000);

      const entry: CacheEntry<T> = {
        data: value,
        createdAt: now,
        expiresAt,
        version: options.version,
        tags: options.tags,
      };

      // Store in Redis if available
      if (this.isRedisConnected && this.redis) {
        await this.redis.setex(key, ttl, JSON.stringify(entry));
      }

      // Also store in memory cache as backup
      this.memoryCache.set(key, entry);

      return true;
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  // Delete from cache
  async delete(key: string): Promise<boolean> {
    try {
      // Delete from Redis
      if (this.isRedisConnected && this.redis) {
        await this.redis.del(key);
      }

      // Delete from memory cache
      this.memoryCache.delete(key);

      return true;
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  // Delete multiple keys
  async deleteMany(keys: string[]): Promise<number> {
    try {
      let deletedCount = 0;

      // Delete from Redis
      if (this.isRedisConnected && this.redis && keys.length > 0) {
        deletedCount = await this.redis.del(...keys);
      }

      // Delete from memory cache
      keys.forEach(key => {
        if (this.memoryCache.has(key)) {
          this.memoryCache.delete(key);
        }
      });

      return deletedCount;
    } catch (error) {
      console.error('Cache deleteMany error:', error);
      return 0;
    }
  }

  // Check if key exists
  async exists(key: string): Promise<boolean> {
    try {
      // Check Redis first
      if (this.isRedisConnected && this.redis) {
        const exists = await this.redis.exists(key);
        return exists === 1;
      }

      // Check memory cache
      return this.memoryCache.has(key);
    } catch (error) {
      console.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  // Invalidate cache by tags
  async invalidateByTags(tags: string[]): Promise<number> {
    try {
      let deletedCount = 0;

      // For Redis, we need to implement tag tracking
      if (this.isRedisConnected && this.redis) {
        // Get all keys with these tags
        const keysToDelete: string[] = [];
        
        for (const tag of tags) {
          const tagKeys = await this.redis.smembers(`tag:${tag}`);
          keysToDelete.push(...tagKeys);
        }

        if (keysToDelete.length > 0) {
          deletedCount = await this.redis.del(...keysToDelete);
          
          // Clean up tag sets
          for (const tag of tags) {
            await this.redis.del(`tag:${tag}`);
          }
        }
      }

      // For memory cache, iterate through entries
      for (const [key, entry] of this.memoryCache.entries()) {
        if (entry.tags && entry.tags.some(tag => tags.includes(tag))) {
          this.memoryCache.delete(key);
          deletedCount++;
        }
      }

      return deletedCount;
    } catch (error) {
      console.error('Cache invalidateByTags error:', error);
      return 0;
    }
  }

  // Flush all cache
  async flush(): Promise<boolean> {
    try {
      // Flush Redis
      if (this.isRedisConnected && this.redis) {
        await this.redis.flushdb();
      }

      // Clear memory cache
      this.memoryCache.clear();

      return true;
    } catch (error) {
      console.error('Cache flush error:', error);
      return false;
    }
  }

  // Get cache statistics
  async getStats() {
    try {
      const stats = {
        redis: {
          connected: this.isRedisConnected,
          keys: 0,
          memory: 0,
        },
        memory: {
          keys: this.memoryCache.size,
          memory: 0,
        },
      };

      // Get Redis stats
      if (this.isRedisConnected && this.redis) {
        const info = await this.redis.info('memory');
        const memoryMatch = info.match(/used_memory:(\d+)/);
        if (memoryMatch) {
          stats.redis.memory = parseInt(memoryMatch[1]);
        }

        stats.redis.keys = await this.redis.dbsize();
      }

      // Estimate memory cache size
      let memorySize = 0;
      for (const [key, entry] of this.memoryCache.entries()) {
        memorySize += key.length + JSON.stringify(entry).length;
      }
      stats.memory.memory = memorySize;

      return stats;
    } catch (error) {
      console.error('Cache getStats error:', error);
      return null;
    }
  }

  // Cached function wrapper
  async cached<T>(
    key: string,
    fn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Execute function and cache result
    const result = await fn();
    await this.set(key, result, options);
    
    return result;
  }

  // Cleanup expired entries from memory cache
  private cleanupMemoryCache() {
    const now = Date.now();
    
    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.expiresAt && now > entry.expiresAt) {
        this.memoryCache.delete(key);
      }
    }
  }

  // Generate cache key with tenant isolation
  generateKey(tenantId: string, type: string, identifier: string, suffix?: string): string {
    const parts = [tenantId, type, identifier];
    if (suffix) parts.push(suffix);
    return parts.join(':');
  }

  // Cache warming utilities
  async warmCache(warmingFunctions: Array<{ key: string; fn: () => Promise<any>; options?: CacheOptions }>) {
    console.log(`🔥 Warming cache with ${warmingFunctions.length} items...`);
    
    const results = await Promise.allSettled(
      warmingFunctions.map(async ({ key, fn, options }) => {
        try {
          const data = await fn();
          await this.set(key, data, options);
          return { key, success: true };
        } catch (error) {
          console.error(`Failed to warm cache for key ${key}:`, error);
          return { key, success: false, error };
        }
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    console.log(`✅ Cache warming completed: ${successful}/${warmingFunctions.length} successful`);
    
    return { total: warmingFunctions.length, successful };
  }

  // Disconnect Redis
  async disconnect() {
    if (this.redis) {
      await this.redis.disconnect();
      this.isRedisConnected = false;
    }
  }
}

// Create global cache instance
export const cacheService = new CacheService({
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    keyPrefix: 'camp:',
  },
  defaultTTL: 3600, // 1 hour
  enableCompression: true,
});

// Cache decorators and utilities
export function Cache(options: CacheOptions & { keyGenerator?: (...args: any[]) => string } = {}) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const key = options.keyGenerator 
        ? options.keyGenerator(...args)
        : `${target.constructor.name}:${propertyName}:${JSON.stringify(args)}`;

      return cacheService.cached(key, () => method.apply(this, args), options);
    };

    return descriptor;
  };
}

// Common cache keys
export const CacheKeys = {
  // User caches
  user: (tenantId: string, userId: string) => `${tenantId}:user:${userId}`,
  userPermissions: (tenantId: string, userId: string) => `${tenantId}:user:${userId}:permissions`,
  
  // Event caches
  event: (tenantId: string, eventId: string) => `${tenantId}:event:${eventId}`,
  eventList: (tenantId: string, filters: string) => `${tenantId}:events:${filters}`,
  eventAttendees: (tenantId: string, eventId: string) => `${tenantId}:event:${eventId}:attendees`,
  
  // Content caches
  page: (tenantId: string, slug: string) => `${tenantId}:page:${slug}`,
  pageList: (tenantId: string) => `${tenantId}:pages`,
  
  // Analytics caches
  analytics: (tenantId: string, period: string) => `${tenantId}:analytics:${period}`,
  analyticsOverview: (tenantId: string) => `${tenantId}:analytics:overview`,
  
  // Search caches
  search: (tenantId: string, query: string, filters: string) => `${tenantId}:search:${query}:${filters}`,
  searchSuggestions: (tenantId: string, query: string) => `${tenantId}:search:suggestions:${query}`,
  
  // Tenant caches
  tenant: (subdomain: string) => `tenant:${subdomain}`,
  tenantConfig: (tenantId: string) => `${tenantId}:config`,
};

// Cache tags for invalidation
export const CacheTags = {
  users: (tenantId: string) => `${tenantId}:users`,
  events: (tenantId: string) => `${tenantId}:events`,
  pages: (tenantId: string) => `${tenantId}:pages`,
  analytics: (tenantId: string) => `${tenantId}:analytics`,
  search: (tenantId: string) => `${tenantId}:search`,
  tenant: (tenantId: string) => `${tenantId}:tenant`,
};