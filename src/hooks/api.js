/**
 * Custom React Hooks for Courtscape
 * useApi - Generic hook for API data fetching
 * useSearch - Hook for search state management
 */

import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

/**
 * useApi Hook
 * Generic hook for fetching API data with loading/error states
 *
 * Usage:
 * const { data, loading, error } = useApi(() => api.searchJudges(query));
 */
export function useApi(apiFunction, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiFunction();

        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to fetch data');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, dependencies);

  return { data, loading, error };
}

/**
 * useSearch Hook
 * Hook for managing search state and pagination
 *
 * Usage:
 * const { results, loading, error, search, nextPage, prevPage } = useSearch(
 *   api.searchJudges
 * );
 */
export function useSearch(searchFunction, pageSize = 20) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const performSearch = useCallback(
    async (query, page = 0) => {
      try {
        setLoading(true);
        setError(null);
        setSearchQuery(query);
        setCurrentPage(page);

        const offset = page * pageSize;
        const result = await searchFunction(query, pageSize, offset);

        setResults(result.data || []);
        setTotalResults(result.pagination?.total || 0);
      } catch (err) {
        setError(err.message || 'Search failed');
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [searchFunction, pageSize]
  );

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      performSearch(searchQuery, currentPage + 1);
    }
  }, [searchQuery, currentPage, performSearch]);

  const prevPage = useCallback(() => {
    if (currentPage > 0) {
      performSearch(searchQuery, currentPage - 1);
    }
  }, [searchQuery, currentPage, performSearch]);

  const goToPage = useCallback(
    (page) => {
      performSearch(searchQuery, page);
    },
    [searchQuery, performSearch]
  );

  const hasNextPage = (currentPage + 1) * pageSize < totalResults;
  const hasPrevPage = currentPage > 0;

  return {
    results,
    loading,
    error,
    search: performSearch,
    nextPage,
    prevPage,
    goToPage,
    currentPage,
    pageSize,
    totalResults,
    hasNextPage,
    hasPrevPage,
  };
}

/**
 * useDebounce Hook
 * Debounce a value to limit API calls during typing
 *
 * Usage:
 * const debouncedQuery = useDebounce(searchInput, 300);
 */
export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export default { useApi, useSearch, useDebounce };
