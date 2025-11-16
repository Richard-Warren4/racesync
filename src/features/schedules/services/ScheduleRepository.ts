/**
 * ScheduleRepository Interface
 *
 * Abstracts schedule data storage and retrieval operations.
 * Allows for different storage implementations (AsyncStorage, SQLite, API, etc.)
 * while keeping the rest of the app agnostic to storage details.
 *
 * @see AsyncStorageScheduleRepository for AsyncStorage implementation
 */

import { Race } from '../types/Race';

/**
 * Repository interface for schedule data operations
 */
export interface ScheduleRepository {
  /**
   * Gets the current schedule, either from cache or by refreshing
   *
   * Primary method for retrieving race schedule data.
   * Implementation should handle cache strategy (return cached if fresh, refresh if stale).
   *
   * @returns Promise resolving to array of Race objects
   *
   * @example
   * ```typescript
   * const repository: ScheduleRepository = new AsyncStorageScheduleRepository();
   * const races = await repository.getSchedule();
   * // Returns cached schedule if fresh, otherwise refreshes
   * ```
   */
  getSchedule(): Promise<Race[]>;

  /**
   * Gets the cached schedule without checking staleness or refreshing
   *
   * Returns schedule from local storage only.
   * Returns null if no cached data exists.
   *
   * @returns Promise resolving to cached races or null
   *
   * @example
   * ```typescript
   * const cachedRaces = await repository.getCachedSchedule();
   * if (cachedRaces === null) {
   *   console.log('No cached data available');
   * }
   * ```
   */
  getCachedSchedule(): Promise<Race[] | null>;

  /**
   * Saves schedule data to local storage
   *
   * Persists race schedule and updates the last updated timestamp.
   *
   * @param races - Array of Race objects to save
   * @returns Promise that resolves when save is complete
   *
   * @example
   * ```typescript
   * const freshRaces: Race[] = await fetchFromAPI();
   * await repository.saveSchedule(freshRaces);
   * // Schedule is now cached with current timestamp
   * ```
   */
  saveSchedule(races: Race[]): Promise<void>;

  /**
   * Gets the timestamp of when the schedule was last updated
   *
   * Used to determine if cached data is stale (>24 hours old).
   * Returns null if schedule has never been saved.
   *
   * @returns Promise resolving to Date or null
   *
   * @example
   * ```typescript
   * const lastUpdated = await repository.getLastUpdated();
   * if (lastUpdated) {
   *   const ageHours = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60);
   *   console.log(`Schedule is ${ageHours} hours old`);
   * }
   * ```
   */
  getLastUpdated(): Promise<Date | null>;
}
