import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Favorite } from '../types/Favorite';
import type { FavoritesRepository } from '../services/FavoritesRepository';
import { AsyncStorageFavoritesRepository } from '../services/AsyncStorageFavoritesRepository';

// Create singleton repository instance to avoid re-creating on every render
const defaultRepository = new AsyncStorageFavoritesRepository();

interface UseFavoritesResult {
  /**
   * Array of all favorited races
   */
  favorites: Favorite[];

  /**
   * Whether the favorites are currently loading
   */
  isLoading: boolean;

  /**
   * Checks if a race is favorited
   * @param raceId - ID of the race to check
   * @returns True if the race is favorited
   */
  isFavorite: (raceId: string) => boolean;

  /**
   * Toggles the favorite status of a race
   * @param raceId - ID of the race to toggle
   * @param notificationEnabled - Whether to enable notifications (default: false)
   */
  toggleFavorite: (raceId: string, notificationEnabled?: boolean) => Promise<void>;

  /**
   * Adds a race to favorites
   * @param raceId - ID of the race to favorite
   * @param notificationEnabled - Whether to enable notifications (default: false)
   */
  addFavorite: (raceId: string, notificationEnabled?: boolean) => Promise<void>;

  /**
   * Removes a race from favorites
   * @param raceId - ID of the race to unfavorite
   */
  removeFavorite: (raceId: string) => Promise<void>;

  /**
   * Refreshes the favorites list from storage
   */
  refresh: () => Promise<void>;
}

/**
 * Hook for managing favorite races
 * Handles favorite state and persistence to repository
 *
 * @param repository - Optional custom repository (defaults to AsyncStorageFavoritesRepository)
 * @returns Object with favorites state and management functions
 */
export function useFavorites(
  repository?: FavoritesRepository
): UseFavoritesResult {
  // Use provided repository or default singleton
  const repo = repository || defaultRepository;

  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  /**
   * Loads favorites from the repository
   */
  const loadFavorites = useCallback(async () => {
    try {
      setIsLoading(true);
      const loadedFavorites = await repo.getFavorites();
      setFavorites(loadedFavorites);
    } catch (error) {
      console.error('Error loading favorites:', error);
      setFavorites([]);
    } finally {
      setIsLoading(false);
    }
  }, [repo]);

  /**
   * Initial load of favorites
   */
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  /**
   * Checks if a race is favorited
   */
  const isFavorite = useCallback(
    (raceId: string): boolean => {
      return favorites.some((f) => f.raceId === raceId);
    },
    [favorites]
  );

  /**
   * Adds a race to favorites
   */
  const addFavorite = useCallback(
    async (raceId: string, notificationEnabled: boolean = false): Promise<void> => {
      try {
        const favorite: Favorite = {
          raceId,
          favoritedAt: new Date(),
          notificationEnabled,
        };

        await repo.addFavorite(favorite);

        // Update local state
        setFavorites((prev) => {
          // Don't add if already exists
          if (prev.some((f) => f.raceId === raceId)) {
            return prev;
          }
          return [...prev, favorite];
        });
      } catch (error) {
        console.error('Error adding favorite:', error);
        throw error;
      }
    },
    [repo]
  );

  /**
   * Removes a race from favorites
   */
  const removeFavorite = useCallback(
    async (raceId: string): Promise<void> => {
      try {
        await repo.removeFavorite(raceId);

        // Update local state
        setFavorites((prev) => prev.filter((f) => f.raceId !== raceId));
      } catch (error) {
        console.error('Error removing favorite:', error);
        throw error;
      }
    },
    [repo]
  );

  /**
   * Toggles the favorite status of a race
   */
  const toggleFavorite = useCallback(
    async (raceId: string, notificationEnabled: boolean = false): Promise<void> => {
      if (isFavorite(raceId)) {
        await removeFavorite(raceId);
      } else {
        await addFavorite(raceId, notificationEnabled);
      }
    },
    [isFavorite, addFavorite, removeFavorite]
  );

  /**
   * Refreshes the favorites list from storage
   */
  const refresh = useCallback(async (): Promise<void> => {
    await loadFavorites();
  }, [loadFavorites]);

  return {
    favorites,
    isLoading,
    isFavorite,
    toggleFavorite,
    addFavorite,
    removeFavorite,
    refresh,
  };
}
