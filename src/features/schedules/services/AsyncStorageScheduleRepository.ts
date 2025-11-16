/**
 * AsyncStorage implementation of ScheduleRepository
 *
 * Stores schedule data in React Native AsyncStorage for offline-first functionality.
 * Handles serialization/deserialization and cache staleness detection.
 *
 * @see ScheduleRepository for interface documentation
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Race } from '../types/Race';
import { ScheduleRepository } from './ScheduleRepository';
import { STORAGE_KEYS } from '../../../shared/constants/storageKeys';

/**
 * AsyncStorage-based schedule repository implementation
 *
 * Provides persistent storage for race schedule data using AsyncStorage.
 * Implements caching with 24-hour staleness threshold.
 */
export class AsyncStorageScheduleRepository implements ScheduleRepository {
  private readonly STALE_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Gets schedule from cache
   *
   * Returns cached schedule without refreshing.
   * If cache is stale (>24h), caller should call saveSchedule with fresh data.
   *
   * @returns Cached races or empty array if no cache
   */
  async getSchedule(): Promise<Race[]> {
    const cached = await this.getCachedSchedule();
    return cached ?? [];
  }

  /**
   * Gets cached schedule or null if no cache exists
   *
   * @returns Cached races or null
   */
  async getCachedSchedule(): Promise<Race[] | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SCHEDULE);

      if (!data) {
        return null;
      }

      const races: Race[] = JSON.parse(data);
      return races;
    } catch (error) {
      console.error('Failed to load cached schedule:', error);
      return null;
    }
  }

  /**
   * Saves schedule to AsyncStorage
   *
   * Persists race array and updates last updated timestamp.
   *
   * @param races - Races to save
   */
  async saveSchedule(races: Race[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(races));
      await AsyncStorage.setItem(
        STORAGE_KEYS.SCHEDULE_LAST_UPDATED,
        new Date().toISOString()
      );
    } catch (error) {
      console.error('Failed to save schedule:', error);
      throw error;
    }
  }

  /**
   * Gets the last updated timestamp
   *
   * @returns Date when schedule was last saved, or null
   */
  async getLastUpdated(): Promise<Date | null> {
    try {
      const timestamp = await AsyncStorage.getItem(
        STORAGE_KEYS.SCHEDULE_LAST_UPDATED
      );

      if (!timestamp) {
        return null;
      }

      const date = new Date(timestamp);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return null;
      }

      return date;
    } catch (error) {
      console.error('Failed to get last updated timestamp:', error);
      return null;
    }
  }

  /**
   * Checks if cached schedule is stale (>24 hours old)
   *
   * @returns True if schedule should be refreshed
   */
  async isStale(): Promise<boolean> {
    const lastUpdated = await this.getLastUpdated();

    if (!lastUpdated) {
      return true; // No cache, treat as stale
    }

    const age = Date.now() - lastUpdated.getTime();
    return age > this.STALE_THRESHOLD_MS;
  }

  /**
   * Clears all cached schedule data
   *
   * Useful for testing or manual cache invalidation.
   */
  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.SCHEDULE);
      await AsyncStorage.removeItem(STORAGE_KEYS.SCHEDULE_LAST_UPDATED);
    } catch (error) {
      console.error('Failed to clear schedule cache:', error);
      throw error;
    }
  }
}
