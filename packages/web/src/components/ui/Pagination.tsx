'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from '@heroicons/react/24/outline';

/**
 * Pagination Component
 *
 * Full-featured pagination with customizable display options
 */
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageRangeDisplayed?: number;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'minimal';
  disabled?: boolean;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  pageRangeDisplayed = 5,
  showFirstLast = true,
  showPrevNext = true,
  size = 'md',
  variant = 'default',
  disabled = false,
  className,
}: PaginationProps) {
  // Calculate page range to display
  const pageNumbers = useMemo(() => {
    const pages: (number | 'ellipsis')[] = [];

    if (totalPages <= pageRangeDisplayed + 2) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate start and end of range around current page
      let start = Math.max(2, currentPage - Math.floor(pageRangeDisplayed / 2));
      let end = Math.min(totalPages - 1, start + pageRangeDisplayed - 1);

      // Adjust start if end is at max
      if (end === totalPages - 1) {
        start = Math.max(2, end - pageRangeDisplayed + 1);
      }

      // Add ellipsis before range if needed
      if (start > 2) {
        pages.push('ellipsis');
      }

      // Add page range
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis after range if needed
      if (end < totalPages - 1) {
        pages.push('ellipsis');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  }, [currentPage, totalPages, pageRangeDisplayed]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage || disabled) {
      return;
    }
    onPageChange(page);
  };

  const sizeClasses = {
    sm: 'h-8 min-w-[2rem] text-sm',
    md: 'h-10 min-w-[2.5rem] text-sm',
    lg: 'h-12 min-w-[3rem] text-base',
  };

  const variantClasses = {
    default: {
      base: 'border border-gray-300 bg-white hover:bg-gray-50',
      active: 'border-primary-600 bg-primary-600 text-white hover:bg-primary-700',
    },
    outline: {
      base: 'border border-gray-300 bg-transparent hover:bg-gray-50',
      active: 'border-primary-600 bg-primary-50 text-primary-600 hover:bg-primary-100',
    },
    minimal: {
      base: 'bg-transparent hover:bg-gray-100',
      active: 'bg-primary-100 text-primary-600',
    },
  };

  const styles = variantClasses[variant];

  return (
    <nav
      className={cn('flex items-center gap-1', className)}
      aria-label="Pagination"
    >
      {/* First Page */}
      {showFirstLast && (
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1 || disabled}
          className={cn(
            'inline-flex items-center justify-center rounded-md transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            sizeClasses[size],
            styles.base
          )}
          aria-label="First page"
        >
          <ChevronDoubleLeftIcon className="h-4 w-4" />
        </button>
      )}

      {/* Previous Page */}
      {showPrevNext && (
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || disabled}
          className={cn(
            'inline-flex items-center justify-center rounded-md transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            sizeClasses[size],
            styles.base
          )}
          aria-label="Previous page"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>
      )}

      {/* Page Numbers */}
      {pageNumbers.map((page, index) => {
        if (page === 'ellipsis') {
          return (
            <span
              key={`ellipsis-${index}`}
              className={cn(
                'inline-flex items-center justify-center',
                sizeClasses[size]
              )}
            >
              ...
            </span>
          );
        }

        const isActive = page === currentPage;

        return (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            disabled={disabled}
            className={cn(
              'inline-flex items-center justify-center rounded-md font-medium transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              sizeClasses[size],
              isActive ? styles.active : styles.base
            )}
            aria-label={`Page ${page}`}
            aria-current={isActive ? 'page' : undefined}
          >
            {page}
          </button>
        );
      })}

      {/* Next Page */}
      {showPrevNext && (
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || disabled}
          className={cn(
            'inline-flex items-center justify-center rounded-md transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            sizeClasses[size],
            styles.base
          )}
          aria-label="Next page"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      )}

      {/* Last Page */}
      {showFirstLast && (
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages || disabled}
          className={cn(
            'inline-flex items-center justify-center rounded-md transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            sizeClasses[size],
            styles.base
          )}
          aria-label="Last page"
        >
          <ChevronDoubleRightIcon className="h-4 w-4" />
        </button>
      )}
    </nav>
  );
}

/**
 * Simple Pagination (just prev/next)
 */
export interface SimplePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPageInfo?: boolean;
  disabled?: boolean;
  className?: string;
}

