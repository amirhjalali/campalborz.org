"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Search, X, Clock, TrendingUp, Filter } from "lucide-react";
import { trpc } from "../../lib/trpc";
import { useDebounce } from "../../hooks/useDebounce";

interface SearchBarProps {
  placeholder?: string;
  showFilters?: boolean;
  onSearch?: (query: string) => void;
  className?: string;
}

interface QuickSearchResult {
  id: string;
  type: string;
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
}

export default function SearchBar({ 
  placeholder = "Search everything...", 
  showFilters = false,
  onSearch,
  className = "" 
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search query for API calls
  const debouncedQuery = useDebounce(query, 300);

  // API queries
  const quickSearchQuery = trpc.search.quickSearch.useQuery(
    { query: debouncedQuery, limit: 5 },
    { 
      enabled: debouncedQuery.length >= 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  );

  const suggestionsQuery = trpc.search.getSuggestions.useQuery(
    { query: debouncedQuery, limit: 8 },
    { 
      enabled: debouncedQuery.length >= 1,
      staleTime: 1000 * 60 * 10, // 10 minutes
    }
  );

  const saveSearchMutation = trpc.search.saveSearch.useMutation();

  // Handle input focus
  const handleFocus = () => {
    setIsOpen(true);
    setShowSuggestions(true);
  };

  // Handle search submission
  const handleSearch = (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;

    // Save search to history
    saveSearchMutation.mutate({ 
      query: searchQuery,
      resultsCount: quickSearchQuery.data?.total,
    });

    // Call external search handler or navigate to search page
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }

    setIsOpen(false);
    setQuery(searchQuery);
    inputRef.current?.blur();
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  // Handle result click
  const handleResultClick = (result: QuickSearchResult) => {
    // Save search to history
    saveSearchMutation.mutate({ 
      query: query,
      resultsCount: quickSearchQuery.data?.total,
    });

    router.push(result.url);
    setIsOpen(false);
    setQuery("");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    } else if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
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

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-12"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setIsOpen(false);
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
        {showFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute inset-y-0 right-8 flex items-center"
            onClick={() => router.push(`/search?q=${encodeURIComponent(query)}`)}
          >
            <Filter className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search Dropdown */}
      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-96 overflow-y-auto">
          <CardContent className="p-0">
            {/* Quick Results */}
            {debouncedQuery.length >= 2 && quickSearchQuery.data?.results && quickSearchQuery.data.results.length > 0 && (
              <div className="border-b border-gray-100">
                <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Quick Results
                </div>
                {quickSearchQuery.data.results.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      {result.imageUrl ? (
                        <img 
                          src={result.imageUrl} 
                          alt=""
                          className="w-8 h-8 rounded object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-sm">
                          {getTypeIcon(result.type)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">{result.title}</span>
                          <Badge className={`text-xs ${getTypeColor(result.type)}`}>
                            {result.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 truncate">{result.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
                {quickSearchQuery.data.total > quickSearchQuery.data.results.length && (
                  <button
                    onClick={() => handleSearch()}
                    className="w-full text-left px-4 py-2 text-xs text-blue-600 hover:bg-blue-50 border-t border-gray-100"
                  >
                    See all {quickSearchQuery.data.total} results
                  </button>
                )}
              </div>
            )}

            {/* Suggestions */}
            {showSuggestions && suggestionsQuery.data && (
              <div>
                {/* Content Suggestions */}
                {suggestionsQuery.data.categories.content.length > 0 && (
                  <div className="border-b border-gray-100">
                    <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Content
                    </div>
                    {suggestionsQuery.data.categories.content.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <Search className="h-3 w-3 text-gray-400" />
                          {suggestion}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Recent Searches */}
                {suggestionsQuery.data.categories.history.length > 0 && (
                  <div className="border-b border-gray-100">
                    <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Recent
                    </div>
                    {suggestionsQuery.data.categories.history.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 text-gray-400" />
                          {suggestion}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Popular Searches */}
                {suggestionsQuery.data.categories.popular.length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Popular
                    </div>
                    {suggestionsQuery.data.categories.popular.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-3 w-3 text-gray-400" />
                          {suggestion}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Empty State */}
                {debouncedQuery.length >= 2 && 
                 (!quickSearchQuery.data || quickSearchQuery.data.results.length === 0) &&
                 suggestionsQuery.data.suggestions.length === 0 && (
                  <div className="px-4 py-8 text-center text-gray-500">
                    <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No results found for "{debouncedQuery}"</p>
                    <p className="text-xs">Try adjusting your search terms</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}