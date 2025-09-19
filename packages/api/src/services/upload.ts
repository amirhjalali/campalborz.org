// File upload service for handling media uploads
// In production, this would integrate with AWS S3, Cloudinary, or similar services

import { createHash } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

export interface UploadConfig {
  provider: "local" | "s3" | "cloudinary" | "gcs";
  basePath?: string; // For local storage
  bucketName?: string; // For cloud storage
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  cloudName?: string; // For Cloudinary
  apiKey?: string;
  apiSecret?: string;
}

export interface FileUpload {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream: () => NodeJS.ReadableStream;
}

export interface UploadResult {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  thumbnailUrl?: string;
  mimeType: string;
  size: number;
  metadata?: Record<string, any>;
}

export interface ProcessingOptions {
  generateThumbnail?: boolean;
  thumbnailSize?: { width: number; height: number };
  optimize?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

class UploadService {
  private config: UploadConfig | null = null;

  configure(config: UploadConfig) {
    this.config = config;
  }

  async upload(
    file: FileUpload,
    options: {
      tenantId: string;
      userId: string;
      folder?: string;
      tags?: string[];
      alt?: string;
      caption?: string;
      processing?: ProcessingOptions;
    }
  ): Promise<UploadResult> {
    if (!this.config) {
      throw new Error("Upload service not configured");
    }

    try {
      // Generate unique filename
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2);
      const extension = path.extname(file.filename);
      const uniqueFilename = `${timestamp}_${random}${extension}`;
      
      // Create folder path
      const folderPath = this.createFolderPath(options.tenantId, options.folder);
      const fullPath = path.join(folderPath, uniqueFilename);

      // Read file stream
      const stream = file.createReadStream();
      const chunks: Buffer[] = [];
      
      for await (const chunk of stream) {
        chunks.push(chunk as Buffer);
      }
      
      const buffer = Buffer.concat(chunks);
      const size = buffer.length;

      // Validate file
      this.validateFile(file, buffer, size);

      // Process file if needed
      const processedBuffer = await this.processFile(buffer, file.mimetype, options.processing);

      let url: string;
      let thumbnailUrl: string | undefined;

      if (this.config.provider === "local") {
        // Ensure directory exists
        await fs.mkdir(path.dirname(fullPath), { recursive: true });
        
        // Save file
        await fs.writeFile(fullPath, processedBuffer);
        
        // Generate URL (in production, this would be a CDN URL)
        url = `/uploads/${options.tenantId}/${options.folder || ""}/${uniqueFilename}`.replace(/\/+/g, "/");

        // Generate thumbnail if requested
        if (options.processing?.generateThumbnail && this.isImage(file.mimetype)) {
          const thumbnailBuffer = await this.generateThumbnail(
            processedBuffer,
            file.mimetype,
            options.processing.thumbnailSize
          );
          
          const thumbnailFilename = `thumb_${uniqueFilename}`;
          const thumbnailPath = path.join(folderPath, thumbnailFilename);
          await fs.writeFile(thumbnailPath, thumbnailBuffer);
          
          thumbnailUrl = `/uploads/${options.tenantId}/${options.folder || ""}/${thumbnailFilename}`.replace(/\/+/g, "/");
        }
      } else {
        // For cloud providers, implement specific upload logic
        // Example for S3:
        // const s3Result = await this.uploadToS3(buffer, uniqueFilename, file.mimetype);
        // url = s3Result.Location;
        
        // Mock cloud upload for development
        url = `https://cdn.example.com/${options.tenantId}/${uniqueFilename}`;
        
        if (options.processing?.generateThumbnail && this.isImage(file.mimetype)) {
          thumbnailUrl = `https://cdn.example.com/${options.tenantId}/thumbs/${uniqueFilename}`;
        }
      }

      // Extract metadata
      const metadata = await this.extractMetadata(processedBuffer, file.mimetype);

      // Generate file hash for deduplication
      const hash = createHash("sha256").update(processedBuffer).digest("hex");

      return {
        id: hash.substring(0, 16),
        filename: uniqueFilename,
        originalName: file.filename,
        url,
        thumbnailUrl,
        mimeType: file.mimetype,
        size: processedBuffer.length,
        metadata: {
          ...metadata,
          folder: options.folder,
          tags: options.tags,
          alt: options.alt,
          caption: options.caption,
          hash,
        },
      };
    } catch (error) {
      console.error("File upload failed:", error);
      throw new Error(error instanceof Error ? error.message : "Upload failed");
    }
  }

