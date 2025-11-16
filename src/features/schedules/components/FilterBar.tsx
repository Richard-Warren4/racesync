/**
 * FilterBar Component
 *
 * Button group for selecting race type filters.
 * Allows users to filter races by All, Daily, Weekly, Special, or Favorites.
 *
 * Features:
 * - Horizontal scrollable button group
 * - Active filter highlighting
 * - One-tap filter selection
 *
 * Requirements:
 * - Component must be <200 lines
 * - Accessible tap targets (44pt minimum)
 *
 * Task: T056 [US2]
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { RaceFilter, FILTER_LABELS } from '../types/RaceFilter';
import { SPACING } from '../../../shared/constants/spacing';

interface FilterBarProps {
  /** Currently selected filter */
  selectedFilter: RaceFilter;
  /** Callback when filter is changed */
  onFilterChange: (filter: RaceFilter) => void;
}

/**
 * FilterBar - Horizontal button group for race type filtering
 *
 * @example
 * ```tsx
 * <FilterBar
 *   selectedFilter="daily"
 *   onFilterChange={(filter) => setFilter(filter)}
 * />
 * ```
 */
export const FilterBar: React.FC<FilterBarProps> = ({
  selectedFilter,
  onFilterChange,
}) => {
  const filters: RaceFilter[] = ['all', 'daily', 'weekly', 'special', 'favorites'];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filters.map((filter) => {
          const isActive = filter === selectedFilter;

          return (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                isActive && styles.filterButtonActive,
              ]}
              onPress={() => onFilterChange(filter)}
              accessibilityLabel={`Filter by ${FILTER_LABELS[filter]}`}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  isActive && styles.filterButtonTextActive,
                ]}
              >
                {FILTER_LABELS[filter]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.md,
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  filterButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    minHeight: 44, // iOS HIG minimum touch target
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  filterButtonTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
});
