/**
 * SkeletonLoader Component
 *
 * Displays animated skeleton placeholders while schedule data loads.
 * Shows 6 skeleton race cards with shimmer effect for better perceived performance.
 *
 * Features:
 * - Shimmer animation effect
 * - 6 skeleton cards matching RaceCard layout
 * - Smooth fade-in animation
 * - Accessible (announces loading state)
 *
 * Requirements:
 * - Component must be <200 lines
 * - Display 5-8 skeleton cards
 * - Shimmer effect for visual feedback
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  AccessibilityInfo,
} from 'react-native';
import { SPACING } from '../../../shared/constants/spacing';

/**
 * Single skeleton card placeholder
 */
const SkeletonCard: React.FC = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Create continuous shimmer animation
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [shimmerAnim]);

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.card}>
      {/* Top row: Track name and car class */}
      <View style={styles.topRow}>
        <Animated.View
          style={[
            styles.skeletonBox,
            styles.trackName,
            { opacity: shimmerOpacity },
          ]}
        />
        <Animated.View
          style={[
            styles.skeletonBox,
            styles.carClass,
            { opacity: shimmerOpacity },
          ]}
        />
      </View>

      {/* Middle row: Time range and countdown */}
      <View style={styles.middleRow}>
        <Animated.View
          style={[
            styles.skeletonBox,
            styles.timeRange,
            { opacity: shimmerOpacity },
          ]}
        />
        <Animated.View
          style={[
            styles.skeletonBox,
            styles.countdown,
            { opacity: shimmerOpacity },
          ]}
        />
      </View>

      {/* Bottom row: Details (weather, time of day, license) */}
      <View style={styles.bottomRow}>
        <Animated.View
          style={[
            styles.skeletonBox,
            styles.detail,
            { opacity: shimmerOpacity },
          ]}
        />
        <Animated.View
          style={[
            styles.skeletonBox,
            styles.detail,
            { opacity: shimmerOpacity },
          ]}
        />
        <Animated.View
          style={[
            styles.skeletonBox,
            styles.detail,
            { opacity: shimmerOpacity },
          ]}
        />
      </View>
    </View>
  );
};

/**
 * SkeletonLoader - Displays loading placeholders
 *
 * @example
 * ```tsx
 * function ScheduleScreen() {
 *   const { races, isLoading } = useRaceSchedule();
 *
 *   if (isLoading) {
 *     return <SkeletonLoader />;
 *   }
 *
 *   return <RaceList races={races} />;
 * }
 * ```
 */
export const SkeletonLoader: React.FC = () => {
  useEffect(() => {
    // Announce loading state for screen readers
    AccessibilityInfo.announceForAccessibility('Loading race schedule');
  }, []);

  return (
    <View style={styles.container} testID="skeleton-loader">
      {/* Render 6 skeleton cards */}
      {Array.from({ length: 6 }).map((_, index) => (
        <SkeletonCard key={`skeleton-${index}`} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.md,
    backgroundColor: '#000000',
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#333333',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  middleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  bottomRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  skeletonBox: {
    backgroundColor: '#333333',
    borderRadius: 4,
  },
  trackName: {
    width: '60%',
    height: 20,
  },
  carClass: {
    width: '30%',
    height: 20,
  },
  timeRange: {
    width: '40%',
    height: 16,
  },
  countdown: {
    width: '30%',
    height: 16,
  },
  detail: {
    width: 60,
    height: 14,
  },
});
