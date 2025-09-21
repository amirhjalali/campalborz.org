import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface SearchOptions {
  query: string;
  entityTypes?: string[];
  filters?: Record<string, any>;
  facets?: string[];
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  page?: number;
  limit?: number;
  includeHighlights?: boolean;
  includeFacets?: boolean;
  userId?: string;
}

export interface SearchResult {
  id: string;
  entityType: string;
  entityId: string;
  title: string;
  snippet?: string;
  score: number;
  highlights?: Record<string, string[]>;
  metadata?: Record<string, any>;
  url?: string;
}

export interface SearchResponse {
  results: SearchResult[];
  totalResults: number;
  executionTime: number;
  facets?: Record<string, FacetResult[]>;
  suggestions?: string[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface FacetResult {
  value: string;
  count: number;
  selected?: boolean;
}

export interface IndexData {
  entityType: string;
  entityId: string;
  title: string;
  content: string;
  metadata?: Record<string, any>;
  tags?: string[];
  categories?: string[];
  status?: string;
  popularity?: number;
}

export class AdvancedSearchService {

  // Search Operations
  async search(tenantId: string, options: SearchOptions): Promise<SearchResponse> {
    const startTime = Date.now();
    const {
      query,
      entityTypes = [],
      filters = {},
      sort = { field: 'score', direction: 'desc' },
      page = 1,
      limit = 20,
      includeHighlights = true,
      includeFacets = true,
      userId
    } = options;

    try {
      // Build search conditions
      const searchConditions = this.buildSearchConditions(tenantId, query, entityTypes, filters);
      
      // Execute search with pagination
      const skip = (page - 1) * limit;
      const [searchResults, totalResults] = await Promise.all([
        this.executeSearch(searchConditions, sort, skip, limit, includeHighlights),
        this.countSearchResults(searchConditions)
      ]);

      // Get facets if requested
      let facets: Record<string, FacetResult[]> | undefined;
      if (includeFacets) {
        facets = await this.getFacets(tenantId, searchConditions, filters);
      }

      // Get suggestions
      const suggestions = await this.getSuggestions(tenantId, query);

      // Log search query
      const executionTime = Date.now() - startTime;
      await this.logSearchQuery(tenantId, userId, query, filters, totalResults, executionTime);

      return {
        results: searchResults,
        totalResults,
        executionTime,
        facets,
        suggestions,
        pagination: {
          page,
          limit,
          total: totalResults,
          pages: Math.ceil(totalResults / limit)
        }
      };
    } catch (error) {
      console.error('Search error:', error);
      throw new Error('Search operation failed');
    }
  }

  private buildSearchConditions(tenantId: string, query: string, entityTypes: string[], filters: Record<string, any>) {
    const conditions: any = {
      tenantId,
      status: 'active'
    };

    if (query) {
      conditions.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } },
        { searchText: { contains: query, mode: 'insensitive' } }
      ];
    }

