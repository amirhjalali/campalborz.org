import { useEffect, useState, useCallback } from 'react';

/**
 * useFormPersistence Hook
 *
 * Automatically saves and restores form data to/from localStorage.
 * Prevents data loss if user accidentally closes browser or navigates away.
 *
 * @param key - Unique key for localStorage (e.g., 'donation-form')
 * @param initialData - Initial form data
 * @param options - Configuration options
 *
 * @example
 * ```tsx
 * const { data, updateField, clearData } = useFormPersistence('donation-form', {
 *   amount: null,
 *   email: '',
 * });
 * ```
 */

export interface FormPersistenceOptions {
  /**
   * Auto-clear data after this many milliseconds
   * Default: 24 hours (86400000 ms)
   */
  expirationMs?: number;

  /**
   * Debounce save operations (ms)
   * Default: 500ms
   */
  debounceMs?: number;

  /**
   * Skip persistence (useful for testing)
   * Default: false
   */
  disabled?: boolean;
}

interface StoredData<T> {
  data: T;
  timestamp: number;
}

export function useFormPersistence<T extends Record<string, any>>(
  key: string,
  initialData: T,
  options: FormPersistenceOptions = {}
) {
  const {
    expirationMs = 24 * 60 * 60 * 1000, // 24 hours
    debounceMs = 500,
    disabled = false,
  } = options;

  // Load initial data from localStorage or use defaults
  const [data, setData] = useState<T>(() => {
    if (disabled || typeof window === 'undefined') {
      return initialData;
    }

    try {
      const stored = localStorage.getItem(key);
      if (!stored) return initialData;

      const parsed: StoredData<T> = JSON.parse(stored);

      // Check if data has expired
      const isExpired = Date.now() - parsed.timestamp > expirationMs;
      if (isExpired) {
        localStorage.removeItem(key);
        return initialData;
      }

      // Merge stored data with initial data (in case schema changed)
      return { ...initialData, ...parsed.data };
    } catch (error) {
      console.error('Failed to load form data from localStorage:', error);
      return initialData;
    }
  });

  // Debounced save to localStorage
  useEffect(() => {
    if (disabled || typeof window === 'undefined') return;

    const timeoutId = setTimeout(() => {
      try {
        const toStore: StoredData<T> = {
          data,
          timestamp: Date.now(),
        };
        localStorage.setItem(key, JSON.stringify(toStore));
      } catch (error) {
        console.error('Failed to save form data to localStorage:', error);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [data, key, debounceMs, disabled]);

  /**
   * Update a single field
   */
  const updateField = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setData((prev) => ({ ...prev, [field]: value }));
  }, []);

  /**
   * Update multiple fields at once
   */
  const updateFields = useCallback((updates: Partial<T>) => {
    setData((prev) => ({ ...prev, ...updates }));
  }, []);

  /**
   * Replace all data
   */
  const setAllData = useCallback((newData: T) => {
    setData(newData);
  }, []);

  /**
   * Clear persisted data
   */
  const clearData = useCallback(() => {
    setData(initialData);
    if (!disabled && typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  }, [key, initialData, disabled]);

  /**
   * Check if there is persisted data
   */
  const hasPersisted = useCallback(() => {
    if (disabled || typeof window === 'undefined') return false;
    return localStorage.getItem(key) !== null;
  }, [key, disabled]);

  /**
   * Get age of persisted data in milliseconds
   */
  const getDataAge = useCallback(() => {
    if (disabled || typeof window === 'undefined') return null;

    try {
      const stored = localStorage.getItem(key);
      if (!stored) return null;

      const parsed: StoredData<T> = JSON.parse(stored);
      return Date.now() - parsed.timestamp;
    } catch {
      return null;
    }
  }, [key, disabled]);

  return {
    data,
    updateField,
    updateFields,
    setAllData,
    clearData,
    hasPersisted,
    getDataAge,
  };
}

/**
 * Hook for simple value persistence
 */
export function usePersistedState<T>(
  key: string,
  initialValue: T,
  expirationMs?: number
): [T, (value: T) => void, () => void] {
  const { data, setAllData, clearData } = useFormPersistence(
    key,
    { value: initialValue } as any,
    { expirationMs }
  );

  return [
    data.value as T,
    (value: T) => setAllData({ value } as any),
    clearData,
  ];
}
