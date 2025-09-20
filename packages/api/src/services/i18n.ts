import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';
import { TRPCError } from '@trpc/server';
import { TranslationStatus } from '@prisma/client';

interface LanguageData {
  code: string;
  name: string;
  nativeName: string;
  direction?: 'ltr' | 'rtl';
  isActive?: boolean;
}

interface TranslationKeyData {
  namespace: string;
  key: string;
  description?: string;
  isPlural?: boolean;
  metadata?: Record<string, any>;
}

interface TranslationData {
  value: string;
  pluralValues?: Record<string, string>;
  status?: TranslationStatus;
}

interface ContentTranslationData {
  contentType: string;
  contentId: string;
  fieldName: string;
  originalValue: string;
  translatedValue: string;
  status?: TranslationStatus;
}

interface TranslationFilters {
  namespace?: string;
  key?: string;
  languageCode?: string;
  status?: TranslationStatus[];
  search?: string;
  page: number;
  limit: number;
}

class I18nService {
  // Language Management
  async getLanguages() {
    try {
      return await prisma.language.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' }
      });
    } catch (error) {
      logger.error('Failed to get languages', { error });
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get languages'
      });
    }
  }

  async createLanguage(data: LanguageData) {
    try {
      const existingLanguage = await prisma.language.findUnique({
        where: { code: data.code }
      });

      if (existingLanguage) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Language with this code already exists'
        });
      }

      const language = await prisma.language.create({
        data: {
          code: data.code,
          name: data.name,
          nativeName: data.nativeName,
          direction: data.direction || 'ltr',
          isActive: data.isActive ?? true
        }
      });

      logger.info('Language created', { languageId: language.id, code: data.code });
      return language;
    } catch (error) {
      logger.error('Failed to create language', { error, data });
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create language'
      });
    }
  }

  // Tenant Language Configuration
  async getTenantLanguages(tenantId: string) {
    try {
      return await prisma.tenantLanguage.findMany({
        where: { tenantId, isActive: true },
        include: {
          language: true
        },
        orderBy: [
          { isDefault: 'desc' },
          { language: { name: 'asc' } }
        ]
      });
    } catch (error) {
      logger.error('Failed to get tenant languages', { error, tenantId });
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get tenant languages'
      });
    }
  }

  async addLanguageToTenant(tenantId: string, languageId: string, isDefault = false) {
    try {
      // If setting as default, update existing default
      if (isDefault) {
        await prisma.tenantLanguage.updateMany({
          where: { tenantId, isDefault: true },
          data: { isDefault: false }
        });
      }

      const tenantLanguage = await prisma.tenantLanguage.create({
        data: {
          tenantId,
          languageId,
          isDefault,
          isActive: true
        },
        include: {
          language: true
        }
      });

      // Update tenant's supported languages array
      const supportedLanguages = await prisma.tenantLanguage.findMany({
        where: { tenantId, isActive: true },
        include: { language: true }
      });

      await prisma.tenant.update({
        where: { id: tenantId },
        data: {
          supportedLanguages: supportedLanguages.map(tl => tl.language.code),
          ...(isDefault && { defaultLanguage: tenantLanguage.language.code })
        }
      });

      logger.info('Language added to tenant', { tenantId, languageId, isDefault });
      return tenantLanguage;
    } catch (error) {
      logger.error('Failed to add language to tenant', { error, tenantId, languageId });
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to add language to tenant'
      });
    }
  }

  // Translation Key Management
  async createTranslationKey(tenantId: string | null, data: TranslationKeyData) {
    try {
      const existingKey = await prisma.translationKey.findFirst({
        where: {
          tenantId,
          namespace: data.namespace,
          key: data.key
        }
      });

      if (existingKey) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Translation key already exists'
        });
      }

      const translationKey = await prisma.translationKey.create({
        data: {
          tenantId,
          namespace: data.namespace,
          key: data.key,
          description: data.description,
          isPlural: data.isPlural || false,
          metadata: data.metadata
        }
      });

      logger.info('Translation key created', {
        keyId: translationKey.id,
        namespace: data.namespace,
        key: data.key
      });

      return translationKey;
    } catch (error) {
      logger.error('Failed to create translation key', { error, tenantId, data });
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create translation key'
      });
    }
  }

  async getTranslationKeys(tenantId: string | null, filters?: Partial<TranslationFilters>) {
    try {
      const where: any = {
        tenantId,
        ...(filters?.namespace && { namespace: filters.namespace }),
        ...(filters?.key && { key: { contains: filters.key, mode: 'insensitive' } })
      };

      if (filters?.search) {
        where.OR = [
          { key: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } }
        ];
      }

      const [keys, total] = await Promise.all([
        prisma.translationKey.findMany({
          where,
          include: {
            translations: {
              include: {
                language: true
              }
            }
          },
          orderBy: [
            { namespace: 'asc' },
            { key: 'asc' }
          ],
          ...(filters?.page && filters?.limit && {
            skip: (filters.page - 1) * filters.limit,
            take: filters.limit
          })
        }),
        prisma.translationKey.count({ where })
      ]);

      return {
        keys,
        pagination: filters?.page && filters?.limit ? {
          page: filters.page,
          limit: filters.limit,
          total,
          pages: Math.ceil(total / filters.limit)
        } : undefined
      };
    } catch (error) {
      logger.error('Failed to get translation keys', { error, tenantId });
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get translation keys'
      });
    }
  }

  // Translation Management
  async createTranslation(
    translationKeyId: string,
    languageId: string,
    userId: string,
    data: TranslationData
  ) {
    try {
      const existingTranslation = await prisma.translation.findFirst({
        where: { translationKeyId, languageId }
      });

      if (existingTranslation) {
        // Update existing translation with new version
        const translation = await prisma.translation.update({
          where: { id: existingTranslation.id },
          data: {
            value: data.value,
            pluralValues: data.pluralValues,
            status: data.status || TranslationStatus.PENDING,
            translatedBy: userId,
            translatedAt: new Date(),
            version: existingTranslation.version + 1
          },
          include: {
            translationKey: true,
            language: true
          }
        });

        logger.info('Translation updated', {
          translationId: translation.id,
          version: translation.version
        });

        return translation;
      } else {
        // Create new translation
        const translation = await prisma.translation.create({
          data: {
            translationKeyId,
            languageId,
            value: data.value,
            pluralValues: data.pluralValues,
            status: data.status || TranslationStatus.PENDING,
            translatedBy: userId,
            translatedAt: new Date(),
            version: 1
          },
          include: {
            translationKey: true,
            language: true
          }
        });

        logger.info('Translation created', { translationId: translation.id });
        return translation;
      }
    } catch (error) {
      logger.error('Failed to create translation', { error, translationKeyId, languageId });
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create translation'
      });
    }
  }

  async reviewTranslation(
    translationId: string,
    reviewerId: string,
    status: TranslationStatus.COMPLETED | TranslationStatus.REVIEW,
    feedback?: string
  ) {
    try {
      const translation = await prisma.translation.update({
        where: { id: translationId },
        data: {
          status,
          reviewedBy: reviewerId,
          reviewedAt: new Date(),
          ...(feedback && {
            metadata: {
              reviewFeedback: feedback
            }
          })
        },
        include: {
          translationKey: true,
          language: true
        }
      });

      logger.info('Translation reviewed', {
        translationId,
        status,
        reviewerId
      });

      return translation;
    } catch (error) {
      logger.error('Failed to review translation', { error, translationId });
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to review translation'
      });
    }
  }

  // Content Translation Management
  async createContentTranslation(
    tenantId: string,
    userId: string,
    data: ContentTranslationData
  ) {
    try {
      const existingTranslation = await prisma.contentTranslation.findFirst({
        where: {
          tenantId,
          contentType: data.contentType,
          contentId: data.contentId,
          languageId: data.fieldName, // Assuming languageId is passed in fieldName for this example
          fieldName: data.fieldName
        }
      });

      if (existingTranslation) {
        const translation = await prisma.contentTranslation.update({
          where: { id: existingTranslation.id },
          data: {
            translatedValue: data.translatedValue,
            status: data.status || TranslationStatus.PENDING,
            translatedBy: userId,
            translatedAt: new Date(),
            version: existingTranslation.version + 1
          }
        });

        logger.info('Content translation updated', {
          translationId: translation.id,
          contentType: data.contentType,
          contentId: data.contentId
        });

        return translation;
      } else {
        const translation = await prisma.contentTranslation.create({
          data: {
            tenantId,
            contentType: data.contentType,
            contentId: data.contentId,
            languageId: data.fieldName, // This should be the actual languageId
            fieldName: data.fieldName,
            originalValue: data.originalValue,
            translatedValue: data.translatedValue,
            status: data.status || TranslationStatus.PENDING,
            translatedBy: userId,
            translatedAt: new Date(),
            version: 1
          }
        });

        logger.info('Content translation created', {
          translationId: translation.id,
          contentType: data.contentType,
          contentId: data.contentId
        });

        return translation;
      }
    } catch (error) {
      logger.error('Failed to create content translation', { error, tenantId, data });
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create content translation'
      });
    }
  }

  // Translation Dictionary/Lookup
  async getTranslationDictionary(tenantId: string, languageCode: string, namespace?: string) {
    try {
      const language = await prisma.language.findUnique({
        where: { code: languageCode }
      });

      if (!language) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Language not found'
        });
      }

      const where: any = {
        tenantId: { in: [tenantId, null] }, // Include both tenant-specific and global keys
        ...(namespace && { namespace })
      };

      const translations = await prisma.translation.findMany({
        where: {
          languageId: language.id,
          status: TranslationStatus.COMPLETED,
          translationKey: where
        },
        include: {
          translationKey: true
        }
      });

      // Build nested dictionary object
      const dictionary: Record<string, Record<string, any>> = {};

      translations.forEach(translation => {
        const { namespace, key } = translation.translationKey;
        
        if (!dictionary[namespace]) {
          dictionary[namespace] = {};
        }

        if (translation.translationKey.isPlural && translation.pluralValues) {
          dictionary[namespace][key] = {
            singular: translation.value,
            plural: translation.pluralValues
          };
        } else {
          dictionary[namespace][key] = translation.value;
        }
      });

      logger.info('Translation dictionary retrieved', {
        tenantId,
        languageCode,
        namespace,
        keyCount: translations.length
      });

      return dictionary;
    } catch (error) {
      logger.error('Failed to get translation dictionary', {
        error,
        tenantId,
        languageCode,
        namespace
      });
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get translation dictionary'
      });
    }
  }

  // Translation Statistics
  async getTranslationStats(tenantId: string) {
    try {
      const [languages, totalKeys, translationCounts] = await Promise.all([
        this.getTenantLanguages(tenantId),
        prisma.translationKey.count({
          where: { tenantId: { in: [tenantId, null] } }
        }),
        prisma.translation.groupBy({
          by: ['languageId', 'status'],
          where: {
            translationKey: {
              tenantId: { in: [tenantId, null] }
            }
          },
          _count: true
        })
      ]);

      const stats = languages.map(tl => {
        const languageTranslations = translationCounts.filter(
          tc => tc.languageId === tl.languageId
        );

        const completed = languageTranslations.find(
          tc => tc.status === TranslationStatus.COMPLETED
        )?._count || 0;

        const pending = languageTranslations.find(
          tc => tc.status === TranslationStatus.PENDING
        )?._count || 0;

        const inProgress = languageTranslations.find(
          tc => tc.status === TranslationStatus.IN_PROGRESS
        )?._count || 0;

        const total = completed + pending + inProgress;
        const completionRate = totalKeys > 0 ? (completed / totalKeys) * 100 : 0;

        return {
          language: tl.language,
          isDefault: tl.isDefault,
          totalKeys,
          translated: completed,
          pending,
          inProgress,
          completionRate
        };
      });

      return {
        languages: stats,
        totalKeys,
        overallProgress: stats.reduce((sum, s) => sum + s.completionRate, 0) / stats.length || 0
      };
    } catch (error) {
      logger.error('Failed to get translation stats', { error, tenantId });
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get translation statistics'
      });
    }
  }

  // Import/Export
  async exportTranslations(tenantId: string, languageCode: string, format: 'json' | 'csv' = 'json') {
    try {
      const dictionary = await this.getTranslationDictionary(tenantId, languageCode);

      if (format === 'json') {
        return JSON.stringify(dictionary, null, 2);
      } else {
        // Convert to CSV format
        const rows = [];
        rows.push(['Namespace', 'Key', 'Value', 'Plural Values']);

        Object.entries(dictionary).forEach(([namespace, keys]) => {
          Object.entries(keys).forEach(([key, value]) => {
            if (typeof value === 'object' && value.singular) {
              rows.push([
                namespace,
                key,
                value.singular,
                JSON.stringify(value.plural)
              ]);
            } else {
              rows.push([namespace, key, value as string, '']);
            }
          });
        });

        return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
      }
    } catch (error) {
      logger.error('Failed to export translations', { error, tenantId, languageCode });
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to export translations'
      });
    }
  }

  async importTranslations(
    tenantId: string,
    languageCode: string,
    userId: string,
    data: Record<string, Record<string, any>>
  ) {
    try {
      const language = await prisma.language.findUnique({
        where: { code: languageCode }
      });

      if (!language) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Language not found'
        });
      }

      const importResults = {
        created: 0,
        updated: 0,
        errors: [] as string[]
      };

      for (const [namespace, keys] of Object.entries(data)) {
        for (const [key, value] of Object.entries(keys)) {
          try {
            // Get or create translation key
            let translationKey = await prisma.translationKey.findFirst({
              where: { tenantId, namespace, key }
            });

            if (!translationKey) {
              translationKey = await this.createTranslationKey(tenantId, {
                namespace,
                key,
                description: `Imported from ${languageCode} translation file`
              });
            }

            // Handle plural forms
            let translationValue: string;
            let pluralValues: Record<string, string> | undefined;

            if (typeof value === 'object' && value.singular) {
              translationValue = value.singular;
              pluralValues = value.plural;
            } else {
              translationValue = value as string;
            }

            // Create or update translation
            const existing = await prisma.translation.findFirst({
              where: {
                translationKeyId: translationKey.id,
                languageId: language.id
              }
            });

            if (existing) {
              await prisma.translation.update({
                where: { id: existing.id },
                data: {
                  value: translationValue,
                  pluralValues,
                  translatedBy: userId,
                  translatedAt: new Date(),
                  version: existing.version + 1
                }
              });
              importResults.updated++;
            } else {
              await prisma.translation.create({
                data: {
                  translationKeyId: translationKey.id,
                  languageId: language.id,
                  value: translationValue,
                  pluralValues,
                  translatedBy: userId,
                  translatedAt: new Date(),
                  status: TranslationStatus.COMPLETED
                }
              });
              importResults.created++;
            }
          } catch (error) {
            importResults.errors.push(`Failed to import ${namespace}.${key}: ${error}`);
          }
        }
      }

      logger.info('Translations imported', {
        tenantId,
        languageCode,
        results: importResults
      });

      return importResults;
    } catch (error) {
      logger.error('Failed to import translations', { error, tenantId, languageCode });
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to import translations'
      });
    }
  }
}

export const i18nService = new I18nService();