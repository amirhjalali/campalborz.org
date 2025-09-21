import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface ExportOptions {
  name: string;
  description?: string;
  exportType: 'FULL' | 'INCREMENTAL' | 'FILTERED' | 'CUSTOM';
  format: 'CSV' | 'JSON' | 'XLSX' | 'XML' | 'PDF' | 'SQL';
  entityTypes: string[];
  filters?: Record<string, any>;
  fields?: string[];
  expiresAt?: Date;
}

export interface ImportOptions {
  name: string;
  description?: string;
  importType: 'CREATE' | 'UPDATE' | 'UPSERT' | 'DELETE';
  format: 'CSV' | 'JSON' | 'XLSX' | 'XML';
  entityType: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mapping: Record<string, string>;
  validation?: Record<string, any>;
  options?: Record<string, any>;
}

export interface TemplateData {
  name: string;
  description?: string;
  type: 'EXPORT' | 'IMPORT';
  entityType: string;
  format: 'CSV' | 'JSON' | 'XLSX' | 'XML' | 'PDF' | 'SQL';
  fields?: string[];
  filters?: Record<string, any>;
  mapping?: Record<string, string>;
  isPublic?: boolean;
}

export interface SyncConfiguration {
  name: string;
  description?: string;
  sourceType: 'DATABASE' | 'API' | 'FILE' | 'WEBHOOK';
  targetType: 'DATABASE' | 'API' | 'FILE' | 'EMAIL';
  sourceConfig: Record<string, any>;
  targetConfig: Record<string, any>;
  mapping: Record<string, any>;
  schedule?: string; // Cron expression
}

export interface BackupOptions {
  name: string;
  description?: string;
  backupType: 'FULL' | 'INCREMENTAL' | 'SELECTIVE';
  entityTypes?: string[];
  compression?: boolean;
  encryption?: boolean;
  expiresAt?: Date;
}

export class DataExportImportService {

  // Export Operations
  async createExport(tenantId: string, userId: string, options: ExportOptions) {
    const exportRecord = await prisma.dataExport.create({
      data: {
        ...options,
        tenantId,
        createdBy: userId,
        status: 'PENDING'
      }
    });

    // Start export process asynchronously
    this.processExport(exportRecord.id).catch(console.error);

    return exportRecord;
  }

  async processExport(exportId: string) {
    const exportRecord = await prisma.dataExport.findUnique({
      where: { id: exportId }
    });

    if (!exportRecord) {
      throw new Error('Export not found');
    }

    try {
      await prisma.dataExport.update({
        where: { id: exportId },
        data: {
          status: 'PROCESSING',
          startedAt: new Date(),
          progress: 0
        }
      });

      const exportData = await this.extractData(exportRecord);
      const fileUrl = await this.generateExportFile(exportRecord, exportData);

      await prisma.dataExport.update({
        where: { id: exportId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          fileUrl,
          fileSize: BigInt(0), // Would be actual file size
          recordCount: exportData.length,
          progress: 100
        }
      });

    } catch (error) {
      await prisma.dataExport.update({
        where: { id: exportId },
        data: {
          status: 'FAILED',
          error: error.message,
          completedAt: new Date()
        }
      });
      throw error;
    }
  }

  private async extractData(exportRecord: any): Promise<any[]> {
    const { tenantId, entityTypes, filters, fields } = exportRecord;
    const allData: any[] = [];

    for (const entityType of entityTypes as string[]) {
      const data = await this.extractEntityData(tenantId, entityType, filters, fields);
      allData.push(...data.map(item => ({ ...item, _entityType: entityType })));
    }

    return allData;
  }

