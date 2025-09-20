import { router, protectedProcedure, publicProcedure, adminProcedure } from '../lib/trpc';
import { documentationService } from '../services/documentation';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

const documentationSectionSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  category: z.string().min(1),
  tags: z.array(z.string()).default([]),
  level: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  order: z.number().default(0),
  isPublished: z.boolean().default(false)
});

export const documentationRouter = router({
  // Public documentation access
  getPublicSections: publicProcedure
    .input(z.object({
      category: z.string().optional(),
      tags: z.array(z.string()).optional(),
      level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
      search: z.string().optional()
    }))
    .query(async ({ ctx, input }) => {
      return documentationService.getDocumentationSections(ctx.tenant.id, {
        ...input,
        published: true
      });
    }),

  // Get single documentation section
  getSection: publicProcedure
    .input(z.object({
      sectionId: z.string()
    }))
    .query(async ({ ctx, input }) => {
      const section = await prisma.content.findFirst({
        where: {
          id: input.sectionId,
          tenantId: ctx.tenant.id,
          contentTypeId: 'documentation',
          status: 'PUBLISHED'
        },
        include: {
          author: {
            select: { id: true, name: true, email: true }
          }
        }
      });

      if (!section) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Documentation section not found'
        });
      }

      return {
        id: section.id,
        title: section.title,
        content: (section.content as any).body,
        category: (section.content as any).category,
        tags: (section.content as any).tags || [],
        level: (section.content as any).level,
        lastUpdated: section.updatedAt,
        author: section.author
      };
    }),

  // Admin: Create documentation section
  createSection: adminProcedure
    .input(documentationSectionSchema)
    .mutation(async ({ ctx, input }) => {
      return documentationService.createDocumentationSection(
        ctx.tenant.id,
        ctx.user.id,
        input
      );
    }),

  // Admin: Update documentation section
  updateSection: adminProcedure
    .input(z.object({
      sectionId: z.string(),
      updates: documentationSectionSchema.partial()
    }))
    .mutation(async ({ ctx, input }) => {
      const section = await prisma.content.findFirst({
        where: {
          id: input.sectionId,
          tenantId: ctx.tenant.id,
          contentTypeId: 'documentation'
        }
      });

      if (!section) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Documentation section not found'
        });
      }

      const currentContent = section.content as any;

      return prisma.content.update({
        where: { id: input.sectionId },
        data: {
          title: input.updates.title || section.title,
          content: {
            ...currentContent,
            ...(input.updates.content && { body: input.updates.content }),
            ...(input.updates.category && { category: input.updates.category }),
            ...(input.updates.tags && { tags: input.updates.tags }),
            ...(input.updates.level && { level: input.updates.level }),
            ...(input.updates.order !== undefined && { order: input.updates.order })
          },
          status: input.updates.isPublished !== undefined
            ? (input.updates.isPublished ? 'PUBLISHED' : 'DRAFT')
            : section.status,
          updatedBy: ctx.user.id
        }
      });
    }),

  // Admin: Delete documentation section
  deleteSection: adminProcedure
    .input(z.object({
      sectionId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const section = await prisma.content.findFirst({
        where: {
          id: input.sectionId,
          tenantId: ctx.tenant.id,
          contentTypeId: 'documentation'
        }
      });

      if (!section) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Documentation section not found'
        });
      }

      await prisma.content.delete({
        where: { id: input.sectionId }
      });

      return { success: true };
    }),

  // Admin: Get all sections (including drafts)
  getAllSections: adminProcedure
    .input(z.object({
      category: z.string().optional(),
      tags: z.array(z.string()).optional(),
      level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
      search: z.string().optional(),
      published: z.boolean().optional()
    }))
    .query(async ({ ctx, input }) => {
      return documentationService.getDocumentationSections(ctx.tenant.id, input);
    }),

  // Search documentation
  search: publicProcedure
    .input(z.object({
      query: z.string().min(1),
      category: z.string().optional(),
      type: z.enum(['user-guide', 'api', 'admin', 'all']).default('all')
    }))
    .query(async ({ ctx, input }) => {
      return documentationService.searchDocumentation(
        ctx.tenant.id,
        input.query,
        {
          category: input.category,
          type: input.type
        }
      );
    }),

  // Get documentation categories
  getCategories: publicProcedure
    .query(async ({ ctx }) => {
      const sections = await prisma.content.findMany({
        where: {
          tenantId: ctx.tenant.id,
          contentTypeId: 'documentation',
          status: 'PUBLISHED'
        },
        select: {
          content: true
        }
      });

      const categories = [...new Set(
        sections.map(s => (s.content as any)?.category).filter(Boolean)
      )];

      const categoryCounts = await Promise.all(
        categories.map(async (category) => {
          const count = await prisma.content.count({
            where: {
              tenantId: ctx.tenant.id,
              contentTypeId: 'documentation',
              status: 'PUBLISHED',
              content: {
                path: ['category'],
                equals: category
              }
            }
          });

          return { category, count };
        })
      );

      return categoryCounts.sort((a, b) => a.category.localeCompare(b.category));
    }),

  // Get documentation tags
  getTags: publicProcedure
    .query(async ({ ctx }) => {
      const sections = await prisma.content.findMany({
        where: {
          tenantId: ctx.tenant.id,
          contentTypeId: 'documentation',
          status: 'PUBLISHED'
        },
        select: {
          content: true
        }
      });

      const allTags = sections.flatMap(s => (s.content as any)?.tags || []);
      const uniqueTags = [...new Set(allTags)];

      return uniqueTags.sort();
    }),

  // Generate API documentation
  generateAPIDocumentation: adminProcedure
    .mutation(async () => {
      return documentationService.generateAPIDocumentation();
    }),

  // Initialize documentation
  initializeDocumentation: adminProcedure
    .mutation(async () => {
      return documentationService.initializeDocumentation();
    }),

  // Get documentation analytics
  getAnalytics: adminProcedure
    .query(async ({ ctx }) => {
      return documentationService.getDocumentationAnalytics(ctx.tenant.id);
    }),

  // Export documentation
  exportDocumentation: adminProcedure
    .input(z.object({
      format: z.enum(['markdown', 'pdf', 'html']).default('markdown'),
      category: z.string().optional(),
      includeUnpublished: z.boolean().default(false)
    }))
    .mutation(async ({ ctx, input }) => {
      return documentationService.exportDocumentation(
        ctx.tenant.id,
        input.format
      );
    }),

  // Bulk operations
  bulkUpdateSections: adminProcedure
    .input(z.object({
      sectionIds: z.array(z.string()),
      updates: z.object({
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
        level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
        isPublished: z.boolean().optional()
      })
    }))
    .mutation(async ({ ctx, input }) => {
      const updateData: any = {};

      if (input.updates.isPublished !== undefined) {
        updateData.status = input.updates.isPublished ? 'PUBLISHED' : 'DRAFT';
      }

      if (Object.keys(input.updates).some(key => ['category', 'tags', 'level'].includes(key))) {
        // We need to update the content JSON field
        const sectionsToUpdate = await prisma.content.findMany({
          where: {
            id: { in: input.sectionIds },
            tenantId: ctx.tenant.id,
            contentTypeId: 'documentation'
          }
        });

        const updates = sectionsToUpdate.map(section => {
          const currentContent = section.content as any;
          const newContent = {
            ...currentContent,
            ...(input.updates.category && { category: input.updates.category }),
            ...(input.updates.tags && { tags: input.updates.tags }),
            ...(input.updates.level && { level: input.updates.level })
          };

          return prisma.content.update({
            where: { id: section.id },
            data: {
              content: newContent,
              ...updateData,
              updatedBy: ctx.user.id
            }
          });
        });

        await Promise.all(updates);
        return { updated: updates.length };
      }

      if (Object.keys(updateData).length > 0) {
        const result = await prisma.content.updateMany({
          where: {
            id: { in: input.sectionIds },
            tenantId: ctx.tenant.id,
            contentTypeId: 'documentation'
          },
          data: {
            ...updateData,
            updatedBy: ctx.user.id
          }
        });

        return { updated: result.count };
      }

      return { updated: 0 };
    }),

  // Documentation versioning
  createVersion: adminProcedure
    .input(z.object({
      sectionId: z.string(),
      versionName: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const section = await prisma.content.findFirst({
        where: {
          id: input.sectionId,
          tenantId: ctx.tenant.id,
          contentTypeId: 'documentation'
        }
      });

      if (!section) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Documentation section not found'
        });
      }

      // Create a revision
      const revision = await prisma.contentRevision.create({
        data: {
          contentId: section.id,
          title: section.title,
          data: section.content,
          version: input.versionName,
          authorId: ctx.user.id
        }
      });

      return revision;
    }),

  getVersions: adminProcedure
    .input(z.object({
      sectionId: z.string()
    }))
    .query(async ({ ctx, input }) => {
      const section = await prisma.content.findFirst({
        where: {
          id: input.sectionId,
          tenantId: ctx.tenant.id,
          contentTypeId: 'documentation'
        }
      });

      if (!section) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Documentation section not found'
        });
      }

      return prisma.contentRevision.findMany({
        where: { contentId: input.sectionId },
        include: {
          author: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    }),

  restoreVersion: adminProcedure
    .input(z.object({
      sectionId: z.string(),
      revisionId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const [section, revision] = await Promise.all([
        prisma.content.findFirst({
          where: {
            id: input.sectionId,
            tenantId: ctx.tenant.id,
            contentTypeId: 'documentation'
          }
        }),
        prisma.contentRevision.findFirst({
          where: {
            id: input.revisionId,
            contentId: input.sectionId
          }
        })
      ]);

      if (!section || !revision) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Section or revision not found'
        });
      }

      // Create a backup of current version
      await prisma.contentRevision.create({
        data: {
          contentId: section.id,
          title: section.title,
          data: section.content,
          version: `backup-${new Date().toISOString()}`,
          authorId: ctx.user.id
        }
      });

      // Restore the revision
      const restored = await prisma.content.update({
        where: { id: input.sectionId },
        data: {
          title: revision.title,
          content: revision.data,
          updatedBy: ctx.user.id
        }
      });

      return restored;
    })
});