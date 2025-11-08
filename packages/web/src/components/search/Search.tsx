'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  ClockIcon,
  HashtagIcon,
  DocumentTextIcon,
  CalendarIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

// Search result types
export type SearchResultType = 'event' | 'article' | 'person' | 'page' | 'tag';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  description?: string;
  url: string;
  image?: string;
  date?: string;
  tags?: string[];
}

interface SearchProps {
  /**
   * Placeholder text for search input
   */
  placeholder?: string;
  /**
   * Show search suggestions as user types
   */
  showSuggestions?: boolean;
  /**
   * Show recent searches
   */
  showRecent?: boolean;
  /**
   * Debounce delay in milliseconds
   */
  debounceMs?: number;
  /**
   * Filter results by type
   */
  filterByType?: SearchResultType[];
  /**
   * Custom search function (override default)
   */
  onSearch?: (query: string, filters: SearchResultType[]) => Promise<SearchResult[]>;
  /**
   * Callback when result is clicked
   */
  onResultClick?: (result: SearchResult) => void;
  /**
   * Show as modal overlay
   */
  isModal?: boolean;
  /**
   * Close modal callback
   */
  onClose?: () => void;
}

const RECENT_SEARCHES_KEY = 'recent-searches';
const MAX_RECENT_SEARCHES = 5;

/**
 * Search Component
 *
 * Comprehensive search with filtering, suggestions, and recent searches
 */
