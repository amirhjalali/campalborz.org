import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { createSearchService, SearchType } from "../services/search";

// Search schemas
const SearchQuerySchema = z.object({
  query: z.string().min(1).max(200),
  types: z.array(z.enum(["pages", "events", "members", "media", "donations", "notifications"])).optional(),
  filters: z.object({
    dateRange: z.object({
      start: z.date().optional(),
      end: z.date().optional(),
    }).optional(),
    author: z.string().optional(),
    tags: z.array(z.string()).optional(),
    status: z.string().optional(),
    category: z.string().optional(),
  }).optional(),
  pagination: z.object({
    limit: z.number().min(1).max(100).default(20),
    offset: z.number().min(0).default(0),
  }).optional(),
  sort: z.object({
    field: z.enum(["relevance", "date", "title", "author"]).default("relevance"),
    direction: z.enum(["asc", "desc"]).default("desc"),
  }).optional(),
});

const SearchSuggestionsSchema = z.object({
  query: z.string().min(1).max(100),
  limit: z.number().min(1).max(10).default(5),
});

const SearchFilterOptionsSchema = z.object({
  type: z.enum(["authors", "tags", "categories"]),
});

export const searchRouter = router({
  // Main search endpoint
  search: protectedProcedure
    .input(SearchQuerySchema)
    .query(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      try {
        const searchService = createSearchService(ctx.prisma);
        
        const results = await searchService.search(ctx.tenant.id, {
          query: input.query,
          types: input.types as SearchType[] | undefined,
          filters: input.filters,
          pagination: input.pagination,
          sort: input.sort,
        });

        return results;
      } catch (error) {
        console.error("Search error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Search failed",
        });
      }
    }),

  // Quick search for autocomplete
  quickSearch: protectedProcedure
    .input(z.object({
      query: z.string().min(1).max(100),
      limit: z.number().min(1).max(10).default(5),
    }))
    .query(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      try {
        const searchService = createSearchService(ctx.prisma);
        
        const results = await searchService.search(ctx.tenant.id, {
          query: input.query,
          types: ["pages", "events", "members"],
          pagination: { limit: input.limit, offset: 0 },
          sort: { field: "relevance", direction: "desc" },
        });

        // Return simplified results for quick search
        return {
          results: results.results.map(result => ({
            id: result.id,
            type: result.type,
            title: result.title,
            description: result.description.substring(0, 100) + "...",
            url: result.url,
            imageUrl: result.imageUrl,
          })),
          total: results.total,
        };
      } catch (error) {
        console.error("Quick search error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Quick search failed",
        });
      }
    }),

  // Get search suggestions
  getSuggestions: protectedProcedure
    .input(SearchSuggestionsSchema)
    .query(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      try {
        // Get recent searches from user's activity
        const recentSearches = await ctx.prisma.user.findFirst({
          where: { id: ctx.user.id },
          select: { metadata: true },
        });

        const userSearchHistory = recentSearches?.metadata 
          ? (recentSearches.metadata as any)?.recentSearches || []
          : [];

        // Get popular search terms (mock implementation)
        const popularSearches = [
          "upcoming events",
          "art gallery",
          "camp members",
          "donation drive",
          "volunteer opportunities",
        ];

        // Get content-based suggestions
        const contentSuggestions: string[] = [];
        
        // Search for partial matches in page titles
        const pages = await ctx.prisma.page.findMany({
          where: {
            tenantId: ctx.tenant.id,
            title: {
              contains: input.query,
              mode: "insensitive",
            },
          },
          select: { title: true },
          take: 3,
        });
        
        contentSuggestions.push(...pages.map(p => p.title));

        // Search for partial matches in event titles
        const events = await ctx.prisma.event.findMany({
          where: {
            tenantId: ctx.tenant.id,
            title: {
              contains: input.query,
              mode: "insensitive",
            },
          },
          select: { title: true },
          take: 3,
        });
        
        contentSuggestions.push(...events.map(e => e.title));

        // Combine and deduplicate suggestions
        const allSuggestions = [
          ...contentSuggestions,
          ...userSearchHistory.filter((search: string) => 
            search.toLowerCase().includes(input.query.toLowerCase())
          ),
          ...popularSearches.filter(search =>
            search.toLowerCase().includes(input.query.toLowerCase())
          ),
        ];

        const uniqueSuggestions = [...new Set(allSuggestions)]
          .slice(0, input.limit);

        return {
          suggestions: uniqueSuggestions,
          categories: {
            content: contentSuggestions.slice(0, 3),
            history: userSearchHistory.slice(0, 3),
            popular: popularSearches.slice(0, 3),
          },
        };
      } catch (error) {
        console.error("Get suggestions error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get suggestions",
        });
      }
    }),

  // Get filter options for advanced search
  getFilterOptions: protectedProcedure
    .input(SearchFilterOptionsSchema)
    .query(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      try {
        switch (input.type) {
          case "authors":
            const authors = await ctx.prisma.user.findMany({
              where: {
                tenantId: ctx.tenant.id,
                status: "ACTIVE",
              },
              select: {
                id: true,
                name: true,
                avatar: true,
              },
              orderBy: { name: "asc" },
            });

            return {
              options: authors.map(author => ({
                id: author.id,
                name: author.name,
                avatar: author.avatar,
              })),
            };

          case "tags":
            // Get all unique tags from media
            const media = await ctx.prisma.media.findMany({
              where: {
                tenantId: ctx.tenant.id,
                tags: { not: { equals: [] } },
              },
              select: { tags: true },
            });

            const allTags = new Set<string>();
            media.forEach(m => {
              m.tags.forEach(tag => allTags.add(tag));
            });

            return {
              options: Array.from(allTags)
                .sort()
                .map(tag => ({ id: tag, name: tag })),
            };

          case "categories":
            // Mock categories - in production, these would come from your content model
            const categories = [
              { id: "events", name: "Events" },
              { id: "announcements", name: "Announcements" },
              { id: "resources", name: "Resources" },
              { id: "gallery", name: "Gallery" },
              { id: "about", name: "About" },
            ];

            return { options: categories };

          default:
            return { options: [] };
        }
      } catch (error) {
        console.error("Get filter options error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get filter options",
        });
      }
    }),

  // Save search query to user's history
  saveSearch: protectedProcedure
    .input(z.object({
      query: z.string().min(1).max(200),
      resultsCount: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      try {
        // Get current user metadata
        const user = await ctx.prisma.user.findFirst({
          where: { id: ctx.user.id },
          select: { metadata: true },
        });

        const currentMetadata = (user?.metadata as any) || {};
        const searchHistory = currentMetadata.recentSearches || [];

        // Add new search to history (keep last 10)
        const updatedHistory = [
          {
            query: input.query,
            timestamp: new Date(),
            resultsCount: input.resultsCount,
          },
          ...searchHistory.filter((s: any) => s.query !== input.query),
        ].slice(0, 10);

        // Update user metadata
        await ctx.prisma.user.update({
          where: { id: ctx.user.id },
          data: {
            metadata: {
              ...currentMetadata,
              recentSearches: updatedHistory,
            },
          },
        });

        return { success: true };
      } catch (error) {
        console.error("Save search error:", error);
        // Don't throw error for non-critical operation
        return { success: false };
      }
    }),

  // Get search analytics (admin only)
  getAnalytics: protectedProcedure
    .query(async ({ ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      // Check permissions
      if (!["admin", "moderator"].includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required",
        });
      }

      try {
        // Get search analytics from user metadata
        const users = await ctx.prisma.user.findMany({
          where: { tenantId: ctx.tenant.id },
          select: { metadata: true },
        });

        const allSearches: any[] = [];
        users.forEach(user => {
          const metadata = user.metadata as any;
          if (metadata?.recentSearches) {
            allSearches.push(...metadata.recentSearches);
          }
        });

        // Calculate top searches
        const searchCounts: Record<string, number> = {};
        allSearches.forEach(search => {
          searchCounts[search.query] = (searchCounts[search.query] || 0) + 1;
        });

        const topSearches = Object.entries(searchCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10)
          .map(([query, count]) => ({ query, count }));

        // Calculate search trends (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentSearches = allSearches.filter(search => 
          new Date(search.timestamp) > thirtyDaysAgo
        );

        return {
          totalSearches: allSearches.length,
          recentSearches: recentSearches.length,
          topSearches,
          averageResultsPerSearch: allSearches.reduce((sum, search) => 
            sum + (search.resultsCount || 0), 0
          ) / allSearches.length || 0,
        };
      } catch (error) {
        console.error("Get search analytics error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get search analytics",
        });
      }
    }),
});