"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./dialog";
import { Button } from "./button";
import { Input } from "./input";
import { Card, CardContent } from "./card";
import { Badge } from "./badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Search, Upload, Check, Image, Video, Music, FileText, File } from "lucide-react";
import { trpc } from "../../lib/trpc";
import FileUpload from "./FileUpload";

interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  thumbnailUrl?: string;
  mimeType: string;
  size: number;
  folder?: string;
  alt?: string;
  caption?: string;
  tags: string[];
}

interface MediaSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (files: MediaFile[]) => void;
  multiple?: boolean;
  accept?: ("image" | "video" | "audio" | "document")[];
  title?: string;
  folder?: string;
}

export default function MediaSelector({
  open,
  onOpenChange,
  onSelect,
  multiple = false,
  accept = ["image", "video", "audio", "document"],
  title = "Select Media",
  folder,
}: MediaSelectorProps) {
  const [selectedFiles, setSelectedFiles] = useState<MediaFile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string>(folder || "");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"browse" | "upload">("browse");

  // API queries
  const mediaQuery = trpc.upload.getMedia.useQuery({
    search: searchQuery || undefined,
    folder: selectedFolder || undefined,
    type: selectedType === "all" ? "all" : (selectedType as any),
    limit: 50,
  });

  const foldersQuery = trpc.upload.getFolders.useQuery();

  const formatFileSize = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + " " + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return <Image className="h-4 w-4" />;
    if (mimeType.startsWith("video/")) return <Video className="h-4 w-4" />;
    if (mimeType.startsWith("audio/")) return <Music className="h-4 w-4" />;
    if (mimeType.includes("pdf") || mimeType.startsWith("text/")) return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const isFileTypeAccepted = (mimeType: string) => {
    if (accept.includes("image") && mimeType.startsWith("image/")) return true;
    if (accept.includes("video") && mimeType.startsWith("video/")) return true;
    if (accept.includes("audio") && mimeType.startsWith("audio/")) return true;
    if (accept.includes("document") && (mimeType.includes("pdf") || mimeType.startsWith("text/") || mimeType.includes("document"))) return true;
    return false;
  };

  const toggleFileSelection = (file: MediaFile) => {
    if (!isFileTypeAccepted(file.mimeType)) return;

    if (multiple) {
      if (selectedFiles.some(f => f.id === file.id)) {
        setSelectedFiles(selectedFiles.filter(f => f.id !== file.id));
      } else {
        setSelectedFiles([...selectedFiles, file]);
      }
    } else {
      if (selectedFiles.some(f => f.id === file.id)) {
        setSelectedFiles([]);
      } else {
        setSelectedFiles([file]);
      }
    }
  };

  const handleSelect = () => {
    onSelect(selectedFiles);
    setSelectedFiles([]);
    onOpenChange(false);
  };

  const handleUploadComplete = (uploadedFiles: any[]) => {
    // Convert uploaded files to MediaFile format
    const mediaFiles: MediaFile[] = uploadedFiles.map(file => ({
      id: file.id,
      filename: file.filename || file.name,
      originalName: file.name,
      url: file.url,
      thumbnailUrl: file.thumbnailUrl,
      mimeType: file.type,
      size: file.size,
      folder: folder,
      alt: "",
      caption: "",
      tags: [],
    }));

    if (multiple) {
      setSelectedFiles([...selectedFiles, ...mediaFiles]);
    } else {
      setSelectedFiles(mediaFiles.slice(0, 1));
    }

    // Refresh the media query to show newly uploaded files
    mediaQuery.refetch();
    
    // Switch to browse tab to see the uploaded files
    setActiveTab("browse");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <p className="text-sm text-gray-600">
            {multiple 
              ? `Select multiple files (${selectedFiles.length} selected)` 
              : "Select a file"
            } • Accepted types: {accept.join(", ")}
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="browse">Browse Library</TabsTrigger>
              <TabsTrigger value="upload">Upload New</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="flex-1 overflow-auto">
              <div className="p-4">
                <FileUpload
                  multiple={multiple}
                  folder={folder}
                  onChange={handleUploadComplete}
                  accept={accept.map(type => {
                    switch (type) {
                      case "image": return "image/*";
                      case "video": return "video/*";
                      case "audio": return "audio/*";
                      case "document": return "application/pdf,text/*";
                      default: return "*/*";
                    }
                  })}
                />
              </div>
            </TabsContent>

            <TabsContent value="browse" className="flex-1 overflow-hidden flex flex-col">
              {/* Filters */}
              <div className="p-4 border-b">
                <div className="flex gap-4 items-center">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search files..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {accept.includes("image") && <SelectItem value="image">Images</SelectItem>}
                      {accept.includes("video") && <SelectItem value="video">Videos</SelectItem>}
                      {accept.includes("audio") && <SelectItem value="audio">Audio</SelectItem>}
                      {accept.includes("document") && <SelectItem value="document">Documents</SelectItem>}
                    </SelectContent>
                  </Select>

                  <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Folders" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Folders</SelectItem>
                      {foldersQuery.data?.map((folder) => (
                        <SelectItem key={folder} value={folder}>
                          {folder}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Media Grid */}
              <div className="flex-1 overflow-auto p-4">
                {mediaQuery.isLoading ? (
                  <div className="text-center py-8">Loading media...</div>
                ) : mediaQuery.data?.media.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No media files found. Upload some files to get started.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {mediaQuery.data?.media
                      .filter(file => isFileTypeAccepted(file.mimeType))
                      .map((file) => {
                        const isSelected = selectedFiles.some(f => f.id === file.id);
                        const isAccepted = isFileTypeAccepted(file.mimeType);
                        
                        return (
                          <Card
                            key={file.id}
                            className={`cursor-pointer transition-all hover:shadow-md relative ${
                              isSelected ? "ring-2 ring-blue-500" : ""
                            } ${!isAccepted ? "opacity-50 cursor-not-allowed" : ""}`}
                            onClick={() => toggleFileSelection(file)}
                          >
                            <CardContent className="p-2">
                              <div className="space-y-2">
                                <div className="aspect-square bg-gray-100 rounded flex items-center justify-center overflow-hidden relative">
                                  {file.thumbnailUrl || file.mimeType.startsWith("image/") ? (
                                    <img 
                                      src={file.thumbnailUrl || file.url} 
                                      alt={file.alt || file.originalName}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="text-2xl text-gray-400">
                                      {getFileIcon(file.mimeType)}
                                    </div>
                                  )}
                                  
                                  {isSelected && (
                                    <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full p-1">
                                      <Check className="h-3 w-3" />
                                    </div>
                                  )}
                                </div>
                                
                                <div>
                                  <div className="text-xs font-medium truncate" title={file.originalName}>
                                    {file.originalName}
                                  </div>
                                  <div className="text-xs text-gray-500">{formatFileSize(file.size)}</div>
                                  {file.folder && (
                                    <Badge variant="secondary" className="text-xs mt-1">
                                      {file.folder}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => {
            setSelectedFiles([]);
            onOpenChange(false);
          }}>
            Cancel
          </Button>
          <Button 
            onClick={handleSelect}
            disabled={selectedFiles.length === 0}
          >
            Select {selectedFiles.length > 0 && `(${selectedFiles.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}