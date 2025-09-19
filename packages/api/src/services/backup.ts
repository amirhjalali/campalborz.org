import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { prisma } from '../lib/prisma';
import { cacheService } from './cache';

const execAsync = promisify(exec);

export interface BackupConfig {
  enabled: boolean;
  schedule: string; // Cron expression
  retention: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  storage: {
    type: 'local' | 's3';
    localPath?: string;
    s3Bucket?: string;
    s3Region?: string;
  };
  encryption: {
    enabled: boolean;
    key?: string;
  };
  compression: boolean;
  includeFiles: boolean;
}

export interface BackupMetadata {
  id: string;
  type: 'database' | 'files' | 'full';
  tenantId?: string;
  size: number;
  compressed: boolean;
  encrypted: boolean;
  checksum: string;
  createdAt: Date;
  expiresAt?: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  error?: string;
}

class BackupService {
  private s3Client?: S3Client;
  private config: BackupConfig;

  constructor() {
    this.config = {
      enabled: process.env.BACKUP_ENABLED === 'true',
      schedule: process.env.BACKUP_SCHEDULE || '0 2 * * *', // Daily at 2 AM
      retention: {
        daily: parseInt(process.env.BACKUP_RETENTION_DAILY || '7'),
        weekly: parseInt(process.env.BACKUP_RETENTION_WEEKLY || '4'),
        monthly: parseInt(process.env.BACKUP_RETENTION_MONTHLY || '12'),
      },
      storage: {
        type: (process.env.BACKUP_STORAGE_TYPE as 'local' | 's3') || 'local',
        localPath: process.env.BACKUP_LOCAL_PATH || './backups',
        s3Bucket: process.env.BACKUP_S3_BUCKET,
        s3Region: process.env.BACKUP_S3_REGION || 'us-east-1',
      },
      encryption: {
        enabled: process.env.BACKUP_ENCRYPTION_ENABLED === 'true',
        key: process.env.BACKUP_ENCRYPTION_KEY,
      },
      compression: process.env.BACKUP_COMPRESSION !== 'false',
      includeFiles: process.env.BACKUP_INCLUDE_FILES === 'true',
    };

    if (this.config.storage.type === 's3') {
      this.s3Client = new S3Client({
        region: this.config.storage.s3Region,
      });
    }
  }

  async createDatabaseBackup(tenantId?: string): Promise<BackupMetadata> {
    const backupId = `db_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const timestamp = new Date();
    
    try {
      console.log(`📦 Starting database backup: ${backupId}`);
      
      // Create backup metadata
      let metadata: BackupMetadata = {
        id: backupId,
        type: 'database',
        tenantId,
        size: 0,
        compressed: this.config.compression,
        encrypted: this.config.encryption.enabled,
        checksum: '',
        createdAt: timestamp,
        status: 'in_progress',
      };

      // Generate database dump command
      const dumpCommand = await this.generateDumpCommand(tenantId);
      const backupPath = await this.getBackupPath(backupId, 'sql');

      // Execute database dump
      const { stdout, stderr } = await execAsync(dumpCommand);
      
      if (stderr && !stderr.includes('NOTICE:')) {
        throw new Error(`Database dump failed: ${stderr}`);
      }

      // Read the dump file
      let backupData = await fs.readFile(backupPath);

      // Compress if enabled
      if (this.config.compression) {
        backupData = await this.compressData(backupData);
      }

      // Encrypt if enabled
      if (this.config.encryption.enabled) {
        backupData = await this.encryptData(backupData);
      }

      // Calculate checksum
      const checksum = await this.calculateChecksum(backupData);

      // Store backup
      const finalPath = await this.storeBackup(backupId, backupData, 'sql');

      // Update metadata
      metadata = {
        ...metadata,
        size: backupData.length,
        checksum,
        status: 'completed',
      };

      // Store metadata in database
      await this.storeBackupMetadata(metadata);

      // Clean up temporary files
      await this.cleanupTempFiles([backupPath]);

      console.log(`✅ Database backup completed: ${backupId} (${this.formatBytes(metadata.size)})`);
      
      return metadata;
    } catch (error) {
      console.error(`❌ Database backup failed: ${backupId}`, error);
      
      const failedMetadata: BackupMetadata = {
        id: backupId,
        type: 'database',
        tenantId,
        size: 0,
        compressed: false,
        encrypted: false,
        checksum: '',
        createdAt: timestamp,
        status: 'failed',
        error: error.message,
      };

      await this.storeBackupMetadata(failedMetadata);
      throw error;
    }
  }

  async createFilesBackup(tenantId?: string): Promise<BackupMetadata> {
    if (!this.config.includeFiles) {
      throw new Error('File backups are disabled in configuration');
    }

    const backupId = `files_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const timestamp = new Date();
    
    try {
      console.log(`📁 Starting files backup: ${backupId}`);
      
      let metadata: BackupMetadata = {
        id: backupId,
        type: 'files',
        tenantId,
        size: 0,
        compressed: this.config.compression,
        encrypted: this.config.encryption.enabled,
        checksum: '',
        createdAt: timestamp,
        status: 'in_progress',
      };

      // Get files to backup
      const filesToBackup = await this.getFilesToBackup(tenantId);
      
      // Create archive
      const archivePath = await this.createFileArchive(backupId, filesToBackup);
      
      // Read archive data
      let backupData = await fs.readFile(archivePath);

      // Compress if enabled (additional compression beyond tar.gz)
      if (this.config.compression) {
        backupData = await this.compressData(backupData);
      }

      // Encrypt if enabled
      if (this.config.encryption.enabled) {
        backupData = await this.encryptData(backupData);
      }

      // Calculate checksum
      const checksum = await this.calculateChecksum(backupData);

      // Store backup
      await this.storeBackup(backupId, backupData, 'tar.gz');

      // Update metadata
      metadata = {
        ...metadata,
        size: backupData.length,
        checksum,
        status: 'completed',
      };

      await this.storeBackupMetadata(metadata);

      // Clean up temporary files
      await this.cleanupTempFiles([archivePath]);

      console.log(`✅ Files backup completed: ${backupId} (${this.formatBytes(metadata.size)})`);
      
      return metadata;
    } catch (error) {
      console.error(`❌ Files backup failed: ${backupId}`, error);
      
      const failedMetadata: BackupMetadata = {
        id: backupId,
        type: 'files',
        tenantId,
        size: 0,
        compressed: false,
        encrypted: false,
        checksum: '',
        createdAt: timestamp,
        status: 'failed',
        error: error.message,
      };

      await this.storeBackupMetadata(failedMetadata);
      throw error;
    }
  }