  async delete(filename: string, tenantId: string, folder?: string): Promise<boolean> {
    if (!this.config) {
      throw new Error("Upload service not configured");
    }

    try {
      if (this.config.provider === "local") {
        const folderPath = this.createFolderPath(tenantId, folder);
        const fullPath = path.join(folderPath, filename);
        
        try {
          await fs.unlink(fullPath);
          
          // Also delete thumbnail if it exists
          const thumbnailPath = path.join(folderPath, `thumb_${filename}`);
          try {
            await fs.unlink(thumbnailPath);
          } catch {
            // Thumbnail doesn't exist, ignore
          }
          
          return true;
        } catch (error) {
          console.error("File deletion failed:", error);
          return false;
        }
      } else {
        // For cloud providers, implement specific deletion logic
        // Example for S3:
        // await this.deleteFromS3(filename);
        
        // Mock cloud deletion
        console.log(`Mock: Deleted ${filename} from cloud storage`);
        return true;
      }
    } catch (error) {
      console.error("File deletion failed:", error);
      return false;
    }
  }

  private createFolderPath(tenantId: string, folder?: string): string {
    const basePath = this.config?.basePath || "./uploads";
    const parts = [basePath, tenantId];
    
    if (folder) {
      parts.push(folder);
    }
    
    return path.join(...parts);
  }

