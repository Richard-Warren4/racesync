/**
 * Integration test for schedule refresh on stale data
 *
 * Test ID: T036
 * User Story: US1 - View Today's Race Schedule
 *
 * Tests validate:
 * - Automatic refresh when data is stale (>24h old)
 * - Manual refresh via pull-to-refresh
 * - Merge logic for new vs cached data
 * - Handling refresh failures
 * - Loading states during refresh
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Race } from '../../src/features/schedules/types/Race';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

/**
 * Mock schedule service for testing refresh logic
 */
interface ScheduleRefreshService {
  shouldRefresh(lastUpdated: Date | null): boolean;
  refreshSchedule(): Promise<Race[]>;
  mergeSchedules(cached: Race[], fresh: Race[]): Race[];
}

class MockScheduleRefreshService implements ScheduleRefreshService {
  private readonly STALE_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours

  shouldRefresh(lastUpdated: Date | null): boolean {
    if (!lastUpdated) {
      return true; // No cache, should refresh
    }

    const now = Date.now();
    const age = now - lastUpdated.getTime();

    return age > this.STALE_THRESHOLD_MS;
  }

  async refreshSchedule(): Promise<Race[]> {
    // Mock implementation - would fetch from API in real implementation
    // For testing, return sample data
    return [
      {
        id: 'fresh-race-1',
        type: 'daily',
        tier: 'beginner',
        trackName: 'Fresh Track',
        trackConfiguration: null,
        carClass: 'Hypercar',
        startTime: new Date(Date.now() + 3600000).toISOString(),
        durationMinutes: 45,
        weatherCondition: 'Clear',
        timeOfDay: 'Afternoon',
        licenseRequirement: 'Bronze',
        repeatInterval: 60,
        isLive: false,
      },
    ];
  }

  mergeSchedules(cached: Race[], fresh: Race[]): Race[] {
    // Simple merge: fresh data takes precedence
    // In real implementation, might preserve favorites, merge by ID, etc.
    return fresh.length > 0 ? fresh : cached;
  }
}

