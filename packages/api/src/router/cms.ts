import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { requirePermission } from "../middleware/auth";

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
});