  async createFullBackup(tenantId?: string): Promise<BackupMetadata[]> {
    console.log(`🔄 Starting full backup for tenant: ${tenantId || 'all'}`);
    
    const results: BackupMetadata[] = [];
    
    try {
      // Create database backup
      const dbBackup = await this.createDatabaseBackup(tenantId);
      results.push(dbBackup);

      // Create files backup if enabled
      if (this.config.includeFiles) {
        const filesBackup = await this.createFilesBackup(tenantId);
        results.push(filesBackup);
      }

      console.log(`✅ Full backup completed: ${results.length} backups created`);
      
      return results;
    } catch (error) {
      console.error(`❌ Full backup failed:`, error);
      throw error;
    }
  }

  async restoreBackup(backupId: string, options: {
    tenantId?: string;
    overwrite?: boolean;
    targetPath?: string;
  } = {}): Promise<void> {
    console.log(`🔄 Starting restore from backup: ${backupId}`);
    
    try {
      // Get backup metadata
      const metadata = await this.getBackupMetadata(backupId);
      if (!metadata) {
        throw new Error(`Backup not found: ${backupId}`);
      }

      if (metadata.status !== 'completed') {
        throw new Error(`Backup is not in completed state: ${metadata.status}`);
      }

      // Download backup data
      const backupData = await this.retrieveBackup(backupId);
      
      // Verify checksum
      const checksum = await this.calculateChecksum(backupData);
      if (checksum !== metadata.checksum) {
        throw new Error('Backup checksum verification failed');
      }

      // Decrypt if needed
      let processedData = backupData;
      if (metadata.encrypted) {
        processedData = await this.decryptData(processedData);
      }

      // Decompress if needed
      if (metadata.compressed) {
        processedData = await this.decompressData(processedData);
      }

      // Restore based on backup type
      switch (metadata.type) {
        case 'database':
          await this.restoreDatabase(processedData, options);
          break;
        case 'files':
          await this.restoreFiles(processedData, options);
          break;
        default:
          throw new Error(`Unsupported backup type: ${metadata.type}`);
      }

      console.log(`✅ Backup restored successfully: ${backupId}`);
    } catch (error) {
      console.error(`❌ Backup restore failed: ${backupId}`, error);
      throw error;
    }
  }

