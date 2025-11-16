import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../../shared/constants/storageKeys';
import type { Favorite } from '../types/Favorite';
import type { FavoritesRepository } from './FavoritesRepository';

/**
 * AsyncStorage implementation of FavoritesRepository
 * Persists favorites to device storage using AsyncStorage
 */
export class AsyncStorageFavoritesRepository implements FavoritesRepository {
  /**
   * Gets all favorited races from AsyncStorage
   * @returns Array of favorites
   */
  async getFavorites(): Promise<Favorite[]> {
    try {
      const favoritesJson = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);

      if (!favoritesJson) {
        return [];
      }

      const favorites = JSON.parse(favoritesJson) as Favorite[];

      // Convert date strings back to Date objects
      return favorites.map((favorite) => ({
        ...favorite,
        favoritedAt: new Date(favorite.favoritedAt),
      }));
    } catch (error) {
      console.error('Error reading favorites from storage:', error);
      return [];
    }
  }

  /**
   * Adds a race to favorites
   * Does not add duplicate favorites (same raceId)
   * @param favorite - The favorite to add
   */
  async addFavorite(favorite: Favorite): Promise<void> {
    try {
      const favorites = await this.getFavorites();

      // Check if already favorited
      const exists = favorites.some((f) => f.raceId === favorite.raceId);
      if (exists) {
        // Don't add duplicate
        await AsyncStorage.setItem(
          STORAGE_KEYS.FAVORITES,
          JSON.stringify(favorites)
        );
        return;
      }

      // Add new favorite
      favorites.push(favorite);

      await AsyncStorage.setItem(
        STORAGE_KEYS.FAVORITES,
        JSON.stringify(favorites)
      );
    } catch (error) {
      console.error('Error adding favorite to storage:', error);
      throw error;
    }
  }

  /**
   * Removes a race from favorites
   * @param raceId - ID of the race to unfavorite
   */
  async removeFavorite(raceId: string): Promise<void> {
    try {
      const favorites = await this.getFavorites();

      const filteredFavorites = favorites.filter((f) => f.raceId !== raceId);

      await AsyncStorage.setItem(
        STORAGE_KEYS.FAVORITES,
        JSON.stringify(filteredFavorites)
      );
    } catch (error) {
      console.error('Error removing favorite from storage:', error);
      throw error;
    }
  }

  /**
   * Checks if a race is favorited
   * @param raceId - ID of the race to check
   * @returns True if the race is favorited, false otherwise
   */
  async isFavorite(raceId: string): Promise<boolean> {
    try {
      const favorites = await this.getFavorites();
      return favorites.some((f) => f.raceId === raceId);
    } catch (error) {
      console.error('Error checking favorite status:', error);
      return false;
    }
  }
}
