/**
 * Race Filter Utilities
 *
 * Functions for filtering races by type and favorites.
 * Used by the ScheduleScreen to implement user-selectable filters.
 *
 * Task: T055 [US2]
 */

import { Race } from '../types/Race';
import { RaceFilter } from '../types/RaceFilter';

/**
 * Filter races by type (daily, weekly, special, all)
 *
 * @param races - Array of races to filter
 * @param filter - Filter type to apply
 * @returns Filtered array of races
 *
 * @example
 * const dailyRaces = filterByType(allRaces, 'daily');
 * const allRaces = filterByType(races, 'all'); // Returns original array
 */
export const filterByType = (races: Race[], filter: Exclude<RaceFilter, 'favorites'>): Race[] => {
  if (filter === 'all') {
    return races;
  }

  return races.filter(race => race.type === filter);
};

/**
 * Filter races by favorite status
 *
 * @param races - Array of races to filter
 * @param favoriteIds - Array of race IDs that are favorited
 * @returns Array of races that are in the favoriteIds list
 *
 * @example
 * const favoritedRaces = filterByFavorites(allRaces, ['race-1', 'race-3']);
 */
export const filterByFavorites = (races: Race[], favoriteIds: string[]): Race[] => {
  if (favoriteIds.length === 0) {
    return [];
  }

  const favoriteSet = new Set(favoriteIds);
  return races.filter(race => favoriteSet.has(race.id));
};

/**
 * Apply the selected filter to a list of races
 *
 * @param races - Array of races to filter
 * @param filter - Filter type to apply
 * @param favoriteIds - Array of race IDs that are favorited (required when filter is 'favorites')
 * @returns Filtered array of races
 *
 * @example
 * const filteredRaces = applyFilter(allRaces, 'daily', []);
 * const favoritedRaces = applyFilter(allRaces, 'favorites', ['race-1', 'race-3']);
 */
export const applyFilter = (
  races: Race[],
  filter: RaceFilter,
  favoriteIds: string[] = []
): Race[] => {
  if (filter === 'favorites') {
    return filterByFavorites(races, favoriteIds);
  }

  return filterByType(races, filter);
};