  async listBackups(filters: {
    tenantId?: string;
    type?: 'database' | 'files' | 'full';
    status?: 'pending' | 'in_progress' | 'completed' | 'failed';
    limit?: number;
    offset?: number;
  } = {}): Promise<{ backups: BackupMetadata[]; total: number }> {
    const cacheKey = `backups:list:${JSON.stringify(filters)}`;
    
    return cacheService.cached(cacheKey, async () => {
      // In a real implementation, this would query a backup metadata table
      // For now, we'll return mock data structure
      const mockBackups: BackupMetadata[] = [];
      
      return {
        backups: mockBackups,
        total: mockBackups.length,
      };
    }, { ttl: 300 }); // Cache for 5 minutes
  }

  async deleteBackup(backupId: string): Promise<void> {
    console.log(`🗑️ Deleting backup: ${backupId}`);
    
    try {
      // Delete from storage
      await this.deleteFromStorage(backupId);
      
      // Remove metadata
      await this.deleteBackupMetadata(backupId);
      
      console.log(`✅ Backup deleted: ${backupId}`);
    } catch (error) {
      console.error(`❌ Failed to delete backup: ${backupId}`, error);
      throw error;
    }
  }

  async cleanupExpiredBackups(): Promise<{ deleted: number; errors: string[] }> {
    console.log('🧹 Starting cleanup of expired backups');
    
    const now = new Date();
    const errors: string[] = [];
    let deleted = 0;

    try {
      // Get all backups
      const { backups } = await this.listBackups();
      
      for (const backup of backups) {
        try {
          if (backup.expiresAt && backup.expiresAt < now) {
            await this.deleteBackup(backup.id);
            deleted++;
          }
        } catch (error) {
          errors.push(`Failed to delete backup ${backup.id}: ${error.message}`);
        }
      }

      console.log(`🧹 Cleanup completed: ${deleted} backups deleted, ${errors.length} errors`);
      
      return { deleted, errors };
    } catch (error) {
      console.error('❌ Cleanup failed:', error);
      throw error;
    }
  }

  async getBackupStats(): Promise<{
    total: number;
    totalSize: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    oldest: Date | null;
    newest: Date | null;
  }> {
    const cacheKey = 'backup:stats';
    
    return cacheService.cached(cacheKey, async () => {
      const { backups } = await this.listBackups();
      
      const stats = {
        total: backups.length,
        totalSize: backups.reduce((sum, b) => sum + b.size, 0),
        byType: {} as Record<string, number>,
        byStatus: {} as Record<string, number>,
        oldest: null as Date | null,
        newest: null as Date | null,
      };

      for (const backup of backups) {
        stats.byType[backup.type] = (stats.byType[backup.type] || 0) + 1;
        stats.byStatus[backup.status] = (stats.byStatus[backup.status] || 0) + 1;
        
        if (!stats.oldest || backup.createdAt < stats.oldest) {
          stats.oldest = backup.createdAt;
        }
        if (!stats.newest || backup.createdAt > stats.newest) {
          stats.newest = backup.createdAt;
        }
      }

      return stats;
    }, { ttl: 600 }); // Cache for 10 minutes
  }

  // Private helper methods
  private async generateDumpCommand(tenantId?: string): Promise<string> {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL not configured');
    }

    // Basic pg_dump command - in production, add proper filtering for tenant data
    const command = `pg_dump "${dbUrl}"`;
    
