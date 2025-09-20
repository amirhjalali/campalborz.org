import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';
import { TRPCError } from '@trpc/server';
import { promises as fs } from 'fs';
import path from 'path';

interface DocumentationSection {
  id: string;
  title: string;
  content: string;
  order: number;
  category: string;
  tags: string[];
  level: 'beginner' | 'intermediate' | 'advanced';
  lastUpdated: Date;
  author: string;
  isPublished: boolean;
}

interface APIDocumentation {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  parameters: {
    name: string;
    type: string;
    required: boolean;
    description: string;
    example?: any;
  }[];
  requestBody?: {
    type: string;
    properties: Record<string, any>;
    example: any;
  };
  responses: {
    status: number;
    description: string;
    example: any;
  }[];
  examples: {
    title: string;
    request: any;
    response: any;
  }[];
}

interface UserGuide {
  title: string;
  description: string;
  steps: {
    title: string;
    content: string;
    images?: string[];
    code?: string;
    tips?: string[];
  }[];
  prerequisites: string[];
  relatedGuides: string[];
}

class DocumentationService {
  private docsPath = path.join(process.cwd(), 'docs');
  private apiDocsPath = path.join(this.docsPath, 'api');
  private userGuidesPath = path.join(this.docsPath, 'guides');

  // Initialize documentation structure
  async initializeDocumentation() {
    try {
      await this.ensureDirectories();
      await this.generateAPIDocumentation();
      await this.createUserGuides();
      
      logger.info('Documentation initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize documentation', { error });
      throw error;
    }
  }

