/**
 * Storage Keys Constants
 *
 * Centralized AsyncStorage keys for all data persistence in RaceSync.
 * All keys are prefixed with 'racesync:' to avoid conflicts with other apps.
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
   */
  SCHEDULE: 'racesync:schedule',

  /**
   * Schedule last updated timestamp
   *
   * @description ISO 8601 timestamp of when the schedule was last fetched/updated
   * @type {string} ISO 8601 UTC timestamp
   */
  SCHEDULE_LAST_UPDATED: 'racesync:schedule-last-updated',

  /**
   * User's favorite races
   *
   * @description Array of Favorite objects for races the user has marked as favorites
   * @type {string} JSON-serialized array of Favorite objects
   */
  FAVORITES: 'racesync:favorites',

  /**
   * Calendar event mappings
   *
   * @description Maps race IDs to device calendar event IDs for synced events
   * @type {string} JSON-serialized object mapping race IDs to calendar event IDs
   */
  CALENDAR_MAPPINGS: 'racesync:calendar-mappings',

  /**
   * Scheduled notification IDs
   *
   * @description Maps race IDs to scheduled notification IDs for managing alerts
   * @type {string} JSON-serialized object mapping race IDs to notification IDs
   */
  SCHEDULED_NOTIFICATIONS: 'racesync:scheduled-notifications',

  /**
   * Selected filter preference
   *
   * @description Stores the user's currently selected race filter
   * @type {string} Plain string value ("all" | "daily" | "weekly" | "special" | "favorites")
   */
  SELECTED_FILTER: 'racesync:selected-filter',

  /**
   * Theme preference
   *
   * @description User's preferred color theme (light, dark, or system)
   * @type {string} Plain string value ("light" | "dark" | "system")
   */
  THEME: 'racesync:theme',
} as const;

/**
 * Type representing all valid storage keys
 */
export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

/**
 * Helper function to validate if a string is a valid storage key
 */
export const isValidStorageKey = (key: string): key is StorageKey => {
  return Object.values(STORAGE_KEYS).includes(key as StorageKey);
};
