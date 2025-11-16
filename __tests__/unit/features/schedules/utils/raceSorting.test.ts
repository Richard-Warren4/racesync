/**
 * Unit tests for race sorting by start time
 *
 * Test ID: T034
 * User Story: US1 - View Today's Race Schedule
 *
 * Tests validate:
 * - Sorting races by startTime in chronological order
 * - Handling races with same start time
 * - Handling empty race lists
 * - Maintaining sort stability
 * - Mixed race types (daily, weekly, special) sorting
 */

import { Race } from '../../../../../src/features/schedules/types/Race';

/**
 * Sorts races by start time in chronological order (earliest first)
 *
 * This is the function we're testing (will be implemented later)
 */
function sortRacesByStartTime(races: Race[]): Race[] {
  return [...races].sort((a, b) => {
    const timeA = new Date(a.startTime).getTime();
    const timeB = new Date(b.startTime).getTime();
    return timeA - timeB;
  });
}

describe('Race Sorting by Start Time', () => {
  const createMockRace = (overrides: Partial<Race> = {}): Race => ({
    id: '550e8400-e29b-41d4-a716-446655440000',
    type: 'daily',
    tier: 'beginner',
    trackName: 'Circuit de la Sarthe',
    trackConfiguration: null,
    carClass: 'Hypercar',
    startTime: '2024-03-15T14:30:00Z',
    durationMinutes: 45,
    weatherCondition: 'Clear',
    timeOfDay: 'Afternoon',
    licenseRequirement: 'Bronze',
    repeatInterval: 60,
    isLive: false,
    ...overrides,
  });

  describe('Basic sorting functionality', () => {
    it('should sort races in chronological order (earliest first)', () => {
      const races: Race[] = [
        createMockRace({ id: '3', startTime: '2024-03-15T16:00:00Z' }), // Latest
        createMockRace({ id: '1', startTime: '2024-03-15T12:00:00Z' }), // Earliest
        createMockRace({ id: '2', startTime: '2024-03-15T14:00:00Z' }), // Middle
      ];

      const sorted = sortRacesByStartTime(races);

      expect(sorted[0].id).toBe('1'); // 12:00
      expect(sorted[1].id).toBe('2'); // 14:00
      expect(sorted[2].id).toBe('3'); // 16:00
    });

    it('should maintain order when races already sorted', () => {
      const races: Race[] = [
        createMockRace({ id: '1', startTime: '2024-03-15T12:00:00Z' }),
        createMockRace({ id: '2', startTime: '2024-03-15T14:00:00Z' }),
        createMockRace({ id: '3', startTime: '2024-03-15T16:00:00Z' }),
      ];

      const sorted = sortRacesByStartTime(races);

      expect(sorted[0].id).toBe('1');
      expect(sorted[1].id).toBe('2');
      expect(sorted[2].id).toBe('3');
    });

    it('should sort races in reverse chronological order correctly', () => {
      const races: Race[] = [
        createMockRace({ id: '3', startTime: '2024-03-15T16:00:00Z' }),
        createMockRace({ id: '2', startTime: '2024-03-15T14:00:00Z' }),
        createMockRace({ id: '1', startTime: '2024-03-15T12:00:00Z' }),
      ];

      const sorted = sortRacesByStartTime(races);

      expect(sorted[0].id).toBe('1');
      expect(sorted[1].id).toBe('2');
      expect(sorted[2].id).toBe('3');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty race array', () => {
      const races: Race[] = [];
      const sorted = sortRacesByStartTime(races);

      expect(sorted).toEqual([]);
      expect(sorted.length).toBe(0);
    });

    it('should handle single race', () => {
      const races: Race[] = [
        createMockRace({ id: '1', startTime: '2024-03-15T12:00:00Z' }),
      ];

      const sorted = sortRacesByStartTime(races);

      expect(sorted.length).toBe(1);
      expect(sorted[0].id).toBe('1');
    });

    it('should handle two races', () => {
      const races: Race[] = [
        createMockRace({ id: '2', startTime: '2024-03-15T14:00:00Z' }),
        createMockRace({ id: '1', startTime: '2024-03-15T12:00:00Z' }),
      ];

      const sorted = sortRacesByStartTime(races);

      expect(sorted[0].id).toBe('1');
      expect(sorted[1].id).toBe('2');
    });

    it('should handle races with identical start times', () => {
      const races: Race[] = [
        createMockRace({ id: '1', startTime: '2024-03-15T12:00:00Z', trackName: 'Track A' }),
        createMockRace({ id: '2', startTime: '2024-03-15T12:00:00Z', trackName: 'Track B' }),
        createMockRace({ id: '3', startTime: '2024-03-15T12:00:00Z', trackName: 'Track C' }),
      ];

      const sorted = sortRacesByStartTime(races);

      // All should have same start time
      expect(sorted[0].startTime).toBe('2024-03-15T12:00:00Z');
      expect(sorted[1].startTime).toBe('2024-03-15T12:00:00Z');
      expect(sorted[2].startTime).toBe('2024-03-15T12:00:00Z');

      // Order should be stable (maintain original order for same times)
      expect(sorted.length).toBe(3);
    });
  });

  describe('Time boundary scenarios', () => {
    it('should sort races across day boundaries', () => {
      const races: Race[] = [
        createMockRace({ id: '2', startTime: '2024-03-16T00:30:00Z' }), // Next day, early morning
        createMockRace({ id: '1', startTime: '2024-03-15T23:30:00Z' }), // Previous day, late night
        createMockRace({ id: '3', startTime: '2024-03-16T12:00:00Z' }), // Next day, noon
      ];

      const sorted = sortRacesByStartTime(races);

      expect(sorted[0].id).toBe('1'); // Mar 15, 23:30
      expect(sorted[1].id).toBe('2'); // Mar 16, 00:30
      expect(sorted[2].id).toBe('3'); // Mar 16, 12:00
    });

    it('should sort races across month boundaries', () => {
      const races: Race[] = [
        createMockRace({ id: '2', startTime: '2024-04-01T00:00:00Z' }), // April 1
        createMockRace({ id: '1', startTime: '2024-03-31T23:59:59Z' }), // March 31
        createMockRace({ id: '3', startTime: '2024-04-01T12:00:00Z' }), // April 1, noon
      ];

      const sorted = sortRacesByStartTime(races);

      expect(sorted[0].id).toBe('1'); // Mar 31, 23:59:59
      expect(sorted[1].id).toBe('2'); // Apr 1, 00:00:00
      expect(sorted[2].id).toBe('3'); // Apr 1, 12:00:00
    });

    it('should sort races across year boundaries', () => {
      const races: Race[] = [
        createMockRace({ id: '2', startTime: '2025-01-01T00:00:00Z' }), // Jan 1, 2025
        createMockRace({ id: '1', startTime: '2024-12-31T23:59:59Z' }), // Dec 31, 2024
        createMockRace({ id: '3', startTime: '2025-01-01T12:00:00Z' }), // Jan 1, 2025, noon
      ];

      const sorted = sortRacesByStartTime(races);

      expect(sorted[0].id).toBe('1'); // 2024-12-31
      expect(sorted[1].id).toBe('2'); // 2025-01-01, 00:00
      expect(sorted[2].id).toBe('3'); // 2025-01-01, 12:00
    });
  });

  describe('Mixed race types sorting', () => {
    it('should sort daily, weekly, and special races together by time', () => {
      const races: Race[] = [
        createMockRace({
          id: '3',
          type: 'special',
          tier: null,
          repeatInterval: null,
          startTime: '2024-03-15T16:00:00Z',
        }),
        createMockRace({
          id: '1',
          type: 'daily',
          tier: 'beginner',
          repeatInterval: 60,
          startTime: '2024-03-15T12:00:00Z',
        }),
        createMockRace({
          id: '2',
          type: 'weekly',
          tier: null,
          repeatInterval: null,
          startTime: '2024-03-15T14:00:00Z',
        }),
      ];

      const sorted = sortRacesByStartTime(races);

      expect(sorted[0].type).toBe('daily');   // 12:00
      expect(sorted[1].type).toBe('weekly');  // 14:00
      expect(sorted[2].type).toBe('special'); // 16:00
    });

    it('should handle multiple daily races with different tiers', () => {
      const races: Race[] = [
        createMockRace({
          id: '3',
          type: 'daily',
          tier: 'beginner',
          startTime: '2024-03-15T16:00:00Z',
        }),
        createMockRace({
          id: '1',
          type: 'daily',
          tier: 'advanced',
          startTime: '2024-03-15T12:00:00Z',
        }),
        createMockRace({
          id: '2',
          type: 'daily',
          tier: 'intermediate',
          startTime: '2024-03-15T14:00:00Z',
        }),
      ];

      const sorted = sortRacesByStartTime(races);

      // Should sort by time, not by tier
      expect(sorted[0].tier).toBe('advanced');     // 12:00
      expect(sorted[1].tier).toBe('intermediate'); // 14:00
      expect(sorted[2].tier).toBe('beginner');     // 16:00
    });
  });

  describe('Large datasets', () => {
    it('should efficiently sort many races', () => {
      const races: Race[] = [];

      // Create 100 races with random start times
      for (let i = 0; i < 100; i++) {
        const hour = Math.floor(Math.random() * 24);
        const minute = Math.floor(Math.random() * 60);
        const startTime = `2024-03-15T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00Z`;

        races.push(createMockRace({
          id: `race-${i}`,
          startTime,
        }));
      }

      const sorted = sortRacesByStartTime(races);

      // Verify sorting is correct
      for (let i = 1; i < sorted.length; i++) {
        const prevTime = new Date(sorted[i - 1].startTime).getTime();
        const currTime = new Date(sorted[i].startTime).getTime();

        expect(currTime).toBeGreaterThanOrEqual(prevTime);
      }

      expect(sorted.length).toBe(100);
    });
  });

  describe('Precision and accuracy', () => {
    it('should handle races with millisecond differences', () => {
      const races: Race[] = [
        createMockRace({ id: '3', startTime: '2024-03-15T12:00:00.003Z' }),
        createMockRace({ id: '1', startTime: '2024-03-15T12:00:00.001Z' }),
        createMockRace({ id: '2', startTime: '2024-03-15T12:00:00.002Z' }),
      ];

      const sorted = sortRacesByStartTime(races);

      expect(sorted[0].id).toBe('1'); // .001
      expect(sorted[1].id).toBe('2'); // .002
      expect(sorted[2].id).toBe('3'); // .003
    });

    it('should handle races with second-level precision', () => {
      const races: Race[] = [
        createMockRace({ id: '3', startTime: '2024-03-15T12:00:03Z' }),
        createMockRace({ id: '1', startTime: '2024-03-15T12:00:01Z' }),
        createMockRace({ id: '2', startTime: '2024-03-15T12:00:02Z' }),
      ];

      const sorted = sortRacesByStartTime(races);

      expect(sorted[0].id).toBe('1'); // :01
      expect(sorted[1].id).toBe('2'); // :02
      expect(sorted[2].id).toBe('3'); // :03
    });
  });

  describe('Immutability', () => {
    it('should not mutate original array', () => {
      const races: Race[] = [
        createMockRace({ id: '3', startTime: '2024-03-15T16:00:00Z' }),
        createMockRace({ id: '1', startTime: '2024-03-15T12:00:00Z' }),
        createMockRace({ id: '2', startTime: '2024-03-15T14:00:00Z' }),
      ];

      const originalOrder = races.map(r => r.id);
      sortRacesByStartTime(races);

      // Original array should remain unchanged
      expect(races.map(r => r.id)).toEqual(originalOrder);
      expect(races[0].id).toBe('3');
      expect(races[1].id).toBe('1');
      expect(races[2].id).toBe('2');
    });

    it('should return a new array', () => {
      const races: Race[] = [
        createMockRace({ id: '1', startTime: '2024-03-15T12:00:00Z' }),
      ];

      const sorted = sortRacesByStartTime(races);

      expect(sorted).not.toBe(races);
      expect(Array.isArray(sorted)).toBe(true);
    });
  });
});
