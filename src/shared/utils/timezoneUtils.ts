import { format, parseISO } from 'date-fns';
import { toZonedTime, formatInTimeZone } from 'date-fns-tz';

/**
 * Gets the device's current timezone using Intl.DateTimeFormat
 *
 * Returns IANA timezone identifier (e.g., 'America/New_York', 'Europe/Paris')
 *
 * @returns IANA timezone string
 *
 * @example
 * ```typescript
 * getDeviceTimezone() // 'America/New_York' (depends on device settings)
 * getDeviceTimezone() // 'Europe/Paris'
 * getDeviceTimezone() // 'Asia/Tokyo'
 * ```
 */
export function getDeviceTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Converts UTC ISO string to local timezone ISO string
 *
 * Takes a UTC timestamp and converts it to the device's local timezone,
 * returning as an ISO-formatted string (without timezone offset)
 *
 * @param utcISOString - ISO 8601 UTC string
 * @returns ISO string in local timezone (without 'Z' suffix)
 *
 * @example
 * ```typescript
 * // Device timezone: America/New_York (UTC-5 in winter)
 * convertUTCToLocal('2024-03-15T14:30:00Z')
 * // Returns: '2024-03-15T09:30:00' (EST, 5 hours behind UTC)
 *
 * // Device timezone: Europe/Paris (UTC+1 in winter)
 * convertUTCToLocal('2024-03-15T14:30:00Z')
 * // Returns: '2024-03-15T15:30:00' (CET, 1 hour ahead of UTC)
 * ```
 */
export function convertUTCToLocal(utcISOString: string): string {
  const utcDate = parseISO(utcISOString);
  const deviceTimezone = getDeviceTimezone();
  const zonedDate = toZonedTime(utcDate, deviceTimezone);

  // Format as ISO string without timezone suffix
  return format(zonedDate, "yyyy-MM-dd'T'HH:mm:ss");
}

/**
 * Registers a callback to be called when timezone changes are detected
 *
 * Returns a cleanup function to unregister the listener.
 *
 * Note: In React Native, timezone changes are not automatically detected
 * by the JavaScript runtime. This function provides a consistent API
 * for potential future enhancements or platform-specific implementations.
 *
 * For now, it returns a no-op cleanup function since React Native doesn't
 * have a built-in timezone change event.
 *
 * @param callback - Function to call when timezone changes
 * @returns Cleanup function to remove the listener
 *
 * @example
 * ```typescript
 * function handleTimezoneChange() {
 *   console.log('Timezone changed, recalculating dates...');
 *   // Refresh race times, update UI, etc.
 * }
 *
 * const cleanup = recalculateOnTimezoneChange(handleTimezoneChange);
 *
 * // Later, when component unmounts:
 * cleanup();
 * ```
 */
export function recalculateOnTimezoneChange(_callback: () => void): () => void {
  // In React Native, there's no built-in way to detect timezone changes
  // This function provides the API for future implementation
  // For now, return a no-op cleanup function

  // If we were to implement this, we could:
  // 1. Use app state change listeners to check timezone on resume
  // 2. Poll Intl.DateTimeFormat().resolvedOptions().timeZone periodically
  // 3. Use platform-specific native modules

  // Return cleanup function (no-op for now)
  return () => {
    // Cleanup logic would go here if we had listeners
  };
}

/**
 * Formats a Date object in a specific timezone
 *
 * Uses date-fns-tz to format the date in the specified timezone
 * without converting the underlying Date object.
 *
 * @param date - Date object to format
 * @param timezone - IANA timezone identifier (e.g., 'America/New_York')
 * @param formatPattern - date-fns format pattern
 * @returns Formatted date string in the specified timezone
 *
 * @example
 * ```typescript
 * const date = new Date('2024-03-15T14:30:00Z');
 *
 * formatInTimezone(date, 'America/New_York', 'HH:mm')
 * // Returns: '09:30' (EST, UTC-5)
 *
 * formatInTimezone(date, 'Europe/Paris', 'HH:mm')
 * // Returns: '15:30' (CET, UTC+1)
 *
 * formatInTimezone(date, 'Asia/Tokyo', 'HH:mm')
 * // Returns: '23:30' (JST, UTC+9)
 *
 * formatInTimezone(date, 'UTC', 'yyyy-MM-dd HH:mm:ss')
 * // Returns: '2024-03-15 14:30:00'
 * ```
 */
export function formatInTimezone(
  date: Date,
  timezone: string,
  formatPattern: string
): string {
  return formatInTimeZone(date, timezone, formatPattern);
}