  private validateFile(file: FileUpload, buffer: Buffer, size: number): void {
    // Size limits (10MB default)
    const maxSize = 10 * 1024 * 1024;
    if (size > maxSize) {
      throw new Error(`File too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
    }

    // MIME type whitelist
    const allowedTypes = [
      // Images
      "image/jpeg",
      "image/png", 
      "image/gif",
      "image/webp",
      "image/svg+xml",
      // Documents
      "application/pdf",
      "text/plain",
      "text/csv",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      // Video
      "video/mp4",
      "video/webm",
      // Audio
      "audio/mpeg",
      "audio/wav",
      "audio/ogg",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error(`File type ${file.mimetype} not allowed`);
    }

    // Additional validation for images
    if (this.isImage(file.mimetype)) {
      // Check for valid image header
      const isValidImage = this.validateImageHeader(buffer, file.mimetype);
      if (!isValidImage) {
        throw new Error("Invalid image file");
      }
    }
  }

  private validateImageHeader(buffer: Buffer, mimeType: string): boolean {
    // Basic image header validation
    const headers = {
      "image/jpeg": [0xFF, 0xD8],
      "image/png": [0x89, 0x50, 0x4E, 0x47],
      "image/gif": [0x47, 0x49, 0x46],
      "image/webp": [0x52, 0x49, 0x46, 0x46],
    };

    const header = headers[mimeType as keyof typeof headers];
    if (!header) return true; // Skip validation for unknown types

    for (let i = 0; i < header.length; i++) {
      if (buffer[i] !== header[i]) {
        return false;
      }
    }

    return true;
  }

  private async processFile(
    buffer: Buffer,
    mimeType: string,
    options?: ProcessingOptions
  ): Promise<Buffer> {
    if (!options || !this.isImage(mimeType)) {
      return buffer;
    }

    // In production, use sharp or similar library for image processing
    // const sharp = require('sharp');
    // let image = sharp(buffer);
    
    // if (options.maxWidth || options.maxHeight) {
    //   image = image.resize(options.maxWidth, options.maxHeight, {
    //     fit: 'inside',
    //     withoutEnlargement: true
    //   });
    // }
    
    // if (options.quality && (mimeType === 'image/jpeg' || mimeType === 'image/webp')) {
    //   image = image.jpeg({ quality: options.quality });
    // }
    
    // return await image.toBuffer();

    // Mock processing for development
    console.log("Mock: Processing image with options:", options);
    return buffer;
  }

  private async generateThumbnail(
    buffer: Buffer,
    mimeType: string,
    size?: { width: number; height: number }
  ): Promise<Buffer> {
    if (!this.isImage(mimeType)) {
      throw new Error("Cannot generate thumbnail for non-image file");
    }

    const thumbnailSize = size || { width: 200, height: 200 };

    // In production, use sharp or similar library
    // const sharp = require('sharp');
    // return await sharp(buffer)
    //   .resize(thumbnailSize.width, thumbnailSize.height, {
    //     fit: 'cover',
    //     position: 'center'
    //   })
    //   .jpeg({ quality: 80 })
    //   .toBuffer();

    // Mock thumbnail generation
    console.log("Mock: Generating thumbnail with size:", thumbnailSize);
    return buffer;
  }

  private async extractMetadata(buffer: Buffer, mimeType: string): Promise<Record<string, any>> {
    const metadata: Record<string, any> = {};

    if (this.isImage(mimeType)) {
      // In production, extract EXIF data and image dimensions
      // const sharp = require('sharp');
      // const imageInfo = await sharp(buffer).metadata();
      // metadata.width = imageInfo.width;
      // metadata.height = imageInfo.height;
      // metadata.format = imageInfo.format;
      // metadata.density = imageInfo.density;

      // Mock metadata extraction
      metadata.width = 1920;
      metadata.height = 1080;
      metadata.format = mimeType.split("/")[1];
    }

    return metadata;
  }

  private isImage(mimeType: string): boolean {
    return mimeType.startsWith("image/");
  }

  private isVideo(mimeType: string): boolean {
    return mimeType.startsWith("video/");
  }

  private isAudio(mimeType: string): boolean {
    return mimeType.startsWith("audio/");
  }

  // Helper method to get file info without uploading
  async getFileInfo(buffer: Buffer, mimeType: string) {
    return {
      size: buffer.length,
      mimeType,
      isImage: this.isImage(mimeType),
      isVideo: this.isVideo(mimeType),
      isAudio: this.isAudio(mimeType),
      metadata: await this.extractMetadata(buffer, mimeType),
    };
  }
}

export const uploadService = new UploadService();

// Upload queue for background processing
export interface UploadJob {
  id: string;
  tenantId: string;
  userId: string;
  file: FileUpload;
  options: any;
  status: "pending" | "processing" | "completed" | "failed";
  result?: UploadResult;
  error?: string;
  createdAt: Date;
  attempts: number;
  maxAttempts: number;
}

class UploadQueue {
  private queue: UploadJob[] = [];
  private processing = false;

  async add(job: Omit<UploadJob, "id" | "status" | "createdAt" | "attempts">): Promise<string> {
    const id = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.queue.push({
      ...job,
      id,
      status: "pending",
      createdAt: new Date(),
      attempts: 0,
    });

    this.processQueue();
    
    return id;
  }

  private async processQueue() {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const job = this.queue.find(j => j.status === "pending");
      if (!job) break;

      job.status = "processing";
      job.attempts++;

      try {
        const result = await uploadService.upload(job.file, job.options);
        job.result = result;
        job.status = "completed";
        console.log(`📁 Upload job ${job.id} completed: ${result.filename}`);
      } catch (error) {
        console.error(`📁 Upload job ${job.id} failed:`, error);
        job.error = error instanceof Error ? error.message : "Unknown error";
        
        if (job.attempts >= job.maxAttempts) {
          job.status = "failed";
        } else {
          job.status = "pending";
        }
      }

      // Remove completed or failed jobs
      if (job.status === "completed" || job.status === "failed") {
        const index = this.queue.indexOf(job);
        this.queue.splice(index, 1);
      }

      // Small delay between jobs
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.processing = false;
  }

  getJob(id: string): UploadJob | undefined {
    return this.queue.find(j => j.id === id);
  }

  getQueueStatus() {
    const pending = this.queue.filter(j => j.status === "pending").length;
    const processing = this.queue.filter(j => j.status === "processing").length;
    
    return {
      pending,
      processing,
      total: this.queue.length,
    };
  }
}

export const uploadQueue = new UploadQueue();