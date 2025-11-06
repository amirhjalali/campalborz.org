"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  Calendar,
  User,
  Tag,
  Clock,
  ExternalLink,
  Grid,
  List
} from "lucide-react";
import { trpc } from "../../lib/trpc";
import SearchBar from "./SearchBar";

interface SearchFilters {
  types: string[];
  dateRange: {
    start?: Date;
    end?: Date;
  };
  author?: string;
  tags: string[];
}

export default function SearchResults() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<SearchFilters>({
    types: [],
    dateRange: {},
    tags: [],
  });
  const [sort, setSort] = useState<{
    field: "relevance" | "date" | "title" | "author";
    direction: "asc" | "desc";
  }>({
    field: "relevance",
    direction: "desc",
  });
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    limit: 20,
    offset: 0,
  });

  // Mock API queries until backend is implemented
  const searchQuery = {
    data: undefined as any,
    isLoading: false,
    refetch: () => Promise.resolve()
  };

  const authorsQuery = {
    data: undefined as any,
    isLoading: false,
    refetch: () => Promise.resolve()
  };

  const tagsQuery = {
    data: undefined as any,
    isLoading: false,
    refetch: () => Promise.resolve()
  };

  // Update URL when search changes
  useEffect(() => {
    if (query !== initialQuery) {
      const url = new URL(window.location.href);
      if (query) {
        url.searchParams.set("q", query);
      } else {
        url.searchParams.delete("q");
      }
      router.replace(url.pathname + url.search);
    }
  }, [query, initialQuery, router]);

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
    setPagination({ limit: 20, offset: 0 });
  };

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination({ limit: 20, offset: 0 });
  };

  const handleSortChange = (field: string, direction?: "asc" | "desc") => {
    setSort({
      field: field as any,
      direction: direction || (sort.field === field && sort.direction === "desc" ? "asc" : "desc"),
    });
    setPagination({ limit: 20, offset: 0 });
  };

  const handleLoadMore = () => {
    setPagination(prev => ({
      ...prev,
      offset: prev.offset + prev.limit,
    }));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "pages": return "📄";
      case "events": return "📅";
      case "members": return "👤";
      case "media": return "🖼️";
      case "donations": return "💝";
      default: return "📄";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "pages": return "bg-blue-100 text-blue-800";
      case "events": return "bg-green-100 text-green-800";
      case "members": return "bg-purple-100 text-purple-800";
      case "media": return "bg-orange-100 text-orange-800";
      case "donations": return "bg-pink-100 text-pink-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  };

  const typeOptions = [
    { value: "pages", label: "Pages", icon: "📄" },
    { value: "events", label: "Events", icon: "📅" },
    { value: "members", label: "Members", icon: "👤" },
    { value: "media", label: "Media", icon: "🖼️" },
    { value: "donations", label: "Donations", icon: "💝" },
    { value: "notifications", label: "Notifications", icon: "🔔" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Search Header */}
      <div className="mb-6">
        <SearchBar
          placeholder="Search everything..."
          onSearch={handleSearch}
          showFilters={true}
          className="max-w-2xl"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Content Types */}
              <div>
                <Label className="text-sm font-medium">Content Types</Label>
                <div className="mt-2 space-y-2">
                  {typeOptions.map((type) => (
                    <div key={type.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={type.value}
                        checked={filters.types.includes(type.value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleFilterChange({
                              types: [...filters.types, type.value],
                            });
                          } else {
                            handleFilterChange({
                              types: filters.types.filter(t => t !== type.value),
                            });
                          }
                        }}
                      />
                      <Label htmlFor={type.value} className="text-sm flex items-center gap-1">
                        <span>{type.icon}</span>
                        {type.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Author Filter */}
              <div>
                <Label className="text-sm font-medium">Author</Label>
                <Select
                  value={filters.author || ""}
                  onValueChange={(value) => handleFilterChange({ author: value || undefined })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Any author" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any author</SelectItem>
                    {authorsQuery.data?.options.map((author) => (
                      <SelectItem key={author.id} value={author.id}>
                        <div className="flex items-center gap-2">
                          {author.avatar && (
                            <img src={author.avatar} alt="" className="w-4 h-4 rounded-full" />
                          )}
                          {author.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tags Filter */}
              <div>
                <Label className="text-sm font-medium">Tags</Label>
                <div className="mt-2 max-h-32 overflow-y-auto space-y-1">
                  {tagsQuery.data?.options.slice(0, 10).map((tag) => (
                    <div key={tag.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`tag-${tag.id}`}
                        checked={filters.tags.includes(tag.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleFilterChange({
                              tags: [...filters.tags, tag.id],
                            });
                          } else {
                            handleFilterChange({
                              tags: filters.tags.filter(t => t !== tag.id),
                            });
                          }
                        }}
                      />
                      <Label htmlFor={`tag-${tag.id}`} className="text-sm">
                        {tag.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {(filters.types.length > 0 || filters.author || filters.tags.length > 0) && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setFilters({
                      types: [],
                      dateRange: {},
                      tags: [],
                    });
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                {searchQuery.data ? (
                  <>
                    {searchQuery.data.total} result{searchQuery.data.total !== 1 ? "s" : ""} 
                    {query && ` for "${query}"`}
                    {searchQuery.data.queryTime && (
                      <span className="ml-2">({searchQuery.data.queryTime}ms)</span>
                    )}
                  </>
                ) : (
                  "Searching..."
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Sort Options */}
              <Select
                value={`${sort.field}-${sort.direction}`}
                onValueChange={(value) => {
                  const [field, direction] = value.split("-") as [any, "asc" | "desc"];
                  setSort({ field, direction });
                }}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance-desc">Most Relevant</SelectItem>
                  <SelectItem value="date-desc">Newest First</SelectItem>
                  <SelectItem value="date-asc">Oldest First</SelectItem>
                  <SelectItem value="title-asc">Title A-Z</SelectItem>
                  <SelectItem value="title-desc">Title Z-A</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode */}
              <div className="flex">
                <Button
                  variant={viewMode === "list" ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Search Results */}
          {searchQuery.isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Searching...</p>
            </div>
          ) : searchQuery.data?.results.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600 mb-4">
                  {query ? `No results found for "${query}"` : "Try searching for something"}
                </p>
                {searchQuery.data?.suggestions && searchQuery.data.suggestions.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Try these suggestions:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {searchQuery.data.suggestions.map((suggestion, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => handleSearch(suggestion)}
                        >
                          {suggestion}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-4"}>
              {searchQuery.data?.results.map((result) => (
                <Card key={result.id} className="hover:shadow-md transition-shadow">
                  <CardContent className={viewMode === "grid" ? "p-4" : "p-4"}>
                    <div className={viewMode === "grid" ? "space-y-3" : "flex gap-4"}>
                      {/* Result Image */}
                      {result.imageUrl && (
                        <div className={viewMode === "grid" ? "w-full h-32" : "w-16 h-16 flex-shrink-0"}>
                          <img
                            src={result.imageUrl}
                            alt=""
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                      )}

                      {/* Result Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <Badge className={`text-xs ${getTypeColor(result.type)}`}>
                              {getTypeIcon(result.type)} {result.type}
                            </Badge>
                            {result.relevance && (
                              <span className="text-xs text-gray-500">
                                {Math.round(result.relevance)}% match
                              </span>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(result.url, "_blank")}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>

                        <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">
                          <a
                            href={result.url}
                            className="hover:text-blue-600 transition-colors"
                          >
                            {result.title}
                          </a>
                        </h3>

                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {result.description}
                        </p>

                        {/* Highlights */}
                        {result.highlights && result.highlights.length > 0 && (
                          <div className="text-xs text-gray-500 mb-2">
                            {result.highlights.map((highlight, index) => (
                              <div
                                key={index}
                                className="line-clamp-1"
                                dangerouslySetInnerHTML={{ __html: highlight }}
                              />
                            ))}
                          </div>
                        )}

                        {/* Metadata */}
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          {result.author && (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {result.author}
                            </div>
                          )}
                          {result.date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(result.date)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Load More */}
          {searchQuery.data && searchQuery.data.results.length > 0 && searchQuery.data.total > searchQuery.data.results.length && (
            <div className="text-center mt-6">
              <Button onClick={handleLoadMore} variant="outline">
                Load More Results
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}