export function Search({
  placeholder = 'Search events, articles, people...',
  showSuggestions = true,
  showRecent = true,
  debounceMs = 300,
  filterByType,
  onSearch,
  onResultClick,
  isModal = false,
  onClose,
}: SearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<SearchResultType[]>(
    filterByType || []
  );
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    if (showRecent) {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    }
  }, [showRecent]);

  // Focus input on mount (for modal)
  useEffect(() => {
    if (isModal && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isModal]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      performSearch(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, selectedFilters, debounceMs]);

  const performSearch = async (searchQuery: string) => {
    setIsSearching(true);

    try {
      let searchResults: SearchResult[];

      if (onSearch) {
        searchResults = await onSearch(searchQuery, selectedFilters);
      } else {
        // Default mock search
        searchResults = await mockSearch(searchQuery, selectedFilters);
      }

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const saveRecentSearch = (searchQuery: string) => {
    if (!searchQuery.trim() || !showRecent) return;

    const updated = [
      searchQuery,
      ...recentSearches.filter(s => s !== searchQuery),
    ].slice(0, MAX_RECENT_SEARCHES);

    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  const handleResultClick = (result: SearchResult) => {
    saveRecentSearch(query);

    if (onResultClick) {
      onResultClick(result);
    } else {
      window.location.href = result.url;
    }

    if (isModal && onClose) {
      onClose();
    }
  };

  const handleRecentSearchClick = (searchQuery: string) => {
    setQuery(searchQuery);
  };

  const toggleFilter = (filter: SearchResultType) => {
    setSelectedFilters(prev =>
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setFocusedIndex(-1);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (isModal && onClose) {
        onClose();
      } else {
        clearSearch();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && focusedIndex >= 0) {
      e.preventDefault();
      handleResultClick(results[focusedIndex]);
    }
  };

  // Scroll focused result into view
  useEffect(() => {
    if (focusedIndex >= 0 && resultsRef.current) {
      const focusedElement = resultsRef.current.children[focusedIndex] as HTMLElement;
      if (focusedElement) {
        focusedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [focusedIndex]);

  const searchContent = (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          ref={searchInputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-4 text-lg border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 transition-colors"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Filters */}
      {!filterByType && (
        <div className="flex flex-wrap gap-2 mt-4">
          {(['event', 'article', 'person', 'page'] as SearchResultType[]).map(filter => (
            <button
              key={filter}
              onClick={() => toggleFilter(filter)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedFilters.includes(filter)
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}s
            </button>
          ))}
        </div>
      )}

      {/* Results or Recent Searches */}
      {query.trim() ? (
        <div ref={resultsRef} className="mt-4 space-y-2">
          {isSearching ? (
            <div className="text-center py-8 text-gray-500">
              Searching...
            </div>
          ) : results.length > 0 ? (
            <>
              <p className="text-sm text-gray-600 mb-2">
                {results.length} result{results.length !== 1 ? 's' : ''} found
              </p>
              {results.map((result, index) => (
                <SearchResultItem
                  key={result.id}
                  result={result}
                  onClick={() => handleResultClick(result)}
                  isFocused={index === focusedIndex}
                />
              ))}
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No results found for "{query}"
            </div>
          )}
        </div>
      ) : showRecent && recentSearches.length > 0 ? (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">Recent Searches</p>
            <button
              onClick={clearRecentSearches}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear
            </button>
          </div>
          <div className="space-y-1">
            {recentSearches.map((search, index) => (
              <button
                key={index}
                onClick={() => handleRecentSearchClick(search)}
                className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <ClockIcon className="h-4 w-4 text-gray-400" />
                <span className="text-gray-700">{search}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 pt-20">
        <Card className="w-full max-w-3xl max-h-[80vh] overflow-y-auto">
          <div className="p-6">
            {searchContent}
          </div>
        </Card>
      </div>
    );
  }

  return <div>{searchContent}</div>;
}

/**
 * Search Result Item
 */
function SearchResultItem({
  result,
  onClick,
  isFocused,
}: {
  result: SearchResult;
  onClick: () => void;
  isFocused: boolean;
}) {
  const Icon = getIconForType(result.type);

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-4 p-4 rounded-lg text-left transition-colors ${
        isFocused
          ? 'bg-primary-50 border-primary-200'
          : 'hover:bg-gray-50 border-transparent'
      } border-2`}
    >
      {/* Image or Icon */}
      {result.image ? (
        <img
          src={result.image}
          alt={result.title}
          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Icon className="h-8 w-8 text-gray-400" />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-gray-500 uppercase">
            {result.type}
          </span>
          {result.date && (
            <span className="text-xs text-gray-400">• {result.date}</span>
          )}
        </div>
        <h3 className="font-semibold text-gray-900 mb-1">{result.title}</h3>
        {result.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {result.description}
          </p>
        )}
        {result.tags && result.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {result.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded"
              >
                <HashtagIcon className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </button>
  );
}

/**
 * Get icon for result type
 */
function getIconForType(type: SearchResultType) {
  switch (type) {
    case 'event':
      return CalendarIcon;
    case 'article':
      return DocumentTextIcon;
    case 'person':
      return UserGroupIcon;
    default:
      return DocumentTextIcon;
  }
}

/**
 * Mock search function (replace with actual API)
 */
async function mockSearch(
  query: string,
  filters: SearchResultType[]
): Promise<SearchResult[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  // Mock data
  const allResults: SearchResult[] = [
    {
      id: '1',
      type: 'event',
      title: 'Burning Man 2024',
      description: 'Annual gathering in Black Rock City',
      url: '/events/burning-man-2024',
      date: 'Aug 25-Sep 2, 2024',
      tags: ['burning-man', 'festival'],
    },
    {
      id: '2',
      type: 'article',
      title: 'Persian Art Workshop',
      description: 'Learn traditional Persian calligraphy and miniature painting',
      url: '/articles/persian-art-workshop',
      date: 'March 15, 2024',
      tags: ['art', 'workshop', 'persian'],
    },
    {
      id: '3',
      type: 'person',
      title: 'Sarah Johnson',
      description: 'Art Installation Lead, Member since 2020',
      url: '/members/sarah-johnson',
      tags: ['member', 'artist'],
    },
    {
      id: '4',
      type: 'page',
      title: 'About Camp Alborz',
      description: 'Learn about our mission, values, and community',
      url: '/about',
    },
    {
      id: '5',
      type: 'event',
      title: 'Pre-Burn Meetup',
      description: 'Get together before heading to the playa',
      url: '/events/pre-burn-meetup',
      date: 'Aug 20, 2024',
      tags: ['meetup', 'community'],
    },
  ];

  // Filter by query
  let filtered = allResults.filter(result =>
    result.title.toLowerCase().includes(query.toLowerCase()) ||
    result.description?.toLowerCase().includes(query.toLowerCase()) ||
    result.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
  );

  // Filter by type
  if (filters.length > 0) {
    filtered = filtered.filter(result => filters.includes(result.type));
  }

  return filtered;
}

/**
 * Search Modal Trigger Button
 */
export function SearchButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
    >
      <MagnifyingGlassIcon className="h-5 w-5 text-gray-600" />
      <span className="text-gray-600">Search...</span>
      <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 bg-white border border-gray-300 rounded text-xs text-gray-600">
        <span>⌘</span>K
      </kbd>
    </button>
  );
}

/**
 * Example: Search Modal with Keyboard Shortcut
 */
export function useSearchModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return { isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) };
}
