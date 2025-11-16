/**
 * RaceCard Component
 *
 * Displays a single race with all relevant information.
 * Color-coded by race type (daily=blue, weekly=teal, special=red).
 *
 * Features:
 * - Real-time countdown timer
 * - Color-coded race type indicators
 * - Track name, car class, and race details
 * - Live indicator for races in progress
 * - Tier badges for daily races
 *
 * Requirements:
 * - Component must be <200 lines
 * - Color coding: daily=blue, weekly=teal, special=red
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Race } from '../types/Race';
import { useCountdownTimer } from '../hooks/useCountdownTimer';
import { formatTimeRange } from '../../../shared/utils/formatters';
import { SPACING } from '../../../shared/constants/spacing';
import { RACE_COLORS } from '../../../shared/constants/raceTypes';
import { FavoriteButton } from '../../favorites/components/FavoriteButton';

interface RaceCardProps {
  /** Race data to display */
  race: Race;
  /** Optional index for testing IDs */
  index?: number;
}

/**
 * RaceCard - Displays race information with countdown
 *
 * @example
 * ```tsx
 * <RaceCard race={race} index={0} />
 * ```
 */
export const RaceCard: React.FC<RaceCardProps> = ({ race, index = 0 }) => {
  const { countdown, isLive } = useCountdownTimer(
    race.startTime,
    race.durationMinutes
  );

  // Get color based on race type
  const typeColor = RACE_COLORS[race.type];

  // Format time range
  const timeRange = formatTimeRange(race.startTime, race.durationMinutes);

  return (
    <View
      style={[styles.card, { borderLeftColor: typeColor }]}
      testID={`race-card-${index}`}
    >
      {/* Top row: Track name, car class, and favorite button */}
      <View style={styles.topRow}>
        <View style={styles.topLeftContent}>
          <Text
            style={styles.trackName}
            numberOfLines={1}
            testID={`race-card-${index}-track-name`}
          >
            {race.trackName}
          </Text>
          <Text
            style={styles.carClass}
            testID={`race-card-${index}-car-class`}
          >
            {race.carClass}
          </Text>
        </View>
        <FavoriteButton raceId={race.id} />
      </View>

      {/* Track configuration (if exists) */}
      {race.trackConfiguration && (
        <Text style={styles.trackConfig} numberOfLines={1}>
          {race.trackConfiguration}
        </Text>
      )}

      {/* Middle row: Time range and countdown */}
      <View style={styles.middleRow}>
        <Text
          style={styles.timeRange}
          testID={`race-card-${index}-start-time`}
        >
          {timeRange}
        </Text>
        <Text
          style={[
            styles.countdown,
            isLive && styles.countdownLive,
          ]}
          testID={`race-card-${index}-countdown`}
        >
          {countdown}
        </Text>
      </View>

      {/* Bottom row: Details */}
      <View style={styles.bottomRow}>
        {/* Race type badge */}
        <View style={[styles.badge, { backgroundColor: typeColor }]}>
          <Text style={styles.badgeText}>
            {race.type.toUpperCase()}
          </Text>
        </View>

        {/* Tier badge (for daily races) */}
        {race.tier && (
          <View
            style={styles.tierBadge}
            testID={`race-card-${race.type}-tier`}
          >
            <Text style={styles.tierText}>
              {race.tier.charAt(0).toUpperCase() + race.tier.slice(1)}
            </Text>
          </View>
        )}

        {/* Weather */}
        <Text style={styles.detail}>{race.weatherCondition}</Text>

        {/* Time of day */}
        <Text style={styles.detail}>{race.timeOfDay}</Text>

        {/* License requirement */}
        <Text style={styles.detail}>{race.licenseRequirement}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#333333',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  topLeftContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  trackName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    flex: 1,
    marginRight: SPACING.sm,
  },
  carClass: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999999',
  },
  trackConfig: {
    fontSize: 13,
    color: '#777777',
    marginBottom: SPACING.sm,
    fontStyle: 'italic',
  },
  middleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  timeRange: {
    fontSize: 14,
    color: '#cccccc',
  },
  countdown: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  countdownLive: {
    color: '#ff4444',
    fontWeight: '700',
  },
  bottomRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  tierBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#444444',
  },
  tierText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  detail: {
    fontSize: 11,
    color: '#999999',
  },
});