  // Create Documentation Section
  async createDocumentationSection(
    tenantId: string,
    userId: string,
    section: Omit<DocumentationSection, 'id' | 'lastUpdated' | 'author'>
  ) {
    try {
      const docSection = await prisma.content.create({
        data: {
          tenantId,
          contentTypeId: 'documentation',
          title: section.title,
          slug: this.generateSlug(section.title),
          content: {
            body: section.content,
            category: section.category,
            tags: section.tags,
            level: section.level,
            order: section.order
          },
          status: section.isPublished ? 'PUBLISHED' : 'DRAFT',
          createdBy: userId,
          updatedBy: userId
        }
      });

      logger.info('Documentation section created', {
        sectionId: docSection.id,
        title: section.title,
        category: section.category
      });

      return docSection;
    } catch (error) {
      logger.error('Failed to create documentation section', { error, section });
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create documentation section'
      });
    }
  }

  // Get Documentation Sections
  async getDocumentationSections(
    tenantId: string,
    filters?: {
      category?: string;
      tags?: string[];
      level?: string;
      search?: string;
      published?: boolean;
    }
  ) {
    try {
      const where: any = {
        tenantId,
        contentTypeId: 'documentation'
      };

      if (filters?.published !== undefined) {
        where.status = filters.published ? 'PUBLISHED' : 'DRAFT';
      }

      if (filters?.category) {
        where.content = {
          path: ['category'],
          equals: filters.category
        };
      }

      if (filters?.search) {
        where.OR = [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { content: { path: ['body'], string_contains: filters.search } }
        ];
      }

      const sections = await prisma.content.findMany({
        where,
        include: {
          author: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy: [
          { content: { path: ['order'], sort: 'asc' } },
          { title: 'asc' }
        ]
      });

      // Filter by tags and level if provided
      const filteredSections = sections.filter(section => {
        const content = section.content as any;
        
        if (filters?.tags?.length) {
          const sectionTags = content.tags || [];
          if (!filters.tags.some(tag => sectionTags.includes(tag))) {
            return false;
          }
        }

        if (filters?.level && content.level !== filters.level) {
          return false;
        }

        return true;
      });

      return filteredSections.map(section => ({
        id: section.id,
        title: section.title,
        content: (section.content as any).body,
        category: (section.content as any).category,
        tags: (section.content as any).tags || [],
        level: (section.content as any).level,
        order: (section.content as any).order,
        lastUpdated: section.updatedAt,
        author: section.author,
        isPublished: section.status === 'PUBLISHED'
      }));
    } catch (error) {
      logger.error('Failed to get documentation sections', { error, tenantId });
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get documentation sections'
      });
    }
  }

  // Generate API Documentation
  async generateAPIDocumentation() {
    try {
      const apiDocs = await this.extractAPIRoutes();
      const documentation = await this.formatAPIDocumentation(apiDocs);
      
      await this.writeDocumentationFile(
        path.join(this.apiDocsPath, 'api-reference.md'),
        documentation
      );

      // Generate OpenAPI spec
      const openApiSpec = await this.generateOpenAPISpec(apiDocs);
      await this.writeDocumentationFile(
        path.join(this.apiDocsPath, 'openapi.json'),
        JSON.stringify(openApiSpec, null, 2)
      );

      logger.info('API documentation generated');
      return documentation;
    } catch (error) {
      logger.error('Failed to generate API documentation', { error });
      throw error;
    }
  }

  // Create User Guides
  async createUserGuides() {
    try {
      const guides = [
        await this.createGettingStartedGuide(),
        await this.createEventManagementGuide(),
        await this.createMemberPortalGuide(),
        await this.createDonationGuide(),
        await this.createAdminGuide()
      ];

      for (const guide of guides) {
        await this.writeDocumentationFile(
          path.join(this.userGuidesPath, `${guide.title.toLowerCase().replace(/\s+/g, '-')}.md`),
          this.formatUserGuide(guide)
        );
      }

      logger.info('User guides created', { count: guides.length });
      return guides;
    } catch (error) {
      logger.error('Failed to create user guides', { error });
      throw error;
    }
  }

  // Search Documentation
  async searchDocumentation(
    tenantId: string,
    query: string,
    filters?: {
      category?: string;
      type?: 'user-guide' | 'api' | 'admin' | 'all';
    }
  ) {
    try {
      const searchResults = await prisma.content.findMany({
        where: {
          tenantId,
          contentTypeId: 'documentation',
          status: 'PUBLISHED',
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { content: { path: ['body'], string_contains: query } }
          ],
          ...(filters?.category && {
            content: {
              path: ['category'],
              equals: filters.category
            }
          })
        },
        select: {
          id: true,
          title: true,
          slug: true,
          content: true,
          updatedAt: true
        },
        take: 20
      });

      // Extract relevant snippets
      const results = searchResults.map(result => {
        const content = (result.content as any).body || '';
        const snippet = this.extractSearchSnippet(content, query);
        
        return {
          id: result.id,
          title: result.title,
          slug: result.slug,
          snippet,
          category: (result.content as any).category,
          lastUpdated: result.updatedAt
        };
      });

      logger.info('Documentation search performed', {
        query,
        resultsCount: results.length
      });

      return results;
    } catch (error) {
      logger.error('Failed to search documentation', { error, query });
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to search documentation'
      });
    }
  }

  // Generate Documentation Analytics
  async getDocumentationAnalytics(tenantId: string) {
    try {
      const [totalSections, categoryStats, viewStats] = await Promise.all([
        prisma.content.count({
          where: {
            tenantId,
            contentTypeId: 'documentation',
            status: 'PUBLISHED'
          }
        }),
        prisma.content.groupBy({
          by: ['content'],
          where: {
            tenantId,
            contentTypeId: 'documentation',
            status: 'PUBLISHED'
          },
          _count: true
        }),
        // Get view statistics from analytics if available
        this.getDocumentationViews(tenantId)
      ]);

      const categories = categoryStats.map(stat => ({
        category: (stat.content as any)?.category || 'uncategorized',
        count: stat._count
      }));

      return {
        totalSections,
        categories,
        views: viewStats,
        lastUpdated: new Date()
      };
    } catch (error) {
      logger.error('Failed to get documentation analytics', { error, tenantId });
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get documentation analytics'
      });
    }
  }

  // Export Documentation
  async exportDocumentation(
    tenantId: string,
    format: 'markdown' | 'pdf' | 'html' = 'markdown'
  ) {
    try {
      const sections = await this.getDocumentationSections(tenantId, {
        published: true
      });

      let exportContent = '';

      switch (format) {
        case 'markdown':
          exportContent = this.formatAsMarkdown(sections);
          break;
        case 'html':
          exportContent = this.formatAsHTML(sections);
          break;
        case 'pdf':
          // Would use a library like puppeteer to generate PDF
          exportContent = await this.formatAsPDF(sections);
          break;
      }

      logger.info('Documentation exported', {
        tenantId,
        format,
        sectionsCount: sections.length
      });

      return {
        content: exportContent,
        filename: `documentation-${new Date().toISOString().split('T')[0]}.${format}`,
        mimeType: this.getMimeType(format)
      };
    } catch (error) {
      logger.error('Failed to export documentation', { error, tenantId, format });
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to export documentation'
      });
    }
  }

  // Private Helper Methods
  private async ensureDirectories() {
    await fs.mkdir(this.docsPath, { recursive: true });
    await fs.mkdir(this.apiDocsPath, { recursive: true });
    await fs.mkdir(this.userGuidesPath, { recursive: true });
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private async extractAPIRoutes(): Promise<APIDocumentation[]> {
    // This would analyze the router files to extract API endpoints
    // For now, return a sample structure
    return [
      {
        endpoint: '/api/trpc/events.create',
        method: 'POST',
        description: 'Create a new event',
        parameters: [],
        requestBody: {
          type: 'object',
          properties: {
            title: { type: 'string', required: true },
            description: { type: 'string' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' }
          },
          example: {
            title: 'Community Workshop',
            description: 'Learn basic woodworking skills',
            startDate: '2024-07-15T10:00:00Z',
            endDate: '2024-07-15T16:00:00Z'
          }
        },
        responses: [
          {
            status: 200,
            description: 'Event created successfully',
            example: {
              id: 'evt_123',
              title: 'Community Workshop',
              status: 'PUBLISHED'
            }
          }
        ],
        examples: []
      }
    ];
  }

  private async formatAPIDocumentation(apiDocs: APIDocumentation[]): Promise<string> {
    let markdown = '# API Reference\n\n';
    markdown += 'This document provides detailed information about the Camp Platform API endpoints.\n\n';

    for (const doc of apiDocs) {
      markdown += `## ${doc.method} ${doc.endpoint}\n\n`;
      markdown += `${doc.description}\n\n`;

      if (doc.parameters.length > 0) {
        markdown += '### Parameters\n\n';
        markdown += '| Name | Type | Required | Description |\n';
        markdown += '|------|------|----------|-------------|\n';
        
        for (const param of doc.parameters) {
          markdown += `| ${param.name} | ${param.type} | ${param.required ? 'Yes' : 'No'} | ${param.description} |\n`;
        }
        markdown += '\n';
      }

      if (doc.requestBody) {
        markdown += '### Request Body\n\n';
        markdown += '```json\n';
        markdown += JSON.stringify(doc.requestBody.example, null, 2);
        markdown += '\n```\n\n';
      }

      markdown += '### Responses\n\n';
      for (const response of doc.responses) {
        markdown += `**${response.status}** - ${response.description}\n\n`;
        markdown += '```json\n';
        markdown += JSON.stringify(response.example, null, 2);
        markdown += '\n```\n\n';
      }
    }

    return markdown;
  }

  private async generateOpenAPISpec(apiDocs: APIDocumentation[]) {
    return {
      openapi: '3.0.0',
      info: {
        title: 'Camp Platform API',
        version: '1.0.0',
        description: 'API for managing Burning Man theme camps'
      },
      servers: [
        {
          url: 'https://api.campalborz.org',
          description: 'Production server'
        }
      ],
      paths: apiDocs.reduce((paths, doc) => {
        const pathKey = doc.endpoint.replace('/api/trpc/', '/api/v1/');
        paths[pathKey] = {
          [doc.method.toLowerCase()]: {
            summary: doc.description,
            parameters: doc.parameters,
            requestBody: doc.requestBody,
            responses: doc.responses.reduce((resp, r) => {
              resp[r.status] = {
                description: r.description,
                content: {
                  'application/json': {
                    example: r.example
                  }
                }
              };
              return resp;
            }, {} as any)
          }
        };
        return paths;
      }, {} as any)
    };
  }

  private async createGettingStartedGuide(): Promise<UserGuide> {
    return {
      title: 'Getting Started',
      description: 'Learn how to set up and use the Camp Platform for your Burning Man theme camp.',
      prerequisites: [
        'Admin access to your camp\'s platform',
        'Basic understanding of theme camp operations'
      ],
      steps: [
        {
          title: 'Account Setup',
          content: 'Create your camp administrator account and configure basic settings.',
          tips: [
            'Use a secure password',
            'Enable two-factor authentication',
            'Verify your email address'
          ]
        },
        {
          title: 'Camp Configuration',
          content: 'Set up your camp\'s basic information, location, and branding.',
          code: `{
  "name": "Camp Alborz",
  "location": "9:00 & G",
  "description": "Persian culture and community at Burning Man"
}`
        },
        {
          title: 'Member Onboarding',
          content: 'Invite members and set up the membership application process.'
        }
      ],
      relatedGuides: ['member-management', 'event-planning']
    };
  }

  private async createEventManagementGuide(): Promise<UserGuide> {
    return {
      title: 'Event Management',
      description: 'Create and manage events for your theme camp.',
      prerequisites: ['Admin or Lead member access'],
      steps: [
        {
          title: 'Creating Events',
          content: 'Learn how to create different types of events for your camp.'
        },
        {
          title: 'RSVP Management',
          content: 'Handle RSVPs, waitlists, and attendance tracking.'
        },
        {
          title: 'Event Analytics',
          content: 'View attendance statistics and member engagement metrics.'
        }
      ],
      relatedGuides: ['member-portal', 'analytics']
    };
  }

  private async createMemberPortalGuide(): Promise<UserGuide> {
    return {
      title: 'Member Portal',
      description: 'Guide for camp members using the member portal.',
      prerequisites: ['Approved membership'],
      steps: [
        {
          title: 'Profile Setup',
          content: 'Complete your member profile with skills, interests, and availability.'
        },
        {
          title: 'Event Participation',
          content: 'RSVP to events and manage your participation.'
        },
        {
          title: 'Volunteer Tracking',
          content: 'Log volunteer hours and track your contributions.'
        }
      ],
      relatedGuides: ['getting-started', 'events']
    };
  }

  private async createDonationGuide(): Promise<UserGuide> {
    return {
      title: 'Donation Management',
      description: 'Set up and manage donations for your theme camp.',
      prerequisites: ['Admin access', 'Stripe account setup'],
      steps: [
        {
          title: 'Payment Integration',
          content: 'Connect Stripe for secure payment processing.'
        },
        {
          title: 'Campaign Creation',
          content: 'Create fundraising campaigns with goals and rewards.'
        },
        {
          title: 'Donor Management',
          content: 'Track donations and manage donor relationships.'
        }
      ],
      relatedGuides: ['admin-dashboard', 'analytics']
    };
  }

  private async createAdminGuide(): Promise<UserGuide> {
    return {
      title: 'Admin Dashboard',
      description: 'Comprehensive guide for camp administrators.',
      prerequisites: ['Admin or Tenant Admin role'],
      steps: [
        {
          title: 'Dashboard Overview',
          content: 'Understand the admin dashboard metrics and controls.'
        },
        {
          title: 'User Management',
          content: 'Manage member roles, permissions, and applications.'
        },
        {
          title: 'System Configuration',
          content: 'Configure camp settings, integrations, and features.'
        }
      ],
      relatedGuides: ['getting-started', 'user-management']
    };
  }

  private formatUserGuide(guide: UserGuide): string {
    let markdown = `# ${guide.title}\n\n`;
    markdown += `${guide.description}\n\n`;

    if (guide.prerequisites.length > 0) {
      markdown += '## Prerequisites\n\n';
      for (const prereq of guide.prerequisites) {
        markdown += `- ${prereq}\n`;
      }
      markdown += '\n';
    }

    markdown += '## Steps\n\n';
    guide.steps.forEach((step, index) => {
      markdown += `### ${index + 1}. ${step.title}\n\n`;
      markdown += `${step.content}\n\n`;

      if (step.code) {
        markdown += '```json\n';
        markdown += step.code;
        markdown += '\n```\n\n';
      }

      if (step.tips && step.tips.length > 0) {
        markdown += '**Tips:**\n';
        for (const tip of step.tips) {
          markdown += `- ${tip}\n`;
        }
        markdown += '\n';
      }
    });

    if (guide.relatedGuides.length > 0) {
      markdown += '## Related Guides\n\n';
      for (const related of guide.relatedGuides) {
        markdown += `- [${related}](${related}.md)\n`;
      }
      markdown += '\n';
    }

    return markdown;
  }

  private async writeDocumentationFile(filePath: string, content: string) {
    await fs.writeFile(filePath, content, 'utf-8');
  }

  private extractSearchSnippet(content: string, query: string): string {
    const words = content.split(/\s+/);
    const queryWords = query.toLowerCase().split(/\s+/);
    
    // Find the first occurrence of any query word
    let startIndex = 0;
    for (let i = 0; i < words.length; i++) {
      if (queryWords.some(qw => words[i].toLowerCase().includes(qw))) {
        startIndex = Math.max(0, i - 10);
        break;
      }
    }

    const snippet = words.slice(startIndex, startIndex + 30).join(' ');
    return snippet.length < content.length ? snippet + '...' : snippet;
  }

  private async getDocumentationViews(tenantId: string) {
    // Placeholder for analytics integration
    return {
      totalViews: 0,
      uniqueViews: 0,
      topPages: []
    };
  }

  private formatAsMarkdown(sections: any[]): string {
    let markdown = '# Documentation Export\n\n';
    
    const categories = [...new Set(sections.map(s => s.category))];
    
    for (const category of categories) {
      markdown += `## ${category}\n\n`;
      
      const categorySections = sections
        .filter(s => s.category === category)
        .sort((a, b) => a.order - b.order);
      
      for (const section of categorySections) {
        markdown += `### ${section.title}\n\n`;
        markdown += `${section.content}\n\n`;
      }
    }

    return markdown;
  }

  private formatAsHTML(sections: any[]): string {
    let html = `
<!DOCTYPE html>
<html>
<head>
    <title>Documentation Export</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1, h2, h3 { color: #333; }
        pre { background: #f5f5f5; padding: 10px; border-radius: 4px; }
        code { background: #f5f5f5; padding: 2px 4px; border-radius: 2px; }
    </style>
</head>
<body>
    <h1>Documentation Export</h1>
`;

    const categories = [...new Set(sections.map(s => s.category))];
    
    for (const category of categories) {
      html += `<h2>${category}</h2>`;
      
      const categorySections = sections
        .filter(s => s.category === category)
        .sort((a, b) => a.order - b.order);
      
      for (const section of categorySections) {
        html += `<h3>${section.title}</h3>`;
        html += `<div>${section.content.replace(/\n/g, '<br>')}</div>`;
      }
    }

    html += '</body></html>';
    return html;
  }

  private async formatAsPDF(sections: any[]): Promise<string> {
    // Would integrate with a PDF generation library
    return 'PDF generation not implemented yet';
  }

  private getMimeType(format: string): string {
    const mimeTypes = {
      markdown: 'text/markdown',
      html: 'text/html',
      pdf: 'application/pdf'
    };
    return mimeTypes[format as keyof typeof mimeTypes] || 'text/plain';
  }
}

export const documentationService = new DocumentationService();