  private async extractEntityData(tenantId: string, entityType: string, filters: any, fields?: string[]): Promise<any[]> {
    const where = { tenantId, ...filters };
    const select = fields ? fields.reduce((acc, field) => ({ ...acc, [field]: true }), {}) : undefined;

    switch (entityType) {
      case 'users':
        return await prisma.user.findMany({
          where: {
            tenants: {
              some: { tenantId }
            }
          },
          select,
          include: !select ? {
            profile: true,
            memberProfiles: {
              where: { tenantId }
            }
          } : undefined
        });

      case 'events':
        return await prisma.event.findMany({
          where,
          select,
          include: !select ? {
            category: true,
            attendees: true,
            sessions: true
          } : undefined
        });

      case 'content':
        return await prisma.content.findMany({
          where,
          select,
          include: !select ? {
            contentType: true,
            categories: true,
            tags: true
          } : undefined
        });

      case 'donations':
        return await prisma.donation.findMany({
          where,
          select,
          include: !select ? {
            donor: true,
            campaign: true
          } : undefined
        });

      case 'members':
        return await prisma.memberProfile.findMany({
          where,
          select,
          include: !select ? {
            user: true,
            applications: true,
            achievements: true
          } : undefined
        });

      case 'messages':
        return await prisma.message.findMany({
          where,
          select,
          include: !select ? {
            author: true,
            channel: true,
            reactions: true
          } : undefined
        });

      case 'forum_posts':
        return await prisma.forumPost.findMany({
          where,
          select,
          include: !select ? {
            topic: true,
            creator: true
          } : undefined
        });

      default:
        throw new Error(`Unsupported entity type: ${entityType}`);
    }
  }

  private async generateExportFile(exportRecord: any, data: any[]): Promise<string> {
    const { format, name } = exportRecord;
    
    switch (format) {
      case 'JSON':
        return await this.generateJSONFile(name, data);
      case 'CSV':
        return await this.generateCSVFile(name, data);
      case 'XLSX':
        return await this.generateXLSXFile(name, data);
      case 'XML':
        return await this.generateXMLFile(name, data);
      case 'SQL':
        return await this.generateSQLFile(name, data);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  private async generateJSONFile(name: string, data: any[]): Promise<string> {
    // In production, this would save to cloud storage (S3, GCS, etc.)
    const fileName = `${name}-${Date.now()}.json`;
    const filePath = `/exports/${fileName}`;
    
    // Simulated file generation
    console.log(`Generated JSON file: ${filePath} with ${data.length} records`);
    
    return filePath;
  }

  private async generateCSVFile(name: string, data: any[]): Promise<string> {
    const fileName = `${name}-${Date.now()}.csv`;
    const filePath = `/exports/${fileName}`;
    
    if (data.length === 0) return filePath;

    // Extract headers from first record
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => 
        JSON.stringify(row[header] || '')
      ).join(','))
    ].join('\n');

    console.log(`Generated CSV file: ${filePath} with ${data.length} records`);
    
