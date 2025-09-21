import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../trpc";
import { AdvancedSearchService } from "../services/advancedSearch";
import { TRPCError } from "@trpc/server";

const advancedSearchService = new AdvancedSearchService();

export const advancedSearchRouter = router({
  search: publicProcedure
    .input(z.object({
      query: z.string(),
      entityTypes: z.array(z.string()).optional(),
      filters: z.record(z.any()).optional(),
      facets: z.array(z.string()).optional(),
      sort: z.object({
        field: z.enum(['relevance', 'score', 'date', 'title']),
        direction: z.enum(['asc', 'desc'])
      }).optional(),
      page: z.number().default(1),
      limit: z.number().default(20),
      includeHighlights: z.boolean().default(true),
      includeFacets: z.boolean().default(true)
    }))
    .query(async ({ ctx, input }) => {
      try {
        return await advancedSearchService.search(ctx.session?.user?.activeTenantId || '', {
          ...input,
          userId: ctx.session?.user?.id
        });
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Search operation failed'
        });
      }
    }),

  indexEntity: protectedProcedure
    .input(z.object({
      entityType: z.string(),
      entityId: z.string(),
      title: z.string(),
      content: z.string(),
      metadata: z.record(z.any()).optional(),
      tags: z.array(z.string()).optional(),
      categories: z.array(z.string()).optional(),
      status: z.string().optional(),
      popularity: z.number().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        await advancedSearchService.indexEntity(ctx.session.user.activeTenantId!, input);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to index entity'
        });
      }
    }),

  removeFromIndex: protectedProcedure
    .input(z.object({
      entityType: z.string(),
      entityId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        await advancedSearchService.removeFromIndex(ctx.session.user.activeTenantId!, input.entityType, input.entityId);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to remove from index'
        });
      }
    }),

  updateIndexStatus: protectedProcedure
    .input(z.object({
      entityType: z.string(),
      entityId: z.string(),
      status: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        await advancedSearchService.updateIndexStatus(ctx.session.user.activeTenantId!, input.entityType, input.entityId, input.status);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update index status'
        });
      }
    }),

  reindexAll: protectedProcedure
    .mutation(async ({ ctx }) => {
      try {
        await advancedSearchService.reindexAll(ctx.session.user.activeTenantId!);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to reindex content'
        });
      }
    }),

  saveSearch: protectedProcedure
    .input(z.object({
      name: z.string(),
      query: z.string(),
      filters: z.record(z.any()),
      description: z.string().optional(),
      isPublic: z.boolean().default(false)
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await advancedSearchService.saveSearch(ctx.session.user.activeTenantId!, ctx.session.user.id, input);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to save search'
        });
      }
    }),

  getSavedSearches: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        return await advancedSearchService.getSavedSearches(ctx.session.user.activeTenantId!, ctx.session.user.id);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch saved searches'
        });
      }
    }),

  deleteSavedSearch: protectedProcedure
    .input(z.object({
      searchId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        await advancedSearchService.deleteSavedSearch(ctx.session.user.activeTenantId!, ctx.session.user.id, input.searchId);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete saved search'
        });
      }
    }),

  getSearchAnalytics: protectedProcedure
    .input(z.object({
      period: z.enum(['day', 'week', 'month']).default('week')
    }))
    .query(async ({ ctx, input }) => {
      try {
        return await advancedSearchService.getSearchAnalytics(ctx.session.user.activeTenantId!, input.period);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch search analytics'
        });
      }
    }),

  // Auto-complete and suggestions
  getSuggestions: publicProcedure
    .input(z.object({
      query: z.string(),
      limit: z.number().default(5)
    }))
    .query(async ({ ctx, input }) => {
      try {
        if (input.query.length < 2) {
          return [];
        }
        
        const tenantId = ctx.session?.user?.activeTenantId || '';
        const suggestions = await advancedSearchService.getSuggestions(tenantId, input.query);
        return suggestions.slice(0, input.limit);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch suggestions'
        });
      }
    }),

  // Facet management
  createFacet: protectedProcedure
    .input(z.object({
      name: z.string(),
      type: z.enum(['TEXT', 'NUMBER', 'DATE', 'BOOLEAN', 'CATEGORY', 'TAG', 'RANGE', 'LOCATION']),
      entityType: z.string(),
      fieldPath: z.string(),
      displayName: z.string(),
      isActive: z.boolean().default(true),
      sortOrder: z.number().default(0),
      metadata: z.record(z.any()).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const facet = await prisma.searchFacet.create({
          data: {
            ...input,
            tenantId: ctx.session.user.activeTenantId!
          }
        });
        return facet;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create facet'
        });
      }
    }),

  getFacets: protectedProcedure
    .input(z.object({
      entityType: z.string().optional()
    }))
    .query(async ({ ctx, input }) => {
      try {
        const where: any = {
          tenantId: ctx.session.user.activeTenantId!,
          isActive: true
        };

        if (input.entityType) {
          where.entityType = input.entityType;
        }

        return await prisma.searchFacet.findMany({
          where,
          orderBy: { sortOrder: 'asc' }
        });
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch facets'
        });
      }
    }),

  updateFacet: protectedProcedure
    .input(z.object({
      facetId: z.string(),
      name: z.string().optional(),
      type: z.enum(['TEXT', 'NUMBER', 'DATE', 'BOOLEAN', 'CATEGORY', 'TAG', 'RANGE', 'LOCATION']).optional(),
      entityType: z.string().optional(),
      fieldPath: z.string().optional(),
      displayName: z.string().optional(),
      isActive: z.boolean().optional(),
      sortOrder: z.number().optional(),
      metadata: z.record(z.any()).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { facetId, ...updateData } = input;
        return await prisma.searchFacet.update({
          where: { id: facetId },
          data: updateData
        });
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update facet'
        });
      }
    }),

  deleteFacet: protectedProcedure
    .input(z.object({
      facetId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        await prisma.searchFacet.delete({
          where: { id: input.facetId }
        });
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete facet'
        });
      }
    }),

  // Quick search for specific entity types
  searchUsers: protectedProcedure
    .input(z.object({
      query: z.string(),
      limit: z.number().default(10)
    }))
    .query(async ({ ctx, input }) => {
      try {
        const results = await advancedSearchService.search(ctx.session.user.activeTenantId!, {
          query: input.query,
          entityTypes: ['user'],
          limit: input.limit,
          includeHighlights: false,
          includeFacets: false
        });
        return results.results;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to search users'
        });
      }
    }),

  searchEvents: protectedProcedure
    .input(z.object({
      query: z.string(),
      limit: z.number().default(10)
    }))
    .query(async ({ ctx, input }) => {
      try {
        const results = await advancedSearchService.search(ctx.session.user.activeTenantId!, {
          query: input.query,
          entityTypes: ['event'],
          limit: input.limit,
          includeHighlights: false,
          includeFacets: false
        });
        return results.results;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to search events'
        });
      }
    }),

  searchContent: protectedProcedure
    .input(z.object({
      query: z.string(),
      limit: z.number().default(10)
    }))
    .query(async ({ ctx, input }) => {
      try {
        const results = await advancedSearchService.search(ctx.session.user.activeTenantId!, {
          query: input.query,
          entityTypes: ['content'],
          limit: input.limit,
          includeHighlights: false,
          includeFacets: false
        });
        return results.results;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to search content'
        });
      }
    }),

  // Global search across all entities
  globalSearch: publicProcedure
    .input(z.object({
      query: z.string(),
      limit: z.number().default(20)
    }))
    .query(async ({ ctx, input }) => {
      try {
        const tenantId = ctx.session?.user?.activeTenantId || '';
        if (!tenantId) {
          return { results: [], totalResults: 0, executionTime: 0 };
        }

        return await advancedSearchService.search(tenantId, {
          query: input.query,
          limit: input.limit,
          includeHighlights: true,
          includeFacets: false,
          userId: ctx.session?.user?.id
        });
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to perform global search'
        });
      }
    })
});