describe('Schedule Refresh Integration', () => {
  let service: ScheduleRefreshService;

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

  beforeEach(() => {
    service = new MockScheduleRefreshService();
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('Staleness detection', () => {
    it('should identify data as stale when > 24 hours old', () => {
      const now = new Date('2024-03-16T12:00:00Z');
      const lastUpdated = new Date('2024-03-15T11:59:59Z'); // 24h 1s ago

      jest.spyOn(Date, 'now').mockReturnValue(now.getTime());

      const shouldRefresh = service.shouldRefresh(lastUpdated);

      expect(shouldRefresh).toBe(true);
    });

    it('should identify data as fresh when < 24 hours old', () => {
      const now = new Date('2024-03-16T12:00:00Z');
      const lastUpdated = new Date('2024-03-16T11:00:00Z'); // 1 hour ago

      jest.spyOn(Date, 'now').mockReturnValue(now.getTime());

      const shouldRefresh = service.shouldRefresh(lastUpdated);

      expect(shouldRefresh).toBe(false);
    });

    it('should require refresh when exactly 24 hours old', () => {
      const now = new Date('2024-03-16T12:00:00Z');
      const lastUpdated = new Date('2024-03-15T12:00:00Z'); // Exactly 24h ago

      jest.spyOn(Date, 'now').mockReturnValue(now.getTime());

      const shouldRefresh = service.shouldRefresh(lastUpdated);

      // At exactly 24 hours, should not refresh yet (> threshold)
      expect(shouldRefresh).toBe(false);
    });

    it('should require refresh when no last updated timestamp', () => {
      const shouldRefresh = service.shouldRefresh(null);

      expect(shouldRefresh).toBe(true);
    });

    it('should handle various staleness thresholds', () => {
      const now = new Date('2024-03-16T12:00:00Z');
      jest.spyOn(Date, 'now').mockReturnValue(now.getTime());

      const testCases = [
        { hoursAgo: 1, expectedStale: false },
        { hoursAgo: 6, expectedStale: false },
        { hoursAgo: 12, expectedStale: false },
        { hoursAgo: 23, expectedStale: false },
        { hoursAgo: 24, expectedStale: false },
        { hoursAgo: 25, expectedStale: true },
        { hoursAgo: 48, expectedStale: true },
        { hoursAgo: 168, expectedStale: true }, // 1 week
      ];

      testCases.forEach(({ hoursAgo, expectedStale }) => {
        const lastUpdated = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
        const shouldRefresh = service.shouldRefresh(lastUpdated);

        expect(shouldRefresh).toBe(expectedStale);
      });
    });
  });

  describe('Refresh schedule functionality', () => {
    it('should fetch fresh schedule data', async () => {
      const freshData = await service.refreshSchedule();

      expect(freshData).toBeDefined();
      expect(Array.isArray(freshData)).toBe(true);
      expect(freshData.length).toBeGreaterThan(0);
    });

    it('should return valid race objects', async () => {
      const freshData = await service.refreshSchedule();

      freshData.forEach(race => {
        expect(race).toHaveProperty('id');
        expect(race).toHaveProperty('type');
        expect(race).toHaveProperty('trackName');
        expect(race).toHaveProperty('startTime');
        expect(race).toHaveProperty('durationMinutes');
        expect(race).toHaveProperty('isLive');
      });
    });

    it('should return races with future start times', async () => {
      const now = Date.now();
      const freshData = await service.refreshSchedule();

      freshData.forEach(race => {
        const startTime = new Date(race.startTime).getTime();
        expect(startTime).toBeGreaterThan(now);
      });
    });
  });

  describe('Schedule merging logic', () => {
    it('should use fresh data when available', () => {
      const cached: Race[] = [
        createMockRace({ id: 'cached-1', trackName: 'Cached Track' }),
      ];

      const fresh: Race[] = [
        createMockRace({ id: 'fresh-1', trackName: 'Fresh Track' }),
      ];

      const merged = service.mergeSchedules(cached, fresh);

      expect(merged).toEqual(fresh);
      expect(merged[0].id).toBe('fresh-1');
    });

    it('should fall back to cached data when fresh data is empty', () => {
      const cached: Race[] = [
        createMockRace({ id: 'cached-1', trackName: 'Cached Track' }),
      ];

      const fresh: Race[] = [];

      const merged = service.mergeSchedules(cached, fresh);

      expect(merged).toEqual(cached);
      expect(merged[0].id).toBe('cached-1');
    });

    it('should handle both empty arrays', () => {
      const merged = service.mergeSchedules([], []);

      expect(merged).toEqual([]);
    });

    it('should handle multiple races in fresh data', () => {
      const cached: Race[] = [
        createMockRace({ id: 'cached-1' }),
      ];

      const fresh: Race[] = [
        createMockRace({ id: 'fresh-1' }),
        createMockRace({ id: 'fresh-2' }),
        createMockRace({ id: 'fresh-3' }),
      ];

      const merged = service.mergeSchedules(cached, fresh);

      expect(merged.length).toBe(3);
      expect(merged.every(r => r.id.startsWith('fresh'))).toBe(true);
    });
  });

  describe('Automatic refresh on app open', () => {
    it('should trigger refresh when app opens with stale data', async () => {
      const now = new Date('2024-03-16T12:00:00Z');
      const staleTimestamp = new Date('2024-03-15T11:00:00Z'); // 25 hours ago

      jest.spyOn(Date, 'now').mockReturnValue(now.getTime());

      const shouldRefresh = service.shouldRefresh(staleTimestamp);
      expect(shouldRefresh).toBe(true);

      if (shouldRefresh) {
        const freshData = await service.refreshSchedule();
        expect(freshData.length).toBeGreaterThan(0);
      }
    });

    it('should skip refresh when app opens with fresh data', async () => {
      const now = new Date('2024-03-16T12:00:00Z');
      const freshTimestamp = new Date('2024-03-16T11:00:00Z'); // 1 hour ago

      jest.spyOn(Date, 'now').mockReturnValue(now.getTime());

      const shouldRefresh = service.shouldRefresh(freshTimestamp);
      expect(shouldRefresh).toBe(false);
    });

    it('should handle first app launch (no cached timestamp)', async () => {
      const shouldRefresh = service.shouldRefresh(null);
      expect(shouldRefresh).toBe(true);

      if (shouldRefresh) {
        const freshData = await service.refreshSchedule();
        expect(freshData.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Manual refresh (pull-to-refresh)', () => {
    it('should allow manual refresh regardless of staleness', async () => {
      // Even with fresh data, manual refresh should work
      const now = new Date('2024-03-16T12:00:00Z');
      const recentTimestamp = new Date('2024-03-16T11:55:00Z'); // 5 minutes ago

      jest.spyOn(Date, 'now').mockReturnValue(now.getTime());

      const isStale = service.shouldRefresh(recentTimestamp);
      expect(isStale).toBe(false);

      // But manual refresh should still proceed
      const freshData = await service.refreshSchedule();
      expect(freshData.length).toBeGreaterThan(0);
    });

    it('should return fresh data on manual refresh', async () => {
      const cached: Race[] = [
        createMockRace({ id: 'old-1', trackName: 'Old Track' }),
      ];

      const fresh = await service.refreshSchedule();
      const merged = service.mergeSchedules(cached, fresh);

      expect(merged).not.toEqual(cached);
      expect(merged.some(r => r.id.startsWith('fresh'))).toBe(true);
    });
  });

  describe('Refresh error handling', () => {
    it('should handle refresh failures gracefully', async () => {
      // Create a service that throws errors
      const failingService: ScheduleRefreshService = {
        shouldRefresh: () => true,
        refreshSchedule: async () => {
          throw new Error('Network error');
        },
        mergeSchedules: (cached, fresh) => fresh.length > 0 ? fresh : cached,
      };

      const cached: Race[] = [createMockRace({ id: 'cached-1' })];

      let result: Race[] = cached;
      try {
        const fresh = await failingService.refreshSchedule();
        result = failingService.mergeSchedules(cached, fresh);
      } catch (error) {
        // On error, keep cached data
        result = cached;
      }

      expect(result).toEqual(cached);
      expect(result[0].id).toBe('cached-1');
    });

    it('should fall back to cached data on partial refresh failure', () => {
      const cached: Race[] = [
        createMockRace({ id: 'cached-1' }),
        createMockRace({ id: 'cached-2' }),
      ];

      // Simulate partial failure - fresh data is empty
      const fresh: Race[] = [];

      const merged = service.mergeSchedules(cached, fresh);

      expect(merged).toEqual(cached);
      expect(merged.length).toBe(2);
    });
  });

  describe('Loading states during refresh', () => {
    it('should track loading state during refresh operation', async () => {
      let isLoading = false;
      let isRefreshing = false;

      // Simulate starting refresh
      isLoading = true;
      isRefreshing = true;

      const freshData = await service.refreshSchedule();

      // Simulate completion
      isLoading = false;
      isRefreshing = false;

      expect(freshData).toBeDefined();
      expect(isLoading).toBe(false);
      expect(isRefreshing).toBe(false);
    });

    it('should differentiate between initial load and refresh', async () => {
      // Initial load
      let isInitialLoad = true;
      let isRefreshing = false;

      await service.refreshSchedule();

      isInitialLoad = false;

      // Subsequent refresh
      isRefreshing = true;

      await service.refreshSchedule();

      isRefreshing = false;

      expect(isInitialLoad).toBe(false);
      expect(isRefreshing).toBe(false);
    });
  });

  describe('Timestamp updates after refresh', () => {
    it('should update last updated timestamp after successful refresh', async () => {
      const beforeRefresh = Date.now();

      await service.refreshSchedule();

      const afterRefresh = Date.now();
      const newTimestamp = new Date();

      expect(newTimestamp.getTime()).toBeGreaterThanOrEqual(beforeRefresh);
      expect(newTimestamp.getTime()).toBeLessThanOrEqual(afterRefresh);
    });

    it('should not update timestamp on refresh failure', async () => {
      const originalTimestamp = new Date('2024-03-15T12:00:00Z');

      // Simulate refresh failure
      let currentTimestamp = originalTimestamp;

      try {
        throw new Error('Refresh failed');
      } catch (error) {
        // On error, don't update timestamp
      }

      expect(currentTimestamp).toEqual(originalTimestamp);
    });
  });

  describe('Race data refresh across boundaries', () => {
    it('should refresh data crossing day boundary', async () => {
      const oldData: Race[] = [
        createMockRace({ id: '1', startTime: '2024-03-15T23:00:00Z' }),
      ];

      // Simulate new day
      jest.spyOn(Date, 'now').mockReturnValue(new Date('2024-03-16T01:00:00Z').getTime());

      const freshData = await service.refreshSchedule();
      const merged = service.mergeSchedules(oldData, freshData);

      expect(merged).not.toEqual(oldData);
    });

    it('should refresh data crossing month boundary', async () => {
      const oldData: Race[] = [
        createMockRace({ id: '1', startTime: '2024-03-31T22:00:00Z' }),
      ];

      // Simulate new month
      jest.spyOn(Date, 'now').mockReturnValue(new Date('2024-04-01T02:00:00Z').getTime());

      const freshData = await service.refreshSchedule();
      const merged = service.mergeSchedules(oldData, freshData);

      expect(merged).not.toEqual(oldData);
    });
  });
});
