// src/hooks/common/useSearch.ts - Fixed readonly array issue
import { useState, useEffect, useRef, useMemo } from 'react';
import { useDebounce } from './useDebounce';

interface UseEnhancedSearchOptions {
  debounceMs?: number;
  minSearchLength?: number;
  enableClientFiltering?: boolean;
}

/**
 * 🚀 ENHANCED SEARCH HOOK
 * Provides smart search functionality with:
 * - Debounced server search
 * - Instant client-side filtering for better UX
 * - Search state management
 * - Performance enhancements
 */
export const useSearch = <T>(
  items: T[],
  // FIXED: Accept both readonly and mutable arrays by using union type
  searchFields: readonly (keyof T)[] | (keyof T)[],
  options: UseEnhancedSearchOptions = {}
) => {
  const {
    debounceMs = 200,
    minSearchLength = 1,
    enableClientFiltering = true,
  } = options;

  const [searchValue, setSearchValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const previousSearchRef = useRef('');

  // Debounced value for server search
  const debouncedSearch = useDebounce(searchValue, debounceMs);

  // Track search state changes
  useEffect(() => {
    const isCurrentlySearching = searchValue !== debouncedSearch;
    setIsSearching(isCurrentlySearching);
  }, [searchValue, debouncedSearch]);

  // 🎯 INSTANT CLIENT-SIDE FILTERING (for better UX during typing)
  const instantFilteredItems = useMemo(() => {
    if (!enableClientFiltering || !searchValue || searchValue.length < minSearchLength) {
      return items;
    }

    const searchTerm = searchValue.toLowerCase().trim();
    
    return items.filter(item => {
      return searchFields.some(field => {
        const fieldValue = item[field];
        if (typeof fieldValue === 'string') {
          return fieldValue.toLowerCase().includes(searchTerm);
        }
        if (typeof fieldValue === 'number') {
          return fieldValue.toString().includes(searchTerm);
        }
        return false;
      });
    });
  }, [items, searchValue, searchFields, minSearchLength, enableClientFiltering]);

  // 🚀 SMART SEARCH DETECTION
  const shouldTriggerServerSearch = useMemo(() => {
    // Don't search if below minimum length
    if (debouncedSearch.length < minSearchLength) {
      return false;
    }

    // Don't search if same as previous search
    if (debouncedSearch === previousSearchRef.current) {
      return false;
    }

    // Update previous search reference
    previousSearchRef.current = debouncedSearch;
    return true;
  }, [debouncedSearch, minSearchLength]);

  // Reset search
  const clearSearch = () => {
    setSearchValue('');
    previousSearchRef.current = '';
  };

  // Search metrics for debugging/analytics
  const searchMetrics = {
    hasActiveSearch: searchValue.length >= minSearchLength,
    isDebouncing: isSearching,
    serverSearchValue: shouldTriggerServerSearch ? debouncedSearch : '',
    clientFilteredCount: instantFilteredItems.length,
    originalCount: items.length,
  };

  return {
    // Search state
    searchValue,
    setSearchValue,
    debouncedSearch: shouldTriggerServerSearch ? debouncedSearch : '',
    isSearching,
    
    // Filtered results
    filteredItems: instantFilteredItems,
    
    // Utilities
    clearSearch,
    shouldTriggerServerSearch,
    
    // Metrics
    searchMetrics,
  };
};

// 🎯 SPECIALIZED BUDGET SEARCH HOOK
export const useBudgetSearch = (budgets: any[]) => {
  return useSearch(
    budgets,
    // FIXED: Remove 'as const' and make it a regular array
    ['name', 'description'],
    {
      debounceMs: 200,
      minSearchLength: 1,
      enableClientFiltering: true,
    }
  );
};