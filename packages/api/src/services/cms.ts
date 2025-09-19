import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';
import { TRPCError } from '@trpc/server';
import { Prisma, ContentStatus, CommentStatus, TranslationStatus } from '@prisma/client';
import { z } from 'zod';

// JSON Schema for field validation
const fieldSchemas = {
  text: z.object({
    type: z.literal('text'),
    label: z.string(),
    placeholder: z.string().optional(),
    required: z.boolean().default(false),
    maxLength: z.number().optional(),
    validation: z.string().optional() // regex pattern
  }),
  textarea: z.object({
    type: z.literal('textarea'),
    label: z.string(),
    placeholder: z.string().optional(),
    required: z.boolean().default(false),
    rows: z.number().default(4)
  }),
  richtext: z.object({
    type: z.literal('richtext'),
    label: z.string(),
    required: z.boolean().default(false),
    toolbar: z.array(z.string()).optional()
  }),
  number: z.object({
    type: z.literal('number'),
    label: z.string(),
    required: z.boolean().default(false),
    min: z.number().optional(),
    max: z.number().optional()
  }),
  date: z.object({
    type: z.literal('date'),
    label: z.string(),
    required: z.boolean().default(false),
    format: z.enum(['date', 'datetime', 'time']).default('date')
  }),
  select: z.object({
    type: z.literal('select'),
    label: z.string(),
    required: z.boolean().default(false),
    options: z.array(z.object({
      value: z.string(),
      label: z.string()
    })),
    multiple: z.boolean().default(false)
  }),
  image: z.object({
    type: z.literal('image'),
    label: z.string(),
    required: z.boolean().default(false),
    maxSize: z.number().optional(), // bytes
    acceptedFormats: z.array(z.string()).optional()
  }),
  file: z.object({
    type: z.literal('file'),
    label: z.string(),
    required: z.boolean().default(false),
    maxSize: z.number().optional(),
    acceptedFormats: z.array(z.string()).optional()
  }),
  gallery: z.object({
    type: z.literal('gallery'),
    label: z.string(),
    required: z.boolean().default(false),
    maxImages: z.number().optional()
  }),
  repeater: z.object({
    type: z.literal('repeater'),
    label: z.string(),
    required: z.boolean().default(false),
    fields: z.record(z.any()), // nested field schema
    min: z.number().optional(),
    max: z.number().optional()
  })
};

interface ContentData {
  [key: string]: any;
}

