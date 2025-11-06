"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Progress } from "../ui/progress";
import { 
  Database, 
  Server, 
  Trash2, 
  RefreshCw, 
  Zap, 
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  HardDrive,
  Wifi,
  WifiOff
} from "lucide-react";
import { trpc } from "../../lib/trpc";
import { toast } from "sonner";

interface CacheManagementProps {
  tenantId: string;
}

export default function CacheManagement({ tenantId }: CacheManagementProps) {
  const [selectedKey, setSelectedKey] = useState("");
  const [newCacheKey, setNewCacheKey] = useState("");
  const [newCacheValue, setNewCacheValue] = useState("");
  const [newCacheTTL, setNewCacheTTL] = useState("3600");
  const [tagsToInvalidate, setTagsToInvalidate] = useState("");
  const [keysToDelete, setKeysToDelete] = useState("");

  // API queries - using mock data until backend is implemented
  const statsQuery = { data: undefined as any, refetch: () => Promise.resolve(), isLoading: false };
  const healthQuery = { data: undefined as any, refetch: () => Promise.resolve(), isLoading: false };
  const configQuery = { data: undefined as any, refetch: () => Promise.resolve(), isLoading: false };
  const getCacheQuery = { data: undefined as any, refetch: () => Promise.resolve(), isLoading: false };

  // API mutations - using mock until backend is implemented
  const setCacheMutation = { mutate: (args?: any) => {}, isLoading: false };
  const deleteMutation = { mutate: (args?: any) => {}, isLoading: false };
  const deleteManyMutation = { mutate: (args?: any) => {}, isLoading: false };
  const invalidateTagsMutation = { mutate: (args?: any) => {}, isLoading: false };
  const flushMutation = { mutate: (args?: any) => {}, isLoading: false };
  const warmMutation = { mutate: (args?: any) => {}, isLoading: false };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleSetCache = () => {
    if (!newCacheKey || !newCacheValue) {
      toast.error("Please provide both key and value");
      return;
    }

    try {
      const value = JSON.parse(newCacheValue);
      setCacheMutation.mutate({
        key: newCacheKey,
        value,
        ttl: parseInt(newCacheTTL),
      });
    } catch (error) {
      toast.error("Invalid JSON format for value");
    }
  };

  const handleDeleteMany = () => {
    if (!keysToDelete.trim()) {
      toast.error("Please provide keys to delete");
      return;
    }

    const keys = keysToDelete.split(",").map(k => k.trim()).filter(Boolean);
    deleteManyMutation.mutate({ keys });
  };

  const handleInvalidateTags = () => {
    if (!tagsToInvalidate.trim()) {
      toast.error("Please provide tags to invalidate");
      return;
    }

    const tags = tagsToInvalidate.split(",").map(t => t.trim()).filter(Boolean);
    invalidateTagsMutation.mutate({ tags });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Cache Management</h1>
          <p className="text-gray-600">Monitor and manage your application cache</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              statsQuery.refetch();
              healthQuery.refetch();
              configQuery.refetch();
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => warmMutation.mutate()}
            disabled={warmMutation.isLoading}
          >
            <Zap className="h-4 w-4 mr-2" />
            Warm Cache
          </Button>
        </div>
      </div>

      {/* Health Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cache Health</p>
                <p className="text-2xl font-bold flex items-center gap-2">
                  {healthQuery.data?.healthy ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Healthy
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      Unhealthy
                    </>
                  )}
                </p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Redis Status</p>
                <p className="text-2xl font-bold flex items-center gap-2">
                  {statsQuery.data?.redis.connected ? (
                    <>
                      <Wifi className="h-5 w-5 text-green-600" />
                      Connected
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-5 w-5 text-red-600" />
                      Disconnected
                    </>
                  )}
                </p>
              </div>
              <Server className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Keys</p>
                <p className="text-2xl font-bold">
                  {(statsQuery.data?.redis.keys || 0) + (statsQuery.data?.memory.keys || 0)}
                </p>
              </div>
              <Database className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="inspect">Inspect</TabsTrigger>
          <TabsTrigger value="manage">Manage</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Cache Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Redis Cache
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Keys</span>
                  <span className="font-medium">{statsQuery.data?.redis.keys || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Memory Usage</span>
                  <span className="font-medium">{formatBytes(statsQuery.data?.redis.memory || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <Badge variant={statsQuery.data?.redis.connected ? "default" : "destructive"}>
                    {statsQuery.data?.redis.connected ? "Connected" : "Disconnected"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5" />
                  Memory Cache
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Keys</span>
                  <span className="font-medium">{statsQuery.data?.memory.keys || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Memory Usage</span>
                  <span className="font-medium">{formatBytes(statsQuery.data?.memory.memory || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <Badge variant="default">Active</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Last Updated */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Last updated</span>
                </div>
                <span className="text-sm font-medium">
                  {healthQuery.data?.timestamp 
                    ? new Date(healthQuery.data.timestamp).toLocaleString()
                    : "Never"
                  }
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inspect" className="space-y-6">
          {/* Cache Key Inspector */}
          <Card>
            <CardHeader>
              <CardTitle>Cache Inspector</CardTitle>
              <p className="text-sm text-gray-600">Inspect individual cache keys and their values</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter cache key (e.g., user:123, events:list)"
                  value={selectedKey}
                  onChange={(e) => setSelectedKey(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={() => getCacheQuery.refetch()} disabled={!selectedKey}>
                  Inspect
                </Button>
              </div>

              {getCacheQuery.data && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Key</Label>
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {getCacheQuery.data.key}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Exists</Label>
                    <Badge variant={getCacheQuery.data.exists ? "default" : "secondary"}>
                      {getCacheQuery.data.exists ? "Yes" : "No"}
                    </Badge>
                  </div>

                  {getCacheQuery.data.exists && getCacheQuery.data.value && (
                    <>
                      <div>
                        <Label>Value</Label>
                        <Textarea
                          value={JSON.stringify(getCacheQuery.data.value, null, 2)}
                          readOnly
                          className="mt-2 font-mono text-sm h-40"
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => deleteMutation.mutate({ key: selectedKey })}
                          disabled={deleteMutation.isLoading}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Key
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          {/* Set Cache Value */}
          <Card>
            <CardHeader>
              <CardTitle>Set Cache Value</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="cache-key">Cache Key</Label>
                <Input
                  id="cache-key"
                  placeholder="Enter cache key"
                  value={newCacheKey}
                  onChange={(e) => setNewCacheKey(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="cache-value">Value (JSON)</Label>
                <Textarea
                  id="cache-value"
                  placeholder='{"example": "value"}'
                  value={newCacheValue}
                  onChange={(e) => setNewCacheValue(e.target.value)}
                  className="h-32"
                />
              </div>
              
              <div>
                <Label htmlFor="cache-ttl">TTL (seconds)</Label>
                <Input
                  id="cache-ttl"
                  type="number"
                  placeholder="3600"
                  value={newCacheTTL}
                  onChange={(e) => setNewCacheTTL(e.target.value)}
                />
              </div>
              
              <Button onClick={handleSetCache} disabled={setCacheMutation.isLoading}>
                {setCacheMutation.isLoading ? "Setting..." : "Set Cache Value"}
              </Button>
            </CardContent>
          </Card>

          {/* Delete Multiple Keys */}
          <Card>
            <CardHeader>
              <CardTitle>Delete Multiple Keys</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="keys-to-delete">Keys (comma-separated)</Label>
                <Input
                  id="keys-to-delete"
                  placeholder="key1, key2, key3"
                  value={keysToDelete}
                  onChange={(e) => setKeysToDelete(e.target.value)}
                />
              </div>
              
              <Button 
                variant="danger" 
                onClick={handleDeleteMany} 
                disabled={deleteManyMutation.isLoading}
              >
                {deleteManyMutation.isLoading ? "Deleting..." : "Delete Keys"}
              </Button>
            </CardContent>
          </Card>

          {/* Invalidate by Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Invalidate by Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="tags-to-invalidate">Tags (comma-separated)</Label>
                <Input
                  id="tags-to-invalidate"
                  placeholder="users, events, pages"
                  value={tagsToInvalidate}
                  onChange={(e) => setTagsToInvalidate(e.target.value)}
                />
              </div>
              
              <Button 
                variant="danger" 
                onClick={handleInvalidateTags} 
                disabled={invalidateTagsMutation.isLoading}
              >
                {invalidateTagsMutation.isLoading ? "Invalidating..." : "Invalidate Tags"}
              </Button>
            </CardContent>
          </Card>

          {/* Flush All Cache */}
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <h4 className="font-medium text-red-800 mb-2">Flush All Cache</h4>
                <p className="text-sm text-red-600 mb-4">
                  This will permanently delete all cached data. This action cannot be undone.
                </p>
                <Button 
                  variant="danger" 
                  onClick={() => {
                    if (confirm("Are you sure you want to flush all cache data?")) {
                      flushMutation.mutate();
                    }
                  }}
                  disabled={flushMutation.isLoading}
                >
                  {flushMutation.isLoading ? "Flushing..." : "Flush All Cache"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-6">
          {/* Cache Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Cache Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {configQuery.data && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Default TTL</Label>
                      <p className="text-sm text-gray-600">{configQuery.data.config.defaultTTL} seconds</p>
                    </div>
                    <div>
                      <Label>Compression</Label>
                      <p className="text-sm text-gray-600">
                        {configQuery.data.config.enableCompression ? "Enabled" : "Disabled"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label>Common Cache Keys</Label>
                    <div className="mt-2 space-y-2">
                      {configQuery.data.commonKeys.map((key, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="font-mono text-sm">{key.pattern}</span>
                          <span className="text-xs text-gray-500">{key.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Available Tags</Label>
                    <div className="mt-2 space-y-2">
                      {configQuery.data.tags.map((tag, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="font-mono text-sm">{tag.name}</span>
                          <span className="text-xs text-gray-500">{tag.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              {configQuery.data?.recommendations && configQuery.data.recommendations.length > 0 ? (
                <div className="space-y-3">
                  {configQuery.data.recommendations.map((rec, index) => (
                    <div 
                      key={index} 
                      className={`p-4 rounded-lg border ${
                        rec.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                        rec.type === 'info' ? 'border-blue-200 bg-blue-50' :
                        'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <AlertCircle className={`h-5 w-5 mt-0.5 ${
                          rec.type === 'warning' ? 'text-yellow-600' :
                          rec.type === 'info' ? 'text-blue-600' :
                          'text-gray-600'
                        }`} />
                        <div>
                          <h4 className="font-medium">{rec.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                          <Badge variant="secondary" className="mt-2 text-xs">
                            {rec.priority} priority
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">All Good!</h3>
                  <p className="text-gray-600">Your cache configuration looks optimal.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}