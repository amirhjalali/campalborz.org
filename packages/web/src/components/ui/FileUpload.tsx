"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "./button";
import { Progress } from "./progress";
import { Card, CardContent } from "./card";
import { Badge } from "./badge";
import { X, Upload, FileText, Image, Video, Music, File } from "lucide-react";
import { toast } from "sonner";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  thumbnailUrl?: string;
}

interface FileUploadProps {
  value?: UploadedFile[];
  onChange?: (files: UploadedFile[]) => void;
  multiple?: boolean;
  accept?: string[];
  maxSize?: number; // in MB
  maxFiles?: number;
  folder?: string;
  className?: string;
  disabled?: boolean;
  showPreview?: boolean;
}

export default function FileUpload({
  value = [],
  onChange,
  multiple = false,
  accept = ["image/*", "video/*", "audio/*", "application/pdf", "text/*"],
  maxSize = 10,
  maxFiles = multiple ? 10 : 1,
  folder,
  className = "",
  disabled = false,
  showPreview = true,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    rejectedFiles.forEach((rejection) => {
      const { file, errors } = rejection;
      errors.forEach((error: any) => {
        if (error.code === "file-too-large") {
          toast.error(`${file.name} is too large. Maximum size is ${maxSize}MB.`);
        } else if (error.code === "file-invalid-type") {
          toast.error(`${file.name} is not a supported file type.`);
        } else {
          toast.error(`Error with ${file.name}: ${error.message}`);
        }
      });
    });

    if (acceptedFiles.length === 0) return;

    // Check if adding these files would exceed maxFiles
    if (value.length + acceptedFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} file(s) allowed.`);
      return;
    }

    setUploading(true);
    const newFiles: UploadedFile[] = [];

    for (const file of acceptedFiles) {
      try {
        const fileId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

        // Create FormData
        const formData = new FormData();
        formData.append("file", file);
        if (folder) formData.append("folder", folder);

        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            const current = prev[fileId] || 0;
            if (current >= 90) {
              clearInterval(progressInterval);
              return prev;
            }
            return { ...prev, [fileId]: current + 10 };
          });
        }, 200);

        // In production, replace with actual upload API call
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

        // Mock successful upload response
        const uploadedFile: UploadedFile = {
          id: fileId,
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file), // In production, this would be the server URL
          thumbnailUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
        };

        newFiles.push(uploadedFile);
        setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));

        // Clean up progress after a delay
        setTimeout(() => {
          setUploadProgress(prev => {
            const { [fileId]: _, ...rest } = prev;
            return rest;
          });
        }, 1000);

      } catch (error) {
        toast.error(`Failed to upload ${file.name}`);
        console.error("Upload error:", error);
      }
    }

    setUploading(false);

    // Update the value
    const updatedFiles = multiple ? [...value, ...newFiles] : newFiles;
    onChange?.(updatedFiles);

    if (newFiles.length > 0) {
      toast.success(`Successfully uploaded ${newFiles.length} file(s)`);
    }
  }, [value, onChange, multiple, maxSize, maxFiles, folder]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize: maxSize * 1024 * 1024,
    multiple,
    disabled: disabled || uploading,
  });

  const removeFile = (fileId: string) => {
    const updatedFiles = value.filter(file => file.id !== fileId);
    onChange?.(updatedFiles);
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + " " + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <Image className="h-4 w-4" />;
    if (type.startsWith("video/")) return <Video className="h-4 w-4" />;
    if (type.startsWith("audio/")) return <Music className="h-4 w-4" />;
    if (type.includes("pdf") || type.startsWith("text/")) return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all
          ${isDragActive 
            ? "border-blue-400 bg-blue-50" 
            : disabled 
              ? "border-gray-200 bg-gray-50 cursor-not-allowed" 
              : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
          }
          ${uploading ? "pointer-events-none opacity-60" : ""}
        `}
      >
        <input {...getInputProps()} />
        <Upload className="h-8 w-8 mx-auto mb-3 text-gray-400" />
        
        {isDragActive ? (
          <p className="text-blue-600">Drop the files here...</p>
        ) : (
          <div>
            <p className="text-base font-medium">
              {multiple ? "Drag & drop files here, or click to select" : "Drag & drop a file here, or click to select"}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {accept.join(", ")} up to {maxSize}MB
              {multiple && ` (max ${maxFiles} files)`}
            </p>
          </div>
        )}

        {uploading && (
          <div className="mt-4">
            <div className="text-sm text-blue-600 mb-2">Uploading...</div>
          </div>
        )}
      </div>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2">
          {Object.entries(uploadProgress).map(([fileId, progress]) => (
            <div key={fileId} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          ))}
        </div>
      )}

      {/* File List */}
      {value.length > 0 && showPreview && (
        <div className="space-y-2">
          <div className="text-sm font-medium">
            Uploaded Files ({value.length}{multiple ? `/${maxFiles}` : ""})
          </div>
          <div className="space-y-2">
            {value.map((file) => (
              <Card key={file.id} className="p-3">
                <div className="flex items-center gap-3">
                  {/* File Icon/Thumbnail */}
                  <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center overflow-hidden">
                    {file.thumbnailUrl ? (
                      <img 
                        src={file.thumbnailUrl} 
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      getFileIcon(file.type)
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{file.name}</div>
                    <div className="text-xs text-gray-500">
                      {formatFileSize(file.size)} • {file.type}
                    </div>
                  </div>

                  {/* File Status */}
                  <Badge variant="secondary" className="text-xs">
                    Uploaded
                  </Badge>

                  {/* Remove Button */}
                  {!disabled && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* File Count Info */}
      {multiple && value.length > 0 && (
        <div className="text-xs text-gray-500 text-center">
          {value.length} of {maxFiles} files selected
        </div>
      )}
    </div>
  );
}