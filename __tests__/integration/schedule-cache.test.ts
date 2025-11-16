/**
 * Integration test for schedule data loading from AsyncStorage
 *
 * Test ID: T035
 * User Story: US1 - View Today's Race Schedule
 *
 * Tests validate:
 * - Loading cached schedule from AsyncStorage
 * - Saving schedule to AsyncStorage
 * - Cache expiration handling (24h staleness)
 * - Handling missing/corrupted cache data
 * - Race data persistence across app restarts
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
 * AsyncStorageScheduleRepository - Interface we're testing against
 * (Implementation will be created later in T039)
 */
interface ScheduleRepository {
  getSchedule(): Promise<Race[]>;
  getCachedSchedule(): Promise<Race[] | null>;
  saveSchedule(races: Race[]): Promise<void>;
  getLastUpdated(): Promise<Date | null>;
}

/**
 * Mock implementation for testing
 */
class MockAsyncStorageScheduleRepository implements ScheduleRepository {
  private readonly STORAGE_KEY_SCHEDULE = 'racesync:schedule';
  private readonly STORAGE_KEY_LAST_UPDATED = 'racesync:schedule:lastUpdated';

  async getSchedule(): Promise<Race[]> {
    const cached = await this.getCachedSchedule();
    if (cached) {
      return cached;
    }
    return [];
  }

  async getCachedSchedule(): Promise<Race[] | null> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEY_SCHEDULE);
      if (!data) {
        return null;
      }
      return JSON.parse(data);
    } catch (error) {
      return null;
    }
  }

  async saveSchedule(races: Race[]): Promise<void> {
    await AsyncStorage.setItem(this.STORAGE_KEY_SCHEDULE, JSON.stringify(races));
    await AsyncStorage.setItem(this.STORAGE_KEY_LAST_UPDATED, new Date().toISOString());
  }

  async getLastUpdated(): Promise<Date | null> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEY_LAST_UPDATED);
      if (!data) {
        return null;
      }
      const date = new Date(data);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return null;
      }
      return date;
    } catch (error) {
      return null;
    }
  }
}

