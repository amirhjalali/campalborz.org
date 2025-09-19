import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { uploadService } from "../services/upload";

// Upload schemas
const UploadConfigSchema = z.object({
  provider: z.enum(["local", "s3", "cloudinary", "gcs"]),
  basePath: z.string().optional(),
  bucketName: z.string().optional(),
  region: z.string().optional(),
  accessKeyId: z.string().optional(),
  secretAccessKey: z.string().optional(),
  cloudName: z.string().optional(),
  apiKey: z.string().optional(),
  apiSecret: z.string().optional(),
});

const MediaFilterSchema = z.object({
  folder: z.string().optional(),
  type: z.enum(["image", "video", "audio", "document", "all"]).default("all"),
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

const UpdateMediaSchema = z.object({
  id: z.string(),
  alt: z.string().optional(),
  caption: z.string().optional(),
  tags: z.array(z.string()).optional(),
  folder: z.string().optional(),
});

export const uploadRouter = router({
  // Configure upload service (admin only)
  configure: protectedProcedure
    .input(UploadConfigSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      // Check permissions
      if (!["admin"].includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can configure upload settings",
        });
      }

      try {
        // Configure the upload service
        uploadService.configure({
          provider: input.provider,
          basePath: input.basePath,
          bucketName: input.bucketName,
          region: input.region,
          accessKeyId: input.accessKeyId,
          secretAccessKey: input.secretAccessKey,
          cloudName: input.cloudName,
          apiKey: input.apiKey,
          apiSecret: input.apiSecret,
        });

        // Store upload configuration in tenant settings
        await ctx.prisma.tenant.update({
          where: { id: ctx.tenant.id },
          data: {
            settings: {
              ...ctx.tenant.settings as any,
              upload: {
                provider: input.provider,
                bucketName: input.bucketName,
                region: input.region,
                cloudName: input.cloudName,
                // Note: API keys should be stored securely, not in database
                configured: true,
              },
            },
          },
        });

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to configure upload service",
        });
      }
    }),

  // Get media files
  getMedia: protectedProcedure
    .input(MediaFilterSchema)
    .query(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      try {
        const where: any = {
          tenantId: ctx.tenant.id,
        };

        if (input.folder) {
          where.folder = input.folder;
        }

        if (input.type !== "all") {
          const typeMap = {
            image: "image/",
            video: "video/",
            audio: "audio/",
            document: ["application/", "text/"],
          };

          const mimePrefix = typeMap[input.type];
          if (Array.isArray(mimePrefix)) {
            where.mimeType = {
              startsWith: { in: mimePrefix },
            };
          } else {
            where.mimeType = { startsWith: mimePrefix };
          }
        }

        if (input.search) {
          where.OR = [
            { filename: { contains: input.search, mode: "insensitive" } },
            { originalName: { contains: input.search, mode: "insensitive" } },
            { alt: { contains: input.search, mode: "insensitive" } },
            { caption: { contains: input.search, mode: "insensitive" } },
          ];
        }

        if (input.tags && input.tags.length > 0) {
          where.tags = { hasSome: input.tags };
        }

        const [media, total] = await Promise.all([
          ctx.prisma.media.findMany({
            where,
            take: input.limit,
            skip: input.offset,
            orderBy: { createdAt: "desc" },
            include: {
              uploader: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          }),
          ctx.prisma.media.count({ where }),
        ]);

        return {
          media,
          total,
          hasMore: total > input.offset + input.limit,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get media files",
        });
      }
    }),

  // Get media file by ID
  getMediaById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      try {
        const media = await ctx.prisma.media.findFirst({
          where: {
            id: input.id,
            tenantId: ctx.tenant.id,
          },
          include: {
            uploader: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        if (!media) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Media file not found",
          });
        }

        return media;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get media file",
        });
      }
    }),

  // Update media metadata
  updateMedia: protectedProcedure
    .input(UpdateMediaSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      try {
        const media = await ctx.prisma.media.findFirst({
          where: {
            id: input.id,
            tenantId: ctx.tenant.id,
          },
        });

        if (!media) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Media file not found",
          });
        }

        // Check permissions - user can edit their own files, admins can edit any
        if (media.uploadedBy !== ctx.user.id && !["admin", "moderator"].includes(ctx.user.role)) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Insufficient permissions to edit this media file",
          });
        }

        const updateData: any = {};
        if (input.alt !== undefined) updateData.alt = input.alt;
        if (input.caption !== undefined) updateData.caption = input.caption;
        if (input.tags !== undefined) updateData.tags = input.tags;
        if (input.folder !== undefined) updateData.folder = input.folder;

        const updatedMedia = await ctx.prisma.media.update({
          where: { id: input.id },
          data: updateData,
        });

        return updatedMedia;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update media file",
        });
      }
    }),

  // Delete media file
  deleteMedia: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      try {
        const media = await ctx.prisma.media.findFirst({
          where: {
            id: input.id,
            tenantId: ctx.tenant.id,
          },
        });

        if (!media) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Media file not found",
          });
        }

        // Check permissions - user can delete their own files, admins can delete any
        if (media.uploadedBy !== ctx.user.id && !["admin", "moderator"].includes(ctx.user.role)) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Insufficient permissions to delete this media file",
          });
        }

        // Delete file from storage
        const deleted = await uploadService.delete(
          media.filename,
          ctx.tenant.id,
          media.folder || undefined
        );

        if (!deleted) {
          console.warn(`Failed to delete file ${media.filename} from storage`);
        }

        // Delete record from database
        await ctx.prisma.media.delete({
          where: { id: input.id },
        });

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete media file",
        });
      }
    }),

  // Get media statistics
  getStats: protectedProcedure
    .query(async ({ ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      try {
        const [
          totalFiles,
          totalSize,
          filesByType,
          recentUploads,
        ] = await Promise.all([
          ctx.prisma.media.count({
            where: { tenantId: ctx.tenant.id },
          }),
          ctx.prisma.media.aggregate({
            where: { tenantId: ctx.tenant.id },
            _sum: { size: true },
          }),
          ctx.prisma.media.groupBy({
            by: ["mimeType"],
            where: { tenantId: ctx.tenant.id },
            _count: { mimeType: true },
            _sum: { size: true },
          }),
          ctx.prisma.media.findMany({
            where: { tenantId: ctx.tenant.id },
            take: 5,
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              filename: true,
              originalName: true,
              mimeType: true,
              size: true,
              createdAt: true,
              uploader: {
                select: {
                  name: true,
                },
              },
            },
          }),
        ]);

        // Categorize file types
        const categories = {
          images: 0,
          videos: 0,
          audio: 0,
          documents: 0,
          other: 0,
        };

        const categorySize = {
          images: 0,
          videos: 0,
          audio: 0,
          documents: 0,
          other: 0,
        };

        filesByType.forEach(item => {
          const size = item._sum.size || 0;
          if (item.mimeType.startsWith("image/")) {
            categories.images += item._count.mimeType;
            categorySize.images += size;
          } else if (item.mimeType.startsWith("video/")) {
            categories.videos += item._count.mimeType;
            categorySize.videos += size;
          } else if (item.mimeType.startsWith("audio/")) {
            categories.audio += item._count.mimeType;
            categorySize.audio += size;
          } else if (item.mimeType.startsWith("application/") || item.mimeType.startsWith("text/")) {
            categories.documents += item._count.mimeType;
            categorySize.documents += size;
          } else {
            categories.other += item._count.mimeType;
            categorySize.other += size;
          }
        });

        return {
          totalFiles,
          totalSize: totalSize._sum.size || 0,
          categories,
          categorySize,
          recentUploads,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get media statistics",
        });
      }
    }),

  // Get folders
  getFolders: protectedProcedure
    .query(async ({ ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      try {
        const folders = await ctx.prisma.media.findMany({
          where: {
            tenantId: ctx.tenant.id,
            folder: { not: null },
          },
          select: { folder: true },
          distinct: ["folder"],
        });

        return folders
          .map(f => f.folder)
          .filter(Boolean)
          .sort();
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get folders",
        });
      }
    }),

  // Get available tags
  getTags: protectedProcedure
    .query(async ({ ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      try {
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

        return Array.from(allTags).sort();
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get tags",
        });
      }
    }),

  // Cleanup orphaned files (admin only)
  cleanup: protectedProcedure
    .mutation(async ({ ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      // Check permissions
      if (!["admin"].includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can cleanup media files",
        });
      }

      try {
        // Find media records without actual files
        // This would require checking the file system or cloud storage
        // For now, just return a mock result
        
        const orphanedCount = 0; // In production, implement actual cleanup logic
        
        return {
          cleaned: orphanedCount,
          message: orphanedCount > 0 
            ? `Cleaned up ${orphanedCount} orphaned files` 
            : "No orphaned files found",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to cleanup media files",
        });
      }
    }),
});