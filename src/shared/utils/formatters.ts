import { format, addMinutes, parseISO } from 'date-fns';
import { Race } from '../../features/schedules/types/Race';

/**
 * Formats the countdown to a race start time
 *
 * Returns human-readable time until race starts:
 * - "2d 6h" for days + hours
 * - "2h 30m" for hours + minutes
 * - "45m" for minutes only
 * - "Starting now" for < 1 minute
 * - "Live" for races that already started
 *
 * @param startTime - ISO 8601 UTC string of race start time
 * @returns Formatted countdown string
 *
 * @example
 * ```typescript
 * // Current time: 2024-03-15T12:00:00Z
 * formatCountdown('2024-03-15T14:30:00Z') // "2h 30m"
 * formatCountdown('2024-03-15T11:30:00Z') // "Live"
 * ```
 */
export function formatCountdown(startTime: string): string {
  const now = Date.now();
  const start = parseISO(startTime).getTime();
  const diffMs = start - now;

  // Race already started
  if (diffMs < 0) {
    return 'Live';
  }

  // Less than 1 minute
  if (diffMs < 60000) {
    return 'Starting now';
  }

  const totalMinutes = Math.floor(diffMs / 60000);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);

  if (totalDays > 0) {
    const hours = totalHours % 24;
    return `${totalDays}d ${hours}h`;
  }

  if (totalHours > 0) {
    const minutes = totalMinutes % 60;
    return `${totalHours}h ${minutes}m`;
  }

  return `${totalMinutes}m`;
}

/**
 * Formats race duration in minutes to human-readable format
 *
 * Returns:
 * - "45 min" for < 60 minutes
 * - "1h 30m" for >= 60 minutes
 *
 * @param minutes - Duration in minutes
 * @returns Formatted duration string
 *
 * @example
 * ```typescript
 * formatDuration(45)  // "45 min"
 * formatDuration(90)  // "1h 30m"
 * formatDuration(360) // "6h 0m"
 * ```
 */
export function formatDuration(minutes: number): string {
  // Handle negative or zero values
  if (minutes <= 0) {
    return '0 min';
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${minutes} min`;
  }

  return `${hours}h ${mins}m`;
}

/**
 * Formats a race title with car class and track
 *
 * @param race - Race object
 * @returns Formatted race title
 *
 * @example
 * ```typescript
 * formatRaceTitle({
 *   carClass: 'Hypercar',
 *   trackName: 'Circuit de la Sarthe',
 *   ...
 * }) // "Hypercar - Circuit de la Sarthe"
 * ```
 */
export function formatRaceTitle(race: Race): string {
  return `${race.carClass} - ${race.trackName}`;
}

/**
 * Formats the time range for a race (start time to end time)
 *
 * Returns time range in local timezone using HH:mm format
 *
 * @param startTime - ISO 8601 UTC string of race start time
 * @param durationMinutes - Race duration in minutes
 * @returns Formatted time range
 *
 * @example
 * ```typescript
 * formatTimeRange('2024-03-15T14:30:00Z', 45) // "14:30 - 15:15"
 * formatTimeRange('2024-03-15T23:00:00Z', 120) // "23:00 - 01:00"
 * ```
 */
export function formatTimeRange(startTime: string, durationMinutes: number): string {
  const start = parseISO(startTime);

  // Handle negative duration
  const safeDuration = Math.max(0, durationMinutes);
  const end = addMinutes(start, safeDuration);

  const startFormatted = format(start, 'HH:mm');
  const endFormatted = format(end, 'HH:mm');

  return `${startFormatted} - ${endFormatted}`;
}