    return filePath;
  }

  private async generateXLSXFile(name: string, data: any[]): Promise<string> {
    // Would use libraries like 'xlsx' or 'exceljs'
    const fileName = `${name}-${Date.now()}.xlsx`;
    const filePath = `/exports/${fileName}`;
    
    console.log(`Generated XLSX file: ${filePath} with ${data.length} records`);
    
    return filePath;
  }

  private async generateXMLFile(name: string, data: any[]): Promise<string> {
    const fileName = `${name}-${Date.now()}.xml`;
    const filePath = `/exports/${fileName}`;
    
    console.log(`Generated XML file: ${filePath} with ${data.length} records`);
    
    return filePath;
  }

  private async generateSQLFile(name: string, data: any[]): Promise<string> {
    const fileName = `${name}-${Date.now()}.sql`;
    const filePath = `/exports/${fileName}`;
    
    console.log(`Generated SQL file: ${filePath} with ${data.length} records`);
    
    return filePath;
  }

  async getExports(tenantId: string, userId?: string) {
    const where: any = { tenantId };
    if (userId) where.createdBy = userId;

    return await prisma.dataExport.findMany({
      where,
      include: {
        creator: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getExport(tenantId: string, exportId: string) {
    return await prisma.dataExport.findFirst({
      where: { id: exportId, tenantId },
      include: {
        creator: true
      }
    });
  }

  async cancelExport(tenantId: string, exportId: string) {
    await prisma.dataExport.updateMany({
      where: {
        id: exportId,
        tenantId,
        status: { in: ['PENDING', 'PROCESSING'] }
      },
      data: {
        status: 'CANCELLED',
        completedAt: new Date()
      }
    });
  }

  // Import Operations
  async createImport(tenantId: string, userId: string, options: ImportOptions) {
    const importRecord = await prisma.dataImport.create({
      data: {
        ...options,
        tenantId,
        createdBy: userId,
        status: 'PENDING'
      }
    });

    // Start import process asynchronously
    this.processImport(importRecord.id).catch(console.error);

    return importRecord;
  }

  async processImport(importId: string) {
    const importRecord = await prisma.dataImport.findUnique({
      where: { id: importId }
    });

    if (!importRecord) {
      throw new Error('Import not found');
    }

    try {
      await prisma.dataImport.update({
        where: { id: importId },
        data: {
          status: 'VALIDATING',
          startedAt: new Date()
        }
      });

      // Parse and validate file
      const fileData = await this.parseImportFile(importRecord);
      const validationResult = await this.validateImportData(importRecord, fileData);

      if (validationResult.hasErrors) {
        await prisma.dataImport.update({
          where: { id: importId },
          data: {
            status: 'FAILED',
            error: 'Validation failed',
            validationReport: validationResult,
            completedAt: new Date()
          }
        });
        return;
      }

      await prisma.dataImport.update({
        where: { id: importId },
        data: {
          status: 'PROCESSING',
          totalRecords: fileData.length,
          validationReport: validationResult
        }
      });

      // Process records
      await this.processImportRecords(importRecord, fileData);

    } catch (error) {
      await prisma.dataImport.update({
        where: { id: importId },
        data: {
          status: 'FAILED',
          error: error.message,
          completedAt: new Date()
        }
      });
      throw error;
    }
  }

  private async parseImportFile(importRecord: any): Promise<any[]> {
    const { fileUrl, format } = importRecord;
    
    // In production, this would fetch from cloud storage and parse
    switch (format) {
      case 'CSV':
        return await this.parseCSVFile(fileUrl);
      case 'JSON':
        return await this.parseJSONFile(fileUrl);
      case 'XLSX':
        return await this.parseXLSXFile(fileUrl);
      case 'XML':
        return await this.parseXMLFile(fileUrl);
      default:
        throw new Error(`Unsupported import format: ${format}`);
    }
  }

  private async parseCSVFile(fileUrl: string): Promise<any[]> {
    // Would use CSV parsing library
    console.log(`Parsing CSV file: ${fileUrl}`);
    
    // Simulated data
    return [
      { name: 'John Doe', email: 'john@example.com', age: '30' },
      { name: 'Jane Smith', email: 'jane@example.com', age: '25' }
    ];
  }

  private async parseJSONFile(fileUrl: string): Promise<any[]> {
    console.log(`Parsing JSON file: ${fileUrl}`);
    
    // Simulated data
    return [
      { name: 'John Doe', email: 'john@example.com', age: 30 },
      { name: 'Jane Smith', email: 'jane@example.com', age: 25 }
    ];
  }

  private async parseXLSXFile(fileUrl: string): Promise<any[]> {
    console.log(`Parsing XLSX file: ${fileUrl}`);
    
    return [
      { name: 'John Doe', email: 'john@example.com', age: 30 }
    ];
  }

  private async parseXMLFile(fileUrl: string): Promise<any[]> {
    console.log(`Parsing XML file: ${fileUrl}`);
    
    return [
      { name: 'John Doe', email: 'john@example.com', age: 30 }
    ];
  }

  private async validateImportData(importRecord: any, data: any[]): Promise<any> {
    const { validation, mapping } = importRecord;
    const errors: any[] = [];
    const warnings: any[] = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowErrors = this.validateRow(row, validation, mapping, i + 1);
      errors.push(...rowErrors);
    }

    return {
      hasErrors: errors.length > 0,
      errors,
      warnings,
      totalRows: data.length,
      validRows: data.length - errors.length
    };
  }

  private validateRow(row: any, validation: any, mapping: any, rowNumber: number): any[] {
    const errors: any[] = [];

    // Required field validation
    if (validation?.required) {
      for (const field of validation.required) {
        const mappedField = mapping[field] || field;
        if (!row[mappedField]) {
          errors.push({
            rowNumber,
            field: mappedField,
            error: `Required field '${field}' is missing`,
            data: row
          });
        }
      }
    }

    // Email validation
    if (validation?.email) {
      for (const field of validation.email) {
        const mappedField = mapping[field] || field;
        const value = row[mappedField];
        if (value && !this.isValidEmail(value)) {
          errors.push({
            rowNumber,
            field: mappedField,
            error: `Invalid email format: ${value}`,
            data: row
          });
        }
      }
    }

    return errors;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private async processImportRecords(importRecord: any, data: any[]) {
    const { id: importId, entityType, importType, mapping } = importRecord;
    let processed = 0;
    let successful = 0;
    let failed = 0;

    for (const row of data) {
      try {
        const mappedData = this.mapRowData(row, mapping);
        await this.processImportRecord(importRecord, mappedData, importType);
        successful++;
      } catch (error) {
        failed++;
        await this.logImportError(importId, processed + 1, error.message, row);
      }

      processed++;
      
      // Update progress
      if (processed % 100 === 0) {
        await prisma.dataImport.update({
          where: { id: importId },
          data: {
            processedRecords: processed,
            successfulRecords: successful,
            failedRecords: failed,
            progress: (processed / data.length) * 100
          }
        });
      }
    }

    // Final update
    await prisma.dataImport.update({
      where: { id: importId },
      data: {
        status: 'COMPLETED',
        processedRecords: processed,
        successfulRecords: successful,
        failedRecords: failed,
        progress: 100,
        completedAt: new Date()
      }
    });
  }

  private mapRowData(row: any, mapping: any): any {
    const mappedData: any = {};
    
    Object.entries(mapping).forEach(([targetField, sourceField]) => {
      mappedData[targetField] = row[sourceField as string];
    });

    return mappedData;
  }

  private async processImportRecord(importRecord: any, data: any, importType: string) {
    const { tenantId, entityType } = importRecord;

    switch (entityType) {
      case 'users':
        await this.importUser(tenantId, data, importType);
        break;
      case 'events':
        await this.importEvent(tenantId, data, importType);
        break;
      case 'members':
        await this.importMember(tenantId, data, importType);
        break;
      default:
        throw new Error(`Unsupported entity type for import: ${entityType}`);
    }
  }

  private async importUser(tenantId: string, data: any, importType: string) {
    switch (importType) {
      case 'CREATE':
        await prisma.user.create({
          data: {
            email: data.email,
            profile: {
              create: {
                firstName: data.firstName,
                lastName: data.lastName,
                bio: data.bio
              }
            },
            tenants: {
              create: {
                tenantId,
                role: 'MEMBER'
              }
            }
          }
        });
        break;

      case 'UPSERT':
        await prisma.user.upsert({
          where: { email: data.email },
          update: {
            profile: {
              update: {
                firstName: data.firstName,
                lastName: data.lastName,
                bio: data.bio
              }
            }
          },
          create: {
            email: data.email,
            profile: {
              create: {
                firstName: data.firstName,
                lastName: data.lastName,
                bio: data.bio
              }
            },
            tenants: {
              create: {
                tenantId,
                role: 'MEMBER'
              }
            }
          }
        });
        break;
    }
  }

  private async importEvent(tenantId: string, data: any, importType: string) {
    switch (importType) {
      case 'CREATE':
        await prisma.event.create({
          data: {
            tenantId,
            title: data.title,
            description: data.description,
            location: data.location,
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
            maxAttendees: data.maxAttendees,
            price: data.price
          }
        });
        break;
    }
  }

  private async importMember(tenantId: string, data: any, importType: string) {
    const user = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (!user) {
      throw new Error(`User not found: ${data.email}`);
    }

    switch (importType) {
      case 'CREATE':
        await prisma.memberProfile.create({
          data: {
            userId: user.id,
            tenantId,
            membershipType: data.membershipType,
            joinDate: new Date(data.joinDate),
            status: data.status || 'ACTIVE'
          }
        });
        break;
    }
  }

  private async logImportError(importId: string, rowNumber: number, message: string, data: any) {
    await prisma.importLog.create({
      data: {
        importId,
        level: 'ERROR',
        message,
        rowNumber,
        data
      }
    });
  }

  async getImports(tenantId: string, userId?: string) {
    const where: any = { tenantId };
    if (userId) where.createdBy = userId;

    return await prisma.dataImport.findMany({
      where,
      include: {
        creator: true,
        _count: {
          select: { logs: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getImport(tenantId: string, importId: string) {
    return await prisma.dataImport.findFirst({
      where: { id: importId, tenantId },
      include: {
        creator: true,
        logs: {
          orderBy: { createdAt: 'desc' },
          take: 100
        }
      }
    });
  }

  // Template Management
  async createTemplate(tenantId: string, userId: string, data: TemplateData) {
    return await prisma.dataTemplate.create({
      data: {
        ...data,
        tenantId,
        createdBy: userId
      }
    });
  }

  async getTemplates(tenantId: string, type?: 'EXPORT' | 'IMPORT', entityType?: string) {
    const where: any = { tenantId, isActive: true };
    if (type) where.type = type;
    if (entityType) where.entityType = entityType;

    return await prisma.dataTemplate.findMany({
      where,
      include: {
        creator: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateTemplate(tenantId: string, templateId: string, data: Partial<TemplateData>) {
    return await prisma.dataTemplate.update({
      where: { id: templateId },
      data
    });
  }

  async deleteTemplate(tenantId: string, templateId: string) {
    await prisma.dataTemplate.update({
      where: { id: templateId },
      data: { isActive: false }
    });
  }

  // Data Sync
  async createSync(tenantId: string, userId: string, config: SyncConfiguration) {
    return await prisma.dataSync.create({
      data: {
        ...config,
        tenantId,
        createdBy: userId
      }
    });
  }

  async getSyncs(tenantId: string) {
    return await prisma.dataSync.findMany({
      where: { tenantId },
      include: {
        creator: true,
        _count: {
          select: { runs: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async executeSync(tenantId: string, syncId: string) {
    const sync = await prisma.dataSync.findFirst({
      where: { id: syncId, tenantId }
    });

    if (!sync) {
      throw new Error('Sync configuration not found');
    }

    const run = await prisma.syncRun.create({
      data: {
        syncId,
        status: 'RUNNING'
      }
    });

    try {
      // Execute sync logic here
      await this.performSync(sync);

      await prisma.syncRun.update({
        where: { id: run.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          recordsRead: 100, // Example values
          recordsWritten: 95,
          recordsSkipped: 3,
          recordsFailed: 2
        }
      });

      await prisma.dataSync.update({
        where: { id: syncId },
        data: {
          lastRunAt: new Date(),
          status: 'IDLE'
        }
      });

    } catch (error) {
      await prisma.syncRun.update({
        where: { id: run.id },
        data: {
          status: 'FAILED',
          completedAt: new Date(),
          error: error.message
        }
      });

      await prisma.dataSync.update({
        where: { id: syncId },
        data: {
          status: 'ERROR'
        }
      });

      throw error;
    }

    return run;
  }

  private async performSync(sync: any) {
    // Implementation would depend on source and target types
    console.log(`Performing sync: ${sync.name}`);
    
    // Simulate sync work
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Backup Operations
  async createBackup(tenantId: string, userId: string, options: BackupOptions) {
    const backup = await prisma.dataBackup.create({
      data: {
        ...options,
        tenantId,
        createdBy: userId,
        status: 'PENDING'
      }
    });

    // Start backup process asynchronously
    this.processBackup(backup.id).catch(console.error);

    return backup;
  }

  async processBackup(backupId: string) {
    const backup = await prisma.dataBackup.findUnique({
      where: { id: backupId }
    });

    if (!backup) {
      throw new Error('Backup not found');
    }

    try {
      await prisma.dataBackup.update({
        where: { id: backupId },
        data: {
          status: 'PROCESSING',
          startedAt: new Date()
        }
      });

      // Create backup file
      const fileUrl = await this.createBackupFile(backup);

      await prisma.dataBackup.update({
        where: { id: backupId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          fileUrl,
          fileSize: BigInt(0) // Would be actual file size
        }
      });

    } catch (error) {
      await prisma.dataBackup.update({
        where: { id: backupId },
        data: {
          status: 'FAILED',
          error: error.message,
          completedAt: new Date()
        }
      });
      throw error;
    }
  }

  private async createBackupFile(backup: any): Promise<string> {
    const { name, backupType, entityTypes, compression, encryption } = backup;
    
    console.log(`Creating ${backupType} backup: ${name}`);
    console.log(`Entities: ${entityTypes}`);
    console.log(`Compression: ${compression}, Encryption: ${encryption}`);
    
    // In production, this would create an actual backup file
    const fileName = `backup-${name}-${Date.now()}.tar.gz`;
    const filePath = `/backups/${fileName}`;
    
    return filePath;
  }

  async getBackups(tenantId: string) {
    return await prisma.dataBackup.findMany({
      where: { tenantId },
      include: {
        creator: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Cleanup Operations
  async cleanupExpiredExports() {
    const expired = await prisma.dataExport.findMany({
      where: {
        expiresAt: { lt: new Date() },
        status: 'COMPLETED'
      }
    });

    for (const exp of expired) {
      // Delete file from storage
      if (exp.fileUrl) {
        console.log(`Deleting expired export file: ${exp.fileUrl}`);
      }

      // Update status
      await prisma.dataExport.update({
        where: { id: exp.id },
        data: { status: 'EXPIRED' }
      });
    }
  }

  async cleanupExpiredBackups() {
    const expired = await prisma.dataBackup.findMany({
      where: {
        expiresAt: { lt: new Date() },
        status: 'COMPLETED'
      }
    });

    for (const backup of expired) {
      // Delete file from storage
      if (backup.fileUrl) {
        console.log(`Deleting expired backup file: ${backup.fileUrl}`);
      }

      // Update status
      await prisma.dataBackup.update({
        where: { id: backup.id },
        data: { status: 'EXPIRED' }
      });
    }
  }

  // Analytics
  async getDataOperationsStats(tenantId: string, period: 'day' | 'week' | 'month' = 'week') {
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

    const [exports, imports, syncs, backups] = await Promise.all([
      prisma.dataExport.groupBy({
        by: ['status'],
        where: {
          tenantId,
          createdAt: { gte: startDate }
        },
        _count: true
      }),
      prisma.dataImport.groupBy({
        by: ['status'],
        where: {
          tenantId,
          createdAt: { gte: startDate }
        },
        _count: true
      }),
      prisma.syncRun.groupBy({
        by: ['status'],
        where: {
          sync: { tenantId },
          startedAt: { gte: startDate }
        },
        _count: true
      }),
      prisma.dataBackup.groupBy({
        by: ['status'],
        where: {
          tenantId,
          createdAt: { gte: startDate }
        },
        _count: true
      })
    ]);

    return {
      period,
      exports: exports.reduce((acc, stat) => ({
        ...acc,
        [stat.status.toLowerCase()]: stat._count
      }), {}),
      imports: imports.reduce((acc, stat) => ({
        ...acc,
        [stat.status.toLowerCase()]: stat._count
      }), {}),
      syncs: syncs.reduce((acc, stat) => ({
        ...acc,
        [stat.status.toLowerCase()]: stat._count
      }), {}),
      backups: backups.reduce((acc, stat) => ({
        ...acc,
        [stat.status.toLowerCase()]: stat._count
      }), {})
    };
  }
}