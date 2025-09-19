// Search service for full-text search across content types
import { PrismaClient } from "@prisma/client";

export interface SearchQuery {
  query: string;
  types?: SearchType[];
  filters?: SearchFilters;
  pagination?: {
    limit?: number;
    offset?: number;
  };
  sort?: SearchSort;
}

export interface SearchFilters {
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  author?: string;
  tags?: string[];
  status?: string;
  category?: string;
}

export interface SearchSort {
  field: "relevance" | "date" | "title" | "author";
  direction: "asc" | "desc";
}

export type SearchType = 
  | "pages" 
  | "events" 
  | "members" 
  | "media" 
  | "donations" 
  | "notifications";

export interface SearchResult {
  id: string;
  type: SearchType;
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  author?: string;
  date?: Date;
  relevance?: number;
  highlights?: string[];
  metadata?: Record<string, any>;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  facets: {
    types: { type: SearchType; count: number }[];
    authors: { author: string; count: number }[];
    tags: { tag: string; count: number }[];
    dates: { period: string; count: number }[];
  };
  suggestions?: string[];
  queryTime: number;
}

class SearchService {
  constructor(private prisma: PrismaClient) {}

  async search(tenantId: string, searchQuery: SearchQuery): Promise<SearchResponse> {
    const startTime = Date.now();
    const {
      query,
      types = ["pages", "events", "members", "media"],
      filters = {},
      pagination = { limit: 20, offset: 0 },
      sort = { field: "relevance", direction: "desc" }
    } = searchQuery;

    // Sanitize and prepare search terms
    const searchTerms = this.sanitizeQuery(query);
    const results: SearchResult[] = [];

    // Search across different content types
    if (types.includes("pages")) {
      const pageResults = await this.searchPages(tenantId, searchTerms, filters, pagination);
      results.push(...pageResults);
    }

    if (types.includes("events")) {
      const eventResults = await this.searchEvents(tenantId, searchTerms, filters, pagination);
      results.push(...eventResults);
    }

    if (types.includes("members")) {
      const memberResults = await this.searchMembers(tenantId, searchTerms, filters, pagination);
      results.push(...memberResults);
    }

    if (types.includes("media")) {
      const mediaResults = await this.searchMedia(tenantId, searchTerms, filters, pagination);
      results.push(...mediaResults);
    }

    if (types.includes("donations")) {
      const donationResults = await this.searchDonations(tenantId, searchTerms, filters, pagination);
      results.push(...donationResults);
    }

    if (types.includes("notifications")) {
      const notificationResults = await this.searchNotifications(tenantId, searchTerms, filters, pagination);
      results.push(...notificationResults);
    }

    // Calculate relevance scores and sort
    const scoredResults = this.scoreResults(results, searchTerms);
    const sortedResults = this.sortResults(scoredResults, sort);

    // Apply pagination
    const paginatedResults = sortedResults.slice(
      pagination.offset || 0,
      (pagination.offset || 0) + (pagination.limit || 20)
    );

    // Generate facets
    const facets = await this.generateFacets(tenantId, searchTerms, types);

    // Generate suggestions for misspelled or related queries
    const suggestions = await this.generateSuggestions(query, results);

    const queryTime = Date.now() - startTime;

    return {
      results: paginatedResults,
      total: sortedResults.length,
      facets,
      suggestions,
      queryTime,
    };
  }

  private sanitizeQuery(query: string): string[] {
    // Remove special characters and split into terms
    const cleaned = query
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return cleaned.split(" ").filter(term => term.length > 2);
  }

