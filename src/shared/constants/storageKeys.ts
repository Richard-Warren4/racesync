/**
 * AsyncStorage keys used throughout the application
 */
export const STORAGE_KEYS = {
  /**
   * Key for storing favorited races
   * Value: Array<Favorite>
   */
  FAVORITES: 'racesync:favorites',

  /**
   * Key for storing race schedules
   * Value: Array<Race>
   */
  SCHEDULES: 'racesync:schedules',
} as const;
