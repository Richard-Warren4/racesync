import type { Race } from '../types/Race';
import type { FavoritesRepository } from '../../favorites/services/FavoritesRepository';

/**
 * ScheduleMerger service handles merging updated race schedules
 * while preserving user-specific data like favorites
 */
export class ScheduleMerger {
  /**
   * Merges new race data with existing races, preserving user-specific fields
   * @param existingRaces - Current races with user data
   * @param newRaces - Updated races from the schedule source
   * @returns Merged races with preserved user data
   */
  merge(existingRaces: Race[], newRaces: Race[]): Race[] {
    // Create a map of existing races by ID for quick lookup
    const existingRacesMap = new Map<string, Race>();
    existingRaces.forEach((race) => {
      existingRacesMap.set(race.id, race);
    });

    // Merge new races with existing user data
    return newRaces.map((newRace) => {
      const existingRace = existingRacesMap.get(newRace.id);

      if (existingRace) {
        // Preserve user-specific fields from existing race
        return {
          ...newRace,
          isFavorited: existingRace.isFavorited,
        };
      }

      // New race, return as-is
      return newRace;
    });
  }

  /**
   * Merges new race data with favorites from repository
   * Removes favorites for races that no longer exist in the schedule
   * @param existingRaces - Current races with user data
   * @param newRaces - Updated races from the schedule source
   * @param favoritesRepository - Repository to manage favorites
   * @returns Merged races with favorite status applied
   */
  async mergeWithFavorites(
    existingRaces: Race[],
    newRaces: Race[],
    favoritesRepository: FavoritesRepository
  ): Promise<Race[]> {
    // Get all favorites from repository
    const favorites = await favoritesRepository.getFavorites();
    const favoriteRaceIds = new Set(favorites.map((f) => f.raceId));

    // Create a set of new race IDs for quick lookup
    const newRaceIds = new Set(newRaces.map((race) => race.id));

    // Remove favorites for races that no longer exist in the schedule
    for (const favorite of favorites) {
      if (!newRaceIds.has(favorite.raceId)) {
        await favoritesRepository.removeFavorite(favorite.raceId);
      }
    }

    // Merge new races with favorite status
    return newRaces.map((newRace) => {
      const isFavorited = favoriteRaceIds.has(newRace.id);

      return {
        ...newRace,
        isFavorited,
      };
    });
  }
}
