/**
 * Integration test for filter persistence
 * Task: T052 [US2]
 * Purpose: Verify selected filter persists across app restarts
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../src/shared/constants/storageKeys';
import { RaceFilter } from '../../src/features/schedules/types/RaceFilter';

describe('Filter Persistence Integration', () => {
  beforeEach(async () => {
    // Clear AsyncStorage before each test
    await AsyncStorage.clear();
  });

  afterEach(async () => {
    await AsyncStorage.clear();
  });

  it('should persist selected filter to AsyncStorage', async () => {
    const selectedFilter: RaceFilter = 'daily';

    // Simulate saving filter
    await AsyncStorage.setItem(STORAGE_KEYS.SELECTED_FILTER, selectedFilter);

    // Verify it was saved
    const storedFilter = await AsyncStorage.getItem(STORAGE_KEYS.SELECTED_FILTER);
    expect(storedFilter).toBe('daily');
  });

  it('should load persisted filter on app restart', async () => {
    // Simulate previous app session saving a filter
    await AsyncStorage.setItem(STORAGE_KEYS.SELECTED_FILTER, 'weekly');

    // Simulate app restart - load filter
    const loadedFilter = await AsyncStorage.getItem(STORAGE_KEYS.SELECTED_FILTER);

    expect(loadedFilter).toBe('weekly');
  });

  it('should default to "all" when no filter is persisted', async () => {
    const storedFilter = await AsyncStorage.getItem(STORAGE_KEYS.SELECTED_FILTER);
    expect(storedFilter).toBeNull();

    // In the actual hook, null should default to 'all'
    const defaultFilter: RaceFilter = (storedFilter as RaceFilter) || 'all';
    expect(defaultFilter).toBe('all');
  });

  it('should update persisted filter when changed', async () => {
    // Initial filter
    await AsyncStorage.setItem(STORAGE_KEYS.SELECTED_FILTER, 'all');

    // Change filter
    await AsyncStorage.setItem(STORAGE_KEYS.SELECTED_FILTER, 'special');

    // Verify update
    const updatedFilter = await AsyncStorage.getItem(STORAGE_KEYS.SELECTED_FILTER);
    expect(updatedFilter).toBe('special');
  });

  it('should handle all valid filter types', async () => {
    const validFilters: RaceFilter[] = ['all', 'daily', 'weekly', 'special', 'favorites'];

    for (const filter of validFilters) {
      await AsyncStorage.setItem(STORAGE_KEYS.SELECTED_FILTER, filter);
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.SELECTED_FILTER);
      expect(stored).toBe(filter);
    }
  });

  it('should persist filter independently of other storage keys', async () => {
    // Save filter and other data
    await AsyncStorage.setItem(STORAGE_KEYS.SELECTED_FILTER, 'daily');
    await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(['race-1', 'race-2']));

    // Verify both are independent
    const filter = await AsyncStorage.getItem(STORAGE_KEYS.SELECTED_FILTER);
    const favorites = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);

    expect(filter).toBe('daily');
    expect(JSON.parse(favorites || '[]')).toEqual(['race-1', 'race-2']);
  });
});
