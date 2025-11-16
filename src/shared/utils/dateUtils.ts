import { format, parseISO, isValid } from 'date-fns';

/**
 * Validates if a string is a valid ISO 8601 date string
 *
 * Checks if the string:
 * - Can be parsed to a valid Date
 * - Is in ISO 8601 format (contains 'T' separator and timezone)
 * - Results in a valid date (not Invalid Date)
 *
 * @param dateString - String to validate
 * @returns True if valid ISO 8601 format, false otherwise
 *
 * @example
 * ```typescript
 * isValidISOString('2024-03-15T14:30:00Z') // true
 * isValidISOString('2024-03-15T14:30:00+02:00') // true
 * isValidISOString('03/15/2024') // false
 * isValidISOString('not a date') // false
 * ```
 */
export function isValidISOString(dateString: string): boolean {
  if (!dateString || typeof dateString !== 'string') {
    return false;
  }

  // ISO 8601 must contain 'T' separator
  if (!dateString.includes('T')) {
    return false;
  }

  // ISO 8601 must have timezone (Z or ±HH:mm)
  const hasTimezone =
    dateString.endsWith('Z') ||
    /[+-]\d{2}:\d{2}$/.test(dateString);

  if (!hasTimezone) {
    return false;
  }

  try {
    const date = parseISO(dateString);
    return isValid(date);
  } catch {
    return false;
  }
}

/**
 * Parses an ISO 8601 UTC string to a Date object
 *
 * @param isoString - ISO 8601 formatted date string
 * @returns Date object representing the UTC time
 *
 * @example
 * ```typescript
 * parseUTC('2024-03-15T14:30:00Z')
 * // Date object: 2024-03-15T14:30:00.000Z
 *
 * parseUTC('2024-03-15T14:30:00+02:00')
 * // Date object: 2024-03-15T12:30:00.000Z (converted to UTC)
 * ```
 */
export function parseUTC(isoString: string): Date {
  return parseISO(isoString);
}

/**
 * Formats a Date object to local time string
 *
 * Uses date-fns format patterns:
 * - 'HH:mm' → '14:30'
 * - 'MMM d, yyyy' → 'Mar 15, 2024'
 * - 'yyyy-MM-dd' → '2024-03-15'
 * - 'PPpp' → Full datetime with time
 *
 * @param date - Date object to format
 * @param formatPattern - date-fns format pattern
 * @returns Formatted date string in local time
 *
 * @example
 * ```typescript
 * const date = new Date('2024-03-15T14:30:00Z');
 * formatLocalTime(date, 'HH:mm') // '14:30' (or adjusted for local timezone)
 * formatLocalTime(date, 'MMM d, yyyy') // 'Mar 15, 2024'
 * ```
 */
export function formatLocalTime(date: Date, formatPattern: string): string {
  return format(date, formatPattern);
}

/**
 * Checks if a race is currently live/in progress
 *
 * A race is live if:
 * - Current time >= start time
 * - Current time < (start time + duration)
 *
 * @param startTime - ISO 8601 UTC string of race start time
 * @param durationMinutes - Race duration in minutes
 * @returns True if race is currently in progress, false otherwise
 *
 * @example
 * ```typescript
 * // Current time: 2024-03-15T12:00:00Z
 * isRaceLive('2024-03-15T11:30:00Z', 60) // true (started 30 min ago, ends in 30 min)
 * isRaceLive('2024-03-15T14:00:00Z', 60) // false (starts in 2 hours)
 * isRaceLive('2024-03-15T10:00:00Z', 60) // false (ended 1 hour ago)
 * ```
 */
export function isRaceLive(startTime: string, durationMinutes: number): boolean {
  const now = Date.now();
  const start = parseISO(startTime).getTime();
  const end = start + durationMinutes * 60 * 1000;

  return now >= start && now <= end;
}

/**
 * Gets the current date/time in a specific timezone
 *
 * Returns a Date object representing the current moment,
 * which can be used with timezone-aware formatting functions.
 *
 * Note: The returned Date object represents the same instant in time
 * as the current moment, regardless of timezone parameter.
 * Use with timezone formatting functions to display in specific timezone.
 *
 * @param timezone - IANA timezone identifier (e.g., 'America/New_York', 'Europe/Paris')
 * @returns Date object representing current time
 *
 * @example
 * ```typescript
 * getCurrentDateInTimezone('America/New_York') // Current time as Date object
 * getCurrentDateInTimezone('Europe/Paris')     // Same instant, different timezone
 * getCurrentDateInTimezone('Asia/Tokyo')       // Same instant, different timezone
 * ```
 */
export function getCurrentDateInTimezone(_timezone: string): Date {
  // Note: The Date object always represents an instant in time (UTC internally)
  // The timezone parameter is accepted for API consistency but the returned
  // Date object represents the current moment in UTC.
  // To display this in a specific timezone, use formatInTimezone from timezoneUtils
  const now = new Date();
  return now;
}
