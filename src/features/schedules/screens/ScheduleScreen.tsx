/**
 * ScheduleScreen - Main race schedule view
 *
 * Primary screen of the app displaying race schedule with:
 * - Skeleton loading during initial load (<5s target)
 * - Pull-to-refresh functionality
 * - "Last updated" indicator
 * - Real-time countdown timers
 * - Color-coded race type indicators
 *
 * User Story 1: View Today's Race Schedule
 * Success Criteria: Display schedule within 5 seconds with skeleton loading
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRaceSchedule } from '../hooks/useRaceSchedule';
import { useRaceFilters } from '../hooks/useRaceFilters';
import { useFavorites } from '../../favorites/hooks/useFavorites';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { RaceList } from '../components/RaceList';
import { FilterBar } from '../components/FilterBar';
import { applyFilter } from '../utils/raceFilters';
import { SPACING } from '../../../shared/constants/spacing';

/**
 * Formats last updated time as relative string
 * @param lastUpdated - Date when schedule was last updated
 * @returns Formatted string (e.g., "Updated 2h ago", "Updated just now")
 */
const formatLastUpdated = (lastUpdated: Date | null): string => {
  if (!lastUpdated) {
    return 'Never updated';
  }

  const now = Date.now();
  const diff = now - lastUpdated.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) {
    return 'Updated just now';
  } else if (minutes < 60) {
    return `Updated ${minutes}m ago`;
  } else if (hours < 24) {
    return `Updated ${hours}h ago`;
  } else {
    return `Updated ${days}d ago`;
  }
};

/**
 * ScheduleScreen - Main screen component
 *
 * @example
 * ```tsx
 * // In AppNavigator.tsx
 * <Stack.Screen
 *   name="Schedule"
 *   component={ScheduleScreen}
 *   options={{ title: 'Race Schedule' }}
 * />
 * ```
 */
export const ScheduleScreen: React.FC = () => {
  const {
    races,
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    refresh,
  } = useRaceSchedule();

  const {
    selectedFilter,
    setSelectedFilter,
    isLoading: isFilterLoading,
  } = useRaceFilters();

  const { favorites } = useFavorites();

  // Filter races based on selected filter
  const filteredRaces = useMemo(() => {
    const favoriteIds = favorites.map(f => f.raceId);
    return applyFilter(races, selectedFilter, favoriteIds);
  }, [races, selectedFilter, favorites]);

  // Show skeleton loader during initial load
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} testID="schedule-screen">
        <StatusBar barStyle="light-content" />
        <View style={styles.header}>
          <Text style={styles.title}>Race Schedule</Text>
        </View>
        <SkeletonLoader />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} testID="schedule-screen">
      <StatusBar barStyle="light-content" />

      {/* Header with title and last updated */}
      <View style={styles.header}>
        <Text style={styles.title}>Race Schedule</Text>
        {lastUpdated && (
          <Text
            style={styles.lastUpdated}
            testID="last-updated-indicator"
          >
            {formatLastUpdated(lastUpdated)}
          </Text>
        )}
      </View>

      {/* Error banner */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>
            ⚠️ {error}
          </Text>
        </View>
      )}

      {/* Filter bar */}
      <FilterBar
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
      />

      {/* Race list with pull-to-refresh */}
      <RaceList
        races={filteredRaces}
        onRefresh={refresh}
        refreshing={isRefreshing}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: SPACING.xs,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#999999',
  },
  errorBanner: {
    backgroundColor: '#ff4444',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  errorText: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '600',
  },
});