    if (entityTypes.length > 0) {
      conditions.entityType = { in: entityTypes };
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      switch (key) {
        case 'dateRange':
          if (value.start) conditions.createdAt = { ...conditions.createdAt, gte: new Date(value.start) };
          if (value.end) conditions.createdAt = { ...conditions.createdAt, lte: new Date(value.end) };
          break;
        case 'categories':
          if (Array.isArray(value) && value.length > 0) {
            conditions.categories = { hassome: value };
          }
          break;
        case 'tags':
          if (Array.isArray(value) && value.length > 0) {
            conditions.tags = { hassome: value };
          }
          break;
        case 'popularity':
          if (value.min !== undefined) conditions.popularity = { ...conditions.popularity, gte: value.min };
          if (value.max !== undefined) conditions.popularity = { ...conditions.popularity, lte: value.max };
          break;
        default:
          if (value !== undefined && value !== null && value !== '') {
            conditions[key] = value;
          }
      }
    });

    return conditions;
  }

  private async executeSearch(
    conditions: any,
    sort: { field: string; direction: 'asc' | 'desc' },
    skip: number,
    limit: number,
    includeHighlights: boolean
  ): Promise<SearchResult[]> {
    const orderBy: any = {};
    
    // Map sort fields
    switch (sort.field) {
      case 'relevance':
      case 'score':
        orderBy.popularity = sort.direction;
        break;
      case 'date':
        orderBy.createdAt = sort.direction;
        break;
      case 'title':
        orderBy.title = sort.direction;
        break;
      default:
        orderBy.popularity = 'desc';
    }

    const searchIndexes = await prisma.searchIndex.findMany({
      where: conditions,
      orderBy,
      skip,
      take: limit
    });

    return searchIndexes.map((index, position) => ({
      id: index.id,
      entityType: index.entityType,
      entityId: index.entityId,
      title: index.title,
      snippet: this.generateSnippet(index.content, conditions.OR?.[0]?.title?.contains),
      score: index.popularity,
      highlights: includeHighlights ? this.generateHighlights(index, conditions.OR?.[0]?.title?.contains) : undefined,
      metadata: index.metadata as Record<string, any>,
      url: this.generateEntityUrl(index.entityType, index.entityId)
    }));
  }

  private async countSearchResults(conditions: any): Promise<number> {
    return await prisma.searchIndex.count({ where: conditions });
  }

  private async getFacets(tenantId: string, searchConditions: any, appliedFilters: Record<string, any>): Promise<Record<string, FacetResult[]>> {
    const facetConfigs = await prisma.searchFacet.findMany({
      where: {
        tenantId,
        isActive: true
      },
      orderBy: { sortOrder: 'asc' }
    });

    const facets: Record<string, FacetResult[]> = {};

    for (const facetConfig of facetConfigs) {
      const facetResults = await this.computeFacet(facetConfig, searchConditions, appliedFilters);
      if (facetResults.length > 0) {
        facets[facetConfig.name] = facetResults;
      }
    }

    return facets;
  }

  private async computeFacet(facetConfig: any, searchConditions: any, appliedFilters: Record<string, any>): Promise<FacetResult[]> {
    // For JSON array fields like categories and tags
    if (facetConfig.fieldPath === 'categories' || facetConfig.fieldPath === 'tags') {
      const results = await prisma.searchIndex.findMany({
        where: searchConditions,
        select: { [facetConfig.fieldPath]: true }
      });

      const valueCount: Record<string, number> = {};
      results.forEach(result => {
        const values = result[facetConfig.fieldPath] as string[];
        if (Array.isArray(values)) {
          values.forEach(value => {
            valueCount[value] = (valueCount[value] || 0) + 1;
          });
        }
      });

      return Object.entries(valueCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 20) // Limit to top 20 facet values
        .map(([value, count]) => ({
          value,
          count,
          selected: appliedFilters[facetConfig.fieldPath]?.includes(value) || false
        }));
    }

    // For entity type facet
    if (facetConfig.fieldPath === 'entityType') {
      const results = await prisma.searchIndex.groupBy({
        by: ['entityType'],
        where: searchConditions,
        _count: true
      });

      return results.map(result => ({
        value: result.entityType,
        count: result._count,
        selected: appliedFilters.entityTypes?.includes(result.entityType) || false
      }));
    }

    return [];
  }

  private async getSuggestions(tenantId: string, query: string): Promise<string[]> {
    if (query.length < 2) return [];

    const suggestions = await prisma.searchSuggestion.findMany({
      where: {
        tenantId,
        isActive: true,
        suggestion: {
          contains: query,
          mode: 'insensitive'
        }
      },
      orderBy: { popularity: 'desc' },
      take: 5
    });

    return suggestions.map(s => s.suggestion);
  }

  private generateSnippet(content: string, query?: string): string {
    if (!content) return '';
    
    const maxLength = 200;
    if (!query) {
      return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
    }

    const queryLower = query.toLowerCase();
    const contentLower = content.toLowerCase();
    const index = contentLower.indexOf(queryLower);
    
    if (index === -1) {
      return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
    }

    const start = Math.max(0, index - 50);
    const end = Math.min(content.length, index + query.length + 100);
    let snippet = content.substring(start, end);
    
    if (start > 0) snippet = '...' + snippet;
    if (end < content.length) snippet = snippet + '...';
    
    return snippet;
  }

  private generateHighlights(index: any, query?: string): Record<string, string[]> {
    if (!query) return {};

    const highlights: Record<string, string[]> = {};
    const regex = new RegExp(`(${query})`, 'gi');

    if (index.title.toLowerCase().includes(query.toLowerCase())) {
      highlights.title = [index.title.replace(regex, '<mark>$1</mark>')];
    }

    if (index.content.toLowerCase().includes(query.toLowerCase())) {
      const snippet = this.generateSnippet(index.content, query);
      highlights.content = [snippet.replace(regex, '<mark>$1</mark>')];
    }

    return highlights;
  }

  private generateEntityUrl(entityType: string, entityId: string): string {
    const baseUrls: Record<string, string> = {
      'user': '/users',
      'event': '/events',
      'content': '/content',
      'forum_post': '/forums/posts',
      'forum_topic': '/forums/topics',
      'channel': '/communication/channels',
      'announcement': '/communication/announcements'
    };

    const basePath = baseUrls[entityType] || '/';
    return `${basePath}/${entityId}`;
  }

  private async logSearchQuery(
    tenantId: string,
    userId: string | undefined,
    query: string,
    filters: Record<string, any>,
    results: number,
    executionTime: number
  ) {
    try {
      await prisma.searchQuery.create({
        data: {
          tenantId,
          userId,
          query,
          filters,
          results,
          executionTime
        }
      });

      // Update suggestion popularity if query returns results
      if (results > 0) {
        await prisma.searchSuggestion.upsert({
          where: {
            tenantId_suggestion: {
              tenantId,
              suggestion: query
            }
          },
          update: {
            popularity: { increment: 1 }
          },
          create: {
            tenantId,
            suggestion: query,
            popularity: 1
          }
        });
      }
    } catch (error) {
      console.error('Failed to log search query:', error);
    }
  }

  // Index Management
  async indexEntity(tenantId: string, data: IndexData): Promise<void> {
    const searchText = this.buildSearchText(data);
    
    await prisma.searchIndex.upsert({
      where: {
        tenantId_entityType_entityId: {
          tenantId,
          entityType: data.entityType,
          entityId: data.entityId
        }
      },
      update: {
        title: data.title,
        content: data.content,
        metadata: data.metadata || {},
        tags: data.tags || [],
        categories: data.categories || [],
        searchText,
        status: data.status || 'active',
        popularity: data.popularity || 0,
        updatedAt: new Date()
      },
      create: {
        tenantId,
        entityType: data.entityType,
        entityId: data.entityId,
        title: data.title,
        content: data.content,
        metadata: data.metadata || {},
        tags: data.tags || [],
        categories: data.categories || [],
        searchText,
        status: data.status || 'active',
        popularity: data.popularity || 0
      }
    });
  }

  async removeFromIndex(tenantId: string, entityType: string, entityId: string): Promise<void> {
    await prisma.searchIndex.deleteMany({
      where: {
        tenantId,
        entityType,
        entityId
      }
    });
  }

  async updateIndexStatus(tenantId: string, entityType: string, entityId: string, status: string): Promise<void> {
    await prisma.searchIndex.updateMany({
      where: {
        tenantId,
        entityType,
        entityId
      },
      data: { status }
    });
  }

  private buildSearchText(data: IndexData): string {
    const parts = [
      data.title,
      data.content,
      ...(data.tags || []),
      ...(data.categories || [])
    ];

    return parts
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Bulk indexing operations
  async reindexAll(tenantId: string): Promise<void> {
    try {
      // Remove existing indexes
      await prisma.searchIndex.deleteMany({
        where: { tenantId }
      });

      // Index users
      await this.indexUsers(tenantId);
      
      // Index events
      await this.indexEvents(tenantId);
      
      // Index content
      await this.indexContent(tenantId);
      
      // Index forum posts
      await this.indexForumPosts(tenantId);
      
      // Index announcements
      await this.indexAnnouncements(tenantId);

    } catch (error) {
      console.error('Reindexing failed:', error);
      throw new Error('Failed to reindex content');
    }
  }

  private async indexUsers(tenantId: string): Promise<void> {
    const users = await prisma.user.findMany({
      where: {
        tenants: {
          some: { tenantId }
        }
      },
      include: {
        profile: true,
        memberProfiles: {
          where: { tenantId }
        }
      }
    });

    for (const user of users) {
      const profile = user.memberProfiles[0] || user.profile;
      if (profile) {
        await this.indexEntity(tenantId, {
          entityType: 'user',
          entityId: user.id,
          title: `${profile.firstName} ${profile.lastName}`.trim() || user.email,
          content: [profile.bio, profile.skills, profile.interests].filter(Boolean).join(' '),
          metadata: {
            email: user.email,
            profilePicture: profile.profilePicture,
            location: profile.location
          },
          tags: profile.skills?.split(',').map(s => s.trim()) || [],
          categories: ['member'],
          popularity: user.memberProfiles[0]?.points || 0
        });
      }
    }
  }

  private async indexEvents(tenantId: string): Promise<void> {
    const events = await prisma.event.findMany({
      where: { tenantId },
      include: {
        category: true,
        _count: {
          select: { attendees: true }
        }
      }
    });

    for (const event of events) {
      await this.indexEntity(tenantId, {
        entityType: 'event',
        entityId: event.id,
        title: event.title,
        content: [event.description, event.location].filter(Boolean).join(' '),
        metadata: {
          startDate: event.startDate,
          endDate: event.endDate,
          location: event.location,
          price: event.price,
          attendeeCount: event._count.attendees
        },
        tags: event.tags as string[] || [],
        categories: event.category ? [event.category.name] : [],
        status: event.isPublished ? 'active' : 'inactive',
        popularity: event._count.attendees
      });
    }
  }

  private async indexContent(tenantId: string): Promise<void> {
    const content = await prisma.content.findMany({
      where: { tenantId },
      include: {
        contentType: true,
        categories: true,
        tags: true
      }
    });

    for (const item of content) {
      await this.indexEntity(tenantId, {
        entityType: 'content',
        entityId: item.id,
        title: item.title,
        content: item.excerpt || '',
        metadata: {
          contentType: item.contentType.name,
          publishedAt: item.publishedAt,
          featuredImage: item.featuredImage
        },
        tags: item.tags.map(t => t.name),
        categories: item.categories.map(c => c.name),
        status: item.status === 'PUBLISHED' ? 'active' : 'inactive',
        popularity: item.viewCount || 0
      });
    }
  }

  private async indexForumPosts(tenantId: string): Promise<void> {
    const posts = await prisma.forumPost.findMany({
      where: { tenantId },
      include: {
        topic: {
          include: {
            category: {
              include: {
                forum: true
              }
            }
          }
        },
        creator: true
      }
    });

    for (const post of posts) {
      await this.indexEntity(tenantId, {
        entityType: 'forum_post',
        entityId: post.id,
        title: post.topic.title,
        content: post.content,
        metadata: {
          topicId: post.topicId,
          forumName: post.topic.category.forum.name,
          categoryName: post.topic.category.name,
          authorName: post.creator.email
        },
        tags: post.topic.tags as string[] || [],
        categories: ['forum', post.topic.category.name],
        status: post.isDeleted ? 'inactive' : 'active',
        popularity: 0
      });
    }
  }

  private async indexAnnouncements(tenantId: string): Promise<void> {
    const announcements = await prisma.announcement.findMany({
      where: { tenantId },
      include: {
        creator: true,
        _count: {
          select: { recipients: true }
        }
      }
    });

    for (const announcement of announcements) {
      await this.indexEntity(tenantId, {
        entityType: 'announcement',
        entityId: announcement.id,
        title: announcement.title,
        content: announcement.content,
        metadata: {
          priority: announcement.priority,
          publishedAt: announcement.publishedAt,
          expiresAt: announcement.expiresAt,
          authorName: announcement.creator.email
        },
        tags: [],
        categories: ['announcement', announcement.priority.toLowerCase()],
        status: announcement.isPublished ? 'active' : 'inactive',
        popularity: announcement._count.recipients
      });
    }
  }

  // Saved Searches
  async saveSearch(tenantId: string, userId: string, data: {
    name: string;
    query: string;
    filters: Record<string, any>;
    description?: string;
    isPublic?: boolean;
  }) {
    return await prisma.savedSearch.create({
      data: {
        ...data,
        tenantId,
        userId
      }
    });
  }

  async getSavedSearches(tenantId: string, userId: string) {
    return await prisma.savedSearch.findMany({
      where: {
        tenantId,
        OR: [
          { userId },
          { isPublic: true }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async deleteSavedSearch(tenantId: string, userId: string, searchId: string) {
    await prisma.savedSearch.deleteMany({
      where: {
        id: searchId,
        tenantId,
        userId
      }
    });
  }

  // Analytics
  async getSearchAnalytics(tenantId: string, period: 'day' | 'week' | 'month' = 'week') {
    const startDate = new Date();
    switch (period) {
      case 'day':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
    }

    const [
      totalQueries,
      uniqueUsers,
      topQueries,
      avgExecutionTime,
      resultsDistribution
    ] = await Promise.all([
      prisma.searchQuery.count({
        where: {
          tenantId,
          createdAt: { gte: startDate }
        }
      }),
      prisma.searchQuery.findMany({
        where: {
          tenantId,
          createdAt: { gte: startDate },
          userId: { not: null }
        },
        distinct: ['userId']
      }).then(queries => queries.length),
      prisma.searchQuery.groupBy({
        by: ['query'],
        where: {
          tenantId,
          createdAt: { gte: startDate }
        },
        _count: true,
        orderBy: { _count: { query: 'desc' } },
        take: 10
      }),
      prisma.searchQuery.aggregate({
        where: {
          tenantId,
          createdAt: { gte: startDate }
        },
        _avg: { executionTime: true }
      }),
      prisma.searchQuery.groupBy({
        by: ['results'],
        where: {
          tenantId,
          createdAt: { gte: startDate }
        },
        _count: true
      })
    ]);

    return {
      period,
      totalQueries,
      uniqueUsers,
      topQueries: topQueries.map(q => ({ query: q.query, count: q._count })),
      avgExecutionTime: avgExecutionTime._avg.executionTime || 0,
      resultsDistribution,
      noResultsQueries: resultsDistribution.find(r => r.results === 0)?._count || 0
    };
  }
}