/**
 * useCountdownTimer Hook
 *
 * Provides real-time countdown timers for race start times.
 * Updates every 60 seconds to show accurate time until race starts.
 *
 * Features:
 * - Automatic updates every 60 seconds
 * - Formatted countdown strings (e.g., "2h 30m", "45m", "2d 6h")
 * - Handles "Live" state for races in progress
 * - Cleanup on unmount
 */

import { useState, useEffect } from 'react';
import { formatCountdown } from '../../../shared/utils/formatters';
import { isRaceLive } from '../../../shared/utils/dateUtils';

/**
 * Hook return type
 */
interface UseCountdownTimerResult {
  /** Formatted countdown string (e.g., "2h 30m", "Live", "Starting now") */
  countdown: string;
  /** True if race is currently in progress */
  isLive: boolean;
}

/**
 * Hook for race countdown timer
 *
 * @param startTime - ISO 8601 UTC string of race start time
 * @param durationMinutes - Race duration in minutes
 * @returns Countdown string and isLive status
 *
 * @example
 * ```tsx
 * function RaceCard({ race }: { race: Race }) {
 *   const { countdown, isLive } = useCountdownTimer(
 *     race.startTime,
 *     race.durationMinutes
 *   );
 *
 *   return (
 *     <View>
 *       <Text style={{ color: isLive ? 'red' : 'white' }}>
 *         {countdown}
 *       </Text>
 *     </View>
 *   );
 * }
 * ```
 */
export function useCountdownTimer(
  startTime: string,
  durationMinutes: number
): UseCountdownTimerResult {
  const [countdown, setCountdown] = useState<string>(() =>
    formatCountdown(startTime)
  );
  const [isLive, setIsLive] = useState<boolean>(() =>
    isRaceLive(startTime, durationMinutes)
  );

  useEffect(() => {
    /**
     * Updates countdown and isLive status
     */
    const updateCountdown = () => {
      const newCountdown = formatCountdown(startTime);
      const newIsLive = isRaceLive(startTime, durationMinutes);

      setCountdown(newCountdown);
      setIsLive(newIsLive);
    };

    // Update immediately on mount/startTime change
    updateCountdown();

    // Update every 60 seconds
    const intervalId = setInterval(updateCountdown, 60000); // 60 seconds

    // Cleanup interval on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [startTime, durationMinutes]);

  return {
    countdown,
    isLive,
  };
}

/**
 * Hook for multiple race countdowns
 *
 * More efficient than calling useCountdownTimer for each race individually.
 * Uses a single interval for all races.
 *
 * @param races - Array of races to track
 * @returns Map of race IDs to countdown data
 *
 * @example
 * ```tsx
 * function RaceList({ races }: { races: Race[] }) {
 *   const countdowns = useMultipleCountdowns(races);
 *
 *   return (
 *     <FlatList
 *       data={races}
 *       renderItem={({ item }) => {
 *         const { countdown, isLive } = countdowns.get(item.id) || {
 *           countdown: '',
 *           isLive: false
 *         };
 *         return <RaceCard race={item} countdown={countdown} isLive={isLive} />;
 *       }}
 *     />
 *   );
 * }
 * ```
 */
export function useMultipleCountdowns(
  races: Array<{ id: string; startTime: string; durationMinutes: number }>
): Map<string, UseCountdownTimerResult> {
  const [countdownMap, setCountdownMap] = useState<
    Map<string, UseCountdownTimerResult>
  >(() => {
    const map = new Map<string, UseCountdownTimerResult>();
    races.forEach(race => {
      map.set(race.id, {
        countdown: formatCountdown(race.startTime),
        isLive: isRaceLive(race.startTime, race.durationMinutes),
      });
    });
    return map;
  });

  useEffect(() => {
    /**
     * Updates all countdowns
     */
    const updateAllCountdowns = () => {
      const newMap = new Map<string, UseCountdownTimerResult>();
      races.forEach(race => {
        newMap.set(race.id, {
          countdown: formatCountdown(race.startTime),
          isLive: isRaceLive(race.startTime, race.durationMinutes),
        });
      });
      setCountdownMap(newMap);
    };

    // Update immediately when races change
    updateAllCountdowns();

    // Update every 60 seconds
    const intervalId = setInterval(updateAllCountdowns, 60000);

    // Cleanup interval on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [races]);

  return countdownMap;
}
