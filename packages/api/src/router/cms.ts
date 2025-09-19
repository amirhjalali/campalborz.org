import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { requirePermission } from "../middleware/auth";
import { cmsService } from "../services/cms";
import { ContentStatus, CommentStatus, TranslationStatus } from "@prisma/client";

const PageSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  content: z.record(z.any()),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  organizationId: z.string().optional(),
  templateId: z.string().optional(),
  settings: z.record(z.any()).optional(),
});

export const cmsRouter = router({
  // Pages management
  pages: router({
    // Create page
    create: protectedProcedure
      .input(PageSchema)
      .use(({ ctx, next }) => {
        requirePermission("content:create")(ctx);
        return next();
      })
      .mutation(async ({ input, ctx }) => {
        // Check if slug is unique for tenant
        const existingPage = await ctx.prisma.page.findFirst({
          where: {
            tenantId: ctx.user.tenantId,
            slug: input.slug,
          },
        });

        if (existingPage) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Page with this slug already exists",
          });
        }

        const page = await ctx.prisma.page.create({
          data: {
            ...input,
            tenantId: ctx.user.tenantId,
            createdBy: ctx.user.id,
            updatedBy: ctx.user.id,
            publishedAt: input.status === "PUBLISHED" ? new Date() : null,
          },
        });

        return page;
      }),

    // List pages
    list: protectedProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
        organizationId: z.string().optional(),
      }))
      .use(({ ctx, next }) => {
        requirePermission("content:view")(ctx);
        return next();
      })
      .query(async ({ input, ctx }) => {
        const where: any = {
          tenantId: ctx.user.tenantId,
        };

        if (input.status) where.status = input.status;
        if (input.organizationId) where.organizationId = input.organizationId;

        const [pages, total] = await Promise.all([
          ctx.prisma.page.findMany({
            where,
            skip: input.offset,
            take: input.limit,
            orderBy: { updatedAt: "desc" },
            include: {
              author: {
                select: { id: true, name: true, email: true },
              },
              organization: {
                select: { id: true, name: true },
              },
            },
          }),
          ctx.prisma.page.count({ where }),
        ]);

        return {
          pages,
          total,
          hasMore: input.offset + input.limit < total,
        };
      }),

    // Get page by ID
    get: protectedProcedure
      .input(z.object({ id: z.string() }))
      .use(({ ctx, next }) => {
        requirePermission("content:view")(ctx);
        return next();
      })
      .query(async ({ input, ctx }) => {
        const page = await ctx.prisma.page.findFirst({
          where: {
            id: input.id,
            tenantId: ctx.user.tenantId,
          },
          include: {
            author: {
              select: { id: true, name: true, email: true },
            },
            editor: {
              select: { id: true, name: true, email: true },
            },
            organization: {
              select: { id: true, name: true },
            },
            template: {
              select: { id: true, name: true },
            },
          },
        });

        if (!page) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Page not found",
          });
        }

        return page;
      }),

    // Update page
    update: protectedProcedure
      .input(z.object({
        id: z.string(),
        data: PageSchema.partial(),
      }))
      .use(({ ctx, next }) => {
        requirePermission("content:update")(ctx);
        return next();
      })
      .mutation(async ({ input, ctx }) => {
        const existingPage = await ctx.prisma.page.findFirst({
          where: {
            id: input.id,
            tenantId: ctx.user.tenantId,
          },
        });

        if (!existingPage) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Page not found",
          });
        }

        // Check slug uniqueness if slug is being updated
        if (input.data.slug && input.data.slug !== existingPage.slug) {
          const existingSlug = await ctx.prisma.page.findFirst({
            where: {
              tenantId: ctx.user.tenantId,
              slug: input.data.slug,
              id: { not: input.id },
            },
          });

          if (existingSlug) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Page with this slug already exists",
            });
          }
        }

        const page = await ctx.prisma.page.update({
          where: { id: input.id },
          data: {
            ...input.data,
            updatedBy: ctx.user.id,
            publishedAt: input.data.status === "PUBLISHED" && !existingPage.publishedAt
              ? new Date()
              : existingPage.publishedAt,
          },
        });

        return page;
      }),

    // Delete page
    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .use(({ ctx, next }) => {
        requirePermission("content:delete")(ctx);
        return next();
      })
      .mutation(async ({ input, ctx }) => {
        const page = await ctx.prisma.page.findFirst({
          where: {
            id: input.id,
            tenantId: ctx.user.tenantId,
          },
        });

        if (!page) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Page not found",
          });
        }

        await ctx.prisma.page.delete({
          where: { id: input.id },
        });

        return { success: true };
      }),

    // Publish page
    publish: protectedProcedure
      .input(z.object({ id: z.string() }))
      .use(({ ctx, next }) => {
        requirePermission("content:publish")(ctx);
        return next();
      })
      .mutation(async ({ input, ctx }) => {
        const page = await ctx.prisma.page.findFirst({
          where: {
            id: input.id,
            tenantId: ctx.user.tenantId,
          },
        });

        if (!page) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Page not found",
          });
        }

        const updatedPage = await ctx.prisma.page.update({
          where: { id: input.id },
          data: {
            status: "PUBLISHED",
            publishedAt: new Date(),
            updatedBy: ctx.user.id,
          },
        });

        return updatedPage;
      }),
  }),

  // Templates management
  templates: router({
    // List templates
    list: protectedProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        category: z.string().optional(),
        isPublic: z.boolean().optional(),
      }))
      .query(async ({ input, ctx }) => {
        const where: any = {
          OR: [
            { tenantId: ctx.user.tenantId },
            { isPublic: true },
          ],
        };

        if (input.category) where.category = input.category;
        if (input.isPublic !== undefined) where.isPublic = input.isPublic;

        const [templates, total] = await Promise.all([
          ctx.prisma.template.findMany({
            where,
            skip: input.offset,
            take: input.limit,
            orderBy: { createdAt: "desc" },
          }),
          ctx.prisma.template.count({ where }),
        ]);

        return {
          templates,
          total,
          hasMore: input.offset + input.limit < total,
        };
      }),

    // Get template
    get: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input, ctx }) => {
        const template = await ctx.prisma.template.findFirst({
          where: {
            id: input.id,
            OR: [
              { tenantId: ctx.user.tenantId },
              { isPublic: true },
            ],
          },
        });

        if (!template) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Template not found",
          });
        }

        return template;
      }),
  }),

  // Content blocks management
  contentBlocks: router({
    // List content blocks
    list: protectedProcedure
      .input(z.object({
        category: z.string().optional(),
        type: z.enum(["TEXT", "IMAGE", "VIDEO", "GALLERY", "FORM", "BUTTON", "HERO", "TESTIMONIAL", "FAQ", "PRICING", "TEAM", "CALENDAR", "MAP", "CUSTOM"]).optional(),
      }))
      .query(async ({ input, ctx }) => {
        const where: any = {
          OR: [
            { tenantId: ctx.user.tenantId },
            { isPublic: true },
          ],
        };

        if (input.category) where.category = input.category;
        if (input.type) where.type = input.type;

        const contentBlocks = await ctx.prisma.contentBlock.findMany({
          where,
          orderBy: { name: "asc" },
        });

        return contentBlocks;
      }),
  }),

  // Advanced CMS - Content Types
  contentTypes: router({
    // Create content type
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().optional(),
        displayName: z.string().min(1),
        pluralName: z.string().min(1),
        icon: z.string().optional(),
        schema: z.record(z.any()),
        permissions: z.record(z.any()),
        workflow: z.record(z.any()).optional(),
        isPublic: z.boolean().default(false),
        allowComments: z.boolean().default(false)
      }))
      .use(({ ctx, next }) => {
        requirePermission("content:admin")(ctx);
        return next();
      })
      .mutation(async ({ input, ctx }) => {
        return await cmsService.createContentType(
          ctx.user.tenantId,
          ctx.user.id,
          input
        );
      }),

    // List content types
    list: protectedProcedure
      .input(z.object({
        enabled: z.boolean().optional()
      }))
      .query(async ({ input, ctx }) => {
        const where: any = {
          tenantId: ctx.user.tenantId
        };

        if (input.enabled !== undefined) {
          where.isEnabled = input.enabled;
        }

        return await ctx.prisma.contentType.findMany({
          where,
          include: {
            creator: {
              select: { id: true, name: true, email: true }
            },
            _count: {
              select: { contents: true, categories: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        });
      }),

    // Get content type
    get: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input, ctx }) => {
        const contentType = await ctx.prisma.contentType.findFirst({
          where: {
            id: input.id,
            tenantId: ctx.user.tenantId
          },
          include: {
            creator: {
              select: { id: true, name: true, email: true }
            },
            categories: true,
            _count: {
              select: { contents: true }
            }
          }
        });

        if (!contentType) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Content type not found"
          });
        }

        return contentType;
      }),

    // Update content type
    update: protectedProcedure
      .input(z.object({
        id: z.string(),
        data: z.object({
          name: z.string().optional(),
          description: z.string().optional(),
          displayName: z.string().optional(),
          pluralName: z.string().optional(),
          icon: z.string().optional(),
          schema: z.record(z.any()).optional(),
          permissions: z.record(z.any()).optional(),
          workflow: z.record(z.any()).optional(),
          isEnabled: z.boolean().optional(),
          isPublic: z.boolean().optional(),
          allowComments: z.boolean().optional()
        })
      }))
      .use(({ ctx, next }) => {
        requirePermission("content:admin")(ctx);
        return next();
      })
      .mutation(async ({ input, ctx }) => {
        return await cmsService.updateContentType(
          input.id,
          ctx.user.tenantId,
          ctx.user.id,
          input.data
        );
      })
  }),

  // Advanced CMS - Content
  content: router({
    // Create content
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        slug: z.string().min(1),
        excerpt: z.string().optional(),
        contentTypeId: z.string(),
        data: z.record(z.any()),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        metaKeywords: z.string().optional(),
        status: z.nativeEnum(ContentStatus).default(ContentStatus.DRAFT),
        publishedAt: z.date().optional(),
        scheduledAt: z.date().optional(),
        featuredImage: z.string().optional(),
        socialImage: z.string().optional(),
        canonicalUrl: z.string().optional(),
        categoryIds: z.array(z.string()).optional(),
        tagIds: z.array(z.string()).optional()
      }))
      .use(({ ctx, next }) => {
        requirePermission("content:create")(ctx);
        return next();
      })
      .mutation(async ({ input, ctx }) => {
        return await cmsService.createContent(
          ctx.user.tenantId,
          ctx.user.id,
          input
        );
      }),

    // List content
    list: protectedProcedure
      .input(z.object({
        contentTypeId: z.string().optional(),
        status: z.nativeEnum(ContentStatus).optional(),
        authorId: z.string().optional(),
        categoryIds: z.array(z.string()).optional(),
        tagIds: z.array(z.string()).optional(),
        query: z.string().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        dateFrom: z.date().optional(),
        dateTo: z.date().optional()
      }))
      .query(async ({ input, ctx }) => {
        return await cmsService.searchContent(
          ctx.user.tenantId,
          input.query,
          {
            contentTypeId: input.contentTypeId,
            status: input.status,
            authorId: input.authorId,
            categoryIds: input.categoryIds,
            tagIds: input.tagIds,
            dateFrom: input.dateFrom,
            dateTo: input.dateTo
          },
          input.page,
          input.limit
        );
      }),

    // Get content
    get: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input, ctx }) => {
        const content = await cmsService.getContentById(input.id, ctx.user.tenantId);
        
        // Increment view count
        await cmsService.incrementViewCount(input.id);
        
        return content;
      }),

    // Update content
    update: protectedProcedure
      .input(z.object({
        id: z.string(),
        data: z.object({
          title: z.string().optional(),
          slug: z.string().optional(),
          excerpt: z.string().optional(),
          data: z.record(z.any()).optional(),
          metaTitle: z.string().optional(),
          metaDescription: z.string().optional(),
          metaKeywords: z.string().optional(),
          status: z.nativeEnum(ContentStatus).optional(),
          publishedAt: z.date().optional(),
          scheduledAt: z.date().optional(),
          featuredImage: z.string().optional(),
          socialImage: z.string().optional(),
          canonicalUrl: z.string().optional(),
          categoryIds: z.array(z.string()).optional(),
          tagIds: z.array(z.string()).optional()
        }),
        createRevision: z.boolean().default(true)
      }))
      .use(({ ctx, next }) => {
        requirePermission("content:update")(ctx);
        return next();
      })
      .mutation(async ({ input, ctx }) => {
        return await cmsService.updateContent(
          input.id,
          ctx.user.tenantId,
          ctx.user.id,
          input.data,
          input.createRevision
        );
      }),

    // Get content revisions
    revisions: protectedProcedure
      .input(z.object({
        contentId: z.string(),
        limit: z.number().min(1).max(50).default(20)
      }))
      .query(async ({ input, ctx }) => {
        return await ctx.prisma.contentRevision.findMany({
          where: {
            contentId: input.contentId,
            content: {
              tenantId: ctx.user.tenantId
            }
          },
          include: {
            author: {
              select: { id: true, name: true, email: true, avatar: true }
            }
          },
          orderBy: { version: 'desc' },
          take: input.limit
        });
      }),

    // Get content stats
    stats: protectedProcedure
      .input(z.object({
        contentTypeId: z.string().optional()
      }))
      .query(async ({ input, ctx }) => {
        return await cmsService.getContentStats(
          ctx.user.tenantId,
          input.contentTypeId
        );
      })
  }),

  // Categories
  categories: router({
    // Create category
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().optional(),
        color: z.string().optional(),
        icon: z.string().optional(),
        parentId: z.string().optional(),
        sortOrder: z.number().default(0),
        contentTypeId: z.string()
      }))
      .use(({ ctx, next }) => {
        requirePermission("content:create")(ctx);
        return next();
      })
      .mutation(async ({ input, ctx }) => {
        return await cmsService.createCategory(
          ctx.user.tenantId,
          ctx.user.id,
          input
        );
      }),

    // List categories
    list: protectedProcedure
      .input(z.object({
        contentTypeId: z.string().optional(),
        parentId: z.string().optional()
      }))
      .query(async ({ input, ctx }) => {
        const where: any = {
          tenantId: ctx.user.tenantId
        };

        if (input.contentTypeId) {
          where.contentTypeId = input.contentTypeId;
        }

        if (input.parentId !== undefined) {
          where.parentId = input.parentId;
        }

        return await ctx.prisma.category.findMany({
          where,
          include: {
            parent: true,
            children: true,
            contentType: {
              select: { id: true, name: true, displayName: true }
            },
            _count: {
              select: { contents: true }
            }
          },
          orderBy: [
            { sortOrder: 'asc' },
            { name: 'asc' }
          ]
        });
      })
  }),

  // Tags
  tags: router({
    // Create tag
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
        color: z.string().optional()
      }))
      .use(({ ctx, next }) => {
        requirePermission("content:create")(ctx);
        return next();
      })
      .mutation(async ({ input, ctx }) => {
        return await ctx.prisma.tag.create({
          data: {
            ...input,
            tenantId: ctx.user.tenantId
          }
        });
      }),

    // List tags
    list: protectedProcedure
      .input(z.object({
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(50)
      }))
      .query(async ({ input, ctx }) => {
        const where: any = {
          tenantId: ctx.user.tenantId
        };

        if (input.search) {
          where.name = {
            contains: input.search,
            mode: 'insensitive'
          };
        }

        return await ctx.prisma.tag.findMany({
          where,
          include: {
            _count: {
              select: { contents: true }
            }
          },
          orderBy: { name: 'asc' },
          take: input.limit
        });
      })
  }),

  // Comments
  comments: router({
    // Create comment
    create: protectedProcedure
      .input(z.object({
        contentId: z.string(),
        content: z.string().min(1),
        parentId: z.string().optional(),
        guestName: z.string().optional(),
        guestEmail: z.string().email().optional()
      }))
      .mutation(async ({ input, ctx }) => {
        return await cmsService.createComment(
          ctx.user.tenantId,
          input.contentId,
          ctx.user.id,
          {
            content: input.content,
            parentId: input.parentId,
            guestName: input.guestName,
            guestEmail: input.guestEmail
          }
        );
      }),

    // List comments for content
    list: protectedProcedure
      .input(z.object({
        contentId: z.string(),
        status: z.nativeEnum(CommentStatus).optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20)
      }))
      .query(async ({ input, ctx }) => {
        const where: any = {
          contentId: input.contentId,
          contentItem: {
            tenantId: ctx.user.tenantId
          }
        };

        if (input.status) {
          where.status = input.status;
        }

        const [comments, total] = await Promise.all([
          ctx.prisma.comment.findMany({
            where,
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
            orderBy: { createdAt: 'desc' },
            skip: (input.page - 1) * input.limit,
            take: input.limit
          }),
          ctx.prisma.comment.count({ where })
        ]);

        return {
          comments,
          pagination: {
            page: input.page,
            limit: input.limit,
            total,
            pages: Math.ceil(total / input.limit)
          }
        };
      }),

    // Moderate comment
    moderate: protectedProcedure
      .input(z.object({
        id: z.string(),
        status: z.nativeEnum(CommentStatus)
      }))
      .use(({ ctx, next }) => {
        requirePermission("content:moderate")(ctx);
        return next();
      })
      .mutation(async ({ input, ctx }) => {
        return await ctx.prisma.comment.update({
          where: { id: input.id },
          data: {
            status: input.status,
            moderatedBy: ctx.user.id,
            moderatedAt: new Date()
          },
          include: {
            author: {
              select: { id: true, name: true, avatar: true }
            }
          }
        });
      })
  }),

  // Translations
  translations: router({
    // Create translation
    create: protectedProcedure
      .input(z.object({
        contentId: z.string(),
        language: z.string().min(2).max(5),
        title: z.string().min(1),
        excerpt: z.string().optional(),
        data: z.record(z.any()),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional()
      }))
      .use(({ ctx, next }) => {
        requirePermission("content:translate")(ctx);
        return next();
      })
      .mutation(async ({ input, ctx }) => {
        return await cmsService.createTranslation(
          input.contentId,
          ctx.user.tenantId,
          ctx.user.id,
          input
        );
      }),

    // List translations for content
    list: protectedProcedure
      .input(z.object({
        contentId: z.string()
      }))
      .query(async ({ input, ctx }) => {
        return await ctx.prisma.contentTranslation.findMany({
          where: {
            contentId: input.contentId,
            content: {
              tenantId: ctx.user.tenantId
            }
          },
          include: {
            translator: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        });
      }),

    // Update translation status
    updateStatus: protectedProcedure
      .input(z.object({
        id: z.string(),
        status: z.nativeEnum(TranslationStatus)
      }))
      .use(({ ctx, next }) => {
        requirePermission("content:translate")(ctx);
        return next();
      })
      .mutation(async ({ input, ctx }) => {
        return await ctx.prisma.contentTranslation.update({
          where: { id: input.id },
          data: { status: input.status },
          include: {
            translator: {
              select: { id: true, name: true, email: true }
            }
          }
        });
      })
  })
});