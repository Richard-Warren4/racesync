import type { Favorite } from '../types/Favorite';

/**
 * Repository interface for managing favorite races
 */
export interface FavoritesRepository {
  /**
   * Gets all favorited races
   * @returns Array of favorites
   */
  getFavorites(): Promise<Favorite[]>;

  /**
   * Adds a race to favorites
   * @param favorite - The favorite to add
   */
  addFavorite(favorite: Favorite): Promise<void>;

  /**
   * Removes a race from favorites
   * @param raceId - ID of the race to unfavorite
   */
  removeFavorite(raceId: string): Promise<void>;

  /**
   * Checks if a race is favorited
   * @param raceId - ID of the race to check
   * @returns True if the race is favorited, false otherwise
   */
  isFavorite(raceId: string): Promise<boolean>;
}