export function SimplePagination({
  currentPage,
  totalPages,
  onPageChange,
  showPageInfo = true,
  disabled = false,
  className,
}: SimplePaginationProps) {
  return (
    <nav className={cn('flex items-center justify-between', className)} aria-label="Pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || disabled}
        className={cn(
          'inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md',
          'bg-white text-sm font-medium text-gray-700 hover:bg-gray-50',
          'disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
        )}
      >
        <ChevronLeftIcon className="h-4 w-4" />
        Previous
      </button>

      {showPageInfo && (
        <span className="text-sm text-gray-700">
          Page <span className="font-medium">{currentPage}</span> of{' '}
          <span className="font-medium">{totalPages}</span>
        </span>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || disabled}
        className={cn(
          'inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md',
          'bg-white text-sm font-medium text-gray-700 hover:bg-gray-50',
          'disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
        )}
      >
        Next
        <ChevronRightIcon className="h-4 w-4" />
      </button>
    </nav>
  );
}

/**
 * Pagination with Items Per Page Selector
 */
export interface AdvancedPaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  itemsPerPageOptions?: number[];
  showItemsInfo?: boolean;
  className?: string;
}

export function AdvancedPagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [10, 25, 50, 100],
  showItemsInfo = true,
  className,
}: AdvancedPaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={cn('flex flex-col sm:flex-row items-center justify-between gap-4', className)}>
      {/* Items Info */}
      {showItemsInfo && (
        <div className="flex items-center gap-4 text-sm text-gray-700">
          <span>
            Showing <span className="font-medium">{startItem}</span> to{' '}
            <span className="font-medium">{endItem}</span> of{' '}
            <span className="font-medium">{totalItems}</span> results
          </span>

          {/* Items Per Page Selector */}
          {onItemsPerPageChange && (
            <div className="flex items-center gap-2">
              <label htmlFor="items-per-page" className="text-sm text-gray-700">
                Show:
              </label>
              <select
                id="items-per-page"
                value={itemsPerPage}
                onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {itemsPerPageOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
}

/**
 * Compact Pagination (for mobile)
 */
export interface CompactPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function CompactPagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: CompactPaginationProps) {
  return (
    <nav className={cn('flex items-center justify-center gap-2', className)} aria-label="Pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={cn(
          'p-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50',
          'disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
        )}
        aria-label="Previous page"
      >
        <ChevronLeftIcon className="h-5 w-5" />
      </button>

      <span className="px-4 py-2 text-sm font-medium text-gray-700">
        {currentPage} / {totalPages}
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={cn(
          'p-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50',
          'disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
        )}
        aria-label="Next page"
      >
        <ChevronRightIcon className="h-5 w-5" />
      </button>
    </nav>
  );
}

/**
 * usePagination Hook
 *
 * Hook for managing pagination state
 */
export function usePagination(totalItems: number, initialItemsPerPage: number = 10) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when items per page changes
  };

  const paginateData = <T,>(data: T[]): T[] => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return data.slice(start, end);
  };

  return {
    currentPage,
    itemsPerPage,
    totalPages,
    setCurrentPage: handlePageChange,
    setItemsPerPage: handleItemsPerPageChange,
    paginateData,
  };
}

// Fix: Add useState import
import { useState } from 'react';

/**
 * Example Usage
 */
export function PaginationExample() {
  const [page1, setPage1] = useState(1);
  const [page2, setPage2] = useState(1);
  const [page3, setPage3] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Sample data
  const totalItems = 247;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="space-y-12 p-8">
      <div>
        <h2 className="text-2xl font-bold mb-6">Default Pagination</h2>
        <Pagination
          currentPage={page1}
          totalPages={20}
          onPageChange={setPage1}
        />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Pagination Variants</h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">Default</p>
            <Pagination
              currentPage={page1}
              totalPages={10}
              onPageChange={setPage1}
              variant="default"
            />
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Outline</p>
            <Pagination
              currentPage={page1}
              totalPages={10}
              onPageChange={setPage1}
              variant="outline"
            />
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Minimal</p>
            <Pagination
              currentPage={page1}
              totalPages={10}
              onPageChange={setPage1}
              variant="minimal"
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Pagination Sizes</h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">Small</p>
            <Pagination
              currentPage={page1}
              totalPages={10}
              onPageChange={setPage1}
              size="sm"
            />
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Medium (default)</p>
            <Pagination
              currentPage={page1}
              totalPages={10}
              onPageChange={setPage1}
              size="md"
            />
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Large</p>
            <Pagination
              currentPage={page1}
              totalPages={10}
              onPageChange={setPage1}
              size="lg"
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Simple Pagination</h2>
        <SimplePagination
          currentPage={page2}
          totalPages={10}
          onPageChange={setPage2}
        />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Advanced Pagination</h2>
        <AdvancedPagination
          currentPage={page3}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setPage3}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Compact Pagination (Mobile)</h2>
        <CompactPagination
          currentPage={page1}
          totalPages={10}
          onPageChange={setPage1}
        />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Without First/Last Buttons</h2>
        <Pagination
          currentPage={page1}
          totalPages={20}
          onPageChange={setPage1}
          showFirstLast={false}
        />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Without Prev/Next Buttons</h2>
        <Pagination
          currentPage={page1}
          totalPages={20}
          onPageChange={setPage1}
          showPrevNext={false}
        />
      </div>
    </div>
  );
}
