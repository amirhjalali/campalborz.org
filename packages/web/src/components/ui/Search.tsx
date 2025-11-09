'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

/**
 * Search Input Component
 *
 * Search input with autocomplete and suggestions
 */
export interface SearchProps {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'bordered';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  clearable?: boolean;
  autoFocus?: boolean;
  className?: string;
}

export function Search({
  value: controlledValue,
  onChange,
  onSearch,
  placeholder = 'Search...',
  size = 'md',
  variant = 'default',
  fullWidth = false,
  disabled = false,
  loading = false,
  clearable = true,
  autoFocus = false,
  className,
}: SearchProps) {
  const [internalValue, setInternalValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const handleChange = (newValue: string) => {
    setInternalValue(newValue);
    onChange?.(newValue);
  };

  const handleClear = () => {
    handleChange('');
    inputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(value);
  };

  const sizeClasses = {
    sm: 'h-8 text-sm pl-9 pr-3',
    md: 'h-10 text-sm pl-10 pr-4',
    lg: 'h-12 text-base pl-12 pr-4',
  };

  const iconSizeClasses = {
    sm: 'h-4 w-4 left-3',
    md: 'h-5 w-5 left-3',
    lg: 'h-6 w-6 left-3',
  };

  const variantClasses = {
    default: 'border border-gray-300 bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
    filled: 'border-0 bg-gray-100 focus:bg-white focus:ring-2 focus:ring-primary-500',
    bordered: 'border-2 border-gray-300 bg-white focus:border-primary-500',
  };

  return (
    <form onSubmit={handleSubmit} className={cn('relative', fullWidth ? 'w-full' : 'w-auto', className)}>
      <MagnifyingGlassIcon
        className={cn(
          'absolute top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none',
          iconSizeClasses[size]
        )}
      />

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        className={cn(
          'rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
          sizeClasses[size],
          variantClasses[variant],
          clearable && value && 'pr-10',
          fullWidth && 'w-full'
        )}
      />

      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="animate-spin h-4 w-4 border-2 border-primary-600 border-t-transparent rounded-full" />
        </div>
      )}

      {clearable && value && !loading && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      )}
    </form>
  );
}

/**
 * Search with Autocomplete
 */
export interface AutocompleteOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  category?: string;
}

export interface AutocompleteProps extends Omit<SearchProps, 'onChange' | 'onSearch'> {
  options: AutocompleteOption[];
  onSelect?: (option: AutocompleteOption) => void;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  maxResults?: number;
  groupByCategory?: boolean;
  highlightMatches?: boolean;
}

