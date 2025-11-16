/**
 * RaceList Component
 *
 * Virtualized list of race cards with optimized rendering.
 * Uses FlatList for efficient scrolling of large race schedules.
 *
 * Features:
 * - FlatList virtualization for performance
 * - Window size optimization (renders 10 items ahead/behind)
 * - Pull-to-refresh support
 * - Empty state handling
 * - Automatic sorting by start time
 */

import React from 'react';
import {
  FlatList,
  RefreshControl,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Race } from '../types/Race';
import { RaceCard } from './RaceCard';
import { SPACING } from '../../../shared/constants/spacing';

interface RaceListProps {
  /** Array of races to display, should be pre-sorted by start time */
  races: Race[];
  /** Pull-to-refresh callback */
  onRefresh?: () => void;
  /** True when refreshing */
  refreshing?: boolean;
}

/**
 * Renders the empty state when no races are available
 */
const EmptyState: React.FC = () => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyTitle}>No races scheduled</Text>
    <Text style={styles.emptySubtitle}>
      Pull down to refresh or check back later
    </Text>
  </View>
);

/**
 * RaceList - Virtualized list of race cards
 *
 * @example
 * ```tsx
 * function ScheduleScreen() {
 *   const { races, isRefreshing, refresh } = useRaceSchedule();
 *
 *   return (
 *     <RaceList
 *       races={races}
 *       onRefresh={refresh}
 *       refreshing={isRefreshing}
 *     />
 *   );
 * }
 * ```
 */
export const RaceList: React.FC<RaceListProps> = ({
  races,
  onRefresh,
  refreshing = false,
}) => {
  /**
   * Renders a single race card
   */
  const renderItem = ({ item, index }: { item: Race; index: number }) => (
    <RaceCard race={item} index={index} />
  );

  /**
   * Extracts unique key for each race
   */
  const keyExtractor = (item: Race) => item.id;

  /**
   * Item separator component
   */
  const ItemSeparator = () => <View style={styles.separator} />;

  return (
    <FlatList
      data={races}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ItemSeparatorComponent={ItemSeparator}
      ListEmptyComponent={EmptyState}
      contentContainerStyle={[
        styles.contentContainer,
        races.length === 0 && styles.emptyContainer,
      ]}
      // Pull-to-refresh
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ffffff"
            titleColor="#ffffff"
          />
        ) : undefined
      }
      // Performance optimizations
      windowSize={10} // Render 10 screens worth of content
      maxToRenderPerBatch={10} // Render 10 items per batch
      removeClippedSubviews={true} // Remove offscreen items from native rendering
      initialNumToRender={10} // Initial items to render
      // Accessibility
      testID="race-list"
      accessible={true}
      accessibilityLabel="Race schedule list"
    />
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    padding: SPACING.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  separator: {
    height: 0, // No separator needed, cards have their own margin
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
});
