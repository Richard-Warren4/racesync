/**
 * Race Filter Types
 *
 * Defines the available filter options for the race schedule view.
 * Users can filter races by category (Daily, Weekly, Special) or by favorites.
 *
 * Task: T053 [US2]
 */

/**
 * Available race filter types
 *
 * @description
 * - "all": Show all races (default)
 * - "daily": Show only daily races (includes tierA, tierB, tierC)
 * - "weekly": Show only weekly endurance races
 * - "special": Show only special event races
 * - "favorites": Show only races marked as favorites by the user
 *
 * @example
 * const currentFilter: RaceFilter = 'daily';
 * const allRaces: RaceFilter = 'all';
 */
export type RaceFilter = 'all' | 'daily' | 'weekly' | 'special' | 'favorites';

/**
 * Filter display configuration
 *
 * Maps filter types to their display labels for the UI
 */
export const FILTER_LABELS: Record<RaceFilter, string> = {
  all: 'All Races',
  daily: 'Daily Only',
  weekly: 'Weekly Only',
  special: 'Special Events Only',
  favorites: 'Favorited Races Only',
};

/**
 * Helper function to check if a string is a valid RaceFilter
 *
 * @param value - The value to check
 * @returns True if the value is a valid RaceFilter type
 *
 * @example
 * isValidRaceFilter('daily') // true
 * isValidRaceFilter('invalid') // false
 */
export const isValidRaceFilter = (value: string): value is RaceFilter => {
  return ['all', 'daily', 'weekly', 'special', 'favorites'].includes(value);
};
