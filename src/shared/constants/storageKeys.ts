/**
 * Storage Keys Constants
 *
 * Centralized AsyncStorage keys for all data persistence in RaceSync.
 * All keys are prefixed with 'racesync:' to avoid conflicts with other apps.
 *
 * @example
 * import { STORAGE_KEYS } from '@/shared/constants/storageKeys';
 * import AsyncStorage from '@react-native-async-storage/async-storage';
 *
 * // Store race schedule
 * await AsyncStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(raceData));
 *
 * // Retrieve favorites
 * const favoritesJson = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
 * const favorites = favoritesJson ? JSON.parse(favoritesJson) : [];
 */

/**
 * Storage key prefix used for all RaceSync data
 */
export const STORAGE_PREFIX = 'racesync:' as const;

/**
 * AsyncStorage keys for persisting app data
 */
export const STORAGE_KEYS = {
  /**
   * Race schedule cache
   *
   * @description Stores the complete race schedule including daily, weekly, and special events
   * @type {string} JSON-serialized object with dailyRaces, weeklyRaces, and specialEvents
   * @example
   * {
   *   "dailyRaces": { "tierA": [...], "tierB": [...], "tierC": [...] },
   *   "weeklyRaces": [...],
   *   "specialEvents": [...]
   * }
   */
  SCHEDULE: 'racesync:schedule',

  /**
   * Schedule last updated timestamp
   *
   * @description ISO 8601 timestamp of when the schedule was last fetched/updated
   * @type {string} ISO 8601 UTC timestamp
   * @example "2025-11-15T16:30:00Z"
   */
  SCHEDULE_LAST_UPDATED: 'racesync:schedule-last-updated',

  /**
   * User's favorite races
   *
   * @description Array of race IDs that the user has marked as favorites
   * @type {string} JSON-serialized array of race IDs
   * @example ["a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d", "c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f"]
   */
  FAVORITES: 'racesync:favorites',

  /**
   * Calendar event mappings
   *
   * @description Maps race IDs to device calendar event IDs for synced events
   * @type {string} JSON-serialized object mapping race IDs to calendar event IDs
   * @example
   * {
   *   "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d": "calendar-event-123",
   *   "c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f": "calendar-event-456"
   * }
   */
  CALENDAR_MAPPINGS: 'racesync:calendar-mappings',

  /**
   * Scheduled notification IDs
   *
   * @description Maps race IDs to scheduled notification IDs for managing alerts
   * @type {string} JSON-serialized object mapping race IDs to notification IDs
   * @example
   * {
   *   "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d": "notif-abc-123",
   *   "c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f": "notif-def-456"
   * }
   */
  SCHEDULED_NOTIFICATIONS: 'racesync:scheduled-notifications',

  /**
   * Selected filter preference
   *
   * @description Stores the user's currently selected race filter (All, Daily, Weekly, Special)
   * @type {string} Plain string value
   * @example "daily" | "weekly" | "special" | "all"
   */
  SELECTED_FILTER: 'racesync:selected-filter',

  /**
   * Theme preference
   *
   * @description User's preferred color theme (light, dark, or system)
   * @type {string} Plain string value
   * @example "light" | "dark" | "system"
   */
  THEME: 'racesync:theme',
} as const;

/**
 * Type representing all valid storage keys
 *
 * @example
 * const key: StorageKey = STORAGE_KEYS.SCHEDULE; // ✓ Valid
 * const invalidKey: StorageKey = 'invalid:key'; // ✗ Type error
 */
export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

/**
 * Helper function to validate if a string is a valid storage key
 *
 * @param key - The string to validate
 * @returns True if the key is a valid RaceSync storage key
 *
 * @example
 * isValidStorageKey('racesync:schedule') // true
 * isValidStorageKey('invalid:key') // false
 */
export const isValidStorageKey = (key: string): key is StorageKey => {
  return Object.values(STORAGE_KEYS).includes(key as StorageKey);
};

/**
 * Helper function to clear all RaceSync data from storage
 *
 * @example
 * import AsyncStorage from '@react-native-async-storage/async-storage';
 *
 * const clearAllData = async () => {
 *   const keys = Object.values(STORAGE_KEYS);
 *   await AsyncStorage.multiRemove(keys);
 * };
 */
