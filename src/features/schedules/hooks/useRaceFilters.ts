/**
 * Race Filters Hook
 *
 * Manages the selected race filter state and persists it to AsyncStorage.
 * Provides filter selection and persistence across app sessions.
 *
 * Task: T054 [US2]
 */

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RaceFilter, isValidRaceFilter } from '../types/RaceFilter';
import { STORAGE_KEYS } from '../../../shared/constants/storageKeys';

/**
 * Hook for managing race filter selection with persistence
 *
 * @returns Object with current filter and setFilter function
 *
 * @example
 * const { selectedFilter, setSelectedFilter, isLoading } = useRaceFilters();
 *
 * // Change filter
 * setSelectedFilter('daily');
 *
 * // Filter is automatically persisted to AsyncStorage
 */
export const useRaceFilters = () => {
  const [selectedFilter, setSelectedFilterState] = useState<RaceFilter>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Load persisted filter on mount
  useEffect(() => {
    const loadPersistedFilter = async () => {
      try {
        const storedFilter = await AsyncStorage.getItem(STORAGE_KEYS.SELECTED_FILTER);

        if (storedFilter && isValidRaceFilter(storedFilter)) {
          setSelectedFilterState(storedFilter);
        }
      } catch (error) {
        console.error('Failed to load persisted filter:', error);
        // Keep default 'all' filter on error
      } finally {
        setIsLoading(false);
      }
    };

    loadPersistedFilter();
  }, []);

  /**
   * Set the selected filter and persist it to AsyncStorage
   *
   * @param filter - The new filter to apply
   */
  const setSelectedFilter = useCallback(async (filter: RaceFilter) => {
    try {
      // Update state immediately for responsive UI
      setSelectedFilterState(filter);

      // Persist to AsyncStorage in background
      await AsyncStorage.setItem(STORAGE_KEYS.SELECTED_FILTER, filter);
    } catch (error) {
      console.error('Failed to persist filter:', error);
      // State is still updated even if persistence fails
    }
  }, []);

  return {
    selectedFilter,
    setSelectedFilter,
    isLoading,
  };
};
