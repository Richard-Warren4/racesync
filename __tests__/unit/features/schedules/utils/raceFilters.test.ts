/**
 * Unit tests for race filter logic
 * Task: T051 [US2]
 * Purpose: Test each filter type (all, daily, weekly, special, favorites)
 */

import { filterByType, filterByFavorites } from '../../../../../src/features/schedules/utils/raceFilters';
import { Race } from '../../../../../src/features/schedules/types/Race';

describe('raceFilters', () => {
  const mockRaces: Race[] = [
    {
      id: 'daily-1',
      type: 'daily',
      tier: 'beginner',
      trackName: 'Spa-Francorchamps',
      trackConfiguration: 'Grand Prix',
      carClass: 'LMP2',
      startTime: '2025-11-16T19:00:00Z',
      durationMinutes: 20,
      weatherCondition: 'Clear',
      timeOfDay: 'Afternoon',
      licenseRequirement: 'Bronze',
      repeatInterval: 40,
      isLive: false,
    },
    {
      id: 'weekly-1',
      type: 'weekly',
      tier: null,
      trackName: 'Le Mans',
      trackConfiguration: 'Full Circuit',
      carClass: 'Hypercar',
      startTime: '2025-11-17T14:00:00Z',
      durationMinutes: 360,
      weatherCondition: 'Dynamic',
      timeOfDay: 'Full Day Cycle',
      licenseRequirement: 'Gold',
      repeatInterval: null,
      isLive: false,
    },
    {
      id: 'special-1',
      type: 'special',
      tier: null,
      trackName: 'Monza',
      trackConfiguration: 'Historic',
      carClass: 'Multi-class',
      startTime: '2025-11-18T20:00:00Z',
      durationMinutes: 180,
      weatherCondition: 'Real Weather',
      timeOfDay: 'Night',
      licenseRequirement: 'Silver',
      repeatInterval: null,
      isLive: false,
    },
    {
      id: 'daily-2',
      type: 'daily',
      tier: 'intermediate',
      trackName: 'Sebring',
      trackConfiguration: 'International',
      carClass: 'LMGT3',
      startTime: '2025-11-16T20:00:00Z',
      durationMinutes: 30,
      weatherCondition: 'Clear',
      timeOfDay: 'Sunset',
      licenseRequirement: 'Silver',
      repeatInterval: 60,
      isLive: false,
    },
  ];

  describe('filterByType', () => {
    it('should return all races when filter is "all"', () => {
      const result = filterByType(mockRaces, 'all');
      expect(result).toHaveLength(4);
      expect(result).toEqual(mockRaces);
    });

    it('should return only daily races when filter is "daily"', () => {
      const result = filterByType(mockRaces, 'daily');
      expect(result).toHaveLength(2);
      expect(result.every(race => race.type === 'daily')).toBe(true);
      expect(result.map(r => r.id)).toEqual(['daily-1', 'daily-2']);
    });

    it('should return only weekly races when filter is "weekly"', () => {
      const result = filterByType(mockRaces, 'weekly');
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('weekly');
      expect(result[0].id).toBe('weekly-1');
    });

    it('should return only special races when filter is "special"', () => {
      const result = filterByType(mockRaces, 'special');
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('special');
      expect(result[0].id).toBe('special-1');
    });

    it('should return empty array when no races match filter', () => {
      const dailyOnlyRaces: Race[] = [mockRaces[0], mockRaces[3]];
      const result = filterByType(dailyOnlyRaces, 'weekly');
      expect(result).toHaveLength(0);
    });

    it('should handle empty race array', () => {
      const result = filterByType([], 'daily');
      expect(result).toHaveLength(0);
    });
  });

  describe('filterByFavorites', () => {
    const favoriteIds = ['daily-1', 'special-1'];

    it('should return only favorited races', () => {
      const result = filterByFavorites(mockRaces, favoriteIds);
      expect(result).toHaveLength(2);
      expect(result.map(r => r.id)).toEqual(['daily-1', 'special-1']);
    });

    it('should return empty array when no races are favorited', () => {
      const result = filterByFavorites(mockRaces, []);
      expect(result).toHaveLength(0);
    });

    it('should handle favoriteIds that do not exist in races', () => {
      const result = filterByFavorites(mockRaces, ['non-existent-1', 'non-existent-2']);
      expect(result).toHaveLength(0);
    });

    it('should handle partial matches in favoriteIds', () => {
      const result = filterByFavorites(mockRaces, ['daily-1', 'non-existent']);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('daily-1');
    });

    it('should handle empty race array', () => {
      const result = filterByFavorites([], favoriteIds);
      expect(result).toHaveLength(0);
    });

    it('should preserve original race order', () => {
      const result = filterByFavorites(mockRaces, ['special-1', 'daily-1']);
      // Result should maintain original array order, not favoriteIds order
      expect(result.map(r => r.id)).toEqual(['daily-1', 'special-1']);
    });
  });
});