export function Autocomplete({
  options,
  onSelect,
  onChange,
  onSearch,
  maxResults = 10,
  groupByCategory = false,
  highlightMatches = true,
  ...searchProps
}: AutocompleteProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter and sort options
  const filteredOptions = options
    .filter((option) =>
      option.label.toLowerCase().includes(query.toLowerCase()) ||
      option.description?.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, maxResults);

  // Group options by category
  const groupedOptions = groupByCategory
    ? filteredOptions.reduce((acc, option) => {
        const category = option.category || 'Other';
        if (!acc[category]) acc[category] = [];
        acc[category].push(option);
        return acc;
      }, {} as Record<string, AutocompleteOption[]>)
    : { All: filteredOptions };

  // Handle option selection
  const handleSelect = (option: AutocompleteOption) => {
    setQuery(option.label);
    setIsOpen(false);
    setSelectedIndex(-1);
    onSelect?.(option);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown') {
        setIsOpen(true);
        setSelectedIndex(0);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        setSelectedIndex((prev) => Math.min(prev + 1, filteredOptions.length - 1));
        e.preventDefault();
        break;
      case 'ArrowUp':
        setSelectedIndex((prev) => Math.max(prev - 1, -1));
        e.preventDefault();
        break;
      case 'Enter':
        if (selectedIndex >= 0 && filteredOptions[selectedIndex]) {
          handleSelect(filteredOptions[selectedIndex]);
          e.preventDefault();
        } else {
          onSearch?.(query);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        e.preventDefault();
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Highlight matching text
  const highlightText = (text: string, query: string) => {
    if (!highlightMatches || !query) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-yellow-200 text-gray-900">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div ref={containerRef} className="relative">
      <div onKeyDown={handleKeyDown}>
        <Search
          {...searchProps}
          value={query}
          onChange={(value) => {
            setQuery(value);
            setIsOpen(true);
            setSelectedIndex(-1);
            onChange?.(value);
          }}
          onSearch={onSearch}
        />
      </div>

      {/* Dropdown */}
      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {Object.entries(groupedOptions).map(([category, categoryOptions]) => (
            <div key={category}>
              {groupByCategory && (
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase bg-gray-50 sticky top-0">
                  {category}
                </div>
              )}

              {categoryOptions.map((option, index) => {
                const globalIndex = filteredOptions.indexOf(option);
                const isSelected = globalIndex === selectedIndex;

                return (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(option)}
                    className={cn(
                      'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors',
                      isSelected ? 'bg-primary-50' : 'hover:bg-gray-50'
                    )}
                  >
                    {option.icon && (
                      <span className="flex-shrink-0 mt-0.5">{option.icon}</span>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900">
                        {highlightText(option.label, query)}
                      </div>
                      {option.description && (
                        <div className="text-sm text-gray-600 mt-0.5">
                          {highlightText(option.description, query)}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* No results */}
      {isOpen && query && filteredOptions.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500">
          No results found for &quot;{query}&quot;
        </div>
      )}
    </div>
  );
}

/**
 * Search with Recent Searches
 */
export interface SearchWithHistoryProps extends SearchProps {
  onSearch: (value: string) => void;
  recentSearches?: string[];
  maxRecent?: number;
  onClearHistory?: () => void;
}

export function SearchWithHistory({
  onSearch,
  recentSearches = [],
  maxRecent = 5,
  onClearHistory,
  ...searchProps
}: SearchWithHistoryProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSearch = (value: string) => {
    setQuery(value);
    setIsOpen(false);
    onSearch(value);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <Search
        {...searchProps}
        value={query}
        onChange={setQuery}
        onSearch={handleSearch}
        onFocus={() => setIsOpen(true)}
      />

      {/* Recent searches dropdown */}
      {isOpen && recentSearches.length > 0 && !query && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
            <span className="text-xs font-semibold text-gray-500 uppercase">
              Recent Searches
            </span>
            {onClearHistory && (
              <button
                onClick={onClearHistory}
                className="text-xs text-primary-600 hover:text-primary-700"
              >
                Clear
              </button>
            )}
          </div>

          <div className="py-1">
            {recentSearches.slice(0, maxRecent).map((search, index) => (
              <button
                key={index}
                onClick={() => handleSearch(search)}
                className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors"
              >
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-900">{search}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Example Usage
 */
export function SearchExample() {
  const [searchValue, setSearchValue] = useState('');
  const [selectedOption, setSelectedOption] = useState<AutocompleteOption | null>(null);

  const options: AutocompleteOption[] = [
    {
      value: '1',
      label: 'Camp Alborz',
      description: 'Main camp page',
      category: 'Pages',
      icon: <span>🏕️</span>,
    },
    {
      value: '2',
      label: 'Events',
      description: 'Browse upcoming events',
      category: 'Pages',
      icon: <span>📅</span>,
    },
    {
      value: '3',
      label: 'Members',
      description: 'View camp members',
      category: 'Pages',
      icon: <span>👥</span>,
    },
    {
      value: '4',
      label: 'Sarah Johnson',
      description: 'Camp Director',
      category: 'People',
      icon: <span>👤</span>,
    },
    {
      value: '5',
      label: 'Michael Chen',
      description: 'Art Coordinator',
      category: 'People',
      icon: <span>👤</span>,
    },
    {
      value: '6',
      label: 'Burning Man 2024',
      description: 'Annual event',
      category: 'Events',
      icon: <span>🔥</span>,
    },
  ];

  return (
    <div className="space-y-12 p-8">
      <div>
        <h2 className="text-2xl font-bold mb-6">Basic Search</h2>
        <div className="space-y-4">
          <Search placeholder="Search..." />
          <Search placeholder="Small search" size="sm" />
          <Search placeholder="Large search" size="lg" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Search Variants</h2>
        <div className="space-y-4">
          <Search placeholder="Default" variant="default" />
          <Search placeholder="Filled" variant="filled" />
          <Search placeholder="Bordered" variant="bordered" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Search States</h2>
        <div className="space-y-4">
          <Search placeholder="Loading..." loading />
          <Search placeholder="Disabled" disabled value="Disabled search" />
          <Search placeholder="With value" value={searchValue} onChange={setSearchValue} />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Autocomplete</h2>
        <Autocomplete
          options={options}
          onSelect={setSelectedOption}
          placeholder="Search pages, people, events..."
          groupByCategory
        />
        {selectedOption && (
          <p className="mt-4 text-sm text-gray-600">
            Selected: {selectedOption.label}
          </p>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Search with Recent Searches</h2>
        <SearchWithHistory
          placeholder="Search..."
          onSearch={(value) => console.log('Search:', value)}
          recentSearches={['Camp Alborz', 'Events', 'Members', 'Donations']}
          onClearHistory={() => console.log('Clear history')}
        />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Full Width Search</h2>
        <Search placeholder="Full width search..." fullWidth />
      </div>
    </div>
  );
}