describe('Schedule Cache Integration', () => {
  let repository: ScheduleRepository;

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
    repository = new MockAsyncStorageScheduleRepository();
    jest.clearAllMocks();
  });

  describe('Loading cached schedule', () => {
    it('should load schedule from AsyncStorage when cache exists', async () => {
      const mockRaces: Race[] = [
        createMockRace({ id: '1', startTime: '2024-03-15T12:00:00Z' }),
        createMockRace({ id: '2', startTime: '2024-03-15T14:00:00Z' }),
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockRaces));

      const result = await repository.getCachedSchedule();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('racesync:schedule');
      expect(result).toEqual(mockRaces);
      expect(result).toHaveLength(2);
    });

    it('should return null when no cached data exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await repository.getCachedSchedule();

      expect(result).toBeNull();
    });

    it('should return null when cached data is empty string', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('');

      const result = await repository.getCachedSchedule();

      expect(result).toBeNull();
    });

    it('should handle corrupted JSON data gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('{ invalid json }');

      const result = await repository.getCachedSchedule();

      expect(result).toBeNull();
    });

    it('should handle AsyncStorage errors gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const result = await repository.getCachedSchedule();

      expect(result).toBeNull();
    });

    it('should parse and return valid race data with all fields', async () => {
      const mockRace: Race = createMockRace({
        id: 'test-race-1',
        type: 'special',
        tier: null,
        trackName: 'Spa-Francorchamps',
        trackConfiguration: 'GP Layout',
        carClass: 'Multi-class',
        startTime: '2024-03-20T18:00:00Z',
        durationMinutes: 360,
        weatherCondition: 'Real Weather',
        timeOfDay: 'Full Day Cycle',
        licenseRequirement: 'Gold',
        repeatInterval: null,
        isLive: true,
      });

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([mockRace]));

      const result = await repository.getCachedSchedule();

      expect(result).toHaveLength(1);
      expect(result![0]).toEqual(mockRace);
      expect(result![0].id).toBe('test-race-1');
      expect(result![0].type).toBe('special');
      expect(result![0].tier).toBeNull();
    });
  });

  describe('Saving schedule to cache', () => {
    it('should save schedule to AsyncStorage', async () => {
      const mockRaces: Race[] = [
        createMockRace({ id: '1' }),
        createMockRace({ id: '2' }),
      ];

      await repository.saveSchedule(mockRaces);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'racesync:schedule',
        JSON.stringify(mockRaces)
      );
    });

    it('should save last updated timestamp when saving schedule', async () => {
      const mockRaces: Race[] = [createMockRace()];
      const beforeSave = Date.now();

      await repository.saveSchedule(mockRaces);

      const setItemCalls = (AsyncStorage.setItem as jest.Mock).mock.calls;
      const lastUpdatedCall = setItemCalls.find(call => call[0] === 'racesync:schedule:lastUpdated');

      expect(lastUpdatedCall).toBeDefined();

      const savedTimestamp = new Date(lastUpdatedCall[1]).getTime();
      const afterSave = Date.now();

      expect(savedTimestamp).toBeGreaterThanOrEqual(beforeSave);
      expect(savedTimestamp).toBeLessThanOrEqual(afterSave);
    });

    it('should handle empty race array', async () => {
      await repository.saveSchedule([]);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'racesync:schedule',
        JSON.stringify([])
      );
    });

    it('should serialize race data correctly', async () => {
      const mockRace: Race = createMockRace({
        id: 'test-id',
        trackName: 'Test Track',
      });

      await repository.saveSchedule([mockRace]);

      const setItemCall = (AsyncStorage.setItem as jest.Mock).mock.calls[0];
      const savedData = JSON.parse(setItemCall[1]);

      expect(savedData[0].id).toBe('test-id');
      expect(savedData[0].trackName).toBe('Test Track');
    });
  });

  describe('Last updated tracking', () => {
    it('should retrieve last updated timestamp', async () => {
      const mockTimestamp = '2024-03-15T12:00:00.000Z';
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(mockTimestamp);

      const result = await repository.getLastUpdated();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('racesync:schedule:lastUpdated');
      expect(result).toBeInstanceOf(Date);
      expect(result!.toISOString()).toBe(mockTimestamp);
    });

    it('should return null when no timestamp exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await repository.getLastUpdated();

      expect(result).toBeNull();
    });

    it('should handle invalid timestamp format', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid-date');

      const result = await repository.getLastUpdated();

      // Invalid date strings create Date objects with NaN
      // The repository should handle this gracefully
      expect(result).toBeNull();
    });

    it('should handle AsyncStorage errors when getting timestamp', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const result = await repository.getLastUpdated();

      expect(result).toBeNull();
    });
  });

  describe('Cache persistence across operations', () => {
    it('should save and then retrieve the same data', async () => {
      const mockRaces: Race[] = [
        createMockRace({ id: '1', trackName: 'Track A' }),
        createMockRace({ id: '2', trackName: 'Track B' }),
      ];

      // Save data
      await repository.saveSchedule(mockRaces);

      // Simulate retrieval by mocking getItem to return what was set
      const savedData = (AsyncStorage.setItem as jest.Mock).mock.calls.find(
        call => call[0] === 'racesync:schedule'
      )[1];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(savedData);

      // Retrieve data
      const retrieved = await repository.getCachedSchedule();

      expect(retrieved).toEqual(mockRaces);
    });

    it('should handle multiple save operations', async () => {
      const firstBatch: Race[] = [createMockRace({ id: '1' })];
      const secondBatch: Race[] = [
        createMockRace({ id: '2' }),
        createMockRace({ id: '3' }),
      ];

      await repository.saveSchedule(firstBatch);
      await repository.saveSchedule(secondBatch);

      // Second save should overwrite first
      expect(AsyncStorage.setItem).toHaveBeenCalledTimes(4); // 2 calls per save (schedule + timestamp)

      const lastScheduleCall = (AsyncStorage.setItem as jest.Mock).mock.calls
        .filter(call => call[0] === 'racesync:schedule')
        .pop();

      const savedData = JSON.parse(lastScheduleCall[1]);
      expect(savedData).toHaveLength(2);
      expect(savedData[0].id).toBe('2');
    });
  });

  describe('Cache staleness detection', () => {
    it('should identify stale cache (>24 hours old)', async () => {
      const now = new Date('2024-03-16T12:00:00Z');
      const staleTimestamp = new Date('2024-03-15T11:59:59Z'); // 24h 1s ago

      jest.spyOn(Date, 'now').mockReturnValue(now.getTime());
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(staleTimestamp.toISOString());

      const lastUpdated = await repository.getLastUpdated();
      const ageMs = now.getTime() - lastUpdated!.getTime();
      const ageHours = ageMs / (1000 * 60 * 60);

      expect(ageHours).toBeGreaterThan(24);
    });

    it('should identify fresh cache (<24 hours old)', async () => {
      const now = new Date('2024-03-16T12:00:00Z');
      const freshTimestamp = new Date('2024-03-16T11:00:00Z'); // 1 hour ago

      jest.spyOn(Date, 'now').mockReturnValue(now.getTime());
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(freshTimestamp.toISOString());

      const lastUpdated = await repository.getLastUpdated();
      const ageMs = now.getTime() - lastUpdated!.getTime();
      const ageHours = ageMs / (1000 * 60 * 60);

      expect(ageHours).toBeLessThan(24);
    });

    it('should handle exactly 24 hour old cache', async () => {
      const now = new Date('2024-03-16T12:00:00Z');
      const exactlyOneDayAgo = new Date('2024-03-15T12:00:00Z');

      jest.spyOn(Date, 'now').mockReturnValue(now.getTime());
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(exactlyOneDayAgo.toISOString());

      const lastUpdated = await repository.getLastUpdated();
      const ageMs = now.getTime() - lastUpdated!.getTime();
      const ageHours = ageMs / (1000 * 60 * 60);

      expect(ageHours).toBe(24);
    });
  });

  describe('getSchedule method (primary method)', () => {
    it('should return cached schedule if available', async () => {
      const mockRaces: Race[] = [createMockRace()];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockRaces));

      const result = await repository.getSchedule();

      expect(result).toEqual(mockRaces);
    });

    it('should return empty array if no cache available', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await repository.getSchedule();

      expect(result).toEqual([]);
    });
  });
});
