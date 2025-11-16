/**
 * useRaceSchedule Hook
 *
 * Manages race schedule data loading, caching, and refreshing.
 * Provides loading states and automatic refresh on stale data.
 *
 * Features:
 * - Loads from AsyncStorage cache
 * - Automatic refresh when data is stale (>24h)
 * - Manual refresh via pull-to-refresh
 * - Loading and refreshing states
 * - Sample data loading for MVP
 */

import { useState, useEffect, useCallback } from 'react';
import { Race } from '../types/Race';
import { AsyncStorageScheduleRepository } from '../services/AsyncStorageScheduleRepository';
import { RaceDataParser } from '../services/RaceDataParser';

// Import sample data
import { sampleRaces } from '../../../data/sampleRaces';

/**
 * Hook return type
 */
interface UseRaceScheduleResult {
  /** Array of race objects, sorted by start time */
  races: Race[];
  /** True during initial load */
  isLoading: boolean;
  /** True during pull-to-refresh */
  isRefreshing: boolean;
  /** Error message if load/refresh failed */
  error: string | null;
  /** Timestamp of last successful data update */
  lastUpdated: Date | null;
  /** Function to manually refresh schedule */
  refresh: () => Promise<void>;
}

/**
 * Hook for managing race schedule data
 *
 * @returns Race schedule state and refresh function
 *
 * @example
 * ```tsx
 * function ScheduleScreen() {
 *   const { races, isLoading, isRefreshing, refresh } = useRaceSchedule();
 *
 *   if (isLoading) {
 *     return <SkeletonLoader />;
 *   }
 *
 *   return (
 *     <RaceList
 *       races={races}
 *       onRefresh={refresh}
 *       refreshing={isRefreshing}
 *     />
 *   );
 * }
 * ```
 */
export function useRaceSchedule(): UseRaceScheduleResult {
  const [races, setRaces] = useState<Race[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const repository = new AsyncStorageScheduleRepository();
  const parser = new RaceDataParser();

  /**
   * Loads schedule from sample data (MVP implementation)
   * In future, this would fetch from API
   */
  const loadSampleData = useCallback(async (): Promise<Race[]> => {
    try {
      // Sample data is already typed, just sort and return
      const sortedRaces = [...sampleRaces].sort((a, b) => {
        return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
      });

      return sortedRaces;
    } catch (err) {
      throw new Error(`Failed to load sample data: ${(err as Error).message}`);
    }
  }, []);

  /**
   * Loads schedule data from cache or sample data
   */
  const loadSchedule = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      // Check if cached data exists and is fresh
      const cached = await repository.getCachedSchedule();
      const isStale = await repository.isStale();
      const lastUpdatedTime = await repository.getLastUpdated();

      if (cached && !isStale && !isManualRefresh) {
        // Use cached data if fresh and not manually refreshing
        setRaces(cached);
        setLastUpdated(lastUpdatedTime);
      } else {
        // Load sample data (or fetch from API in future)
        const freshRaces = await loadSampleData();

        // Save to cache
        await repository.saveSchedule(freshRaces);

        // Update state
        setRaces(freshRaces);
        const newLastUpdated = await repository.getLastUpdated();
        setLastUpdated(newLastUpdated);
      }
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      console.error('Failed to load schedule:', err);

      // On error, try to use cached data as fallback
      try {
        const cached = await repository.getCachedSchedule();
        if (cached) {
          setRaces(cached);
          const cachedLastUpdated = await repository.getLastUpdated();
          setLastUpdated(cachedLastUpdated);
        }
      } catch (fallbackErr) {
        console.error('Failed to load cached data as fallback:', fallbackErr);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [loadSampleData]);

  /**
   * Manual refresh function for pull-to-refresh
   */
  const refresh = useCallback(async () => {
    await loadSchedule(true);
  }, [loadSchedule]);

  /**
   * Load schedule on mount
   */
  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  return {
    races,
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    refresh,
  };
}