interface SearchFilters {
  contentTypeId?: string;
  status?: ContentStatus;
  categoryIds?: string[];
  tagIds?: string[];
  authorId?: string;
  language?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

class CMSService {
  // Content Type Management
  async createContentType(
    tenantId: string,
    userId: string,
    data: {
      name: string;
      slug: string;
      description?: string;
      displayName: string;
      pluralName: string;
      icon?: string;
      schema: Record<string, any>;
      permissions: Record<string, any>;
      workflow?: Record<string, any>;
      isPublic?: boolean;
      allowComments?: boolean;
    }
  ) {
    try {
      // Validate schema structure
      this.validateContentTypeSchema(data.schema);

      const contentType = await prisma.contentType.create({
        data: {
          ...data,
          tenantId,
          createdBy: userId
        },
        include: {
          creator: true,
          _count: {
            select: { contents: true }
          }
        }
      });

      logger.info('Content type created', {
        contentTypeId: contentType.id,
        tenantId,
        userId,
        name: data.name
      });

      return contentType;
    } catch (error) {
      logger.error('Failed to create content type', { error, tenantId, userId });
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create content type'
      });
    }
  }

  async updateContentType(
    contentTypeId: string,
    tenantId: string,
    userId: string,
    data: Partial<{
      name: string;
      description: string;
      displayName: string;
      pluralName: string;
      icon: string;
      schema: Record<string, any>;
      permissions: Record<string, any>;
      workflow: Record<string, any>;
      isEnabled: boolean;
      isPublic: boolean;
      allowComments: boolean;
    }>
  ) {
    try {
      if (data.schema) {
        this.validateContentTypeSchema(data.schema);
      }

      const contentType = await prisma.contentType.update({
        where: {
          id: contentTypeId,
          tenantId
        },
        data,
        include: {
          creator: true,
          _count: {
            select: { contents: true }
          }
        }
      });

      logger.info('Content type updated', {
        contentTypeId,
        tenantId,
        userId
      });

      return contentType;
    } catch (error) {
      logger.error('Failed to update content type', { error, contentTypeId, tenantId });
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update content type'
      });
    }
  }

  // Content Management
  async createContent(
    tenantId: string,
    userId: string,
    data: {
      title: string;
      slug: string;
      excerpt?: string;
      contentTypeId: string;
      data: ContentData;
      metaTitle?: string;
      metaDescription?: string;
      metaKeywords?: string;
      status?: ContentStatus;
      publishedAt?: Date;
      scheduledAt?: Date;
      featuredImage?: string;
      socialImage?: string;
      canonicalUrl?: string;
      categoryIds?: string[];
      tagIds?: string[];
    }
  ) {
    try {
      // Validate content data against content type schema
      await this.validateContentData(data.contentTypeId, data.data);

      const content = await prisma.$transaction(async (tx) => {
        // Create the content
        const newContent = await tx.content.create({
          data: {
            title: data.title,
            slug: data.slug,
            excerpt: data.excerpt,
            data: data.data,
            metaTitle: data.metaTitle,
            metaDescription: data.metaDescription,
            metaKeywords: data.metaKeywords,
            status: data.status || ContentStatus.DRAFT,
            publishedAt: data.publishedAt,
            scheduledAt: data.scheduledAt,
            featuredImage: data.featuredImage,
            socialImage: data.socialImage,
            canonicalUrl: data.canonicalUrl,
            contentTypeId: data.contentTypeId,
            tenantId,
            authorId: userId
          }
        });

        // Create initial revision
        await tx.contentRevision.create({
          data: {
            title: data.title,
            data: data.data,
            excerpt: data.excerpt,
            version: 1,
            comment: 'Initial version',
            contentId: newContent.id,
            authorId: userId
          }
        });

        // Associate categories
        if (data.categoryIds?.length) {
          await tx.contentCategory.createMany({
            data: data.categoryIds.map(categoryId => ({
              contentId: newContent.id,
              categoryId
            }))
          });
        }

        // Associate tags
        if (data.tagIds?.length) {
          await tx.contentTag.createMany({
            data: data.tagIds.map(tagId => ({
              contentId: newContent.id,
              tagId
            }))
          });
        }

        return newContent;
      });

      // Fetch complete content with relations
      const fullContent = await this.getContentById(content.id, tenantId);

      logger.info('Content created', {
        contentId: content.id,
        tenantId,
        userId,
        title: data.title
      });

      return fullContent;
    } catch (error) {
      logger.error('Failed to create content', { error, tenantId, userId });
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create content'
      });
    }
  }

  async updateContent(
    contentId: string,
    tenantId: string,
    userId: string,
    data: Partial<{
      title: string;
      slug: string;
      excerpt: string;
      data: ContentData;
      metaTitle: string;
      metaDescription: string;
      metaKeywords: string;
      status: ContentStatus;
      publishedAt: Date;
      scheduledAt: Date;
      featuredImage: string;
      socialImage: string;
      canonicalUrl: string;
      categoryIds: string[];
      tagIds: string[];
    }>,
    createRevision: boolean = true
  ) {
    try {
      const existingContent = await prisma.content.findFirst({
        where: { id: contentId, tenantId },
        include: { contentType: true }
      });

      if (!existingContent) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Content not found'
        });
      }

      // Validate content data if provided
      if (data.data) {
        await this.validateContentData(existingContent.contentTypeId, data.data);
      }

      const updatedContent = await prisma.$transaction(async (tx) => {
        // Update content
        const content = await tx.content.update({
          where: { id: contentId },
          data: {
            ...data,
            lastEditedBy: userId,
            categoryIds: undefined, // Remove from update data
            tagIds: undefined // Remove from update data
          }
        });

        // Create revision if requested
        if (createRevision) {
          const lastRevision = await tx.contentRevision.findFirst({
            where: { contentId },
            orderBy: { version: 'desc' }
          });

          await tx.contentRevision.create({
            data: {
              title: data.title || existingContent.title,
              data: data.data || existingContent.data,
              excerpt: data.excerpt !== undefined ? data.excerpt : existingContent.excerpt,
              version: (lastRevision?.version || 0) + 1,
              comment: 'Updated content',
              contentId,
              authorId: userId
            }
          });
        }

        // Update categories if provided
        if (data.categoryIds !== undefined) {
          await tx.contentCategory.deleteMany({
            where: { contentId }
          });

          if (data.categoryIds.length > 0) {
            await tx.contentCategory.createMany({
              data: data.categoryIds.map(categoryId => ({
                contentId,
                categoryId
              }))
            });
          }
        }

        // Update tags if provided
        if (data.tagIds !== undefined) {
          await tx.contentTag.deleteMany({
            where: { contentId }
          });

          if (data.tagIds.length > 0) {
            await tx.contentTag.createMany({
              data: data.tagIds.map(tagId => ({
                contentId,
                tagId
              }))
            });
          }
        }

        return content;
      });

      // Fetch complete updated content
      const fullContent = await this.getContentById(contentId, tenantId);

      logger.info('Content updated', {
        contentId,
        tenantId,
        userId
      });

      return fullContent;
    } catch (error) {
      logger.error('Failed to update content', { error, contentId, tenantId });
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update content'
      });
    }
  }

  async getContentById(contentId: string, tenantId: string) {
    try {
      const content = await prisma.content.findFirst({
        where: { id: contentId, tenantId },
        include: {
          contentType: true,
          author: {
            select: { id: true, name: true, email: true, avatar: true }
          },
          lastEditor: {
            select: { id: true, name: true, email: true, avatar: true }
          },
          categories: {
            include: { category: true }
          },
          tags: {
            include: { tag: true }
          },
          media: true,
          comments: {
            where: { status: CommentStatus.APPROVED },
            include: {
              author: {
                select: { id: true, name: true, avatar: true }
              },
              replies: {
                include: {
                  author: {
                    select: { id: true, name: true, avatar: true }
                  }
                }
              }
            },
            orderBy: { createdAt: 'desc' }
          },
          translations: true,
          _count: {
            select: { 
              comments: { where: { status: CommentStatus.APPROVED } },
              revisions: true
            }
          }
        }
      });

      if (!content) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Content not found'
        });
      }

      return content;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      
      logger.error('Failed to get content', { error, contentId, tenantId });
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get content'
      });
    }
  }

  async searchContent(
    tenantId: string,
    query?: string,
    filters: SearchFilters = {},
    page: number = 1,
    limit: number = 20
  ) {
    try {
      const where: Prisma.ContentWhereInput = {
        tenantId,
        ...filters.contentTypeId && { contentTypeId: filters.contentTypeId },
        ...filters.status && { status: filters.status },
        ...filters.authorId && { authorId: filters.authorId },
        ...filters.dateFrom && filters.dateTo && {
          createdAt: {
            gte: filters.dateFrom,
            lte: filters.dateTo
          }
        },
        ...query && {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { excerpt: { contains: query, mode: 'insensitive' } },
            { metaKeywords: { contains: query, mode: 'insensitive' } }
          ]
        },
        ...filters.categoryIds?.length && {
          categories: {
            some: {
              categoryId: { in: filters.categoryIds }
            }
          }
        },
        ...filters.tagIds?.length && {
          tags: {
            some: {
              tagId: { in: filters.tagIds }
            }
          }
        }
      };

      const [contents, total] = await Promise.all([
        prisma.content.findMany({
          where,
          include: {
            contentType: true,
            author: {
              select: { id: true, name: true, avatar: true }
            },
            categories: {
              include: { category: true }
            },
            tags: {
              include: { tag: true }
            },
            _count: {
              select: { comments: { where: { status: CommentStatus.APPROVED } } }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit
        }),
        prisma.content.count({ where })
      ]);

      return {
        contents,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Failed to search content', { error, tenantId });
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to search content'
      });
    }
  }

  // Category Management
  async createCategory(
    tenantId: string,
    userId: string,
    data: {
      name: string;
      slug: string;
      description?: string;
      color?: string;
      icon?: string;
      parentId?: string;
      sortOrder?: number;
      contentTypeId: string;
    }
  ) {
    try {
      const category = await prisma.category.create({
        data: {
          ...data,
          tenantId
        },
        include: {
          parent: true,
          children: true,
          contentType: true,
          _count: {
            select: { contents: true }
          }
        }
      });

      logger.info('Category created', {
        categoryId: category.id,
        tenantId,
        userId,
        name: data.name
      });

      return category;
    } catch (error) {
      logger.error('Failed to create category', { error, tenantId, userId });
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create category'
      });
    }
  }

  // Comment Management
  async createComment(
    tenantId: string,
    contentId: string,
    userId: string | null,
    data: {
      content: string;
      parentId?: string;
      guestName?: string;
      guestEmail?: string;
    }
  ) {
    try {
      const comment = await prisma.comment.create({
        data: {
          content: data.content,
          parentId: data.parentId,
          contentId,
          authorId: userId,
          guestName: data.guestName,
          guestEmail: data.guestEmail,
          status: CommentStatus.PENDING // Require moderation
        },
        include: {
          author: {
            select: { id: true, name: true, avatar: true }
          }
        }
      });

      // Update comment count
      await prisma.content.update({
        where: { id: contentId },
        data: {
          commentCount: {
            increment: 1
          }
        }
      });

      logger.info('Comment created', {
        commentId: comment.id,
        contentId,
        tenantId,
        userId
      });

      return comment;
    } catch (error) {
      logger.error('Failed to create comment', { error, contentId, tenantId });
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create comment'
      });
    }
  }

  // Translation Management
  async createTranslation(
    contentId: string,
    tenantId: string,
    userId: string,
    data: {
      language: string;
      title: string;
      excerpt?: string;
      data: ContentData;
      metaTitle?: string;
      metaDescription?: string;
    }
  ) {
    try {
      const translation = await prisma.contentTranslation.create({
        data: {
          ...data,
          contentId,
          translatorId: userId,
          status: TranslationStatus.PENDING
        },
        include: {
          translator: {
            select: { id: true, name: true, email: true }
          }
        }
      });

      logger.info('Translation created', {
        translationId: translation.id,
        contentId,
        language: data.language,
        tenantId,
        userId
      });

      return translation;
    } catch (error) {
      logger.error('Failed to create translation', { error, contentId, tenantId });
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create translation'
      });
    }
  }

  // Private helper methods
  private validateContentTypeSchema(schema: Record<string, any>) {
    for (const [fieldName, fieldConfig] of Object.entries(schema)) {
      const fieldType = fieldConfig.type;
      
      if (!fieldSchemas[fieldType as keyof typeof fieldSchemas]) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Invalid field type: ${fieldType}`
        });
      }

      try {
        fieldSchemas[fieldType as keyof typeof fieldSchemas].parse(fieldConfig);
      } catch (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Invalid field configuration for ${fieldName}: ${error}`
        });
      }
    }
  }

  private async validateContentData(contentTypeId: string, data: ContentData) {
    const contentType = await prisma.contentType.findUnique({
      where: { id: contentTypeId }
    });

    if (!contentType) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Content type not found'
      });
    }

    const schema = contentType.schema as Record<string, any>;

    // Validate required fields
    for (const [fieldName, fieldConfig] of Object.entries(schema)) {
      if (fieldConfig.required && (data[fieldName] === undefined || data[fieldName] === null || data[fieldName] === '')) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Field "${fieldName}" is required`
        });
      }
    }

    // Additional validation based on field types could be added here
  }

  // Utility methods
  async incrementViewCount(contentId: string) {
    try {
      await prisma.content.update({
        where: { id: contentId },
        data: {
          viewCount: {
            increment: 1
          }
        }
      });
    } catch (error) {
      logger.error('Failed to increment view count', { error, contentId });
    }
  }

  async getContentStats(tenantId: string, contentTypeId?: string) {
    try {
      const where = {
        tenantId,
        ...contentTypeId && { contentTypeId }
      };

      const [total, published, draft, archived] = await Promise.all([
        prisma.content.count({ where }),
        prisma.content.count({ where: { ...where, status: ContentStatus.PUBLISHED } }),
        prisma.content.count({ where: { ...where, status: ContentStatus.DRAFT } }),
        prisma.content.count({ where: { ...where, status: ContentStatus.ARCHIVED } })
      ]);

      return {
        total,
        published,
        draft,
        archived
      };
    } catch (error) {
      logger.error('Failed to get content stats', { error, tenantId });
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get content stats'
      });
    }
  }
}

export const cmsService = new CMSService();