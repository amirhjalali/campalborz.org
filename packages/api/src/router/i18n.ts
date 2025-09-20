import { router, protectedProcedure, publicProcedure, adminProcedure } from '../lib/trpc';
import { i18nService } from '../services/i18n';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

const languageSchema = z.object({
  code: z.string().min(2).max(5), // ISO 639-1 codes
  name: z.string().min(1),
  nativeName: z.string().min(1),
  direction: z.enum(['ltr', 'rtl']).default('ltr'),
  isActive: z.boolean().default(true)
});

const translationKeySchema = z.object({
  namespace: z.string().min(1),
  key: z.string().min(1),
  description: z.string().optional(),
  isPlural: z.boolean().default(false),
  metadata: z.record(z.any()).optional()
});

const translationSchema = z.object({
  value: z.string().min(1),
  pluralValues: z.record(z.string()).optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'REVIEW', 'COMPLETED']).default('PENDING')
});

const contentTranslationSchema = z.object({
  contentType: z.string().min(1),
  contentId: z.string().min(1),
  fieldName: z.string().min(1),
  originalValue: z.string(),
  translatedValue: z.string().min(1),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'REVIEW', 'COMPLETED']).default('PENDING')
});

export const i18nRouter = router({
  // Public translation dictionary access
  getDictionary: publicProcedure
    .input(z.object({
      languageCode: z.string().min(2).max(5),
      namespace: z.string().optional()
    }))
    .query(async ({ ctx, input }) => {
      return i18nService.getTranslationDictionary(
        ctx.tenant.id,
        input.languageCode,
        input.namespace
      );
    }),

  // Get available languages for tenant
  getLanguages: publicProcedure
    .query(async ({ ctx }) => {
      return i18nService.getTenantLanguages(ctx.tenant.id);
    }),

  // Get all system languages (admin only)
  getAllLanguages: adminProcedure
    .query(async () => {
      return i18nService.getLanguages();
    }),

  // Create new language (admin only)
  createLanguage: adminProcedure
    .input(languageSchema)
    .mutation(async ({ input }) => {
      return i18nService.createLanguage(input);
    }),

  // Add language to tenant
  addLanguageToTenant: adminProcedure
    .input(z.object({
      languageId: z.string(),
      isDefault: z.boolean().default(false)
    }))
    .mutation(async ({ ctx, input }) => {
      return i18nService.addLanguageToTenant(
        ctx.tenant.id,
        input.languageId,
        input.isDefault
      );
    }),

  // Remove language from tenant
  removeLanguageFromTenant: adminProcedure
    .input(z.object({
      languageId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const tenantLanguage = await prisma.tenantLanguage.findFirst({
        where: {
          tenantId: ctx.tenant.id,
          languageId: input.languageId
        }
      });

      if (!tenantLanguage) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Language not enabled for this tenant'
        });
      }

      if (tenantLanguage.isDefault) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot remove default language'
        });
      }

      await prisma.tenantLanguage.update({
        where: { id: tenantLanguage.id },
        data: { isActive: false }
      });

      // Update tenant's supported languages
      const remainingLanguages = await prisma.tenantLanguage.findMany({
        where: { tenantId: ctx.tenant.id, isActive: true },
        include: { language: true }
      });

      await prisma.tenant.update({
        where: { id: ctx.tenant.id },
        data: {
          supportedLanguages: remainingLanguages.map(tl => tl.language.code)
        }
      });

      return { success: true };
    }),

  // Translation Key Management
  createTranslationKey: adminProcedure
    .input(translationKeySchema)
    .mutation(async ({ ctx, input }) => {
      return i18nService.createTranslationKey(ctx.tenant.id, input);
    }),

  getTranslationKeys: protectedProcedure
    .input(z.object({
      namespace: z.string().optional(),
      key: z.string().optional(),
      search: z.string().optional(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20)
    }))
    .query(async ({ ctx, input }) => {
      return i18nService.getTranslationKeys(ctx.tenant.id, input);
    }),

  updateTranslationKey: adminProcedure
    .input(z.object({
      keyId: z.string(),
      updates: translationKeySchema.partial()
    }))
    .mutation(async ({ ctx, input }) => {
      const translationKey = await prisma.translationKey.findFirst({
        where: {
          id: input.keyId,
          tenantId: ctx.tenant.id
        }
      });

      if (!translationKey) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Translation key not found'
        });
      }

      return prisma.translationKey.update({
        where: { id: input.keyId },
        data: input.updates
      });
    }),

  deleteTranslationKey: adminProcedure
    .input(z.object({
      keyId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const translationKey = await prisma.translationKey.findFirst({
        where: {
          id: input.keyId,
          tenantId: ctx.tenant.id
        }
      });

      if (!translationKey) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Translation key not found'
        });
      }

      // Delete all translations for this key first
      await prisma.translation.deleteMany({
        where: { translationKeyId: input.keyId }
      });

      // Delete the key
      await prisma.translationKey.delete({
        where: { id: input.keyId }
      });

      return { success: true };
    }),

  // Translation Management
  createTranslation: protectedProcedure
    .input(z.object({
      translationKeyId: z.string(),
      languageId: z.string(),
      translation: translationSchema
    }))
    .mutation(async ({ ctx, input }) => {
      return i18nService.createTranslation(
        input.translationKeyId,
        input.languageId,
        ctx.user.id,
        input.translation
      );
    }),

  updateTranslation: protectedProcedure
    .input(z.object({
      translationId: z.string(),
      updates: translationSchema.partial()
    }))
    .mutation(async ({ ctx, input }) => {
      const translation = await prisma.translation.findFirst({
        where: { id: input.translationId },
        include: {
          translationKey: true
        }
      });

      if (!translation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Translation not found'
        });
      }

      // Check if user has permission to edit this translation
      if (translation.translationKey.tenantId !== ctx.tenant.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'No permission to edit this translation'
        });
      }

      return prisma.translation.update({
        where: { id: input.translationId },
        data: {
          ...input.updates,
          translatedBy: ctx.user.id,
          translatedAt: new Date(),
          version: translation.version + 1
        }
      });
    }),

  reviewTranslation: adminProcedure
    .input(z.object({
      translationId: z.string(),
      status: z.enum(['REVIEW', 'COMPLETED']),
      feedback: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      return i18nService.reviewTranslation(
        input.translationId,
        ctx.user.id,
        input.status,
        input.feedback
      );
    }),

  getTranslations: protectedProcedure
    .input(z.object({
      languageCode: z.string().optional(),
      namespace: z.string().optional(),
      status: z.array(z.enum(['PENDING', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'])).optional(),
      search: z.string().optional(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20)
    }))
    .query(async ({ ctx, input }) => {
      const where: any = {
        translationKey: {
          tenantId: { in: [ctx.tenant.id, null] },
          ...(input.namespace && { namespace: input.namespace })
        },
        ...(input.status?.length && { status: { in: input.status } })
      };

      if (input.languageCode) {
        const language = await prisma.language.findUnique({
          where: { code: input.languageCode }
        });
        if (language) {
          where.languageId = language.id;
        }
      }

      if (input.search) {
        where.OR = [
          { value: { contains: input.search, mode: 'insensitive' } },
          { translationKey: { key: { contains: input.search, mode: 'insensitive' } } }
        ];
      }

      const [translations, total] = await Promise.all([
        prisma.translation.findMany({
          where,
          include: {
            translationKey: true,
            language: true,
            translator: {
              select: { id: true, name: true, email: true }
            },
            reviewer: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: { updatedAt: 'desc' },
          skip: (input.page - 1) * input.limit,
          take: input.limit
        }),
        prisma.translation.count({ where })
      ]);

      return {
        translations,
        pagination: {
          page: input.page,
          limit: input.limit,
          total,
          pages: Math.ceil(total / input.limit)
        }
      };
    }),

  // Content Translation Management
  createContentTranslation: protectedProcedure
    .input(z.object({
      languageId: z.string(),
      translation: contentTranslationSchema
    }))
    .mutation(async ({ ctx, input }) => {
      const contentTranslationData = {
        ...input.translation,
        fieldName: input.languageId // This is a simplification - should be handled properly
      };

      return i18nService.createContentTranslation(
        ctx.tenant.id,
        ctx.user.id,
        contentTranslationData
      );
    }),

  getContentTranslations: protectedProcedure
    .input(z.object({
      contentType: z.string(),
      contentId: z.string(),
      languageCode: z.string().optional()
    }))
    .query(async ({ ctx, input }) => {
      const where: any = {
        tenantId: ctx.tenant.id,
        contentType: input.contentType,
        contentId: input.contentId
      };

      if (input.languageCode) {
        const language = await prisma.language.findUnique({
          where: { code: input.languageCode }
        });
        if (language) {
          where.languageId = language.id;
        }
      }

      return prisma.contentTranslation.findMany({
        where,
        include: {
          language: true,
          translator: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy: { updatedAt: 'desc' }
      });
    }),

  // Translation Statistics
  getTranslationStats: adminProcedure
    .query(async ({ ctx }) => {
      return i18nService.getTranslationStats(ctx.tenant.id);
    }),

  // Import/Export
  exportTranslations: adminProcedure
    .input(z.object({
      languageCode: z.string(),
      format: z.enum(['json', 'csv']).default('json')
    }))
    .mutation(async ({ ctx, input }) => {
      return i18nService.exportTranslations(
        ctx.tenant.id,
        input.languageCode,
        input.format
      );
    }),

  importTranslations: adminProcedure
    .input(z.object({
      languageCode: z.string(),
      data: z.record(z.record(z.any()))
    }))
    .mutation(async ({ ctx, input }) => {
      return i18nService.importTranslations(
        ctx.tenant.id,
        input.languageCode,
        ctx.user.id,
        input.data
      );
    }),

  // Bulk operations
  bulkUpdateTranslationStatus: adminProcedure
    .input(z.object({
      translationIds: z.array(z.string()),
      status: z.enum(['PENDING', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'])
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await prisma.translation.updateMany({
        where: {
          id: { in: input.translationIds },
          translationKey: {
            tenantId: ctx.tenant.id
          }
        },
        data: {
          status: input.status,
          reviewedBy: ctx.user.id,
          reviewedAt: new Date()
        }
      });

      return { updated: result.count };
    }),

  // Auto-translation (placeholder for future AI integration)
  autoTranslate: adminProcedure
    .input(z.object({
      translationKeyId: z.string(),
      targetLanguageId: z.string(),
      service: z.enum(['google', 'deepl', 'azure']).default('google')
    }))
    .mutation(async ({ ctx, input }) => {
      // Placeholder for auto-translation integration
      // Would integrate with Google Translate, DeepL, or Azure Translator
      
      const translationKey = await prisma.translationKey.findFirst({
        where: {
          id: input.translationKeyId,
          tenantId: ctx.tenant.id
        },
        include: {
          translations: {
            where: {
              languageId: ctx.tenant.defaultLanguage // Get source translation
            }
          }
        }
      });

      if (!translationKey || !translationKey.translations.length) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Source translation not found'
        });
      }

      // For now, return a placeholder response
      return {
        success: false,
        message: 'Auto-translation service not yet implemented'
      };
    }),

  // Translation workflow
  submitForReview: protectedProcedure
    .input(z.object({
      translationId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const translation = await prisma.translation.findFirst({
        where: {
          id: input.translationId,
          translationKey: {
            tenantId: ctx.tenant.id
          }
        }
      });

      if (!translation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Translation not found'
        });
      }

      if (translation.translatedBy !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Can only submit your own translations for review'
        });
      }

      return prisma.translation.update({
        where: { id: input.translationId },
        data: {
          status: 'REVIEW'
        }
      });
    })
});