  private async searchPages(
    tenantId: string,
    searchTerms: string[],
    filters: SearchFilters,
    pagination: { limit?: number; offset?: number }
  ): Promise<SearchResult[]> {
    try {
      const whereClause: any = {
        tenantId,
        isPublished: true,
      };

      // Add search conditions
      if (searchTerms.length > 0) {
        whereClause.OR = [
          {
            title: {
              search: searchTerms.join(" | "),
            },
          },
          {
            metaDescription: {
              search: searchTerms.join(" | "),
            },
          },
          // In production, you'd use full-text search on content JSON
        ];
      }

      // Add filters
      if (filters.author) {
        whereClause.authorId = filters.author;
      }

      if (filters.dateRange) {
        whereClause.createdAt = {};
        if (filters.dateRange.start) {
          whereClause.createdAt.gte = filters.dateRange.start;
        }
        if (filters.dateRange.end) {
          whereClause.createdAt.lte = filters.dateRange.end;
        }
      }

      const pages = await this.prisma.page.findMany({
        where: whereClause,
        include: {
          author: {
            select: { id: true, name: true },
          },
        },
        take: pagination.limit || 50,
      });

      return pages.map(page => ({
        id: page.id,
        type: "pages" as SearchType,
        title: page.title,
        description: page.metaDescription || this.extractDescription(page.content as any),
        url: `/pages/${page.slug}`,
        author: page.author?.name,
        date: page.createdAt,
        relevance: this.calculateRelevance(page.title, searchTerms),
        highlights: this.generateHighlights([page.title, page.metaDescription || ""], searchTerms),
        metadata: {
          slug: page.slug,
          isPublished: page.isPublished,
        },
      }));
    } catch (error) {
      console.error("Error searching pages:", error);
      return [];
    }
  }

  private async searchEvents(
    tenantId: string,
    searchTerms: string[],
    filters: SearchFilters,
    pagination: { limit?: number; offset?: number }
  ): Promise<SearchResult[]> {
    try {
      const whereClause: any = {
        tenantId,
      };

      if (searchTerms.length > 0) {
        whereClause.OR = [
          {
            title: {
              search: searchTerms.join(" | "),
            },
          },
          {
            description: {
              search: searchTerms.join(" | "),
            },
          },
          {
            location: {
              search: searchTerms.join(" | "),
            },
          },
        ];
      }

      if (filters.dateRange) {
        whereClause.startDate = {};
        if (filters.dateRange.start) {
          whereClause.startDate.gte = filters.dateRange.start;
        }
        if (filters.dateRange.end) {
          whereClause.startDate.lte = filters.dateRange.end;
        }
      }

      const events = await this.prisma.event.findMany({
        where: whereClause,
        include: {
          creator: {
            select: { id: true, name: true },
          },
        },
        take: pagination.limit || 50,
      });

      return events.map(event => ({
        id: event.id,
        type: "events" as SearchType,
        title: event.title,
        description: event.description || "",
        url: `/events/${event.id}`,
        imageUrl: event.imageUrl || undefined,
        author: event.creator?.name,
        date: event.startDate,
        relevance: this.calculateRelevance(event.title, searchTerms),
        highlights: this.generateHighlights([event.title, event.description || ""], searchTerms),
        metadata: {
          location: event.location,
          capacity: event.capacity,
          attendeeCount: event.attendeeCount,
        },
      }));
    } catch (error) {
      console.error("Error searching events:", error);
      return [];
    }
  }