    return command;
  }

  private async getBackupPath(backupId: string, extension: string): Promise<string> {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${backupId}_${timestamp}.${extension}`;
    
    if (this.config.storage.type === 'local') {
      const backupDir = this.config.storage.localPath || './backups';
      await fs.mkdir(backupDir, { recursive: true });
      return path.join(backupDir, filename);
    }
    
    return `/tmp/${filename}`;
  }

  private async compressData(data: Buffer): Promise<Buffer> {
    const zlib = await import('zlib');
    return new Promise((resolve, reject) => {
      zlib.gzip(data, (err, compressed) => {
        if (err) reject(err);
        else resolve(compressed);
      });
    });
  }

  private async decompressData(data: Buffer): Promise<Buffer> {
    const zlib = await import('zlib');
    return new Promise((resolve, reject) => {
      zlib.gunzip(data, (err, decompressed) => {
        if (err) reject(err);
        else resolve(decompressed);
      });
    });
  }

  private async encryptData(data: Buffer): Promise<Buffer> {
    if (!this.config.encryption.key) {
      throw new Error('Encryption key not configured');
    }
    
    const crypto = await import('crypto');
    const cipher = crypto.createCipher('aes-256-cbc', this.config.encryption.key);
    return Buffer.concat([cipher.update(data), cipher.final()]);
  }

  private async decryptData(data: Buffer): Promise<Buffer> {
    if (!this.config.encryption.key) {
      throw new Error('Encryption key not configured');
    }
    
    const crypto = await import('crypto');
    const decipher = crypto.createDecipher('aes-256-cbc', this.config.encryption.key);
    return Buffer.concat([decipher.update(data), decipher.final()]);
  }

  private async calculateChecksum(data: Buffer): Promise<string> {
    const crypto = await import('crypto');
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  private async storeBackup(backupId: string, data: Buffer, extension: string): Promise<string> {
    if (this.config.storage.type === 's3' && this.s3Client) {
      const key = `backups/${backupId}.${extension}`;
      await this.s3Client.send(new PutObjectCommand({
        Bucket: this.config.storage.s3Bucket,
        Key: key,
        Body: data,
      }));
      return key;
    } else {
      const filePath = await this.getBackupPath(backupId, extension);
      await fs.writeFile(filePath, data);
      return filePath;
    }
  }

  private async retrieveBackup(backupId: string): Promise<Buffer> {
    if (this.config.storage.type === 's3' && this.s3Client) {
      const response = await this.s3Client.send(new GetObjectCommand({
        Bucket: this.config.storage.s3Bucket,
        Key: `backups/${backupId}`,
      }));
      
      const chunks: Buffer[] = [];
      for await (const chunk of response.Body as any) {
        chunks.push(chunk);
      }
      return Buffer.concat(chunks);
    } else {
      // For local storage, we'd need to find the file by ID
      throw new Error('Local backup retrieval not implemented');
    }
  }

  private async storeBackupMetadata(metadata: BackupMetadata): Promise<void> {
    // In a real implementation, this would store in a database table
    console.log('Storing backup metadata:', metadata.id);
  }

  private async getBackupMetadata(backupId: string): Promise<BackupMetadata | null> {
    // In a real implementation, this would query the database
    return null;
  }

  private async deleteBackupMetadata(backupId: string): Promise<void> {
    // In a real implementation, this would delete from database
    console.log('Deleting backup metadata:', backupId);
  }

  private async deleteFromStorage(backupId: string): Promise<void> {
    if (this.config.storage.type === 's3' && this.s3Client) {
      await this.s3Client.send(new DeleteObjectCommand({
        Bucket: this.config.storage.s3Bucket,
        Key: `backups/${backupId}`,
      }));
    } else {
      // For local storage, delete the file
      console.log('Deleting local backup file:', backupId);
    }
  }

  private async getFilesToBackup(tenantId?: string): Promise<string[]> {
    // In a real implementation, this would query the Media table
    // and return file paths for the specified tenant
    return [];
  }

  private async createFileArchive(backupId: string, files: string[]): Promise<string> {
    const archivePath = `/tmp/${backupId}.tar.gz`;
    
    if (files.length === 0) {
      // Create empty archive
      await execAsync(`tar -czf ${archivePath} -T /dev/null`);
    } else {
      const fileList = files.join(' ');
      await execAsync(`tar -czf ${archivePath} ${fileList}`);
    }
    
    return archivePath;
  }

  private async restoreDatabase(data: Buffer, options: any): Promise<void> {
    // Write data to temp file and restore using psql
    const tempFile = `/tmp/restore_${Date.now()}.sql`;
    await fs.writeFile(tempFile, data);
    
    try {
      const dbUrl = process.env.DATABASE_URL;
      await execAsync(`psql "${dbUrl}" < ${tempFile}`);
    } finally {
      await fs.unlink(tempFile);
    }
  }

  private async restoreFiles(data: Buffer, options: any): Promise<void> {
    // Extract archive to target location
    const tempFile = `/tmp/restore_${Date.now()}.tar.gz`;
    await fs.writeFile(tempFile, data);
    
    try {
      const targetPath = options.targetPath || './restored_files';
      await fs.mkdir(targetPath, { recursive: true });
      await execAsync(`tar -xzf ${tempFile} -C ${targetPath}`);
    } finally {
      await fs.unlink(tempFile);
    }
  }

  private async cleanupTempFiles(files: string[]): Promise<void> {
    for (const file of files) {
      try {
        await fs.unlink(file);
      } catch (error) {
        console.warn(`Failed to cleanup temp file ${file}:`, error.message);
      }
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export const backupService = new BackupService();