"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { trpc } from "../../lib/trpc";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Upload, Search, Filter, Grid, List, Trash2, Edit, Download, Share, Eye } from "lucide-react";
import { toast } from "sonner";

interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  thumbnailUrl?: string;
  mimeType: string;
  size: number;
  alt?: string;
  caption?: string;
  tags: string[];
  folder?: string;
  uploader: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export default function MediaLibrary() {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [editingFile, setEditingFile] = useState<MediaFile | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [uploadFolder, setUploadFolder] = useState<string>("");

  // API queries - using mock data until backend is implemented
  const mediaQuery = { data: undefined, refetch: () => Promise.resolve(), isLoading: false };
  const foldersQuery = { data: undefined, isLoading: false };
  const tagsQuery = { data: undefined, isLoading: false };
  const statsQuery = { data: undefined, isLoading: false };

  // API mutations - using mock until backend is implemented
  const updateMediaMutation = { mutate: () => {}, isLoading: false };
  const deleteMediaMutation = { mutate: () => {}, isLoading: false };

  // File upload with dropzone
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      try {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", uploadFolder);

        // In production, this would upload to your API endpoint
        toast.success(`Uploaded ${file.name}`);
        mediaQuery.refetch();
      } catch (error) {
        toast.error(`Failed to upload ${file.name}`);
      }
    }
  }, [uploadFolder, mediaQuery]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
      "video/*": [".mp4", ".webm"],
      "audio/*": [".mp3", ".wav", ".ogg"],
      "application/pdf": [".pdf"],
      "text/*": [".txt", ".csv"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const formatFileSize = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + " " + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return "🖼️";
    if (mimeType.startsWith("video/")) return "🎥";
    if (mimeType.startsWith("audio/")) return "🎵";
    if (mimeType.includes("pdf")) return "📄";
    return "📁";
  };

  const handleUpdateMedia = (data: any) => {
    if (!editingFile) return;
    
    updateMediaMutation.mutate({
      id: editingFile.id,
      ...data,
    });
  };

  const handleDeleteSelected = () => {
    if (selectedFiles.length === 0) return;
    
    selectedFiles.forEach(fileId => {
      deleteMediaMutation.mutate({ id: fileId });
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Media Library</h1>
          <p className="text-gray-600">Manage your uploaded files and media</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      {statsQuery.data && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{statsQuery.data.totalFiles}</div>
              <div className="text-sm text-gray-600">Total Files</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{formatFileSize(statsQuery.data.totalSize)}</div>
              <div className="text-sm text-gray-600">Total Size</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{statsQuery.data.categories.images}</div>
              <div className="text-sm text-gray-600">Images</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{statsQuery.data.categories.documents}</div>
              <div className="text-sm text-gray-600">Documents</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="library" className="space-y-6">
        <TabsList>
          <TabsTrigger value="library">Media Library</TabsTrigger>
          <TabsTrigger value="upload">Upload Files</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          {/* Upload Area */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Files</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="upload-folder">Folder (optional)</Label>
                  <Input
                    id="upload-folder"
                    placeholder="e.g., events, profiles, art"
                    value={uploadFolder}
                    onChange={(e) => setUploadFolder(e.target.value)}
                  />
                </div>
              </div>
              
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                {isDragActive ? (
                  <p className="text-blue-600">Drop the files here...</p>
                ) : (
                  <div>
                    <p className="text-lg font-medium">Drag & drop files here, or click to select</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Supports images, videos, audio, documents up to 10MB
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="library" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px]">
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
                    <SelectItem value="image">Images</SelectItem>
                    <SelectItem value="video">Videos</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="document">Documents</SelectItem>
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

                {selectedFiles.length > 0 && (
                  <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete ({selectedFiles.length})
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Media Grid/List */}
          {mediaQuery.isLoading ? (
            <div className="text-center py-8">Loading media...</div>
          ) : mediaQuery.data?.media.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No media files found. Upload some files to get started.
            </div>
          ) : (
            <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4" : "space-y-2"}>
              {mediaQuery.data?.media.map((file) => (
                <Card
                  key={file.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedFiles.includes(file.id) ? "ring-2 ring-blue-500" : ""
                  } ${viewMode === "list" ? "flex" : ""}`}
                  onClick={() => {
                    if (selectedFiles.includes(file.id)) {
                      setSelectedFiles(selectedFiles.filter(id => id !== file.id));
                    } else {
                      setSelectedFiles([...selectedFiles, file.id]);
                    }
                  }}
                >
                  <CardContent className={`p-3 ${viewMode === "list" ? "flex items-center gap-4 flex-1" : ""}`}>
                    {viewMode === "grid" ? (
                      <div className="space-y-2">
                        <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                          {file.thumbnailUrl ? (
                            <img 
                              src={file.thumbnailUrl} 
                              alt={file.alt || file.originalName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-3xl">{getFileIcon(file.mimeType)}</div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-sm truncate" title={file.originalName}>
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
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                          {file.thumbnailUrl ? (
                            <img 
                              src={file.thumbnailUrl} 
                              alt={file.alt || file.originalName}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <div className="text-lg">{getFileIcon(file.mimeType)}</div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{file.originalName}</div>
                          <div className="text-sm text-gray-500">
                            {formatFileSize(file.size)} • {file.uploader.name} • {new Date(file.createdAt).toLocaleDateString()}
                          </div>
                          {file.folder && (
                            <Badge variant="secondary" className="text-xs mt-1">
                              {file.folder}
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFile(file);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingFile(file);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* File Details Modal */}
      <Dialog open={!!selectedFile} onOpenChange={() => setSelectedFile(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>File Details</DialogTitle>
          </DialogHeader>
          {selectedFile && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                  {selectedFile.thumbnailUrl || selectedFile.mimeType.startsWith("image/") ? (
                    <img 
                      src={selectedFile.thumbnailUrl || selectedFile.url} 
                      alt={selectedFile.alt || selectedFile.originalName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-4xl">{getFileIcon(selectedFile.mimeType)}</div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div>
                    <div className="font-medium">{selectedFile.originalName}</div>
                    <div className="text-sm text-gray-500">{selectedFile.filename}</div>
                  </div>
                  <div className="text-sm">
                    <div>Size: {formatFileSize(selectedFile.size)}</div>
                    <div>Type: {selectedFile.mimeType}</div>
                    <div>Uploaded: {new Date(selectedFile.createdAt).toLocaleString()}</div>
                    <div>By: {selectedFile.uploader.name}</div>
                  </div>
                  {selectedFile.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {selectedFile.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {selectedFile.caption && (
                <div>
                  <Label>Caption</Label>
                  <p className="text-sm text-gray-600">{selectedFile.caption}</p>
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => window.open(selectedFile.url, "_blank")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedFile.url);
                    toast.success("URL copied to clipboard");
                  }}
                >
                  <Share className="h-4 w-4 mr-2" />
                  Copy URL
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingFile(selectedFile);
                    setSelectedFile(null);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit File Modal */}
      <Dialog open={!!editingFile} onOpenChange={() => setEditingFile(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit File</DialogTitle>
          </DialogHeader>
          {editingFile && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleUpdateMedia({
                  alt: formData.get("alt") as string,
                  caption: formData.get("caption") as string,
                  folder: formData.get("folder") as string,
                  tags: (formData.get("tags") as string).split(",").map(tag => tag.trim()).filter(Boolean),
                });
              }}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="alt">Alt Text</Label>
                <Input
                  id="alt"
                  name="alt"
                  defaultValue={editingFile.alt || ""}
                  placeholder="Describe the image for accessibility"
                />
              </div>
              <div>
                <Label htmlFor="caption">Caption</Label>
                <Textarea
                  id="caption"
                  name="caption"
                  defaultValue={editingFile.caption || ""}
                  placeholder="Add a caption for this file"
                />
              </div>
              <div>
                <Label htmlFor="folder">Folder</Label>
                <Input
                  id="folder"
                  name="folder"
                  defaultValue={editingFile.folder || ""}
                  placeholder="e.g., events, profiles, art"
                />
              </div>
              <div>
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  name="tags"
                  defaultValue={editingFile.tags.join(", ")}
                  placeholder="Enter tags separated by commas"
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingFile(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMediaMutation.isLoading}>
                  {updateMediaMutation.isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}