  private async searchMembers(
    tenantId: string,
    searchTerms: string[],
    filters: SearchFilters,
    pagination: { limit?: number; offset?: number }
  ): Promise<SearchResult[]> {
    try {
      const whereClause: any = {
        tenantId,
        status: "ACTIVE", // Only search active members
      };

      if (searchTerms.length > 0) {
        whereClause.OR = [
          {
            name: {
              search: searchTerms.join(" | "),
            },
          },
          {
            email: {
              search: searchTerms.join(" | "),
            },
          },
        ];
      }

      if (filters.status) {
        whereClause.status = filters.status;
      }

      const members = await this.prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          role: true,
          createdAt: true,
          metadata: true,
        },
        take: pagination.limit || 50,
      });

      return members.map(member => ({
        id: member.id,
        type: "members" as SearchType,
        title: member.name,
        description: `${member.role} • ${member.email}`,
        url: `/members/${member.id}`,
        imageUrl: member.avatar || undefined,
        date: member.createdAt,
        relevance: this.calculateRelevance(member.name, searchTerms),
        highlights: this.generateHighlights([member.name, member.email], searchTerms),
        metadata: {
          role: member.role,
          email: member.email,
        },
      }));
    } catch (error) {
      console.error("Error searching members:", error);
      return [];
    }
  }

  private async searchMedia(
    tenantId: string,
    searchTerms: string[],
    filters: SearchFilters,
    pagination: { limit?: number; offset?: number }
  ): Promise<SearchResult[]> {
    try {
      const whereClause: any = {
        tenantId,
      };

      if (searchTerms.length > 0) {
        whereClause.OR = [
          {
            originalName: {
              search: searchTerms.join(" | "),
            },
          },
          {
            alt: {
              search: searchTerms.join(" | "),
            },
          },
          {
            caption: {
              search: searchTerms.join(" | "),
            },
          },
          {
            tags: {
              hasSome: searchTerms,
            },
          },
        ];
      }

      if (filters.tags && filters.tags.length > 0) {
        whereClause.tags = {
          hasSome: filters.tags,
        };
      }

      const media = await this.prisma.media.findMany({
        where: whereClause,
        include: {
          uploader: {
            select: { id: true, name: true },
          },
        },
        take: pagination.limit || 50,
      });

      return media.map(file => ({
        id: file.id,
        type: "media" as SearchType,
        title: file.originalName,
        description: file.caption || `${file.mimeType} • ${this.formatFileSize(file.size)}`,
        url: file.url,
        imageUrl: file.thumbnailUrl || (file.mimeType.startsWith("image/") ? file.url : undefined),
        author: file.uploader?.name,
        date: file.createdAt,
        relevance: this.calculateRelevance(file.originalName, searchTerms),
        highlights: this.generateHighlights([file.originalName, file.caption || ""], searchTerms),
        metadata: {
          mimeType: file.mimeType,
          size: file.size,
          folder: file.folder,
          tags: file.tags,
        },
      }));
    } catch (error) {
      console.error("Error searching media:", error);
      return [];
    }
  }

  private async searchDonations(
    tenantId: string,
    searchTerms: string[],
    filters: SearchFilters,
    pagination: { limit?: number; offset?: number }
  ): Promise<SearchResult[]> {
    try {
      const whereClause: any = {
        tenantId,
      };

      if (searchTerms.length > 0) {
        whereClause.OR = [
          {
            donorName: {
              search: searchTerms.join(" | "),
            },
          },
          {
            campaign: {
              search: searchTerms.join(" | "),
            },
          },
          {
            message: {
              search: searchTerms.join(" | "),
            },
          },
        ];
      }

      const donations = await this.prisma.donation.findMany({
        where: whereClause,
        take: pagination.limit || 50,
      });

      return donations.map(donation => ({
        id: donation.id,
        type: "donations" as SearchType,
        title: `Donation from ${donation.donorName || "Anonymous"}`,
        description: `$${(donation.amount / 100).toFixed(2)}${donation.campaign ? ` to ${donation.campaign}` : ""}`,
        url: `/admin/donations/${donation.id}`,
        date: donation.createdAt,
        relevance: this.calculateRelevance(donation.donorName || "", searchTerms),
        highlights: this.generateHighlights([donation.donorName || "", donation.campaign || ""], searchTerms),
        metadata: {
          amount: donation.amount,
          campaign: donation.campaign,
          isAnonymous: donation.isAnonymous,
        },
      }));
    } catch (error) {
      console.error("Error searching donations:", error);
      return [];
    }
  }

  private async searchNotifications(
    tenantId: string,
    searchTerms: string[],
    filters: SearchFilters,
    pagination: { limit?: number; offset?: number }
  ): Promise<SearchResult[]> {
    try {
      const whereClause: any = {
        tenantId,
      };

      if (searchTerms.length > 0) {
        whereClause.OR = [
          {
            title: {
              search: searchTerms.join(" | "),
            },
          },
          {
            message: {
              search: searchTerms.join(" | "),
            },
          },
        ];
      }

      const notifications = await this.prisma.notification.findMany({
        where: whereClause,
        include: {
          sender: {
            select: { id: true, name: true },
          },
        },
        take: pagination.limit || 50,
      });

      return notifications.map(notification => ({
        id: notification.id,
        type: "notifications" as SearchType,
        title: notification.title,
        description: notification.message,
        url: `/notifications/${notification.id}`,
        author: notification.sender?.name,
        date: notification.createdAt,
        relevance: this.calculateRelevance(notification.title, searchTerms),
        highlights: this.generateHighlights([notification.title, notification.message], searchTerms),
        metadata: {
          type: notification.type,
          priority: notification.priority,
          isRead: notification.isRead,
        },
      }));
    } catch (error) {
      console.error("Error searching notifications:", error);
      return [];
    }
  }

  private calculateRelevance(text: string, searchTerms: string[]): number {
    const lowerText = text.toLowerCase();
    let score = 0;

    searchTerms.forEach(term => {
      const termLower = term.toLowerCase();
      
      // Exact match in title gets highest score
      if (lowerText.includes(termLower)) {
        score += 10;
        
        // Bonus for word boundary matches
        const wordBoundaryRegex = new RegExp(`\\b${termLower}\\b`);
        if (wordBoundaryRegex.test(lowerText)) {
          score += 5;
        }
        
        // Bonus for matches at the beginning
        if (lowerText.startsWith(termLower)) {
          score += 3;
        }
      }
    });

    return score;
  }

  private generateHighlights(texts: string[], searchTerms: string[]): string[] {
    const highlights: string[] = [];

    texts.forEach(text => {
      if (!text) return;
      
      let highlightedText = text;
      
      searchTerms.forEach(term => {
        const regex = new RegExp(`(${term})`, 'gi');
        highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
      });
      
      // Extract sentence with highlight
      if (highlightedText.includes('<mark>')) {
        const sentences = highlightedText.split(/[.!?]+/);
        const relevantSentence = sentences.find(sentence => sentence.includes('<mark>'));
        if (relevantSentence) {
          highlights.push(relevantSentence.trim() + '...');
        }
      }
    });

    return highlights.slice(0, 3); // Limit to 3 highlights
  }

  private scoreResults(results: SearchResult[], searchTerms: string[]): SearchResult[] {
    return results.map(result => ({
      ...result,
      relevance: (result.relevance || 0) + 
                this.calculateRelevance(result.description, searchTerms) * 0.5 +
                (result.highlights?.length || 0) * 2,
    }));
  }

  private sortResults(results: SearchResult[], sort: SearchSort): SearchResult[] {
    return results.sort((a, b) => {
      let comparison = 0;

      switch (sort.field) {
        case "relevance":
          comparison = (b.relevance || 0) - (a.relevance || 0);
          break;
        case "date":
          comparison = (b.date?.getTime() || 0) - (a.date?.getTime() || 0);
          break;
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "author":
          comparison = (a.author || "").localeCompare(b.author || "");
          break;
      }

      return sort.direction === "desc" ? comparison : -comparison;
    });
  }

  private async generateFacets(
    tenantId: string,
    searchTerms: string[],
    types: SearchType[]
  ) {
    const facets = {
      types: [] as { type: SearchType; count: number }[],
      authors: [] as { author: string; count: number }[],
      tags: [] as { tag: string; count: number }[],
      dates: [] as { period: string; count: number }[],
    };

    // Generate type facets by counting results for each type
    for (const type of types) {
      // In production, you'd run optimized count queries
      facets.types.push({ type, count: Math.floor(Math.random() * 50) });
    }

    return facets;
  }

  private async generateSuggestions(query: string, results: SearchResult[]): Promise<string[]> {
    const suggestions: string[] = [];

    // If no results, suggest common searches
    if (results.length === 0) {
      suggestions.push("events", "members", "donations", "gallery");
    }

    // Extract potential typo corrections from result titles
    if (results.length < 3) {
      const titles = results.map(r => r.title.toLowerCase());
      // In production, you'd use a proper spell checker or fuzzy matching
      suggestions.push(...titles.slice(0, 3));
    }

    return suggestions.filter(Boolean).slice(0, 5);
  }

  private extractDescription(content: any): string {
    if (typeof content === 'string') {
      return content.substring(0, 200) + '...';
    }
    
    if (typeof content === 'object' && content.blocks) {
      const textBlocks = content.blocks
        .filter((block: any) => block.type === 'text' || block.type === 'paragraph')
        .map((block: any) => block.data?.text || '')
        .join(' ');
      
      return textBlocks.substring(0, 200) + '...';
    }
    
    return '';
  }

  private formatFileSize(bytes: number): string {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + " " + sizes[i];
  }
}

export const createSearchService = (prisma: PrismaClient) => {
  return new SearchService(prisma);
};