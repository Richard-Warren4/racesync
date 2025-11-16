import type { Race } from '../types/Race';

/**
 * Filter options for filtering race schedules
 */
export interface RaceFilterOptions {
  /**
   * Filter by category (e.g., "Varsity", "JV", "Novice")
   */
  category?: string;

  /**
   * Show only favorited races
   */
  favoritedOnly?: boolean;

  /**
   * Filter by date range
   */
  dateRange?: {
    start: Date;
    end: Date;
  };

  /**
   * Search by name or location
   */
  searchTerm?: string;
}

/**
 * RaceFilter service handles filtering of race schedules
 */
export class RaceFilter {
  /**
   * Filters races based on the provided filter options
   * @param races - Array of races to filter
   * @param options - Filter options
   * @returns Filtered array of races
   */
  filter(races: Race[], options: RaceFilterOptions): Race[] {
    let filteredRaces = [...races];

    // Filter by favorited only
    if (options.favoritedOnly) {
      filteredRaces = filteredRaces.filter((race) => race.isFavorited === true);
    }

    // Filter by category
    if (options.category) {
      filteredRaces = filteredRaces.filter(
        (race) => race.category.toLowerCase() === options.category?.toLowerCase()
      );
    }

    // Filter by date range
    if (options.dateRange) {
      filteredRaces = filteredRaces.filter((race) => {
        const raceDate = new Date(race.startTime);
        const startDate = new Date(options.dateRange!.start);
        const endDate = new Date(options.dateRange!.end);

        return raceDate >= startDate && raceDate <= endDate;
      });
    }

    // Filter by search term
    if (options.searchTerm && options.searchTerm.trim() !== '') {
      const searchLower = options.searchTerm.toLowerCase();
      filteredRaces = filteredRaces.filter(
        (race) =>
          race.name.toLowerCase().includes(searchLower) ||
          race.location.toLowerCase().includes(searchLower) ||
          race.description?.toLowerCase().includes(searchLower)
      );
    }

    return filteredRaces;
  }

  /**
   * Filters races to show only favorited ones
   * Convenience method for filtering by favorites
   * @param races - Array of races to filter
   * @returns Only favorited races
   */
  filterFavoritesOnly(races: Race[]): Race[] {
    return this.filter(races, { favoritedOnly: true });
  }
}
