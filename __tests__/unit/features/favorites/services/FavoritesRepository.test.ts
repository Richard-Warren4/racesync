import { AsyncStorageFavoritesRepository } from '../../../../../src/features/favorites/services/AsyncStorageFavoritesRepository';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../../../../src/shared/constants/storageKeys';
import type { Favorite } from '../../../../../src/features/favorites/types/Favorite';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('FavoritesRepository', () => {
  let repository: AsyncStorageFavoritesRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new AsyncStorageFavoritesRepository();
  });

  describe('getFavorites', () => {
    it('should return empty array when no favorites exist', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const favorites = await repository.getFavorites();

      expect(favorites).toEqual([]);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(STORAGE_KEYS.FAVORITES);
    });

    it('should return parsed favorites from storage', async () => {
      const storedFavorites: Favorite[] = [
        {
          raceId: 'race-1',
          favoritedAt: new Date('2025-01-01T12:00:00Z'),
          notificationEnabled: true,
        },
        {
          raceId: 'race-2',
          favoritedAt: new Date('2025-01-02T12:00:00Z'),
          notificationEnabled: false,
        },
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(storedFavorites)
      );

      const favorites = await repository.getFavorites();

      expect(favorites).toHaveLength(2);
      expect(favorites[0].raceId).toBe('race-1');
      expect(favorites[1].raceId).toBe('race-2');
      // Dates should be converted back to Date objects
      expect(favorites[0].favoritedAt).toBeInstanceOf(Date);
    });

    it('should handle corrupted data gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid json');

      const favorites = await repository.getFavorites();

      expect(favorites).toEqual([]);
    });
  });

  describe('addFavorite', () => {
    it('should add a new favorite to empty list', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      const newFavorite: Favorite = {
        raceId: 'race-1',
        favoritedAt: new Date('2025-01-01T12:00:00Z'),
        notificationEnabled: true,
      };

      await repository.addFavorite(newFavorite);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.FAVORITES,
        JSON.stringify([newFavorite])
      );
    });

    it('should add a new favorite to existing list', async () => {
      const existingFavorites: Favorite[] = [
        {
          raceId: 'race-1',
          favoritedAt: new Date('2025-01-01T12:00:00Z'),
          notificationEnabled: true,
        },
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(existingFavorites)
      );
      const newFavorite: Favorite = {
        raceId: 'race-2',
        favoritedAt: new Date('2025-01-02T12:00:00Z'),
        notificationEnabled: false,
      };

      await repository.addFavorite(newFavorite);

      const expectedFavorites = [...existingFavorites, newFavorite];
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.FAVORITES,
        JSON.stringify(expectedFavorites)
      );
    });

    it('should not add duplicate favorite', async () => {
      const existingFavorites: Favorite[] = [
        {
          raceId: 'race-1',
          favoritedAt: new Date('2025-01-01T12:00:00Z'),
          notificationEnabled: true,
        },
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(existingFavorites)
      );
      const duplicateFavorite: Favorite = {
        raceId: 'race-1',
        favoritedAt: new Date('2025-01-02T12:00:00Z'),
        notificationEnabled: false,
      };

      await repository.addFavorite(duplicateFavorite);

      // Should still only have one favorite
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.FAVORITES,
        JSON.stringify(existingFavorites)
      );
    });
  });

  describe('removeFavorite', () => {
    it('should remove a favorite by raceId', async () => {
      const existingFavorites: Favorite[] = [
        {
          raceId: 'race-1',
          favoritedAt: new Date('2025-01-01T12:00:00Z'),
          notificationEnabled: true,
        },
        {
          raceId: 'race-2',
          favoritedAt: new Date('2025-01-02T12:00:00Z'),
          notificationEnabled: false,
        },
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(existingFavorites)
      );

      await repository.removeFavorite('race-1');

      const expectedFavorites = existingFavorites.filter(f => f.raceId !== 'race-1');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.FAVORITES,
        JSON.stringify(expectedFavorites)
      );
    });

    it('should handle removing non-existent favorite', async () => {
      const existingFavorites: Favorite[] = [
        {
          raceId: 'race-1',
          favoritedAt: new Date('2025-01-01T12:00:00Z'),
          notificationEnabled: true,
        },
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(existingFavorites)
      );

      await repository.removeFavorite('non-existent');

      // List should remain unchanged
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.FAVORITES,
        JSON.stringify(existingFavorites)
      );
    });
  });

  describe('isFavorite', () => {
    it('should return true if race is favorited', async () => {
      const existingFavorites: Favorite[] = [
        {
          raceId: 'race-1',
          favoritedAt: new Date('2025-01-01T12:00:00Z'),
          notificationEnabled: true,
        },
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(existingFavorites)
      );

      const result = await repository.isFavorite('race-1');

      expect(result).toBe(true);
    });

    it('should return false if race is not favorited', async () => {
      const existingFavorites: Favorite[] = [
        {
          raceId: 'race-1',
          favoritedAt: new Date('2025-01-01T12:00:00Z'),
          notificationEnabled: true,
        },
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(existingFavorites)
      );

      const result = await repository.isFavorite('race-2');

      expect(result).toBe(false);
    });

    it('should return false when no favorites exist', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await repository.isFavorite('race-1');

      expect(result).toBe(false);
    });
  });
});
