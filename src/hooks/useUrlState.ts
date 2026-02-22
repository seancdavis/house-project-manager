import { useSearchParams } from 'react-router-dom';
import { useCallback, useMemo } from 'react';

/**
 * Hook for managing URL-based state.
 * Any action that adjusts a view (sorting, filtering) should result in a URL change
 * so it can be shared and bookmarked.
 */
export function useUrlState<T extends Record<string, string | undefined>>(
  defaults: T
): [T, (updates: Partial<T>) => void, () => void] {
  const [searchParams, setSearchParams] = useSearchParams();

  const state = useMemo(() => {
    const result = { ...defaults };
    for (const key of Object.keys(defaults)) {
      const value = searchParams.get(key);
      if (value !== null) {
        (result as Record<string, string | undefined>)[key] = value;
      }
    }
    return result;
  }, [searchParams, defaults]);

  const updateState = useCallback(
    (updates: Partial<T>) => {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        for (const [key, value] of Object.entries(updates)) {
          if (value === undefined || value === '' || value === defaults[key as keyof T]) {
            newParams.delete(key);
          } else {
            newParams.set(key, value);
          }
        }
        return newParams;
      });
    },
    [setSearchParams, defaults]
  );

  const resetState = useCallback(() => {
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  return [state, updateState, resetState];
}

// Type-safe project list filters
export type ProjectFilters = {
  status?: string;
  type?: string;
  owner?: string;
  sort?: string;
  order?: string;
  view?: string;
  [key: string]: string | undefined;
};

export const PROJECT_FILTER_DEFAULTS: ProjectFilters = {
  status: undefined,
  type: undefined,
  owner: undefined,
  sort: 'updatedAt',
  order: 'desc',
  view: 'cards',
};

const PROJECT_SORT_STORAGE_KEY = 'house-project-manager-sort';

function getStoredSortPrefs(): { sort?: string; order?: string } {
  try {
    const stored = localStorage.getItem(PROJECT_SORT_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }
  return {};
}

function persistSortPrefs(sort: string | undefined, order: string | undefined) {
  try {
    localStorage.setItem(PROJECT_SORT_STORAGE_KEY, JSON.stringify({ sort, order }));
  } catch {
    // Ignore storage errors
  }
}

export function useProjectFilters(): [ProjectFilters, (updates: Partial<ProjectFilters>) => void, () => void] {
  const storedPrefs = useMemo(() => getStoredSortPrefs(), []);
  const defaults = useMemo(() => ({
    ...PROJECT_FILTER_DEFAULTS,
    sort: storedPrefs.sort || PROJECT_FILTER_DEFAULTS.sort,
    order: storedPrefs.order || PROJECT_FILTER_DEFAULTS.order,
  }), [storedPrefs]);

  const [filters, setFiltersRaw, resetFilters] = useUrlState<ProjectFilters>(defaults);

  const setFilters = useCallback((updates: Partial<ProjectFilters>) => {
    setFiltersRaw(updates);
    // Persist sort preferences to localStorage when they change
    if (updates.sort !== undefined || updates.order !== undefined) {
      const newSort = updates.sort ?? filters.sort ?? defaults.sort;
      const newOrder = updates.order ?? filters.order ?? defaults.order;
      persistSortPrefs(newSort, newOrder);
    }
  }, [setFiltersRaw, filters.sort, filters.order, defaults.sort, defaults.order]);

  return [filters, setFilters, resetFilters];
}

// Type-safe member list filters
export type MemberFilters = {
  type?: string;
  sort?: string;
  order?: string;
  [key: string]: string | undefined;
};

export const MEMBER_FILTER_DEFAULTS: MemberFilters = {
  type: undefined,
  sort: 'name',
  order: 'asc',
};

export function useMemberFilters() {
  return useUrlState<MemberFilters>(MEMBER_FILTER_DEFAULTS);
}
