import { ScheduleMerger } from '../../../../../src/features/schedules/services/ScheduleMerger';
import type { Race } from '../../../../../src/features/schedules/types/Race';
import type { Favorite } from '../../../../../src/features/favorites/types/Favorite';
import type { FavoritesRepository } from '../../../../../src/features/favorites/services/FavoritesRepository';

describe('ScheduleMerger - Favorite Race Merging', () => {
  let merger: ScheduleMerger;
  let mockFavoritesRepository: jest.Mocked<FavoritesRepository>;

  beforeEach(() => {
    mockFavoritesRepository = {
      getFavorites: jest.fn(),
      addFavorite: jest.fn(),
      removeFavorite: jest.fn(),
      isFavorite: jest.fn(),
    };
    merger = new ScheduleMerger();
  });

  describe('merge with favorites', () => {
    it('should preserve favorite status when race exists in updated schedule', async () => {
      const existingRaces: Race[] = [
        {
          id: 'race-1',
          name: 'Spring Championship',
          startTime: new Date('2025-03-15T10:00:00Z'),
          endTime: new Date('2025-03-15T12:00:00Z'),
          location: 'Track A',
          category: 'Varsity',
          isFavorited: true,
        },
        {
          id: 'race-2',
          name: 'Summer Race',
          startTime: new Date('2025-06-15T10:00:00Z'),
          endTime: new Date('2025-06-15T12:00:00Z'),
          location: 'Track B',
          category: 'JV',
          isFavorited: false,
        },
      ];

      const newRaces: Race[] = [
        {
          id: 'race-1',
          name: 'Spring Championship - Updated',
          startTime: new Date('2025-03-15T11:00:00Z'), // Time changed
          endTime: new Date('2025-03-15T13:00:00Z'),
          location: 'Track A - Field 2', // Location changed
          category: 'Varsity',
        },
        {
          id: 'race-2',
          name: 'Summer Race',
          startTime: new Date('2025-06-15T10:00:00Z'),
          endTime: new Date('2025-06-15T12:00:00Z'),
          location: 'Track B',
          category: 'JV',
        },
      ];

      const favorites: Favorite[] = [
        {
          raceId: 'race-1',
          favoritedAt: new Date('2025-01-01T12:00:00Z'),
          notificationEnabled: true,
        },
      ];
      mockFavoritesRepository.getFavorites.mockResolvedValue(favorites);

      const mergedRaces = await merger.mergeWithFavorites(
        existingRaces,
        newRaces,
        mockFavoritesRepository
      );

      expect(mergedRaces).toHaveLength(2);
      // Race 1 should have updated data but preserved favorite status
      expect(mergedRaces[0].id).toBe('race-1');
      expect(mergedRaces[0].name).toBe('Spring Championship - Updated');
      expect(mergedRaces[0].location).toBe('Track A - Field 2');
      expect(mergedRaces[0].isFavorited).toBe(true);
      // Race 2 should remain unfavorited
      expect(mergedRaces[1].isFavorited).toBe(false);
    });

    it('should add favorite status to new races based on repository', async () => {
      const existingRaces: Race[] = [];

      const newRaces: Race[] = [
        {
          id: 'race-1',
          name: 'New Race',
          startTime: new Date('2025-03-15T10:00:00Z'),
          endTime: new Date('2025-03-15T12:00:00Z'),
          location: 'Track A',
          category: 'Varsity',
        },
      ];

      const favorites: Favorite[] = [
        {
          raceId: 'race-1',
          favoritedAt: new Date('2025-01-01T12:00:00Z'),
          notificationEnabled: true,
        },
      ];
      mockFavoritesRepository.getFavorites.mockResolvedValue(favorites);

      const mergedRaces = await merger.mergeWithFavorites(
        existingRaces,
        newRaces,
        mockFavoritesRepository
      );

      expect(mergedRaces).toHaveLength(1);
      expect(mergedRaces[0].isFavorited).toBe(true);
    });

    it('should remove favorite status from races no longer in schedule', async () => {
      const existingRaces: Race[] = [
        {
          id: 'race-1',
          name: 'Old Race',
          startTime: new Date('2025-03-15T10:00:00Z'),
          endTime: new Date('2025-03-15T12:00:00Z'),
          location: 'Track A',
          category: 'Varsity',
          isFavorited: true,
        },
      ];

      const newRaces: Race[] = [
        // race-1 is no longer in the schedule
        {
          id: 'race-2',
          name: 'New Race',
          startTime: new Date('2025-06-15T10:00:00Z'),
          endTime: new Date('2025-06-15T12:00:00Z'),
          location: 'Track B',
          category: 'JV',
        },
      ];

      const favorites: Favorite[] = [
        {
          raceId: 'race-1',
          favoritedAt: new Date('2025-01-01T12:00:00Z'),
          notificationEnabled: true,
        },
      ];
      mockFavoritesRepository.getFavorites.mockResolvedValue(favorites);

      const mergedRaces = await merger.mergeWithFavorites(
        existingRaces,
        newRaces,
        mockFavoritesRepository
      );

      // Should remove race-1 from favorites since it's no longer in schedule
      expect(mockFavoritesRepository.removeFavorite).toHaveBeenCalledWith('race-1');
      expect(mergedRaces).toHaveLength(1);
      expect(mergedRaces[0].id).toBe('race-2');
      expect(mergedRaces[0].isFavorited).toBe(false);
    });

    it('should handle multiple favorited races correctly', async () => {
      const existingRaces: Race[] = [
        {
          id: 'race-1',
          name: 'Race 1',
          startTime: new Date('2025-03-15T10:00:00Z'),
          endTime: new Date('2025-03-15T12:00:00Z'),
          location: 'Track A',
          category: 'Varsity',
          isFavorited: true,
        },
        {
          id: 'race-2',
          name: 'Race 2',
          startTime: new Date('2025-04-15T10:00:00Z'),
          endTime: new Date('2025-04-15T12:00:00Z'),
          location: 'Track B',
          category: 'JV',
          isFavorited: true,
        },
      ];

      const newRaces: Race[] = [
        {
          id: 'race-1',
          name: 'Race 1 - Updated',
          startTime: new Date('2025-03-15T11:00:00Z'),
          endTime: new Date('2025-03-15T13:00:00Z'),
          location: 'Track A',
          category: 'Varsity',
        },
        {
          id: 'race-2',
          name: 'Race 2 - Updated',
          startTime: new Date('2025-04-15T11:00:00Z'),
          endTime: new Date('2025-04-15T13:00:00Z'),
          location: 'Track B',
          category: 'JV',
        },
        {
          id: 'race-3',
          name: 'Race 3 - New',
          startTime: new Date('2025-05-15T10:00:00Z'),
          endTime: new Date('2025-05-15T12:00:00Z'),
          location: 'Track C',
          category: 'Novice',
        },
      ];

      const favorites: Favorite[] = [
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
      mockFavoritesRepository.getFavorites.mockResolvedValue(favorites);

      const mergedRaces = await merger.mergeWithFavorites(
        existingRaces,
        newRaces,
        mockFavoritesRepository
      );

      expect(mergedRaces).toHaveLength(3);
      expect(mergedRaces[0].isFavorited).toBe(true);
      expect(mergedRaces[1].isFavorited).toBe(true);
      expect(mergedRaces[2].isFavorited).toBe(false);
    });

    it('should handle empty existing races', async () => {
      const existingRaces: Race[] = [];
      const newRaces: Race[] = [
        {
          id: 'race-1',
          name: 'First Race',
          startTime: new Date('2025-03-15T10:00:00Z'),
          endTime: new Date('2025-03-15T12:00:00Z'),
          location: 'Track A',
          category: 'Varsity',
        },
      ];

      const favorites: Favorite[] = [];
      mockFavoritesRepository.getFavorites.mockResolvedValue(favorites);

      const mergedRaces = await merger.mergeWithFavorites(
        existingRaces,
        newRaces,
        mockFavoritesRepository
      );

      expect(mergedRaces).toHaveLength(1);
      expect(mergedRaces[0].isFavorited).toBe(false);
    });

    it('should handle empty new races', async () => {
      const existingRaces: Race[] = [
        {
          id: 'race-1',
          name: 'Old Race',
          startTime: new Date('2025-03-15T10:00:00Z'),
          endTime: new Date('2025-03-15T12:00:00Z'),
          location: 'Track A',
          category: 'Varsity',
          isFavorited: true,
        },
      ];
      const newRaces: Race[] = [];

      const favorites: Favorite[] = [
        {
          raceId: 'race-1',
          favoritedAt: new Date('2025-01-01T12:00:00Z'),
          notificationEnabled: true,
        },
      ];
      mockFavoritesRepository.getFavorites.mockResolvedValue(favorites);

      const mergedRaces = await merger.mergeWithFavorites(
        existingRaces,
        newRaces,
        mockFavoritesRepository
      );

      // Should remove all favorites since no races exist
      expect(mockFavoritesRepository.removeFavorite).toHaveBeenCalledWith('race-1');
      expect(mergedRaces).toHaveLength(0);
    });
  });
});
